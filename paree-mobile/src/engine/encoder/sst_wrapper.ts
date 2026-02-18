import * as ort from 'onnxruntime-web';
import CryptoJS from 'crypto-js';

export class SSTWrapper {
    private session: ort.InferenceSession | null = null;
    private modelPath: string;
    private initAttempted = false;

    private CAT_LIST = ['METHOD', 'PATH', 'VERSION', 'HEADER_NAME', 'HEADER_VALUE'];
    private CAT_MAP: Record<string, number> = {};
    private REV_CAT_MAP: Record<number, string> = {};

    // Deterministic HTTP state machine — used when ONNX is unavailable
    private FALLBACK_SEQUENCE = ['METHOD', 'PATH', 'VERSION', 'HEADER_NAME', 'HEADER_VALUE'];

    constructor(modelPath: string = '/models/sst_model.onnx') {
        this.modelPath = modelPath;
        this.CAT_LIST.sort();
        this.CAT_LIST.forEach((t, i) => {
            this.CAT_MAP[t] = i;
            this.REV_CAT_MAP[i] = t;
        });
    }

    async init() {
        if (this.session) return;
        if (this.initAttempted) return;
        this.initAttempted = true;

        try {
            // Configure WASM paths — required for Capacitor file:// context
            ort.env.wasm.wasmPaths = '/';
            ort.env.wasm.numThreads = 1; // Single thread for mobile stability

            this.session = await ort.InferenceSession.create(this.modelPath, {
                executionProviders: ['wasm'],
                graphOptimizationLevel: 'all',
            });
            console.log('[SSTWrapper] ONNX model loaded successfully.');
        } catch (e) {
            // Graceful degradation — engine still works with deterministic fallback
            console.warn('[SSTWrapper] ONNX unavailable, using deterministic fallback:', String(e));
            this.session = null;
        }
    }

    injectSession(session: ort.InferenceSession) {
        this.session = session;
    }

    /**
     * Predicts the next token category.
     * Primary: ONNX model inference.
     * Fallback: Deterministic state machine based on HTTP grammar order.
     */
    async predictNextCategory(history: [string, string][]): Promise<string> {
        if (this.session) {
            return this.onnxPredict(history);
        }
        return this.deterministicPredict(history);
    }

    private async onnxPredict(history: [string, string][]): Promise<string> {
        if (!this.session) return this.deterministicPredict(history);
        if (history.length === 0) return 'METHOD';

        try {
            const typeIds: number[] = [];
            const valueIds: number[] = [];

            for (const [baseType, val] of history) {
                typeIds.push(this.CAT_MAP[baseType] ?? 5);
                const hashHex = CryptoJS.MD5(val).toString(CryptoJS.enc.Hex);
                const hashInt = parseInt(hashHex.substring(0, 8), 16);
                valueIds.push(hashInt % 1000);
            }

            const seqLen = history.length;
            const typeTensor = new ort.Tensor('int64', BigInt64Array.from(typeIds.map(BigInt)), [1, seqLen]);
            const valueTensor = new ort.Tensor('int64', BigInt64Array.from(valueIds.map(BigInt)), [1, seqLen]);

            const feeds = { type_ids: typeTensor, value_ids: valueTensor };
            const results = await this.session.run(feeds);
            const logits = results.logits.data as Float32Array;

            const numClasses = 7;
            const startIdx = (seqLen - 1) * numClasses;
            let maxScore = -Infinity;
            let predId = 0;

            for (let i = 0; i < numClasses; i++) {
                const score = logits[startIdx + i];
                if (score > maxScore) {
                    maxScore = score;
                    predId = i;
                }
            }

            return this.REV_CAT_MAP[predId] || this.deterministicPredict(history);
        } catch (e) {
            console.warn('[SSTWrapper] Inference error, using fallback:', String(e));
            return this.deterministicPredict(history);
        }
    }

    /**
     * Deterministic fallback: follows HTTP grammar order.
     * After VERSION, alternates HEADER_NAME → HEADER_VALUE.
     * This is 100% deterministic and produces identical results on Encoder and Decoder.
     */
    private deterministicPredict(history: [string, string][]): string {
        // Filter out START entries
        const real = history.filter(h => h[0] !== 'START');
        const len = real.length;

        if (len === 0) return 'METHOD';
        if (len === 1) return 'PATH';
        if (len === 2) return 'VERSION';

        // After the first 3 tokens (METHOD, PATH, VERSION), alternate HEADER_NAME / HEADER_VALUE
        const lastType = real[real.length - 1][0];
        if (lastType === 'HEADER_NAME') return 'HEADER_VALUE';
        return 'HEADER_NAME';
    }
}

import * as ort from 'onnxruntime-web';
import CryptoJS from 'crypto-js';

export class SSTWrapper {
    private session: ort.InferenceSession | null = null;
    private modelPath: string;

    private CAT_LIST = ['METHOD', 'PATH', 'VERSION', 'HEADER_NAME', 'HEADER_VALUE'];
    private CAT_MAP: Record<string, number> = {};
    private REV_CAT_MAP: Record<number, string> = {};

    constructor(modelPath: string = '/models/sst_model.onnx') {
        this.modelPath = modelPath;
        this.CAT_LIST.sort(); // Ensure deterministic order
        this.CAT_LIST.forEach((t, i) => {
            this.CAT_MAP[t] = i;
            this.REV_CAT_MAP[i] = t;
        });
    }

    async init() {
        if (this.session) {
            console.log("[SSTWrapper] Using injected session.");
            return;
        }
        try {
            // Load ONNX model
            this.session = await ort.InferenceSession.create(this.modelPath, {
                executionProviders: ['wasm'],
                graphOptimizationLevel: 'all'
            });
            console.log(`[SSTWrapper] Model loaded from ${this.modelPath}`);
        } catch (e) {
            console.error(`[SSTWrapper] Failed to load model: ${e}`);
        }
    }

    injectSession(session: any) {
        this.session = session;
    }

    async predictNextCategory(history: [string, string][]): Promise<string> {
        if (!this.session) {
            console.warn("[SSTWrapper] Session not initialized");
            return "HEADER_NAME"; // Fallback
        }

        if (history.length === 0) return "METHOD";

        // Prepare inputs
        // SST expects [batch, seq_len] int64 tensors
        const typeIds: number[] = [];
        const valueIds: number[] = [];

        for (const [baseType, val] of history) {
            typeIds.push(this.CAT_MAP[baseType] ?? 5); // Default to 5 (unknown)

            // Match Python's hash: int(md5(val).hexdigest(), 16) % 1000
            const hashHex = CryptoJS.MD5(val).toString(CryptoJS.enc.Hex);
            const hashInt = parseInt(hashHex.substring(0, 8), 16); // Take first 8 chars to avoid overflow
            valueIds.push(hashInt % 1000);
        }

        // Create tensors
        // Shape: [1, seq_len]
        const seqLen = history.length;
        const typeTensor = new ort.Tensor('int64', BigInt64Array.from(typeIds.map(BigInt)), [1, seqLen]);
        const valueTensor = new ort.Tensor('int64', BigInt64Array.from(valueIds.map(BigInt)), [1, seqLen]);

        try {
            const feeds = { type_ids: typeTensor, value_ids: valueTensor };
            const results = await this.session.run(feeds);

            // Output is 'logits': [1, seq_len, num_classes]
            const logits = results.logits.data as Float32Array;

            // We want the last timestep's prediction
            // logits form is flat: [batch * seq * classes]
            // The last token's logits start at: (seqLen - 1) * num_classes
            const numClasses = 7; // As defined in model.py
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

            return this.REV_CAT_MAP[predId] || "HEADER_NAME";

        } catch (e) {
            console.error(`[SSTWrapper] Inference failed: ${e}`);
            return "HEADER_NAME";
        }
    }
}

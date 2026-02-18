import CryptoJS from 'crypto-js';
import { Token } from '../tokenizer/token';
import { MappingGenerator } from '../encoder/mapping';
import { HTTPGrammar } from '../grammar/http_grammar';
import { SSTWrapper } from '../encoder/sst_wrapper';

export class ReversibleDecoder {
    private generator: MappingGenerator;
    private grammar: HTTPGrammar;
    private sst: SSTWrapper;
    private sessionKey: string;

    // History for SST context: [Type, Value]
    private history: [string, string][] = [];

    constructor(sessionKey: string, timestamp: number, modelPathOrWrapper?: string | SSTWrapper) {
        this.sessionKey = sessionKey;
        const window = MappingGenerator.getTimeWindow(timestamp);
        this.generator = new MappingGenerator(sessionKey, window);
        this.grammar = new HTTPGrammar();

        if (modelPathOrWrapper instanceof SSTWrapper) {
            this.sst = modelPathOrWrapper;
        } else {
            this.sst = new SSTWrapper(typeof modelPathOrWrapper === 'string' ? modelPathOrWrapper : undefined);
        }
    }

    async init() {
        await this.sst.init();
        this.history = [['START', 'START']];
    }

    // Label helper to identify token types
    private label(baseLabel: string): string {
        const input = `${this.sessionKey}:${baseLabel}`;
        const hash = CryptoJS.SHA256(input).toString(CryptoJS.enc.Hex);
        return `T_${hash.substring(0, 6)}`;
    }

    async decode(encodedTokens: Token[]): Promise<Token[]> {
        const decodedTokens: Token[] = [];
        this.history = [['START', 'START']];

        const baseTypes = ['METHOD', 'PATH', 'VERSION', 'HEADER_NAME', 'HEADER_VALUE', 'UNKNOWN'];
        let currentHeaderName: string | undefined = undefined;

        for (let i = 0; i < encodedTokens.length; i++) {
            const t = encodedTokens[i];

            // 1. Identify Base Type using Dynamic Label
            // The encoded token retains the original Type Label (Session-Specific)
            let baseType = 'UNKNOWN';
            for (const bt of baseTypes) {
                if (t.type === this.label(bt)) {
                    baseType = bt;
                    break;
                }
            }

            // 2. Predict Next (Same as Encoder - keeping SST synchronized)
            // Note: Decoder uses *decoded* history for prediction, matching Encoder's *original* history
            const predictedNext = await this.sst.predictNextCategory(this.history);

            // 3. SST Prediction (Sync with encoder)
            let targetCategory = baseType;

            try {
                if (predictedNext && predictedNext !== 'UNKNOWN') {
                    // PROFESSIONAL UPGRADE: Synchronized Adaptive Jitter
                    // Replicating the exact same jitter logic from the Encoder to maintain 1:1 sync.
                    const historyStr = this.history.map(h => h[0]).join(':');
                    const jitterHash = CryptoJS.HmacSHA256(historyStr, this.sessionKey).toString();
                    const jitterFactor = parseInt(jitterHash.substring(0, 2), 16) % 10;

                    if (predictedNext && predictedNext !== 'UNKNOWN' && jitterFactor > 2) {
                        targetCategory = predictedNext;
                    } else if (jitterFactor <= 2) {
                        const decoys = ['HEADER_NAME', 'HEADER_VALUE', 'PATH'];
                        targetCategory = decoys[jitterFactor % decoys.length];
                    }
                }
            } catch (e) { }

            // 4. Get Vocabulary
            let vocabulary: string[] = [];

            if (targetCategory === 'HEADER_VALUE' && currentHeaderName) {
                vocabulary = this.grammar.getVocabulary(targetCategory, currentHeaderName);
            } else {
                vocabulary = this.grammar.getVocabulary(targetCategory);
            }

            // 4. Decode Value
            // Apply inverse mapping
            const originalValue = this.generator.unmapValue(baseType, t.value, vocabulary);

            // 5. Update History & Context with ORIGINAL value
            this.history.push([baseType, originalValue]);

            if (baseType === 'HEADER_NAME') {
                currentHeaderName = originalValue;
            }

            decodedTokens.push(new Token(t.type, originalValue, t.position));
        }

        return decodedTokens;
    }
}

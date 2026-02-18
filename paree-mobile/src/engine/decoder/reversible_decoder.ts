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

    private label(baseLabel: string): string {
        const input = `${this.sessionKey}:${baseLabel}`;
        const hash = CryptoJS.SHA256(input).toString(CryptoJS.enc.Hex);
        return `T_${hash.substring(0, 6)}`;
    }

    /**
     * MUST be identical logic to ReversibleEncoder.selectTargetCategory.
     * Deterministic — no jitter, no randomness.
     */
    private async selectTargetCategory(baseType: string): Promise<string> {
        try {
            const predicted = await this.sst.predictNextCategory(this.history);
            if (predicted && predicted !== 'UNKNOWN') {
                return predicted;
            }
        } catch (_) {
            // Model unavailable — fall through to baseType
        }
        return baseType;
    }

    async decode(encodedTokens: Token[]): Promise<Token[]> {
        const decodedTokens: Token[] = [];
        this.history = [['START', 'START']];

        const baseTypes = ['METHOD', 'PATH', 'VERSION', 'HEADER_NAME', 'HEADER_VALUE', 'UNKNOWN'];
        let currentHeaderName: string | undefined = undefined;

        for (let i = 0; i < encodedTokens.length; i++) {
            const t = encodedTokens[i];

            // 1. Identify base type from dynamic label
            let baseType = 'UNKNOWN';
            for (const bt of baseTypes) {
                if (t.type === this.label(bt)) {
                    baseType = bt;
                    break;
                }
            }

            // 2. Deterministic target category selection (SAME logic as encoder)
            const targetCategory = await this.selectTargetCategory(baseType);

            // 3. Get vocabulary for target category
            let vocabulary: string[] = [];
            if (targetCategory === 'HEADER_VALUE' && currentHeaderName) {
                vocabulary = this.grammar.getVocabulary(targetCategory, currentHeaderName);
            } else {
                vocabulary = this.grammar.getVocabulary(targetCategory);
            }

            // 4. Decode value using inverse mapping
            const originalValue = this.generator.unmapValue(baseType, t.value, vocabulary);

            // 5. Update history with ORIGINAL value (mirrors encoder's history)
            this.history.push([baseType, originalValue]);

            // 6. Track header name context
            if (baseType === 'HEADER_NAME') {
                currentHeaderName = originalValue;
            }

            decodedTokens.push(new Token(t.type, originalValue, t.position));
        }

        return decodedTokens;
    }
}

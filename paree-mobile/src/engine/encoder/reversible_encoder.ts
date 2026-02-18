import CryptoJS from 'crypto-js';
import { Token } from '../tokenizer/token';
import { MappingGenerator } from './mapping';
import { HTTPGrammar } from '../grammar/http_grammar';
import { SSTWrapper } from './sst_wrapper';

export class ReversibleEncoder {
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
     * Deterministic category selector.
     * Uses the SST model prediction as primary signal.
     * Falls back to the token's own base type if model fails or returns UNKNOWN.
     * NO jitter — determinism is required for mobile reliability.
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

    async encode(tokens: Token[]): Promise<Token[]> {
        const encodedTokens: Token[] = [];
        this.history = [['START', 'START']];

        const baseTypes = ['METHOD', 'PATH', 'VERSION', 'HEADER_NAME', 'HEADER_VALUE', 'UNKNOWN'];
        let currentHeaderName: string | undefined = undefined;

        for (let i = 0; i < tokens.length; i++) {
            const t = tokens[i];

            // 1. Identify base type from dynamic label
            let baseType = 'UNKNOWN';
            for (const bt of baseTypes) {
                if (t.type === this.label(bt)) {
                    baseType = bt;
                    break;
                }
            }

            // 2. Deterministic target category selection
            const targetCategory = await this.selectTargetCategory(baseType);

            // 3. Get vocabulary for target category
            let vocabulary: string[] = [];
            if (targetCategory === 'HEADER_VALUE' && currentHeaderName) {
                vocabulary = this.grammar.getVocabulary(targetCategory, currentHeaderName);
            } else {
                vocabulary = this.grammar.getVocabulary(targetCategory);
            }

            // 4. Update history BEFORE encoding (encoder and decoder share this order)
            this.history.push([baseType, t.value]);

            // 5. Track header name context
            if (baseType === 'HEADER_NAME') {
                currentHeaderName = t.value;
            }

            // 6. Encode value
            const encodedValue = this.generator.mapValue(baseType, t.value, vocabulary);
            encodedTokens.push(new Token(t.type, encodedValue, t.position));
        }

        return encodedTokens;
    }
}

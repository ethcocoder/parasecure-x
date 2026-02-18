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
        // Initialize with start token
        this.history = [['START', 'START']];
    }

    // Helper to re-generate the unique label for comparison
    private label(baseLabel: string): string {
        const input = `${this.sessionKey}:${baseLabel}`;
        const hash = CryptoJS.SHA256(input).toString(CryptoJS.enc.Hex);
        return `T_${hash.substring(0, 6)}`;
    }

    async encode(tokens: Token[]): Promise<Token[]> {
        const encodedTokens: Token[] = [];
        this.history = [['START', 'START']]; // Reset history per packet

        // Known base types to check against
        const baseTypes = ['METHOD', 'PATH', 'VERSION', 'HEADER_NAME', 'HEADER_VALUE', 'UNKNOWN'];

        // Context tracking
        let currentHeaderName: string | undefined = undefined;

        for (let i = 0; i < tokens.length; i++) {
            const t = tokens[i];

            // 1. Identify Base Type (Reverse lookup of dynamic label)
            let baseType = 'UNKNOWN';
            for (const bt of baseTypes) {
                if (t.type === this.label(bt)) {
                    baseType = bt;
                    break;
                }
            }

            // 2. Get Vocabulary for specific type
            // If HEADER_VALUE, we need the *original* header name context
            // But wait, the header name itself might be encoded?
            // No, we are encoding *this* token. The context comes from previous *original* tokens?
            // Actually, in the Python implementation, we map based on the *original* value's vocabulary.

            // 3. SST Prediction (The "Architect")
            // The model tells us what the "Cover Traffic" should look like at this position.
            // We use this prediction to select the VOCABULARY for the mapping.
            // This makes the encoding context-aware and dependent on the model.

            let targetCategory = baseType; // Default fallback

            try {
                // prediction is strictly based on history, which is shared state
                const predicted = await this.sst.predictNextCategory(this.history);

                // PROFESSIONAL UPGRADE: Adaptive Jitter
                // We add a deterministic "noise" factor to decoy selection.
                // Even if the model predicts X, we might drift to Y based on session entropy.
                // This breaks statistical frequency analysis while remaining 100% reversible.
                const historyStr = this.history.map(h => h[0]).join(':');
                const jitterHash = CryptoJS.HmacSHA256(historyStr, this.sessionKey).toString();
                const jitterFactor = parseInt(jitterHash.substring(0, 2), 16) % 10;

                if (predicted && predicted !== 'UNKNOWN' && jitterFactor > 2) { // 70% chance to follow model
                    targetCategory = predicted;
                } else if (jitterFactor <= 2) {
                    // Drift to an adjacent valid category
                    const decoys = ['HEADER_NAME', 'HEADER_VALUE', 'PATH'];
                    targetCategory = decoys[jitterFactor % decoys.length];
                }
            } catch (e) {
                // Fallback on model failure
            }

            // 4. Get Vocabulary for the TARGET category
            // The Decoder will run the same model, get the same targetCategory, and load the same vocab to decode.
            let vocabulary: string[] = [];

            // Note: For HEADER_VALUE, we usually need context to pick the right decoy list (e.g. User-Agent decoys vs Accept decoys).
            if (targetCategory === 'HEADER_VALUE' && currentHeaderName) {
                vocabulary = this.grammar.getVocabulary(targetCategory, currentHeaderName);
            } else {
                vocabulary = this.grammar.getVocabulary(targetCategory);
            }

            // 5. Update History (Authentic History)
            // CRITICAL: The model predicts based on what it *has seen* (Encoded or Original?).
            // In the "Sovereign" design, the model usually tracks the *Cover* structure (Encoded).
            // BUT, our SST implementation currently tracks `baseType` in `history.push([baseType, t.value])`.
            // If we want the model to predict the *next cover*, we should feed it the *cover* history?
            // Or does it model the *underlying* protocol?
            // Re-reading plan: "SST learns 100% of RFC rules... Deterministic state-selector".
            // It models the *valid protocol*. 
            // If we want the output to look like valid HTTP, we must feed it the *output* structure?
            // Actually, for Reversibility, Encoder/Decoder must stay in sync.
            // If we feed it *Original* history, both have it (Decoder reconstructs it).
            // If we feed it *Encoded* history, both have it (Decoder sees it first).
            // Let's stick to ORIGINAL history for now as it's cleaner for the logic flow,
            // (Decoder decodes T -> adds T_original to history -> Predicts T+1).
            // Wait, to decode T, Decoder needs prediction for T.
            // Prediction for T comes from history 0..T-1.
            // So Decoder has 0..T-1 (already decoded).
            // So yes, we feed ORIGINAL history.

            this.history.push([baseType, t.value]);

            // 6. Encode Value
            // Map (Original Value) -> (Value from Target Vocabulary)
            const encodedValue = this.generator.mapValue(baseType, t.value, vocabulary);

            // Track header name for next value (if we were strictly grammar based)
            if (baseType === 'HEADER_NAME') {
                currentHeaderName = t.value;
            }

            // 6. Create Encoded Token
            // We keep the SAME token type (dynamic label) so decoder knows what it is
            // The value is what changes.
            encodedTokens.push(new Token(t.type, encodedValue, t.position));
        }

        return encodedTokens;
    }
}

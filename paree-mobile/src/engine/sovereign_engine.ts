import { HTTPTokenizer } from './tokenizer/http_tokenizer';
import { ReversibleEncoder } from './encoder/reversible_encoder';
import { ReversibleDecoder } from './decoder/reversible_decoder';
import { SSTWrapper } from './encoder/sst_wrapper';

export interface EngineResult {
    ok: boolean;
    original: string;
    encoded: string;
    decoded: string;
    stats: {
        tokens: number;
        encodeMs: number;
        decodeMs: number;
    };
    error?: string;
}

/**
 * SovereignEngine: Production-grade coordinator for the PAREE system.
 * Implements the "Two-Model Isolation" strategy for maximum reliability.
 */
export class SovereignEngine {
    private sstEncoder: SSTWrapper;
    private sstDecoder: SSTWrapper;
    private tokenizer: HTTPTokenizer;
    private initialized = false;

    constructor(private sessionKey: string) {
        // DUPLICATION STRATEGY: Separate instances to avoid internal WASM state sharing
        this.sstEncoder = new SSTWrapper();
        this.sstDecoder = new SSTWrapper();
        this.tokenizer = new HTTPTokenizer(sessionKey);
    }

    async init() {
        if (this.initialized) return;
        // Parallel init for speed
        await Promise.all([
            this.sstEncoder.init(),
            this.sstDecoder.init()
        ]);
        this.initialized = true;
    }

    private normalize(s: string): string {
        // Normalize newlines and trim for robust comparison
        return s.replace(/\r\n/g, '\n').trim();
    }

    async run(packet: string): Promise<EngineResult> {
        if (!this.initialized) await this.init();

        const stats = { tokens: 0, encodeMs: 0, decodeMs: 0 };
        const timestamp = Math.floor(Date.now() / 1000);

        try {
            // 1. Tokenize
            const tokens = this.tokenizer.tokenize(packet);
            stats.tokens = tokens.length;

            // 2. Encode
            const encoder = new ReversibleEncoder(this.sessionKey, timestamp, this.sstEncoder);
            await encoder.init();

            const t1 = performance.now();
            const encodedTokens = await encoder.encode(tokens);
            stats.encodeMs = Math.round(performance.now() - t1);
            const encodedStr = this.tokenizer.reconstruct(encodedTokens);

            // 3. Decode
            const decoder = new ReversibleDecoder(this.sessionKey, timestamp, this.sstDecoder);
            await decoder.init();

            const t2 = performance.now();
            const decodedTokens = await decoder.decode(encodedTokens);
            stats.decodeMs = Math.round(performance.now() - t2);
            const decodedStr = this.tokenizer.reconstruct(decodedTokens);

            // 4. Verify with Newline Normalization
            const originalNorm = this.normalize(packet);
            const decodedNorm = this.normalize(decodedStr);
            const ok = originalNorm === decodedNorm;

            let errorDetail = undefined;
            if (!ok) {
                errorDetail = `Mismatch detected.\nOriginal (norm):\n${originalNorm}\n\nDecoded (norm):\n${decodedNorm}`;
            }

            return {
                ok,
                original: packet,
                encoded: encodedStr,
                decoded: decodedStr,
                stats,
                error: errorDetail
            };
        } catch (e: any) {
            return {
                ok: false,
                original: packet,
                encoded: '',
                decoded: '',
                stats,
                error: `Engine Exception: ${e.message || String(e)}`
            };
        }
    }
}

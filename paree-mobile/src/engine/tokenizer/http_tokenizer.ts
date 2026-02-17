import CryptoJS from 'crypto-js';
import { Token } from './token';

export class HTTPTokenizer {
    private sessionKey: string | null;

    constructor(sessionKey: string | null = null) {
        this.sessionKey = sessionKey;
    }

    private label(baseLabel: string): string {
        if (!this.sessionKey) return baseLabel;
        const input = `${this.sessionKey}:${baseLabel}`;
        const hash = CryptoJS.SHA256(input).toString(CryptoJS.enc.Hex);
        return `T_${hash.substring(0, 6)}`;
    }

    tokenize(rawData: string): Token[] {
        const tokens: Token[] = [];
        let pos = 0;

        // 1. Split Head and Body
        // Normalize newlines to \n for splitting, but keep raw for body if needed?
        // Actually, HTTP standard is \r\n\r\n. 
        // Let's look for the first double newline.
        let splitIndex = rawData.indexOf('\r\n\r\n');
        let delimiterLen = 4;

        if (splitIndex === -1) {
            splitIndex = rawData.indexOf('\n\n');
            delimiterLen = 2;
        }

        let head = rawData;
        let body = "";

        if (splitIndex !== -1) {
            head = rawData.substring(0, splitIndex);
            body = rawData.substring(splitIndex + delimiterLen);
        }

        // 2. Parse Head (Request Line + Headers)
        const lines = head.split(/\r?\n/).filter(l => l.trim().length > 0);

        if (lines.length > 0) {
            // Request Line
            const reqLine = lines[0];
            const reqMatch = reqLine.match(/^([A-Z]+)\s+(.+)\s+(HTTP\/[\d\.]+)$/);

            if (reqMatch) {
                const [, method, path, version] = reqMatch;
                tokens.push(new Token(this.label('METHOD'), method, pos++));
                tokens.push(new Token(this.label('PATH'), path, pos++));
                tokens.push(new Token(this.label('VERSION'), version, pos++));
            } else {
                tokens.push(new Token(this.label('UNKNOWN'), reqLine, pos++));
            }

            // Headers
            for (let i = 1; i < lines.length; i++) {
                const line = lines[i];
                // Keep raw header validation loose to catch varied formats
                const headerMatch = line.match(/^([^:]+):\s*(.*)$/);
                if (headerMatch) {
                    const [, name, value] = headerMatch;
                    tokens.push(new Token(this.label('HEADER_NAME'), name, pos++));
                    tokens.push(new Token(this.label('HEADER_VALUE'), value, pos++));
                }
            }
        }

        // 3. Body
        if (body.length > 0) {
            tokens.push(new Token(this.label('PAYLOAD'), body, pos++));
        }

        return tokens;
    }

    reconstruct(tokens: Token[]): string {
        const sorted = [...tokens].sort((a, b) => a.position - b.position);
        let res = "";

        // Helper to find token by base label (reversed in theory, but here we just check type)
        // Since labels are dynamic, this is tricky *if* we don't know the dynamic map.
        // BUT, the tokens passed here are ALREADY decoded (restored to base types? No, they have dynamic labels).
        // Wait, the DECODER restores the *values*. Does it restore the *types* (labels)?
        // The Token class has `type`. The Decoder returns tokens with the *original* values.
        // It *should* also theoretically restore the labels if `ReversibleDecoder` mapped them back.
        // Let's assume for reconstruct we iterate structurally.

        // We assume standard order: METHOD PATH VERSION -> HEADERS -> PAYLOAD

        // This relies on the relative position.

        // 0: METHOD, 1: PATH, 2: VERSION
        if (sorted.length >= 3) {
            res += `${sorted[0].value} ${sorted[1].value} ${sorted[2].value}\r\n`;
        }

        let i = 3;
        // Headers are pairs
        while (i < sorted.length) {
            const t1 = sorted[i];
            const t2 = sorted[i + 1];

            // Check if t1 is PAYLOAD (it won't have a pair, or we identify it by specific logic?)
            // We don't have the un-hashed label here easily to check "is this PAYLOAD?"
            // But PAYLOAD is usually the last token and might be alone.

            // Heuristic: If we have a pair and neither looks like a massive body...
            // Or better: rely on the loop. Headers are pairs. Payload is single.

            if (i === sorted.length - 1) {
                // Single token left -> Payload
                res += `\r\n${t1.value}`;
                i++;
            } else {
                // Pair -> Header?
                // Note: If payload exists, it's 1 token. If headers make even count, payload makes odd.
                // Start index 3. 
                // e.g. 3,4 (Header), 5 (Payload). Length=6. 
                // i=3. t1=3, t2=4. res += H: V. i+=2 -> 5.
                // i=5. Length=6. t2=sorted[6] undefined.

                if (t2) {
                    // Check if t2 is actually the payload? (Unlikely, payload is last).
                    // We treat pairs as headers.
                    res += `${t1.value}: ${t2.value}\r\n`;
                    i += 2;
                } else {
                    // Should be unreachable if logic holds, but handle tail
                    res += `\r\n${t1.value}`;
                    i++;
                }
            }
        }

        // If no payload token was processed (e.g. valid even number of tokens, no body), 
        // we might still need the double CRLF? 
        // Standard says headers end with CRLF. 
        // Our loop adds `\r\n` after each header.
        // If there was a payload, we added `\r\n${payload}`.
        // If there was NO payload, we need the final `\r\n` to end headers.
        // But our payload logic (last token) adds `\r\n` *before* payload.
        // If no payload, we just printed headers. We need one more \r\n.

        // Revised Logic:
        // We need to know which token is payload.
        // We can check `this.label('PAYLOAD')` against `token.type`!
        // The Tokenizer instance has the session key, so it can re-compute the hash.

        // Let's restart the reconstruction loop with reliable type checking.
        return this.reconstructSafe(sorted);
    }

    private reconstructSafe(sorted: Token[]): string {
        let res = "";
        let headerSeq = true;

        const L_METHOD = this.label('METHOD');
        const L_PATH = this.label('PATH');
        const L_VERSION = this.label('VERSION');
        const L_HEADER_NAME = this.label('HEADER_NAME');
        const L_HEADER_VALUE = this.label('HEADER_VALUE');
        const L_PAYLOAD = this.label('PAYLOAD');

        const L_UNKNOWN = this.label('UNKNOWN');

        let startIndex = 0;

        // Check for Request Line (Method, Path, Version) vs Unknown
        if (sorted.length > 0 && sorted[0].type === L_UNKNOWN) {
            res += `${sorted[0].value}\r\n`;
            startIndex = 1;
        } else if (sorted.length >= 3) {
            // Assume 3-part request line
            res += `${sorted[0].value} ${sorted[1].value} ${sorted[2].value}\r\n`;
            startIndex = 3;
        }

        for (let i = startIndex; i < sorted.length; i++) {
            const t = sorted[i];
            if (t.type === L_PAYLOAD) {
                res += `\r\n${t.value}`;
                headerSeq = false;
            } else {
                // Header Name
                if (t.type === L_HEADER_NAME && sorted[i + 1] && sorted[i + 1].type === L_HEADER_VALUE) {
                    res += `${t.value}: ${sorted[i + 1].value}\r\n`;
                    i++; // Skip value
                } else {
                    // Fallback for weird states
                    // res += `${t.value}\r\n`;
                }
            }
        }

        // If we ended with headers and no payload, append final CRLF
        if (headerSeq) {
            res += "\r\n";
        }

        return res;
    }
}

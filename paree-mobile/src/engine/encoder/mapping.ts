import CryptoJS from 'crypto-js';

export class MappingGenerator {
    private seed: number;

    constructor(
        private sessionKey: string,
        private timestampWindow: number
    ) {
        this.seed = this.generateSeed();
    }

    private generateSeed(): number {
        const input = `${this.sessionKey}:${this.timestampWindow}`;
        const hash = CryptoJS.SHA256(input).toString(CryptoJS.enc.Hex);
        // Use first 8 bytes (16 hex chars) to create a large integer seed
        return parseInt(hash.substring(0, 16), 16);
    }

    private reversibleCipher(value: string, decrypt: boolean = false): string {
        const keyHash = CryptoJS.SHA256(this.sessionKey).toString(CryptoJS.enc.Hex);
        const keyBytes = this.hexToBytes(keyHash);

        let dataBytes: number[] = [];
        if (decrypt) {
            try {
                dataBytes = this.hexToBytes(value);
            } catch (e) {
                return value; // Return original if not valid hex
            }
        } else {
            for (let i = 0; i < value.length; i++) {
                dataBytes.push(value.charCodeAt(i));
            }
        }

        const result: number[] = [];
        for (let i = 0; i < dataBytes.length; i++) {
            // Simple XOR with key byte offset by seed
            const keyByte = keyBytes[(i + (this.seed % 256)) % keyBytes.length];
            result.push(dataBytes[i] ^ keyByte);
        }

        if (decrypt) {
            return String.fromCharCode(...result);
        } else {
            return this.bytesToHex(result);
        }
    }

    generateMapping(tokenType: string, vocabulary: string[]): Record<string, string> {
        if (!vocabulary || vocabulary.length === 0) return {};

        // Seed PRNG with (Global Seed + Token Type Hash)
        const typeHash = parseInt(CryptoJS.SHA256(tokenType).toString(CryptoJS.enc.Hex).substring(0, 8), 16);
        const localSeed = this.seed + typeHash;

        const rng = new SimplePRNG(localSeed);

        const sortedVocab = [...new Set(vocabulary)].sort();
        const shuffledVocab = [...sortedVocab];

        // Fisher-Yates Shuffle using seeded PRNG
        for (let i = shuffledVocab.length - 1; i > 0; i--) {
            const j = Math.floor(rng.nextFloat() * (i + 1));
            [shuffledVocab[i], shuffledVocab[j]] = [shuffledVocab[j], shuffledVocab[i]];
        }

        const mapping: Record<string, string> = {};
        for (let i = 0; i < sortedVocab.length; i++) {
            mapping[sortedVocab[i]] = shuffledVocab[i];
        }
        return mapping;
    }

    mapValue(tokenType: string, value: string, vocabulary: string[]): string {
        const mapping = this.generateMapping(tokenType, vocabulary);
        if (mapping[value]) {
            return mapping[value];
        }
        return this.reversibleCipher(value, false);
    }

    unmapValue(tokenType: string, value: string, vocabulary: string[]): string {
        const mapping = this.generateMapping(tokenType, vocabulary);
        // Invert map
        const inverse: Record<string, string> = {};
        for (const [k, v] of Object.entries(mapping)) {
            inverse[v] = k;
        }

        if (inverse[value]) {
            return inverse[value];
        }
        return this.reversibleCipher(value, true);
    }

    static getTimeWindow(timestamp: number, windowMinutes: number = 5): number {
        return Math.floor(timestamp / (windowMinutes * 60));
    }

    // Helpers
    private hexToBytes(hex: string): number[] {
        const bytes = [];
        for (let c = 0; c < hex.length; c += 2) {
            bytes.push(parseInt(hex.substr(c, 2), 16));
        }
        return bytes;
    }

    private bytesToHex(bytes: number[]): string {
        return bytes.map(b => b.toString(16).padStart(2, '0')).join('');
    }
}

// Simple Linear Congruential Generator for consistent cross-platform randomness
class SimplePRNG {
    private m = 2147483647;
    private a = 16807;
    private c = 0;
    private state: number;

    constructor(seed: number) {
        this.state = seed % this.m;
        if (this.state <= 0) this.state += this.m;
    }

    nextFloat(): number {
        this.state = (this.a * this.state + this.c) % this.m;
        return (this.state - 1) / (this.m - 1);
    }
}

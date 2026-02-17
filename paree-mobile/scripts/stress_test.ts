
import fs from 'fs';
import path from 'path';
import { HTTPTokenizer } from '../src/engine/tokenizer/http_tokenizer';
import { ReversibleEncoder } from '../src/engine/encoder/reversible_encoder';
import { ReversibleDecoder } from '../src/engine/decoder/reversible_decoder';
import { SSTWrapper } from '../src/engine/encoder/sst_wrapper';
import * as ortNode from 'onnxruntime-node';

// Real-world scenarios
const SCENARIOS = [
    {
        name: "Standard API GET",
        input: "GET /api/v1/users/123/profile HTTP/1.1\r\nHost: api.social-network.com\r\nAuthorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9\r\nAccept: application/json\r\nUser-Agent: OkHttp/4.9.0\r\n\r\n"
    },
    {
        name: "JSON POST Login",
        input: "POST /auth/login HTTP/2\r\nHost: accounts.google.com\r\nContent-Type: application/json\r\nContent-Length: 48\r\nOrigin: https://google.com\r\n\r\n{\"username\": \"user@example.com\", \"password\": \"secret\"}"
    },
    {
        name: "Multipart File Upload (Fragment)",
        input: "POST /upload HTTP/1.1\r\nHost: file-server.internal\r\nContent-Type: multipart/form-data; boundary=----WebKitFormBoundary7MA4YWxkTrZu0gW\r\n\r\n------WebKitFormBoundary7MA4YWxkTrZu0gW\nContent-Disposition: form-data; name=\"file\"; filename=\"report.pdf\"\nContent-Type: application/pdf\n\n%PDF-1.5\n..."
    },
    {
        name: "Browser Options Preflight",
        input: "OPTIONS /graphql HTTP/1.1\r\nHost: api.backend.io\r\nAccess-Control-Request-Method: POST\r\nAccess-Control-Request-Headers: content-type\r\nOrigin: https://dashboard.io\r\n\r\n"
    },
    {
        name: "CDN Image Fetch",
        input: "GET /assets/images/logo-v2.png HTTP/1.1\r\nHost: cdn.assets.net\r\nIf-None-Match: \"5f8d2-12e4\"\r\nIf-Modified-Since: Wed, 21 Oct 2025 07:28:00 GMT\r\n\r\n"
    }
];

async function runStressTest() {
    console.log("========================================");
    console.log("   PAREE ENGINE: REAL-WORLD STRESS TEST   ");
    console.log("========================================");

    const sessionKey = "stress-test-session-key-999";
    const timestamp = Math.floor(Date.now() / 1000);
    const modelPath = path.resolve(__dirname, '../sst_model.onnx');

    console.log(`[*] Loading ONNX Model...`);
    let session: ortNode.InferenceSession;
    try {
        session = await ortNode.InferenceSession.create(modelPath);
    } catch (e) {
        console.error(`[FAIL] Model load failed: ${e}`);
        process.exit(1);
    }

    const sstWrapper = new SSTWrapper(modelPath);
    sstWrapper.injectSession(session);

    const tokenizer = new HTTPTokenizer(sessionKey);
    const encoder = new ReversibleEncoder(sessionKey, timestamp, sstWrapper);
    const decoder = new ReversibleDecoder(sessionKey, timestamp, sstWrapper);

    // Initialize once
    await encoder.init();
    await decoder.init();

    let passed = 0;
    let failed = 0;

    for (const test of SCENARIOS) {
        console.log(`\n----------------------------------------`);
        console.log(`TEST: ${test.name}`);

        try {
            // 1. Tokenize
            // Normalize input for tokenization (the tokenizer expects lines)
            // Ideally tokenizer handles \r\n, but let's ensure it's clean for splitting
            const raw = test.input.replace(/\r\n/g, '\n');
            const tokens = tokenizer.tokenize(raw);
            console.log(`  > Structurally valid? ${tokens.length > 0 ? 'YES' : 'NO'} (${tokens.length} tokens)`);

            // 2. Encode
            const encodedTokens = await encoder.encode(tokens);
            const encodedStr = tokenizer.reconstruct(encodedTokens);

            // 3. Decode
            const decodedTokens = await decoder.decode(encodedTokens);
            const decodedStr = tokenizer.reconstruct(decodedTokens);

            // 4. Verify
            // Normalize for comparison
            const normOriginal = raw.trim();
            const normDecoded = decodedStr.trim().replace(/\r\n/g, '\n');

            if (normOriginal === normDecoded) {
                console.log(`  > STATUS: [PASS] ✅`);
                passed++;
            } else {
                console.log(`  > STATUS: [FAIL] ❌`);
                console.log(`    Expected len: ${normOriginal.length}`);
                console.log(`    Actual len:   ${normDecoded.length}`);
                console.log(`    Diff:`);
                // Simple delta print
                for (let i = 0; i < Math.min(normOriginal.length, normDecoded.length); i++) {
                    if (normOriginal[i] !== normDecoded[i]) {
                        console.log(`      Mismatch at char ${i}: '${normOriginal[i]}' vs '${normDecoded[i]}'`);
                        break;
                    }
                }
                failed++;
            }

        } catch (e) {
            console.log(`  > STATUS: [CRASH] 💥`);
            console.error(e);
            failed++;
        }
    }

    console.log("\n========================================");
    console.log(`SUMMARY: ${passed}/${SCENARIOS.length} Scenarios Passed`);
    console.log("========================================");

    if (failed > 0) process.exit(1);
}

runStressTest();


import fs from 'fs';
import path from 'path';
import { HTTPTokenizer } from '../src/engine/tokenizer/http_tokenizer';
import { ReversibleEncoder } from '../src/engine/encoder/reversible_encoder';
import { ReversibleDecoder } from '../src/engine/decoder/reversible_decoder';
import { SSTWrapper } from '../src/engine/encoder/sst_wrapper';
import * as ortNode from 'onnxruntime-node';

async function runTest() {
    console.log("========================================");
    console.log("[Test] PAREE Engine + ONNX Runtime (Node)");
    console.log("========================================");

    const sessionKey = "test-session-key-123";
    const timestamp = Math.floor(Date.now() / 1000);
    const modelPath = path.resolve(__dirname, '../sst_model.onnx');

    console.log(`[*] Loading ONNX Model from: ${modelPath}`);

    // 1. Create Node.js Session
    let session: ortNode.InferenceSession;
    try {
        session = await ortNode.InferenceSession.create(modelPath);
        console.log("[PASS] Model loaded successfully via onnxruntime-node.");
    } catch (e) {
        console.error(`[FAIL] Failed to load model: ${e}`);
        process.exit(1);
    }

    // 2. Create Wrapper and Inject Session
    const sstWrapper = new SSTWrapper(modelPath);
    sstWrapper.injectSession(session);
    console.log("[*] Injected Node.js session into SSTWrapper.");

    // 3. Define Input
    const input = "GET /api/data HTTP/1.1\nHost: example.com\nUser-Agent: TestClient/1.0";
    console.log(`\n[Input] \n${input}\n`);

    // 4. Tokenize
    console.log("[*] Tokenizing...");
    const tokenizer = new HTTPTokenizer(sessionKey);
    const tokens = tokenizer.tokenize(input);

    // 5. Encode (Using Real Model via DI)
    console.log("\n[*] Encoding (Full Logic with Real Model)...");
    const encoder = new ReversibleEncoder(sessionKey, timestamp, sstWrapper);
    await encoder.init(); // Should use injected session

    const encodedTokens = await encoder.encode(tokens);
    const encodedStr = tokenizer.reconstruct(encodedTokens);
    console.log(`[+] Encoded Packet:\n${encodedStr}`);

    // 6. Decode (Using Real Model via DI)
    console.log("[*] Decoding (Full Logic with Real Model)...");
    const decoder = new ReversibleDecoder(sessionKey, timestamp, sstWrapper); // Reuse same wrapper/session
    await decoder.init();

    const decodedTokens = await decoder.decode(encodedTokens);
    const decodedStr = tokenizer.reconstruct(decodedTokens);

    // 7. Verify
    console.log("========================================");
    const normalizedInput = input.trim().replace(/\r\n/g, '\n');
    const normalizedOutput = decodedStr.trim().replace(/\r\n/g, '\n');

    if (normalizedOutput === normalizedInput) {
        console.log("[SUCCESS] Integrity Verified! Original === Decoded");
    } else {
        console.error("[FAILURE] Mismatch detected!");
        process.exit(1);
    }
    console.log("========================================");
}

runTest();

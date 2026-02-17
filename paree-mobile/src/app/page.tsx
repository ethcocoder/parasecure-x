"use client";

import { useState, useEffect } from "react";
import { HTTPTokenizer } from "../engine/tokenizer/http_tokenizer";
import { ReversibleEncoder } from "../engine/encoder/reversible_encoder";
import { ReversibleDecoder } from "../engine/decoder/reversible_decoder";
import { Token } from "../engine/tokenizer/token";

export default function Home() {
    const [input, setInput] = useState(
        "GET /api/user/profile HTTP/1.1\nHost: secure.internal.bank.com\nAuthorization: Bearer top-secret-token\nUser-Agent: SecureClient/1.0\nAccept: application/json"
    );
    const [status, setStatus] = useState("Ready");
    const [encoded, setEncoded] = useState("");
    const [decoded, setDecoded] = useState("");
    const [logs, setLogs] = useState<string[]>([]);
    const [sessionKey, setSessionKey] = useState("demo-session-key-123");

    const log = (msg: string) => setLogs((prev) => [...prev, msg]);

    const runDemo = async () => {
        setLogs([]);
        setStatus("Processing...");
        setEncoded("");
        setDecoded("");

        try {
            const timestamp = Date.now() / 1000;

            // 1. Tokenize
            log("[*] Tokenizing input...");
            const tokenizer = new HTTPTokenizer(sessionKey);
            const tokens = tokenizer.tokenize(input);
            log(`[+] Tokenized: ${tokens.length} tokens found.`);

            // 2. Encode
            log("[*] Initializing SST Model & Encoder...");
            const encoder = new ReversibleEncoder(sessionKey, timestamp, "/models/sst_model.onnx");
            await encoder.init();

            log("[*] Encoding packet...");
            const encodedTokens = await encoder.encode(tokens);
            const encodedStr = tokenizer.reconstruct(encodedTokens);
            setEncoded(encodedStr);
            log("[+] Encoding Complete.");

            // 3. Decode
            log("[*] Initializing Decoder...");
            const decoder = new ReversibleDecoder(sessionKey, timestamp, "/models/sst_model.onnx");
            await decoder.init();

            log("[*] Decoding packet...");
            const decodedTokens = await decoder.decode(encodedTokens);
            const decodedStr = tokenizer.reconstruct(decodedTokens);
            setDecoded(decodedStr);
            log("[+] Decoding Complete.");

            // 4. Verify
            if (decodedStr.trim() === input.trim()) {
                log("[SUCCESS] 100% Data Integrity Verified! ✅");
                setStatus("Success");
            } else {
                log("[FAILURE] Data mismatch detected! ❌");
                setStatus("Failed");
            }

        } catch (e) {
            log(`[ERROR] ${e}`);
            setStatus("Error");
        }
    };

    return (
        <div className="min-h-screen bg-gray-900 text-gray-100 p-8 font-mono">
            <h1 className="text-3xl font-bold mb-6 text-emerald-400">PAREE Engine Mobile Demo</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Input Column */}
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm text-gray-400 mb-2">Original HTTP Request</label>
                        <textarea
                            className="w-full h-48 bg-gray-800 border border-gray-700 rounded p-4 text-sm focus:border-emerald-500 outline-none"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                        />
                    </div>

                    <div>
                        <label className="block text-sm text-gray-400 mb-2">Session Key</label>
                        <input
                            type="text"
                            className="w-full bg-gray-800 border border-gray-700 rounded p-2 text-sm"
                            value={sessionKey}
                            onChange={(e) => setSessionKey(e.target.value)}
                        />
                    </div>

                    <button
                        onClick={runDemo}
                        className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 rounded transition-colors"
                    >
                        Run Transformation Engine
                    </button>

                    <div className="bg-black border border-gray-800 rounded p-4 h-64 overflow-y-auto">
                        <h3 className="text-gray-500 text-xs uppercase mb-2">System Logs</h3>
                        {logs.map((L, i) => (
                            <div key={i} className="text-xs text-green-400 mb-1">{L}</div>
                        ))}
                    </div>
                </div>

                {/* Output Column */}
                <div className="space-y-6">
                    <div>
                        <label className="block text-sm text-gray-400 mb-2">Encoded Packet (Obfuscated)</label>
                        <pre className="w-full h-40 bg-gray-800 border border-gray-700 rounded p-4 text-xs overflow-auto text-yellow-400">
                            {encoded || "// Waiting for visualization..."}
                        </pre>
                    </div>

                    <div>
                        <label className="block text-sm text-gray-400 mb-2">Decoded Packet (Restored)</label>
                        <pre className="w-full h-40 bg-gray-800 border border-gray-700 rounded p-4 text-xs overflow-auto text-blue-400">
                            {decoded || "// Waiting for visualization..."}
                        </pre>
                    </div>

                    <div className="flex items-center justify-between bg-gray-800 p-4 rounded border border-gray-700">
                        <span className="text-sm text-gray-400">Status</span>
                        <span className={`font-bold ${status === 'Success' ? 'text-green-500' : status === 'Error' ? 'text-red-500' : 'text-gray-300'}`}>
                            {status}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}

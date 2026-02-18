"use client";

import { useState, useEffect, useRef } from "react";
import { HTTPTokenizer } from "../engine/tokenizer/http_tokenizer";
import { ReversibleEncoder } from "../engine/encoder/reversible_encoder";
import { ReversibleDecoder } from "../engine/decoder/reversible_decoder";
import { Token } from "../engine/tokenizer/token";

export default function Home() {
    // --- State Management ---
    const [input, setInput] = useState(
        "GET /api/user/profile HTTP/1.1\nHost: secure.internal.bank.com\nAuthorization: Bearer top-secret-token\nUser-Agent: SecureClient/1.0\nAccept: application/json"
    );
    const [status, setStatus] = useState("Standby");
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isActive, setIsActive] = useState(false);
    const [encoded, setEncoded] = useState("");
    const [decoded, setDecoded] = useState("");
    const [logs, setLogs] = useState<{ id: number, msg: string, time: string }[]>([]);
    const [sessionKey, setSessionKey] = useState("paradox-secure-alpha");
    const logEndRef = useRef<HTMLDivElement>(null);

    // --- Helpers ---
    const addLog = (msg: string) => {
        setLogs((prev) => [
            ...prev,
            { id: Date.now(), msg, time: new Date().toLocaleTimeString().split(' ')[0] }
        ]);
    };

    useEffect(() => {
        logEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [logs]);

    // --- Core Logic ---
    const toggleEngine = async () => {
        if (isActive) {
            setIsActive(false);
            setStatus("Standby");
            addLog("[SYSTEM] Engine Deactivated.");
            return;
        }

        setIsActive(true);
        setStatus("Activating...");
        setLogs([]);
        addLog("[Sovereign] Initializing ParaSecure Paradox Core...");

        try {
            const timestamp = Math.floor(Date.now() / 1000);
            const tokenizer = new HTTPTokenizer(sessionKey);

            // 1. Tokenize
            addLog("[*] Tokenizing structural transitions...");
            const tokens = tokenizer.tokenize(input);
            addLog(`[+] Mapped ${tokens.length} structural tokens.`);

            // 2. Encode (Neural Layer)
            addLog("[*] Loading SST Model (ONNX)...");
            const encoder = new ReversibleEncoder(sessionKey, timestamp, "/models/sst_model.onnx");
            await encoder.init();

            addLog("[*] Executing Neural Disguise...");
            const encodedTokens = await encoder.encode(tokens);
            const encodedStr = tokenizer.reconstruct(encodedTokens);
            setEncoded(encodedStr);
            addLog("[✓] Structural Camouflage Applied.");

            // 3. Decode (Recovery)
            addLog("[*] Synchronizing Decoder session...");
            const decoder = new ReversibleDecoder(sessionKey, timestamp, "/models/sst_model.onnx");
            await decoder.init();

            addLog("[*] Reversing structural transformation...");
            const decodedTokens = await decoder.decode(encodedTokens);
            const decodedStr = tokenizer.reconstruct(decodedTokens);
            setDecoded(decodedStr);
            addLog("[✓] Perfect Restoration Verified.");

            // 4. Final Verification
            if (decodedStr.trim() === input.trim()) {
                addLog("[SUCCESS] 100% Data Integrity. Sovereign Link Stable. ✅");
                setStatus("Active");
            } else {
                addLog("[ERROR] Data mismatch! Logic desync detected. ❌");
                setStatus("Error");
                setIsActive(false);
            }

        } catch (e) {
            addLog(`[CRITICAL] Engine Error: ${e}`);
            setStatus("Error");
            setIsActive(false);
        }
    };

    return (
        <div className="flex min-h-screen bg-[#050505] text-gray-100 font-mono overflow-hidden">

            {/* --- SIDEBAR (Native Style) --- */}
            <div className={`fixed inset-y-0 left-0 transform ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"} md:relative md:translate-x-0 transition-transform duration-300 ease-in-out z-30 w-72 bg-[#0c0c0c] border-r border-[#1a1a1a] flex flex-col`}>
                <div className="p-6 border-b border-[#1a1a1a]">
                    <h2 className="text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-500 tracking-tighter">
                        PARASECURE
                    </h2>
                    <p className="text-[10px] text-gray-500 tracking-widest uppercase">Paradox Engine v1.0</p>
                </div>

                <div className="flex-1 p-4 space-y-6 overflow-y-auto">
                    <div>
                        <label className="text-[10px] text-gray-500 uppercase font-bold mb-2 block">Developer</label>
                        <div className="bg-[#151515] p-3 rounded-lg border border-[#222]">
                            <p className="text-sm font-bold text-emerald-400">Natnael Ermiyas</p>
                            <p className="text-[10px] text-gray-400 italic">Young Innovator & Developer</p>
                        </div>
                    </div>

                    <div>
                        <label className="text-[10px] text-gray-500 uppercase font-bold mb-2 block">Session Context</label>
                        <input
                            type="text"
                            className="w-full bg-[#151515] border border-[#222] rounded p-2 text-xs text-cyan-400 focus:border-cyan-500 outline-none"
                            value={sessionKey}
                            onChange={(e) => setSessionKey(e.target.value)}
                        />
                    </div>

                    <div className="pt-4 border-t border-[#1a1a1a]">
                        <p className="text-[10px] text-gray-500 leading-relaxed">
                            PAREE Engine utilizes Sovereign Structural Transformers to disguise packets as natural traffic while maintaining perfect bit-for-bit reversibility.
                        </p>
                    </div>
                </div>

                <div className="p-6 text-[9px] text-gray-600 uppercase tracking-widest text-center border-t border-[#1a1a1a]">
                    Built for the Sovereign Future
                </div>
            </div>

            {/* --- MAIN CONTENT --- */}
            <div className="flex-1 flex flex-col relative">

                {/* Header / Mobile Toggle */}
                <div className="h-16 border-b border-[#1a1a1a] flex items-center justify-between px-6 bg-[#050505]/80 backdrop-blur-md sticky top-0 z-20">
                    <button className="md:hidden text-emerald-400" onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
                        {isSidebarOpen ? "✕" : "☰"}
                    </button>
                    <div className="flex items-center space-x-2">
                        <div className={`w-2 h-2 rounded-full ${isActive ? 'bg-emerald-500 animate-pulse shadow-[0_0_8px_#10b981]' : 'bg-red-500'}`}></div>
                        <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">{status}</span>
                    </div>
                    <div className="text-[10px] text-gray-600 hidden md:block">NATNAEL ERMIYAS // INNOVATION LAB</div>
                </div>

                <div className="flex-1 p-6 overflow-y-auto space-y-8 max-w-5xl mx-auto w-full">

                    {/* --- CENTRAL POWER UNIT --- */}
                    <div className="flex flex-col items-center justify-center py-10">
                        <button
                            onClick={toggleEngine}
                            className={`relative group w-48 h-48 rounded-full flex flex-col items-center justify-center transition-all duration-500 shadow-2xl
                                ${isActive
                                    ? 'bg-emerald-950/30 border-4 border-emerald-500 shadow-[0_0_50px_-12px_rgba(16,185,129,0.5)]'
                                    : 'bg-[#0c0c0c] border-4 border-[#222] hover:border-emerald-700'
                                }`}
                        >
                            <div className={`text-4xl mb-2 transition-transform duration-500 ${isActive ? 'scale-110' : 'group-hover:scale-105'}`}>
                                {isActive ? '⚡' : '⏻'}
                            </div>
                            <span className={`text-[10px] font-black uppercase tracking-[0.2em] transition-colors duration-500
                                ${isActive ? 'text-emerald-400' : 'text-gray-600 group-hover:text-emerald-600'}`}>
                                {isActive ? 'Paradox Active' : 'Activate PX'}
                            </span>

                            {/* Decorative Rings */}
                            <div className={`absolute -inset-4 rounded-full border border-emerald-500/10 transition-transform duration-[3s] linear infinite
                                ${isActive ? 'animate-[spin_10s_linear_infinite]' : ''}`}></div>
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Input Area */}
                        <div className="space-y-3">
                            <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Target Packet (Original)</h3>
                            <textarea
                                className="w-full h-48 bg-[#0c0c0c] border border-[#1a1a1a] rounded-xl p-4 text-xs font-mono text-cyan-400 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/20 outline-none transition-all"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder="Paste HTTP request here..."
                            />
                        </div>

                        {/* Obfuscated Area */}
                        <div className="space-y-3">
                            <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Sovereign Disguise (Encoded)</h3>
                            <div className="w-full h-48 bg-[#0c0c0c] border border-[#1a1a1a] rounded-xl p-4 text-xs font-mono text-amber-500 overflow-auto whitespace-pre">
                                {encoded || "// Waiting for mobilization..."}
                            </div>
                        </div>
                    </div>

                    {/* --- REAL-TIME TERMINAL --- */}
                    <div className="bg-[#080808] border border-[#1a1a1a] rounded-xl shadow-2xl overflow-hidden flex flex-col h-80">
                        <div className="bg-[#111] px-4 py-2 border-b border-[#1a1a1a] flex justify-between items-center">
                            <div className="flex space-x-2">
                                <div className="w-2.5 h-2.5 rounded-full bg-red-900"></div>
                                <div className="w-2.5 h-2.5 rounded-full bg-amber-900"></div>
                                <div className="w-2.5 h-2.5 rounded-full bg-emerald-900"></div>
                            </div>
                            <span className="text-[9px] font-bold text-gray-500 tracking-tighter">PARASECURE_CORE_STREAM</span>
                        </div>
                        <div className="flex-1 p-4 overflow-y-auto space-y-1 scrollbar-hide">
                            {logs.length === 0 && <div className="text-gray-700 italic text-[10px]">// System initialized. Awaiting user activation...</div>}
                            {logs.map((log) => (
                                <div key={log.id} className="flex space-x-3 text-[10px]">
                                    <span className="text-gray-700 shrink-0">[{log.time}]</span>
                                    <span className={`${log.msg.includes('[SUCCESS]') || log.msg.includes('[✓]') ? 'text-emerald-400' : 'text-gray-400'}`}>
                                        {log.msg}
                                    </span>
                                </div>
                            ))}
                            <div ref={logEndRef} />
                        </div>
                    </div>

                    {/* Bottom Info */}
                    <div className="flex flex-col md:flex-row justify-between items-center py-6 text-[10px] text-gray-600 gap-4">
                        <div className="flex items-center space-x-4">
                            <span>ARCH: SST-Uv3</span>
                            <span>INFERENCE: ONNXWASM</span>
                        </div>
                        <div className="text-center md:text-right">
                            © 2026 ParaSecure Paradox. Crafted by <span className="text-gray-400 font-bold">Natnael Ermiyas</span>.
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}

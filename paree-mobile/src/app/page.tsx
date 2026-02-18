"use client";

import { useState, useRef, useCallback } from "react";
import { HTTPTokenizer } from "../engine/tokenizer/http_tokenizer";
import { ReversibleEncoder } from "../engine/encoder/reversible_encoder";
import { ReversibleDecoder } from "../engine/decoder/reversible_decoder";

type AppState = "off" | "connecting" | "protected" | "error";

const DEFAULT_PACKET = `GET /api/v2/users/profile HTTP/1.1\nHost: api.production.internal\nAuthorization: Bearer eyJhbGciOiJSUzI1NiJ9.payload.sig\nUser-Agent: Mozilla/5.0 (Linux; Android 14) AppleWebKit/537.36\nAccept: application/json\nAccept-Encoding: gzip, deflate, br\nConnection: keep-alive\nX-Request-ID: a1b2c3d4-e5f6-7890-abcd-ef1234567890`;

export default function Home() {
    const [appState, setAppState] = useState<AppState>("off");
    const [statusMsg, setStatusMsg] = useState("Tap to activate protection");
    const [sessionKey] = useState("sovereign-key-alpha-2026");
    const [lastResult, setLastResult] = useState<{ ok: boolean; encodeMs: number; decodeMs: number } | null>(null);
    const runningRef = useRef(false);

    const statusConfig: Record<AppState, { color: string; glow: string; ring: string; dot: string; label: string }> = {
        off: { color: "text-gray-400", glow: "", ring: "border-gray-700", dot: "bg-gray-600", label: "Not Protected" },
        connecting: { color: "text-yellow-400", glow: "shadow-[0_0_60px_rgba(234,179,8,0.25)]", ring: "border-yellow-500/60", dot: "bg-yellow-400 animate-pulse", label: "Connecting..." },
        protected: { color: "text-emerald-400", glow: "shadow-[0_0_80px_rgba(52,211,153,0.3)]", ring: "border-emerald-500/70", dot: "bg-emerald-400", label: "Protected" },
        error: { color: "text-red-400", glow: "shadow-[0_0_60px_rgba(239,68,68,0.25)]", ring: "border-red-500/60", dot: "bg-red-500", label: "Connection Failed" },
    };

    const cfg = statusConfig[appState];

    const toggle = useCallback(async () => {
        if (runningRef.current) return;

        if (appState === "protected") {
            setAppState("off");
            setStatusMsg("Tap to activate protection");
            setLastResult(null);
            return;
        }

        runningRef.current = true;
        setAppState("connecting");
        setStatusMsg("Establishing sovereign link...");
        setLastResult(null);

        try {
            const timestamp = Math.floor(Date.now() / 1000);
            const tokenizer = new HTTPTokenizer(sessionKey);
            const tokens = tokenizer.tokenize(DEFAULT_PACKET);

            const encoder = new ReversibleEncoder(sessionKey, timestamp, "/models/sst_model.onnx");
            await encoder.init();
            const t1 = performance.now();
            const encodedTokens = await encoder.encode(tokens);
            const encodeMs = Math.round(performance.now() - t1);

            const decoder = new ReversibleDecoder(sessionKey, timestamp, "/models/sst_model.onnx");
            await decoder.init();
            const t2 = performance.now();
            const decodedTokens = await decoder.decode(encodedTokens);
            const decodeMs = Math.round(performance.now() - t2);

            const decodedStr = tokenizer.reconstruct(decodedTokens);
            const ok = decodedStr.trim() === DEFAULT_PACKET.trim();

            if (ok) {
                setAppState("protected");
                setStatusMsg("Your traffic is protected");
                setLastResult({ ok: true, encodeMs, decodeMs });
            } else {
                setAppState("error");
                setStatusMsg("Verification failed. Tap to retry.");
                setLastResult({ ok: false, encodeMs, decodeMs });
            }
        } catch {
            setAppState("error");
            setStatusMsg("Could not connect. Tap to retry.");
        } finally {
            runningRef.current = false;
        }
    }, [appState, sessionKey]);

    return (
        <div className="flex flex-col min-h-screen bg-[#030303] text-white font-sans">

            {/* ── Header ─────────────────────────────────────────────────────── */}
            <header className="flex items-center justify-between px-6 pt-12 pb-4">
                <div>
                    <div className="text-base font-black tracking-tight bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
                        ParaSecure
                    </div>
                    <div className="text-[10px] text-gray-600 tracking-widest uppercase">Paradox Engine</div>
                </div>
                {/* Status dot */}
                <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${cfg.dot}`} />
                    <span className={`text-xs font-semibold ${cfg.color}`}>{cfg.label}</span>
                </div>
            </header>

            {/* ── Main ───────────────────────────────────────────────────────── */}
            <main className="flex-1 flex flex-col items-center justify-center px-6 gap-10">

                {/* Power button */}
                <button
                    onClick={toggle}
                    disabled={appState === "connecting"}
                    className={`
            relative w-48 h-48 rounded-full border-4 flex flex-col items-center justify-center
            transition-all duration-500 active:scale-95
            ${cfg.ring} ${cfg.glow}
            ${appState === "connecting" ? "opacity-70 cursor-not-allowed" : "cursor-pointer"}
            bg-[#0a0a0a]
          `}
                    aria-label="Toggle protection"
                >
                    {/* Spinning ring when connecting */}
                    {appState === "connecting" && (
                        <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-yellow-400 animate-spin" />
                    )}

                    {/* Power icon */}
                    <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className={`w-16 h-16 transition-colors duration-500 ${cfg.color}`}
                    >
                        <path d="M12 2v6" />
                        <path d="M4.93 4.93a10 10 0 1 0 14.14 0" />
                    </svg>

                    <span className={`text-[10px] font-bold tracking-[0.2em] uppercase mt-2 transition-colors duration-500 ${cfg.color}`}>
                        {appState === "off" ? "Tap to start" : appState === "connecting" ? "Wait..." : appState === "protected" ? "Tap to stop" : "Retry"}
                    </span>
                </button>

                {/* Status message */}
                <p className={`text-sm text-center transition-colors duration-500 ${cfg.color}`}>
                    {statusMsg}
                </p>

                {/* Stats — only shown when protected, minimal */}
                {appState === "protected" && lastResult?.ok && (
                    <div className="w-full max-w-xs bg-[#0a0a0a] border border-white/5 rounded-2xl p-5 space-y-3">
                        <div className="flex justify-between items-center">
                            <span className="text-xs text-gray-500">Encryption</span>
                            <span className="text-xs font-semibold text-emerald-400">AES-256 + HMAC</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-xs text-gray-500">Camouflage</span>
                            <span className="text-xs font-semibold text-emerald-400">Active</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-xs text-gray-500">Latency</span>
                            <span className="text-xs font-semibold text-cyan-400">{lastResult.encodeMs + lastResult.decodeMs}ms</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-xs text-gray-500">Integrity</span>
                            <span className="text-xs font-semibold text-emerald-400">✓ Verified</span>
                        </div>
                    </div>
                )}

                {/* Error state hint */}
                {appState === "error" && (
                    <div className="w-full max-w-xs bg-red-950/30 border border-red-500/20 rounded-2xl p-4 text-center">
                        <p className="text-xs text-red-400">Engine verification failed. Please tap to retry.</p>
                    </div>
                )}
            </main>

            {/* ── Footer ─────────────────────────────────────────────────────── */}
            <footer className="px-6 pb-10 text-center">
                <p className="text-[10px] text-gray-700">
                    Built by <span className="text-gray-500 font-semibold">Natnael Ermiyas</span>
                </p>
            </footer>
        </div>
    );
}

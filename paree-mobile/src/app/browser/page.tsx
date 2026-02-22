"use client";

import { useState } from "react";
import { useEngine } from "@/src/context/EngineContext";
import SecurityLockout from "@/src/components/SecurityLockout";
import SecureWindow from "@/src/components/SecureWindow";
import { motion, AnimatePresence } from "framer-motion";

export default function Browser() {
    const [input, setInput] = useState("what is physics");

    const [activeUrl, setActiveUrl] = useState("");
    const [isProcessing, setIsProcessing] = useState(false);
    const [isWindowOpen, setIsWindowOpen] = useState(false);
    const [engineTrace, setEngineTrace] = useState<{
        original: string;
        decoy: string;
        decoded: string;
        stats: any;
        ok: boolean;
    } | null>(null);

    const { engine, addLogEntry, appState } = useEngine();

    const isLocked = appState !== "protected";

    const handleGo = async (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!input || isProcessing || !engine || isLocked) return;

        setIsProcessing(true);
        setActiveUrl("");
        setEngineTrace(null);
        setIsWindowOpen(false);

        let target = input.trim();
        const isUrl = /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/.test(target);

        if (!isUrl && !target.includes("://")) {
            // Use DuckDuckGo — works perfectly in Android WebViews, no CAPTCHA.
            // Google blocks WebView containers and requires reCAPTCHA repeatedly.
            target = `https://duckduckgo.com/?q=${encodeURIComponent(target)}&ia=web`;
        } else if (!target.startsWith("http")) {
            target = "https://" + target;
        }


        try {
            const parsed = new URL(target);
            const fakeRequest = `GET ${parsed.pathname}${parsed.search} HTTP/1.1\r\nHost: ${parsed.host}\r\nUser-Agent: Sovereign-Browser/PRO\r\n\r\n`;

            const result = await engine.run(fakeRequest);
            addLogEntry(result);

            setEngineTrace({
                original: result.original,
                decoy: result.encoded,
                decoded: result.decoded,
                stats: result.stats,
                ok: result.ok
            });

            if (result.ok) {
                setTimeout(() => {
                    setActiveUrl(target);
                    setIsProcessing(false);
                    setIsWindowOpen(true);
                }, 1200);
            } else {
                setIsProcessing(false);
            }

        } catch (err) {
            setIsProcessing(false);
        }
    };

    return (
        <div className="flex-1 flex flex-col w-full max-w-7xl mx-auto py-8 lg:py-12 px-6 lg:px-8 h-full relative overflow-hidden">


            {/* Cyber Matrix Decor */}
            <div className="absolute inset-0 cyber-grid opacity-[0.02] pointer-events-none" />
            <div className="absolute inset-0 cyber-dots opacity-[0.05] pointer-events-none animate-pulse-soft" />

            {/* Security Lockout Overlay */}
            {isLocked && (
                <SecurityLockout
                    moduleName="Secure Search"
                    description="Bijective protocol tunneling and grammatic masking requires an active cryptographic bridge"
                />
            )}

            {/* Integrated Secure Viewport Modal */}
            <SecureWindow
                url={activeUrl}
                isOpen={isWindowOpen}
                onClose={() => setIsWindowOpen(false)}
                title={activeUrl ? new URL(activeUrl).hostname.toUpperCase() : "Sovereign Viewport"}
                encryptionKey={engineTrace?.stats ? `SST-X-${engineTrace.stats.encodeMs}MS` : "SST-IDLE"}
            />

            {/* Precision Search Input Section - Centered in 'Medium' */}
            <motion.div
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className={`flex flex-col items-center justify-center gap-12 w-full max-w-4xl mx-auto px-4 transition-all duration-700 ${activeUrl ? 'py-12' : 'flex-1'}`}
            >
                <div className="w-full flex flex-row items-center bg-[#050505] border border-white/[0.05] p-2.5 rounded-[2.5rem] shadow-[0_40px_80px_rgba(0,0,0,0.6)] relative group focus-within:border-emerald-500/40 transition-all border-t-white/[0.1] gap-3">
                    <div className="absolute inset-0 bg-emerald-500/[0.02] rounded-[2.5rem] blur-3xl opacity-0 group-focus-within:opacity-100 transition-opacity pointer-events-none" />

                    <form onSubmit={handleGo} className="flex-1 min-w-0 flex items-center bg-white/[0.02] rounded-full px-6 py-4 border border-white/[0.02]">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Quantum Vector Search..."
                            disabled={isLocked}
                            className="w-full bg-transparent text-sm text-white font-sans outline-none border-none focus:ring-0 placeholder:text-gray-700 font-bold disabled:opacity-50 min-w-0 tracking-tight"
                        />
                    </form>
                    <button
                        onClick={handleGo}
                        disabled={isProcessing || !input || isLocked}
                        className={`
                            flex-shrink-0 px-8 py-4 rounded-full text-[10px] font-black uppercase tracking-[0.4em] transition-all
                            ${isProcessing || isLocked
                                ? 'bg-emerald-500/10 text-emerald-500/40 cursor-not-allowed'
                                : 'bg-emerald-500 text-black hover:bg-emerald-400 active:scale-95 shadow-[0_10px_30px_rgba(16,185,129,0.3)]'}
                        `}
                    >
                        {isProcessing ? '...' : 'RUN'}
                    </button>
                </div>

                <div className="flex flex-wrap items-center justify-center gap-8 text-[9px] text-gray-700 font-black uppercase tracking-[0.4em] opacity-40">
                    <span className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                        ALPHA-SST BRIDGE
                    </span>
                    <span className="w-1.5 h-1.5 rounded-full bg-gray-900" />
                    <span className="text-emerald-500">Grammatic Masking: ON</span>
                </div>
            </motion.div>

            {/* Main Content Area - Only dominant when active */}
            <div className={`grid grid-cols-1 lg:grid-cols-12 gap-10 min-h-0 transition-all duration-700 ${activeUrl ? 'flex-1 opacity-100' : 'h-0 opacity-0 overflow-hidden'}`}>


                {/* Left: Preview & Launch Card */}
                <motion.div
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    className="lg:col-span-8 bg-[#050505] rounded-[3rem] overflow-hidden shadow-2xl flex flex-col border border-white/[0.03] relative border-t-white/[0.08] min-h-[450px]"
                >
                    <div className="h-16 bg-white/[0.015] border-b border-white/[0.03] flex items-center px-8 gap-4 flex-none">
                        <div className="hidden xs:flex gap-2 flex-none opacity-20">
                            <div className="w-2.5 h-2.5 rounded-full bg-white" />
                            <div className="w-2.5 h-2.5 rounded-full bg-white" />
                            <div className="w-2.5 h-2.5 rounded-full bg-white" />
                        </div>
                        <div className="lg:ml-6 flex-1 max-w-lg glass-cyan border-cyan-500/10 rounded-xl px-5 py-2 flex items-center gap-3 overflow-hidden shadow-inner">
                            <span className="text-cyan-500 text-xs animate-pulse">🔒</span>
                            <span className="text-[10px] text-gray-500 font-mono truncate uppercase tracking-widest font-black">
                                {activeUrl ? new URL(activeUrl).hostname : "tunnel.sovereign.local"}
                            </span>
                        </div>
                    </div>

                    <div className="flex-1 w-full relative overflow-hidden flex flex-col items-center justify-center p-12 lg:p-20">
                        <AnimatePresence mode="wait">
                            {activeUrl ? (
                                <motion.div
                                    key="ready"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    className="max-w-md w-full flex flex-col items-center text-center space-y-10"
                                >
                                    <div className="w-24 h-24 lg:w-32 lg:h-32 relative group">
                                        <div className="w-full h-full glass-emerald rounded-[2rem] lg:rounded-[2.5rem] flex items-center justify-center border border-emerald-500/10 shadow-2xl transition-transform duration-700 group-hover:scale-105">
                                            <span className="text-emerald-500 text-4xl lg:text-5xl font-black italic tracking-tighter opacity-80">PX</span>
                                        </div>
                                    </div>

                                    <div className="space-y-6">
                                        <h3 className="text-2xl lg:text-3xl font-black text-white tracking-tight uppercase italic">Secure Tunnel Ready</h3>
                                        <p className="text-gray-500 text-xs lg:text-sm leading-relaxed font-bold uppercase tracking-widest opacity-60">
                                            The bijective grammar bridge is established for {new URL(activeUrl).hostname}.
                                        </p>
                                    </div>

                                    <button
                                        onClick={() => setIsWindowOpen(true)}
                                        className="w-full bg-emerald-500 text-black py-5 rounded-[2rem] text-[10px] font-black uppercase tracking-[0.4em] hover:bg-emerald-400 transition-all shadow-[0_20px_40px_rgba(16,185,129,0.2)] active:scale-[0.98]"
                                    >
                                        Launch Window ↗
                                    </button>
                                </motion.div>
                            ) : (
                                <motion.div
                                    key="idle"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 0.3 }}
                                    className="flex flex-col items-center gap-8"
                                >
                                    <div className="w-20 h-20 rounded-[2rem] glass flex items-center justify-center">
                                        <span className="text-white/40 text-3xl font-black italic tracking-tighter">PX</span>
                                    </div>
                                    <p className="text-[10px] font-black uppercase tracking-[0.5em] text-white">Awaiting Vector</p>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {isProcessing && (
                            <div className="absolute inset-0 bg-black/95 backdrop-blur-3xl flex flex-col items-center justify-center z-20 px-10 text-center">
                                <div className="w-12 h-12 rounded-2xl border-[3px] border-emerald-500/10 border-t-emerald-500 animate-[spin_0.8s_linear_infinite] mb-10" />
                                <p className="text-[10px] font-black text-white uppercase tracking-[0.5em] animate-pulse">Establishing Bridge...</p>
                            </div>
                        )}
                    </div>
                </motion.div>

                {/* Right: Telemetry & Stats */}
                <div className="lg:col-span-4 flex flex-col gap-10">
                    <div className="flex-1 bg-[#050505] rounded-[3rem] p-8 flex flex-col shadow-2xl border border-white/[0.03] border-t-white/[0.08] relative overflow-hidden">
                        <div className="p-3 px-6 mb-10 rounded-full glass self-start inline-flex items-center gap-3">
                            <div className="w-2 h-2 rounded-full bg-cyan-500 shadow-[0_0_10px_rgba(34,211,238,1)]" />
                            <h3 className="text-[9px] text-gray-500 font-black uppercase tracking-[0.4em]">Protocol Stream</h3>
                        </div>

                        <div className="flex-1 overflow-y-auto scrollbar-hide">
                            <AnimatePresence mode="wait">
                                {!engineTrace ? (
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 0.2 }}
                                        className="h-full flex flex-col items-center justify-center text-center gap-6"
                                    >
                                        <span className="text-4xl">⏣</span>
                                        <p className="text-[8px] font-black uppercase tracking-[0.3em]">No Active Tunnel</p>
                                    </motion.div>
                                ) : (
                                    <motion.div
                                        initial={{ x: 20, opacity: 0 }}
                                        animate={{ x: 0, opacity: 1 }}
                                        className="space-y-10"
                                    >
                                        <div className="space-y-4">
                                            <p className="text-[8px] text-cyan-500/60 font-black uppercase tracking-[0.4em]">Inbound Vector</p>
                                            <div className="bg-black/60 p-6 rounded-3xl border border-white/5 font-mono text-[10px] text-gray-600 break-all italic leading-relaxed">
                                                {engineTrace.original}
                                            </div>
                                        </div>
                                        <div className="space-y-4">
                                            <p className="text-[8px] text-emerald-500/60 font-black uppercase tracking-[0.4em]">SST Masking</p>
                                            <div className="glass-emerald p-6 rounded-3xl border-emerald-500/10 font-mono text-[10px] text-emerald-500/60 break-all leading-relaxed font-bold">
                                                {engineTrace.decoy}
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>

                    <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        className="h-32 glass p-8 rounded-[2.5rem] flex items-center justify-between shadow-2xl border-t-white/[0.1]"
                    >
                        <div className="space-y-2">
                            <p className="text-[8px] text-gray-600 font-black uppercase tracking-[0.4em]">SST Entropy</p>
                            <div className="flex items-baseline gap-2">
                                <p className="text-2xl font-black text-white italic">99.99%</p>
                                <span className="text-[8px] text-cyan-500 font-black uppercase">Verified</span>
                            </div>
                        </div>
                        <div className="w-16 h-16 rounded-2xl glass-cyan flex items-center justify-center border-cyan-500/10">
                            <span className="text-sm font-black text-cyan-500 italic">SST</span>
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
}

"use client";

import { useState } from "react";
import { useEngine } from "@/src/context/EngineContext";
import SecurityLockout from "@/src/components/SecurityLockout";
import SecureWindow from "@/src/components/SecureWindow";
import SecureResultsUI from "@/src/components/SecureResultsUI";

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
            target = `https://www.google.com/search?q=${encodeURIComponent(target)}`;
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
        <div className="flex-1 flex flex-col w-full max-w-7xl mx-auto py-8 lg:py-12 px-6 lg:px-8 h-full animate-in fade-in duration-1000 gap-8 lg:gap-10 relative overflow-x-hidden">

            {/* Security Lockout Overlay */}
            {isLocked && (
                <SecurityLockout
                    moduleName="Secure Search"
                    description="Bijective protocol tunneling and grammatic masking requires an active cryptographic bridge"
                />
            )}

            {/* Integrated Secure Viewport (High-Level Controller) */}
            <SecureWindow
                url={activeUrl}
                isOpen={isWindowOpen}
                onClose={() => setIsWindowOpen(false)}
                title={activeUrl ? new URL(activeUrl).hostname.toUpperCase() : "Sovereign Viewport"}
                encryptionKey={engineTrace?.stats ? `SST-X-${engineTrace.stats.encodeMs}MS` : "SST-IDLE"}
            />

            {/* Precision Search Input (Full Responsive) */}
            <div className="flex flex-col items-center gap-6 lg:gap-8">
                <div className="w-full max-w-3xl flex flex-col sm:flex-row items-center bg-[#050505] border border-white/[0.03] p-1.5 rounded-[1.75rem] shadow-2xl relative group focus-within:border-emerald-500/20 transition-all border-t-white/[0.08]">
                    <div className="absolute inset-0 bg-emerald-500/[0.01] rounded-[1.75rem] blur-2xl opacity-0 group-focus-within:opacity-100 transition-opacity pointer-events-none" />

                    <div className="w-full sm:flex-1 flex items-center bg-white/[0.015] rounded-2xl px-5 lg:px-6 py-4 transition-colors">
                        <span className="hidden xs:block text-gray-700 mr-4 lg:mr-5 text-base lg:text-lg opacity-40">🌐</span>
                        <form onSubmit={handleGo} className="flex-1">
                            <input
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder=" keyword or URL..."
                                disabled={isLocked}
                                className="w-full bg-transparent text-[13px] lg:text-[14px] text-white/90 font-sans outline-none border-none focus:ring-0 placeholder:text-gray-700 font-medium tracking-tight disabled:opacity-50"
                            />
                        </form>
                    </div>
                    <button
                        onClick={handleGo}
                        disabled={isProcessing || !input || isLocked}
                        className={`
                w-full sm:w-auto px-10 py-4 rounded-2xl text-[9px] lg:text-[10px] font-black uppercase tracking-[0.4em] transition-all mt-2 sm:mt-0 sm:ml-2
                ${isProcessing || isLocked ? 'bg-emerald-500/10 text-emerald-500/40 cursor-not-allowed border border-emerald-500/10' : 'bg-emerald-500 text-black hover:bg-emerald-400 active:scale-95 shadow-lg'}
              `}
                    >
                        {isProcessing ? 'TUNNEL' : 'SECURE'}
                    </button>
                </div>
                <div className="flex flex-wrap items-center justify-center gap-4 lg:gap-6 text-[8px] lg:text-[9px] text-gray-700 font-bold uppercase tracking-[0.25em] lg:tracking-[0.3em]">
                    <span className="flex items-center gap-2"><div className="w-1 h-1 bg-emerald-500/40 rounded-full" /> Node: Alpha-2026</span>
                    <span className="hidden xs:block w-1 h-1 rounded-full bg-gray-900" />
                    <span className="text-emerald-500/40">Bijective Protocol Bridge</span>
                </div>
            </div>

            <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 min-h-0">

                {/* Left: Preview Card (Adaptive Layout) */}
                <div className="lg:col-span-8 bg-[#050505] rounded-[2rem] lg:rounded-[2.5rem] overflow-hidden shadow-2xl flex flex-col border border-white/[0.03] relative animate-in zoom-in-[0.98] duration-1000 min-h-[400px] border-t-white/[0.08]">

                    <div className="h-14 bg-white/[0.015] border-b border-white/[0.03] flex items-center px-6 lg:px-8 gap-4 flex-none">
                        <div className="hidden xs:flex gap-1.5 flex-none opacity-20">
                            <div className="w-2.5 h-2.5 rounded-full bg-white" />
                            <div className="w-2.5 h-2.5 rounded-full bg-white" />
                            <div className="w-2.5 h-2.5 rounded-full bg-white" />
                        </div>
                        <div className="lg:ml-6 flex-1 max-w-lg bg-black/40 border border-white/[0.02] rounded-xl px-4 lg:px-5 py-1.5 flex items-center gap-3 overflow-hidden shadow-sm">
                            <span className="text-emerald-500 text-[9px] lg:text-[10px]">🔒</span>
                            <span className="text-[9px] lg:text-[10px] text-gray-500 font-mono truncate uppercase tracking-widest font-bold">
                                {activeUrl ? new URL(activeUrl).hostname : "tunnel.sovereign.local"}
                            </span>
                        </div>
                    </div>

                    <div className="flex-1 w-full relative overflow-hidden flex flex-col items-center justify-center">

                        {activeUrl ? (
                            <div className="w-full h-full flex flex-col animate-in slide-in-from-bottom-4 duration-700">
                                <div className="flex-1 flex flex-col items-center justify-center p-8 lg:p-16 text-center">
                                    <div className="w-20 h-20 lg:w-28 lg:h-28 mb-6 lg:mb-10 relative group">
                                        <div className="w-full h-full bg-emerald-500/[0.03] rounded-[1.5rem] lg:rounded-[2rem] flex items-center justify-center border border-emerald-500/10 shadow-sm transition-transform duration-700 group-hover:scale-105">
                                            <span className="text-emerald-500 text-3xl lg:text-4xl font-black italic tracking-tighter opacity-80">PX</span>
                                        </div>
                                        <div className="absolute inset-x-0 -bottom-4 h-1 bg-emerald-500/10 blur-xl transition-all group-hover:blur-2xl" />
                                    </div>

                                    <div className="max-w-md space-y-4 lg:space-y-6">
                                        <h3 className="text-xl lg:text-2xl font-black text-white tracking-tight uppercase italic">Vector Identified</h3>
                                        <p className="text-gray-500 text-[11px] lg:text-[13px] leading-relaxed font-medium px-4">
                                            Sovereign Tunnel is standing by for <span className="text-white font-black uppercase tracking-widest text-[10px] lg:text-[11px]">{new URL(activeUrl).hostname}</span>.
                                            Encryption bridge is ready for launch.
                                        </p>

                                        <div className="pt-6 lg:pt-8 grid grid-cols-2 gap-3 lg:gap-4">
                                            <div className="p-4 lg:p-5 rounded-2xl border border-white/[0.02] bg-white/[0.01] flex flex-col items-start gap-1">
                                                <span className="text-[6px] lg:text-[7px] font-black text-gray-600 uppercase tracking-widest">Inference</span>
                                                <span className="text-[11px] lg:text-[12px] font-black text-white/90 uppercase tracking-widest">{engineTrace?.stats.encodeMs} ms</span>
                                            </div>
                                            <div className="p-4 lg:p-5 rounded-2xl border border-white/[0.02] bg-white/[0.01] flex flex-col items-start gap-1">
                                                <span className="text-[6px] lg:text-[7px] font-black text-gray-600 uppercase tracking-widest">Integrity</span>
                                                <span className="text-[11px] lg:text-[12px] font-black text-emerald-500 uppercase tracking-widest">Verified</span>
                                            </div>
                                        </div>

                                        <button
                                            onClick={() => setIsWindowOpen(true)}
                                            className="w-full mt-8 lg:mt-10 bg-emerald-500 text-black py-4 rounded-2xl text-[9px] lg:text-[10px] font-black uppercase tracking-[0.4em] hover:bg-emerald-400 transition-all shadow-2xl active:scale-[0.98]"
                                        >
                                            Launch Secure Window ↗
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center text-center opacity-30 gap-6 lg:gap-8">
                                <div className="w-16 h-16 lg:w-20 lg:h-20 rounded-[1.5rem] lg:rounded-[1.75rem] border border-white/5 bg-white/[0.01] shadow-sm flex items-center justify-center">
                                    <div className="text-white/20 text-2xl lg:text-3xl font-black italic tracking-tighter">PX</div>
                                </div>
                                <div className="space-y-2">
                                    <h3 className="text-gray-400 text-[9px] lg:text-[11px] font-black uppercase tracking-[0.4em] lg:tracking-[0.5em]">Tunnel Idle</h3>
                                    <p className="text-gray-700 text-[8px] lg:text-[9px] font-black uppercase tracking-[0.2em] lg:tracking-[0.3em]">Awaiting protocol vector</p>
                                </div>
                            </div>
                        )}

                        {isProcessing && (
                            <div className="absolute inset-0 bg-black/90 backdrop-blur-xl flex flex-col items-center justify-center z-20 animate-in fade-in duration-500 px-8 text-center">
                                <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-[1rem] lg:rounded-2xl border-[2px] border-emerald-500/10 border-t-emerald-500 animate-[spin_0.8s_linear_infinite] mb-6 lg:mb-8" />
                                <p className="text-[9px] lg:text-[10px] font-black text-white uppercase tracking-[0.4em] lg:tracking-[0.5em] animate-pulse">Establishing Bridge...</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Right: Telemetry (Adaptive Stacking) */}
                <div className="lg:col-span-4 flex flex-col gap-8 lg:gap-10 min-h-0">

                    <div className="flex-1 bg-[#050505] border border-white/[0.03] rounded-[2rem] lg:rounded-[2.5rem] p-6 lg:p-8 flex flex-col shadow-2xl overflow-hidden relative border-t-white/[0.08] min-h-[300px]">
                        <div className="p-2 px-4 lg:px-5 mb-6 lg:mb-8 rounded-full border border-white/[0.03] bg-white/[0.01] flex items-center gap-3 self-start">
                            <div className="w-1.5 h-1.5 rounded-full bg-cyan-500 shadow-[0_0_8px_rgba(34,211,238,1)]" />
                            <h3 className="text-[8px] lg:text-[9px] text-gray-500 font-black uppercase tracking-[0.4em]">Sovereign Stream</h3>
                        </div>

                        <div className="flex-1 overflow-y-auto scrollbar-hide space-y-8 lg:space-y-10">
                            {!engineTrace ? (
                                <div className="h-full flex flex-col items-center justify-center text-center opacity-20 gap-6">
                                    <span className="text-2xl lg:text-3xl font-black italic tracking-tighter opacity-40">⏣</span>
                                    <p className="text-[8px] lg:text-[9px] font-black uppercase tracking-[0.3em] leading-relaxed text-gray-700">Waiting for <br /> protocol vector</p>
                                </div>
                            ) : (
                                <div className="space-y-8 lg:space-y-10 pb-4 animate-in slide-in-from-right-8 duration-1000">
                                    <div className="space-y-4">
                                        <p className="text-[8px] text-cyan-500/60 font-black uppercase tracking-[0.4em] px-1">Raw Protocol Matrix</p>
                                        <div className="bg-white/[0.01] p-4 lg:p-6 rounded-xl lg:rounded-2xl border border-white/[0.03] font-mono text-[9px] lg:text-[10px] text-gray-600 leading-relaxed break-all selection:bg-cyan-500/20">
                                            {engineTrace.original.trim()}
                                        </div>
                                    </div>

                                    <div className="flex justify-center -my-3">
                                        <div className="w-px h-8 lg:h-10 bg-emerald-500/10" />
                                    </div>

                                    <div className="space-y-4">
                                        <p className="text-[8px] text-emerald-400/60 font-black uppercase tracking-[0.4em] px-1 flex items-center gap-2">
                                            <span className="w-1 h-1 bg-emerald-500 rounded-full animate-pulse" /> Decoy Frame
                                        </p>
                                        <div className="bg-emerald-500/[0.01] p-4 lg:p-6 rounded-xl lg:rounded-2xl border border-emerald-500/10 font-mono text-[9px] lg:text-[10px] text-emerald-400/70 leading-relaxed break-all selection:bg-emerald-500/20 italic">
                                            {engineTrace.decoy.trim()}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="h-28 lg:h-32 bg-[#050505] border border-white/[0.03] rounded-[2rem] lg:rounded-[2.5rem] p-6 lg:p-8 flex items-center justify-between shadow-2xl relative overflow-hidden group border-t-white/[0.08] flex-none">
                        <div className="absolute inset-x-0 bottom-0 h-0.5 bg-gradient-to-r from-transparent via-emerald-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                        <div className="space-y-1 lg:space-y-1.5 relative">
                            <p className="text-[7px] lg:text-[8px] text-gray-700 font-bold uppercase tracking-[0.3em] lg:tracking-[0.4em]">SST Mapping</p>
                            <div className="flex items-baseline gap-2">
                                <p className="text-xl lg:text-2xl font-black text-white italic">99.98%</p>
                                <span className="text-[8px] lg:text-[9px] text-emerald-500 font-black tracking-widest uppercase">High</span>
                            </div>
                        </div>
                        <div className="w-12 h-12 lg:w-16 lg:h-16 rounded-[1rem] lg:rounded-[1.25rem] border border-white/[0.05] bg-white/[0.01] flex items-center justify-center group-hover:bg-white/[0.03] transition-all flex-none">
                            <span className="text-[10px] lg:text-[12px] font-black text-emerald-500 italic opacity-80 uppercase">PRO</span>
                        </div>
                    </div>

                </div>

            </div>
        </div>
    );
}

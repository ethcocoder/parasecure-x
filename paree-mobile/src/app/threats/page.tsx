"use client";

import { useEngine, ThreatEvent } from "@/src/context/EngineContext";
import SecurityLockout from "@/src/components/SecurityLockout";

export default function Threats() {
    const { threats, activeDefense, toggleDefense, ghostMode, toggleGhostMode, appState, networkInfo } = useEngine();

    const isLocked = appState !== "protected";

    const getSeverityColor = (sev: ThreatEvent["severity"]) => {
        switch (sev) {
            case "critical": return "text-red-500 border-red-500/10 bg-red-500/[0.03]";
            case "high": return "text-orange-500 border-orange-500/10 bg-orange-500/[0.03]";
            case "medium": return "text-amber-500 border-amber-500/10 bg-amber-500/[0.03]";
            default: return "text-emerald-500 border-emerald-500/10 bg-emerald-500/[0.03]";
        }
    };

    return (
        <div className="flex-1 flex flex-col w-full max-w-7xl mx-auto py-8 lg:py-12 px-6 lg:px-8 h-full animate-in fade-in duration-1000 gap-6 lg:gap-8 overflow-x-hidden relative">

            {/* Security Lockout Overlay */}
            {isLocked && (
                <SecurityLockout
                    moduleName="Threat Intel"
                    description="Real-time environment scanning and intrusion detection requires an active cryptographic sentinel"
                />
            )}

            {/* Header: System Health & Controls (Responsive Stacking) */}
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 lg:gap-8 items-stretch">

                {/* Advanced Controls Card */}
                <div className="xl:col-span-8 bg-[#050505] border border-white/[0.03] rounded-[2rem] lg:rounded-[2.5rem] p-6 lg:p-8 flex flex-col sm:flex-row justify-between items-center gap-8 shadow-2xl relative overflow-hidden group border-t-white/[0.08]">
                    <div className="absolute inset-0 bg-emerald-500/[0.01] pointer-events-none" />

                    <div className="space-y-3 lg:space-y-4 text-center sm:text-left z-10">
                        <h2 className="text-2xl lg:text-3xl font-black tracking-[0.2em] text-white uppercase italic">Sovereign IDS</h2>
                        <div className="flex items-center gap-3 justify-center sm:justify-start">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,1)]" />
                            <p className="text-gray-600 text-[9px] lg:text-[10px] font-black uppercase tracking-[0.4em]">Environmental Scan: ACTIVE</p>
                        </div>
                    </div>

                    <div className="flex w-full sm:w-auto justify-center sm:justify-end gap-8 lg:gap-10 items-center z-10 pt-4 sm:pt-0 border-t sm:border-t-0 border-white/[0.03]">
                        {/* Ghost Mode Slim Switch */}
                        <div className="flex flex-col items-center gap-3 group">
                            <button
                                onClick={toggleGhostMode}
                                disabled={isLocked}
                                className={`w-12 h-6 lg:w-14 lg:h-7 rounded-full p-1 transition-all duration-500 relative ${ghostMode ? 'bg-cyan-500/20' : 'bg-white/5'} ${isLocked ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                                <div className={`aspect-square h-full rounded-full transition-all duration-500 ${ghostMode ? 'translate-x-6 lg:translate-x-7 bg-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.5)]' : 'translate-x-0 bg-gray-600'}`} />
                            </button>
                            <span className="text-[7px] lg:text-[8px] font-black text-gray-500 uppercase tracking-widest">Ghost Mode</span>
                        </div>

                        <div className="hidden xs:block w-px h-10 bg-white/[0.03]" />

                        {/* Active Shield Button */}
                        <button
                            onClick={toggleDefense}
                            disabled={isLocked}
                            className={`
                                relative px-6 lg:px-8 py-3 lg:py-3.5 rounded-[1.25rem] lg:rounded-2xl text-[8px] lg:text-[10px] font-black uppercase tracking-[0.3em] transition-all border
                                ${activeDefense
                                    ? 'bg-emerald-500 text-black border-emerald-500 shadow-[0_15px_30px_rgba(16,185,129,0.15)] active:scale-95'
                                    : 'bg-[#080808] text-gray-400 border-white/[0.05] hover:border-white/10'}
                                ${isLocked ? 'opacity-50 cursor-not-allowed' : ''}
                            `}
                        >
                            {activeDefense ? 'Shield ACTIVE' : 'Shield OFF'}
                        </button>
                    </div>
                </div>

                {/* Health Metrics Card (Fluid Design) */}
                <div className="xl:col-span-4 bg-[#050505] border border-white/[0.03] rounded-[2rem] lg:rounded-[2.5rem] p-6 lg:p-8 flex flex-col justify-center gap-6 shadow-2xl relative border-t-white/[0.08]">
                    <div className="space-y-3 lg:space-y-4">
                        <div className="flex justify-between items-center text-[8px] lg:text-[9px] font-black text-gray-500 uppercase tracking-widest px-1">
                            <span>Integrity Vector</span>
                            <span className="text-emerald-400 font-mono">99.85%</span>
                        </div>
                        <div className="h-1 w-full bg-white/[0.02] rounded-full overflow-hidden">
                            <div className="h-full w-[99.85%] bg-emerald-500 opacity-80" />
                        </div>
                    </div>
                    <div className="space-y-3 lg:space-y-4">
                        <div className="flex justify-between items-center text-[8px] lg:text-[9px] font-black text-gray-500 uppercase tracking-widest px-1">
                            <span>Surface Noise</span>
                            <span className="text-cyan-400 font-mono">0.05%</span>
                        </div>
                        <div className="h-1 w-full bg-white/[0.02] rounded-full overflow-hidden">
                            <div className="h-full w-[5%] bg-cyan-400 opacity-60" />
                        </div>
                    </div>
                </div>

            </div>

            <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 min-h-0">

                {/* Secondary: Threat Density Distribution (Adaptive Order) */}
                <div className="lg:col-span-4 flex flex-col gap-6 lg:gap-8 order-2 lg:order-1">
                    <div className="bg-[#050505] border border-white/[0.03] rounded-[2rem] lg:rounded-[2.5rem] p-8 lg:p-10 flex flex-col items-center justify-center text-center gap-8 lg:gap-10 shadow-2xl relative overflow-hidden border-t-white/[0.08]">
                        <div className="relative">
                            <div className={`w-28 h-28 lg:w-36 lg:h-36 rounded-full border-2 flex items-center justify-center transition-colors duration-1000 ${threats.length > 0 ? 'border-red-500/10 text-red-500' : 'border-emerald-500/10 text-emerald-500'}`}>
                                <div className="text-3xl lg:text-4xl font-black italic tracking-tighter opacity-80">PX</div>
                                <div className={`absolute inset-0 rounded-full animate-ping opacity-10 ${threats.length > 0 ? 'bg-red-500' : 'bg-emerald-500'}`} />
                            </div>
                        </div>

                        <div className="space-y-3 lg:space-y-4">
                            <p className="text-3xl lg:text-4xl font-black text-white leading-none">{networkInfo.anomaliesCount.toString().padStart(3, '0')}</p>

                            <p className="text-[9px] lg:text-[10px] text-gray-600 font-black uppercase tracking-[0.4em] lg:tracking-[0.5em]">Anomalies Indexed</p>
                        </div>

                        <div className="w-full pt-8 border-t border-white/[0.03] grid grid-cols-2 gap-6 lg:gap-8">
                            <div className="space-y-2">
                                <p className="text-[14px] font-black text-white">{threats.filter(t => t.type === 'Port Scan').length}</p>
                                <p className="text-[8px] text-gray-600 font-bold uppercase tracking-widest">Scans</p>
                            </div>
                            <div className="space-y-2">
                                <p className="text-[14px] font-black text-white">{threats.filter(t => t.type === 'MITM').length + threats.filter(t => t.type === 'Exploit').length}</p>
                                <p className="text-[8px] text-gray-600 font-bold uppercase tracking-widest">Exploits</p>
                            </div>
                        </div>
                    </div>

                    <div className="flex-1 bg-gradient-to-br from-white/[0.015] to-transparent border border-white/[0.03] rounded-[2rem] lg:rounded-[2.5rem] p-8 flex flex-col justify-center gap-6 shadow-xl relative overflow-hidden group">
                        <span className="text-2xl lg:text-3xl text-emerald-500/30 font-black absolute top-6 right-8 italic group-hover:scale-110 transition-transform">05</span>
                        <p className="text-[12px] lg:text-[13px] text-gray-400 font-medium leading-[1.8] tracking-tight">
                            "In Ghost Mode, the system generates perfect decoy responses. The attacker believes they have succeeded, while their tools are actually interacting with a simulation."
                        </p>
                        <div className="flex items-center gap-4">
                            <div className="w-6 h-px bg-emerald-500/40" />
                            <span className="text-[7px] lg:text-[8px] font-black text-emerald-500 uppercase tracking-[0.4em]">Protocol Axiom</span>
                        </div>
                    </div>
                </div>

                {/* Primary: Detailed Forensics Bulletin (Fluid Stacking) */}
                <div className="lg:col-span-8 bg-[#050505] border border-white/[0.03] rounded-[2rem] lg:rounded-[2.5rem] flex flex-col shadow-2xl overflow-hidden relative border-t-white/[0.08] order-1 lg:order-2">
                    <div className="px-6 lg:px-10 py-8 lg:py-10 bg-white/[0.01] border-b border-white/[0.03] flex justify-between items-center sticky top-0 z-10 backdrop-blur-3xl">
                        <div className="space-y-1.5">
                            <h3 className="text-[10px] lg:text-[11px] text-white font-black uppercase tracking-[0.4em]">Bulletin</h3>
                            <p className="text-[8px] lg:text-[9px] text-gray-600 font-bold uppercase tracking-[0.3em]">Forensics Stream</p>
                        </div>
                        <div className="p-1 px-4 rounded-full border border-emerald-500/20 bg-emerald-500/5 flex items-center gap-2 lg:gap-3">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,1)]" />
                            <span className="text-[8px] lg:text-[9px] font-black text-emerald-500/80 uppercase tracking-widest">Secure</span>
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto scrollbar-hide py-4">
                        {threats.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center text-center opacity-30 gap-8 p-12 lg:p-20 scale-95 transition-all">
                                <div className="w-20 h-20 lg:w-24 lg:h-24 rounded-full border-t-2 border-white/10 animate-spin flex items-center justify-center text-2xl lg:text-3xl [animation-duration:10s]">
                                    <span className="opacity-20">⏣</span>
                                </div>
                                <div className="space-y-3">
                                    <p className="text-[11px] lg:text-[12px] font-black uppercase tracking-[0.4em] text-white">Environment Secured</p>
                                    <p className="text-[8px] lg:text-[9px] font-black uppercase tracking-[0.2em] text-gray-600">Passive Sensor Polling...</p>
                                </div>
                            </div>
                        ) : (
                            <div className="px-4 lg:px-10 py-6 space-y-8 pb-12">
                                {threats.map((t) => (
                                    <div key={t.id} className="group relative">
                                        <div className="p-6 lg:p-8 rounded-[1.75rem] lg:rounded-[2.25rem] bg-white/[0.02] border border-white/[0.03] hover:bg-white/[0.04] transition-all duration-500 animate-in slide-in-from-bottom-8 duration-700 shadow-xl overflow-hidden relative">

                                            {/* Status Header (Stacks on small mobile) */}
                                            <div className="flex flex-col md:flex-row justify-between items-start gap-5 mb-8">
                                                <div className="flex flex-wrap items-center gap-3 lg:gap-4">
                                                    <span className={`px-4 lg:px-5 py-2 rounded-xl text-[9px] lg:text-[10px] font-black uppercase tracking-widest border transition-colors ${getSeverityColor(t.severity)}`}>
                                                        {t.type}
                                                    </span>
                                                    <span className="text-[10px] lg:text-[11px] font-mono text-cyan-500/60 font-black bg-cyan-400/[0.03] px-3 lg:px-3.5 py-1.5 rounded-lg border border-cyan-500/10">
                                                        {t.source}
                                                    </span>
                                                </div>
                                                <div className="flex w-full md:w-auto items-center justify-between md:justify-end gap-5 pt-3 md:pt-1 border-t md:border-t-0 border-white/[0.03]">
                                                    <span className="text-[9px] lg:text-[10px] font-bold text-gray-700 uppercase tracking-widest">{t.time}</span>
                                                    <span className={`px-3 lg:px-4 py-1.5 rounded-full text-[8px] lg:text-[9px] font-black italic uppercase tracking-widest shadow-xl transition-all ${t.status === "monitored" ? "text-cyan-400 bg-cyan-400/[0.08]" :
                                                        t.status === "blocked" ? "text-emerald-500 bg-emerald-500/[0.08]" :
                                                            "text-amber-500 bg-amber-500/[0.08]"}`}>
                                                        {t.status}
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Message Content */}
                                            <div className="space-y-6">
                                                <p className="text-[15px] lg:text-[17px] text-white/95 font-bold tracking-tight leading-relaxed">{t.description}</p>

                                                <div className="bg-[#020202] border border-white/[0.03] rounded-2xl p-5 lg:p-6 relative overflow-hidden group/box">
                                                    <div className="absolute top-0 right-0 p-3 opacity-20">
                                                        <span className="text-[7px] lg:text-[8px] font-black uppercase tracking-widest font-mono text-gray-600">FORENSICS</span>
                                                    </div>
                                                    <h5 className="text-[7px] lg:text-[8px] font-black text-gray-600 uppercase tracking-widest mb-3 flex items-center gap-2">
                                                        <span className="w-1 h-1 bg-gray-700 rounded-full" /> Attack Vector Analysis
                                                    </h5>
                                                    <p className="text-[12px] lg:text-[13px] text-gray-500 font-medium leading-relaxed tracking-tight italic">
                                                        "{t.details}"
                                                    </p>
                                                </div>

                                                {/* Meta Bits (Adaptive Grid) */}
                                                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-6 border-t border-white/[0.03]">
                                                    {[
                                                        { label: 'Protocol', val: 'TCP/HTTP' },
                                                        { label: 'Integrity', val: '99.9%', hl: 'text-emerald-400' },
                                                        { label: 'Resolution', val: t.status === 'monitored' ? 'Stealth' : 'Neutralize', hl: 'text-cyan-400' },
                                                        { label: 'Risk Score', val: 'CRITICAL', hl: 'text-red-500' }
                                                    ].map((bit, idx) => (
                                                        <div key={idx} className="space-y-1.5">
                                                            <span className="text-[6px] lg:text-[7px] text-gray-600 font-black uppercase tracking-[0.2em]">{bit.label}</span>
                                                            <p className={`text-[9px] lg:text-[10px] font-black uppercase tracking-widest ${bit.hl || 'text-white/80'}`}>{bit.val}</p>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
}

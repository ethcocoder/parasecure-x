"use client";

import { useEngine } from "@/src/context/EngineContext";
import SecurityLockout from "@/src/components/SecurityLockout";

export default function Monitor() {
    const { packetLog, appState } = useEngine();

    const isLocked = appState !== "protected";

    return (
        <div className="flex-1 flex flex-col w-full max-w-7xl mx-auto py-8 lg:py-12 px-6 lg:px-8 h-full animate-in fade-in duration-1000 relative">

            {/* Security Lockout Overlay */}
            {isLocked && (
                <SecurityLockout
                    moduleName="Network Trace"
                    description="Real-time protocol interception and packet forensic analysis requires an active Sovereign bridge"
                />
            )}

            {/* Page Header (Responsive Balance) */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8 mb-10 lg:mb-12">
                <div className="space-y-2 lg:space-y-3">
                    <h2 className="text-2xl lg:text-3xl font-black tracking-[0.2em] text-white uppercase italic">Sovereign Trace</h2>
                    <div className="flex items-center gap-3">
                        <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 shadow-[0_0_8px_rgba(34,211,238,1)]" />
                        <p className="text-gray-600 text-[9px] lg:text-[10px] font-black uppercase tracking-[0.4em]">Bijective Protocol Interceptor</p>
                    </div>
                </div>

                <div className="w-full md:w-auto flex items-center gap-6 px-6 py-4 lg:py-3 border border-white/[0.03] bg-white/[0.01] rounded-2xl backdrop-blur-3xl shadow-xl">
                    <div className="flex flex-col">
                        <span className="text-[7px] text-gray-600 font-black uppercase tracking-widest mb-1">State</span>
                        <div className="flex items-center gap-2">
                            <div className={`w-1.5 h-1.5 rounded-full ${appState === 'protected' ? 'bg-emerald-400 animate-pulse transition-all duration-300' : 'bg-gray-800'}`} />
                            <span className={`text-[10px] font-black uppercase tracking-widest ${appState === 'protected' ? 'text-emerald-400' : 'text-gray-500'}`}>
                                {appState === 'protected' ? 'Online' : 'Idle'}
                            </span>
                        </div>
                    </div>
                    <div className="w-px h-6 bg-white/[0.05]" />
                    <div className="flex flex-col">
                        <span className="text-[7px] text-gray-600 font-black uppercase tracking-widest mb-1">Total Frames</span>
                        <span className="text-[10px] font-black text-white uppercase tracking-widest">{packetLog.length.toString().padStart(3, '0')}</span>
                    </div>
                </div>
            </div>

            {/* Stream Terminal (Enterprise Table -> Mobile Cards) */}
            <div className="flex-1 flex flex-col min-h-0 bg-[#050505] lg:border border-white/[0.03] rounded-[2rem] lg:rounded-[2.5rem] overflow-hidden relative shadow-2xl lg:border-t-white/[0.08]">

                {/* Table Header (Desktop/Tablet Only) */}
                <div className="hidden md:grid grid-cols-12 px-10 py-8 bg-white/[0.015] border-b border-white/[0.03] text-[9px] font-black text-gray-600 uppercase tracking-[0.45em] flex-none z-10">
                    <div className="col-span-1">TS</div>
                    <div className="col-span-1 px-4 text-center">PF</div>
                    <div className="col-span-5 px-10 border-l border-white/[0.03] text-cyan-500/60 font-black">Source Vector</div>
                    <div className="col-span-5 px-10 border-l border-white/[0.03] text-emerald-500/60 font-black">Decoy Frame</div>
                </div>

                {/* List Content */}
                <div className="flex-1 overflow-y-auto divide-y divide-white/[0.02] scrollbar-hide py-4 md:py-4 relative">

                    {packetLog.length === 0 && (
                        <div className="h-full flex flex-col items-center justify-center p-20 opacity-30 gap-10">
                            <div className="w-16 h-16 lg:w-20 lg:h-20 rounded-full border border-white/5 flex items-center justify-center">
                                <span className="w-2 h-2 bg-gray-600 rounded-full animate-pulse" />
                            </div>
                            <div className="text-center space-y-3">
                                <p className="text-[10px] lg:text-[11px] font-black uppercase tracking-[0.4em] text-white">Sensor Polling...</p>
                                <p className="text-[8px] lg:text-[9px] font-black uppercase tracking-[0.2em] text-gray-700">Waiting for protocol interaction</p>
                            </div>
                        </div>
                    )}

                    {packetLog.map((ev, idx) => (
                        <div key={ev.id} className="group animate-in slide-in-from-top-2 duration-500">

                            {/* Desktop Row View */}
                            <div className="hidden md:grid grid-cols-12 px-10 py-6 bg-transparent hover:bg-white/[0.015] transition-all items-center">
                                <div className="col-span-1 text-[10px] font-mono text-gray-700 font-bold tracking-tight">
                                    {ev.time}
                                </div>
                                <div className="col-span-1 flex justify-center px-4">
                                    <span className={`text-[8px] font-black px-2 py-1 rounded-md border tracking-[0.2em] transition-colors ${ev.type === 'POST' ? 'border-amber-500/10 bg-amber-500/[0.02] text-amber-500/60' : 'border-cyan-500/10 bg-cyan-500/[0.02] text-cyan-500/60'}`}>
                                        {ev.type}
                                    </span>
                                </div>
                                <div className="col-span-5 px-10 border-l border-white/[0.03] font-mono text-[11px] flex items-center gap-3 overflow-hidden">
                                    <span className="text-cyan-500/40 opacity-50 text-[10px] select-none">{idx.toString().padStart(3, '0')}</span>
                                    <span className="text-gray-400 group-hover:text-cyan-400 group-hover:opacity-80 transition-all truncate tracking-tight">{ev.original}</span>
                                </div>
                                <div className="col-span-5 px-10 border-l border-white/[0.03] font-mono text-[11px] flex items-center gap-3 overflow-hidden">
                                    <span className="text-emerald-500/20 opacity-50 text-[10px] select-none">ENC</span>
                                    <span className="text-emerald-500/60 group-hover:text-emerald-400 transition-all truncate tracking-tight italic">{ev.encoded}</span>
                                </div>
                            </div>

                            {/* Mobile Card View */}
                            <div className="md:hidden p-6 mx-4 mb-4 rounded-2xl bg-white/[0.02] border border-white/[0.03] space-y-5">
                                <div className="flex justify-between items-center">
                                    <div className="flex items-center gap-3">
                                        <span className={`text-[8px] font-black px-2 py-0.5 rounded-md border tracking-[0.2em] ${ev.type === 'POST' ? 'border-amber-500/20 bg-amber-500/5 text-amber-500' : 'border-cyan-500/20 bg-cyan-500/5 text-cyan-500'}`}>
                                            {ev.type}
                                        </span>
                                        <span className="text-[10px] font-mono text-gray-500">{ev.time}</span>
                                    </div>
                                    <span className="text-[8px] font-black text-gray-700 uppercase tracking-widest">#{idx.toString().padStart(3, '0')}</span>
                                </div>

                                <div className="space-y-4">
                                    <div className="space-y-1.5">
                                        <p className="text-[7px] text-gray-600 font-black uppercase tracking-widest">Source Vector</p>
                                        <p className="text-[10px] font-mono text-gray-400 break-all leading-relaxed bg-black/40 p-3 rounded-xl border border-white/[0.02]">{ev.original}</p>
                                    </div>
                                    <div className="space-y-1.5">
                                        <p className="text-[7px] text-emerald-500/40 font-black uppercase tracking-widest">Grammar Decoy</p>
                                        <p className="text-[10px] font-mono text-emerald-500/60 break-all leading-relaxed bg-emerald-500/[0.03] p-3 rounded-xl border border-emerald-500/10 italic">{ev.encoded}</p>
                                    </div>
                                </div>
                            </div>

                        </div>
                    ))}
                </div>
            </div>

            {/* Responsive Specs Footer */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 mt-10 lg:mt-12 flex-none">
                {[
                    { label: "Vector Transformation", value: "Verified", hl: "text-emerald-500" },
                    { label: "Session Integrity", value: "99.982%", hl: "text-white/90" },
                    { label: "Protocol Map", value: "SST-U-HTTP", hl: "text-cyan-500", hideOnMobile: true },
                ].map((stat) => (
                    <div key={stat.label} className={`bg-[#050505] border border-white/[0.03] rounded-[1.5rem] lg:rounded-[2rem] p-6 lg:p-8 flex flex-col items-start gap-2 lg:gap-3 shadow-xl hover:bg-white/[0.015] transition-all group overflow-hidden relative ${stat.hideOnMobile ? 'hidden lg:flex' : 'flex'}`}>
                        <div className="absolute -right-4 -bottom-4 text-3xl lg:text-4xl font-black text-white/[0.01] select-none group-hover:scale-125 transition-transform">{stat.label[0]}</div>
                        <div className="text-[8px] lg:text-[9px] text-gray-600 uppercase font-black tracking-[0.4em]">{stat.label}</div>
                        <div className={`text-lg lg:text-xl font-black uppercase tracking-widest ${stat.hl}`}>{stat.value}</div>
                    </div>
                ))}
            </div>
        </div>
    );
}

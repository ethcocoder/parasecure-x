"use client";

import { useEngine, ThreatEvent } from "@/src/context/EngineContext";
import SecurityLockout from "@/src/components/SecurityLockout";
import ThreatMap from "@/src/components/ThreatMap";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";


export default function Threats() {
    const { threats, activeDefense, toggleDefense, ghostMode, toggleGhostMode, appState, networkInfo } = useEngine();
    const [selectedThreat, setSelectedThreat] = useState<ThreatEvent | null>(null);

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
        <div className="flex-1 flex flex-col w-full max-w-7xl mx-auto py-8 lg:py-12 px-6 lg:px-8 h-full relative overflow-x-hidden">

            {/* Cyber Background Decoration */}
            <div className="absolute inset-0 cyber-grid opacity-[0.02] pointer-events-none" />

            {/* Security Lockout Overlay */}
            {isLocked && (
                <SecurityLockout
                    moduleName="Threat Intelligence"
                    description="Real-time threat feeds and topological anomaly maps require an active Sovereign bridge"
                />
            )}

            {/* Content Top: Map + Status Control Panel */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-12">

                {/* Global Map Section */}
                <motion.div
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="lg:col-span-8 h-[350px] lg:h-full min-h-[400px] z-10"
                >
                    <ThreatMap />
                </motion.div>

                {/* Status Column */}
                <div className="lg:col-span-4 flex flex-col gap-6 z-10">

                    {/* Active Intelligence Card */}
                    <motion.div
                        initial={{ x: 20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        className="glass-emerald p-8 rounded-[2.5rem] flex-1 flex flex-col justify-between shadow-2xl border-t-white/[0.08]"
                    >
                        <div className="space-y-4">
                            <div className="flex items-center gap-3">
                                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                <span className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.3em]">Guardian Mode Active</span>
                            </div>
                            <h3 className="text-xl font-black text-white uppercase italic tracking-wider">Sovereign Node</h3>
                            <p className="text-[10px] text-gray-500 leading-relaxed font-bold uppercase tracking-widest max-w-[240px]">
                                Tunneling through bijective grammar protocols. Real-time interception active.
                            </p>
                        </div>

                        <div className="space-y-3 lg:space-y-4 pt-6">
                            <p className="text-3xl lg:text-4xl font-black text-white leading-none">
                                {networkInfo.anomaliesCount.toString().padStart(3, '0')}
                            </p>
                            <p className="text-[9px] lg:text-[10px] text-gray-600 font-black uppercase tracking-[0.4em]">Anomalies Indexed</p>
                        </div>
                    </motion.div>

                    {/* Quick Control Switches */}
                    <div className="grid grid-cols-2 gap-4">
                        <button
                            onClick={toggleDefense}
                            disabled={isLocked}
                            className={`p-6 rounded-[2.5rem] border transition-all flex flex-col items-center gap-3 glass ${activeDefense ? 'border-emerald-500/30 text-emerald-500 bg-emerald-500/[0.05]' : 'border-white/5 text-gray-700'}`}
                        >
                            <span className="text-[7px] font-black uppercase tracking-widest opacity-60">Shield</span>
                            <span className="text-[10px] font-black">{activeDefense ? 'ON' : 'OFF'}</span>
                        </button>
                        <button
                            onClick={toggleGhostMode}
                            disabled={isLocked}
                            className={`p-6 rounded-[2.5rem] border transition-all flex flex-col items-center gap-3 glass ${ghostMode ? 'border-cyan-500/30 text-cyan-500 bg-cyan-500/[0.05]' : 'border-white/5 text-gray-700'}`}
                        >
                            <span className="text-[7px] font-black uppercase tracking-widest opacity-60">Ghost</span>
                            <span className="text-[10px] font-black">{ghostMode ? 'ON' : 'OFF'}</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Section Header */}
            <div className="flex items-center gap-4 mb-10">
                <div className="flex flex-col">
                    <h2 className="text-2xl font-black text-white uppercase tracking-[0.2em] italic">Intelligence Log</h2>
                    <span className="text-[8px] text-gray-600 font-black uppercase tracking-[0.4em]">Global Incident Stream</span>
                </div>
                <div className="h-px flex-1 bg-gradient-to-r from-white/10 to-transparent" />
            </div>

            {/* Threats Repository (Responsive Grid) */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 lg:gap-8 pb-32">
                <AnimatePresence mode="popLayout">
                    {threats.length === 0 ? (
                        <div className="col-span-full h-64 flex flex-col items-center justify-center opacity-20 gap-6">
                            <div className="w-12 h-12 rounded-full border border-white/10 animate-spin border-t-emerald-500" />
                            <p className="text-[10px] font-black uppercase tracking-[0.5em]">Polling Sensors...</p>
                        </div>
                    ) : (
                        threats.map((threat) => (
                            <motion.div
                                key={threat.id}
                                layout
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                onClick={() => setSelectedThreat(threat)}
                                className={`group p-8 rounded-[2.5rem] border ${getSeverityColor(threat.severity)} hover:scale-[1.02] transition-all duration-500 relative overflow-hidden backdrop-blur-xl cursor-pointer`}
                            >
                                {/* Decorative Gradient */}
                                <div className="absolute inset-0 bg-gradient-to-br from-white/[0.015] to-transparent pointer-events-none" />

                                <div className="relative space-y-6">
                                    <div className="flex justify-between items-start">
                                        <div className="space-y-1.5 text-left">
                                            <span className="text-[9px] font-mono text-gray-500 font-bold">{threat.time}</span>
                                            <h4 className="text-sm font-black text-white uppercase tracking-wider">{threat.type}</h4>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <div className={`px-3 py-1.5 rounded-xl text-[8px] font-black uppercase tracking-[0.2em] border border-current opacity-70`}>
                                                {threat.severity}
                                            </div>
                                            <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center group-hover:bg-white/10 transition-colors">
                                                <span className="text-[10px] text-white/40">⛶</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-5">
                                        <p className="text-[12px] text-gray-400 font-bold leading-relaxed tracking-tight text-left line-clamp-2 italic">
                                            {threat.description}
                                        </p>

                                        <div className="p-5 rounded-2xl bg-black/40 border border-white/[0.02] space-y-3">
                                            <div className="flex justify-between items-end">
                                                <div className="flex flex-col gap-1 items-start">
                                                    <span className="text-[7px] text-gray-700 font-black uppercase tracking-[0.2em]">Source Vector</span>
                                                    <span className="text-[10px] font-mono text-cyan-500/60 font-bold drop-shadow-[0_0_5px_rgba(6,182,212,0.2)]">{threat.source}</span>
                                                </div>
                                                <div className="flex flex-col items-end gap-1">
                                                    <span className="text-[7px] text-gray-700 font-black uppercase tracking-[0.2em]">System Outcome</span>
                                                    <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">{threat.status}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>

                        ))
                    )}
                </AnimatePresence>
            </div>

            {/* Detailed Threat Modal */}
            <AnimatePresence>
                {selectedThreat && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 md:p-12">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setSelectedThreat(null)}
                            className="absolute inset-0 bg-black/90 backdrop-blur-2xl"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className={`relative w-full max-w-2xl p-10 md:p-14 rounded-[3.5rem] border shadow-[0_50px_100px_rgba(0,0,0,0.8)] overflow-hidden ${getSeverityColor(selectedThreat.severity)} border-white/5 backdrop-blur-3xl`}
                        >
                            <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-red-500/40 to-transparent" />

                            <div className="flex justify-between items-start mb-12">
                                <div className="space-y-3 text-left">
                                    <div className="flex items-center gap-3">
                                        <span className="text-[10px] font-mono text-gray-500 font-bold">{selectedThreat.time}</span>
                                        <div className={`px-3 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest border border-current opacity-80`}>
                                            {selectedThreat.severity}
                                        </div>
                                    </div>
                                    <h3 className="text-3xl font-black text-white uppercase italic tracking-wider">{selectedThreat.type}</h3>
                                </div>
                                <button
                                    onClick={() => setSelectedThreat(null)}
                                    className="p-4 rounded-full bg-white/5 hover:bg-white/10 transition-colors border border-white/10"
                                >
                                    <span className="text-xs text-gray-500">ESC</span>
                                </button>
                            </div>

                            <div className="space-y-10">
                                <div className="space-y-4 text-left">
                                    <span className="text-[9px] text-gray-600 font-black uppercase tracking-[0.4em]">Detailed Discovery</span>
                                    <p className="text-lg font-bold text-white/90 leading-relaxed tracking-tight italic">
                                        {selectedThreat.description}
                                    </p>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="p-8 rounded-[2.5rem] bg-black/60 border border-white/[0.03] space-y-4">
                                        <span className="text-[8px] text-gray-700 font-black uppercase tracking-[0.4em]">Origin Vector</span>
                                        <p className="text-sm font-mono text-cyan-400 font-black opacity-80 break-all leading-relaxed uppercase">{selectedThreat.source}</p>
                                    </div>

                                    <div className="p-8 rounded-[2.5rem] bg-black/60 border border-white/[0.03] space-y-4">
                                        <span className="text-[8px] text-gray-700 font-black uppercase tracking-[0.4em]">Defense Result</span>
                                        <div className="flex items-center gap-3">
                                            <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
                                            <p className="text-sm font-black text-emerald-500 uppercase tracking-widest">{selectedThreat.status}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-10 border-t border-white/5">
                                    <button
                                        onClick={() => setSelectedThreat(null)}
                                        className="w-full py-5 rounded-[2rem] bg-white/5 text-white text-[10px] font-black uppercase tracking-[0.5em] border border-white/10 hover:bg-white/10 transition-all shadow-xl"
                                    >
                                        Acknowledge & Close
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>

    );
}

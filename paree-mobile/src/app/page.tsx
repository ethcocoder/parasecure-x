"use client";

import { useEngine } from "@/src/context/EngineContext";
import { motion, AnimatePresence } from "framer-motion";


export default function Dashboard() {
    const { appState, statusMsg, lastResult, toggle } = useEngine();

    const isProtected = appState === "protected";
    const isConnecting = appState === "connecting";
    const isError = appState === "error";

    return (
        <div className="flex-1 flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] lg:min-h-screen px-6 py-12 lg:py-20 overflow-hidden relative">

            {/* Cyber Matrix Base Layer */}
            <div className="absolute inset-0 cyber-grid opacity-[0.03] pointer-events-none" />
            <div className="absolute inset-0 cyber-dots opacity-[0.05] pointer-events-none animate-pulse-soft" />


            {/* Background Ambience (Adaptive Size) */}
            <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90vw] lg:w-[600px] h-[90vw] lg:h-[600px] blur-[100px] lg:blur-[140px] transition-colors duration-1000 -z-10 opacity-30 ${isProtected ? 'bg-emerald-500/40' :
                isError ? 'bg-red-500/30' :
                    isConnecting ? 'bg-cyan-500/30 animate-pulse' : 'bg-white/5'
                }`} />

            {/* Main Core Container (Adaptive Gap) */}
            <div className="w-full max-w-lg flex flex-col items-center gap-10 lg:gap-16 relative">

                {/* System ID Tag (Responsive Text) */}
                <motion.div
                    initial={{ y: -20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="px-5 lg:px-6 py-2 rounded-full border border-white/[0.03] bg-white/[0.02] backdrop-blur-md shadow-2xl z-10"
                >
                    <p className="text-[9px] lg:text-[10px] font-black uppercase tracking-[0.4em] lg:tracking-[0.5em] text-gray-400 flex items-center gap-2 lg:gap-3 whitespace-nowrap">
                        <span className={`w-1 h-1 rounded-full ${isProtected ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,1)]' : 'bg-gray-700'}`} />
                        System Status: <span className={isProtected ? 'text-emerald-400' : 'text-gray-200'}>{appState.toUpperCase()}</span>
                    </p>
                </motion.div>


                {/* The Power Core (Fluid UI Design) */}
                <motion.div
                    layout
                    className="relative group p-4 scale-[0.85] lg:scale-100 transition-transform duration-700"
                >
                    {/* Outer Ring Glow */}
                    <AnimatePresence>
                        {isProtected && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 1.2 }}
                                className="absolute inset-0 rounded-full blur-[40px] bg-emerald-500/20"
                            />
                        )}
                    </AnimatePresence>

                    <button
                        onClick={toggle}
                        disabled={isConnecting}
                        className={`
                            relative w-64 h-64 lg:w-80 lg:h-80 rounded-full flex flex-col items-center justify-center transition-all duration-1000
                            border shadow-[0_0_80px_rgba(0,0,0,0.5)] active:scale-[0.96] overflow-hidden group/core
                            ${isProtected
                                ? 'border-emerald-500/20 bg-[#080808]'
                                : 'border-white/[0.05] bg-[#050505] hover:border-white/10 shadow-none'}
                        `}
                    >
                        {/* Internal Hardware Texture */}
                        <div className="absolute inset-0 opacity-20 pointer-events-none">
                            <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,_transparent_40%,_black_95%)]" />
                            <div className="w-full h-full bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] scale-150 group-hover/core:scale-[1.6] transition-transform duration-1000" />
                        </div>

                        <div className="absolute inset-[10px] lg:inset-[15px] rounded-full border border-white/[0.02] bg-gradient-to-br from-white/[0.03] to-transparent shadow-inner" />

                        <div className="relative flex flex-col items-center gap-4 lg:gap-5 z-20">
                            <motion.div
                                animate={isProtected ? { scale: [1, 1.05, 1], rotate: [0, 2, 0, -2, 0] } : {}}
                                transition={{ repeat: Infinity, duration: 4 }}
                                className={`
                                    text-4xl lg:text-6xl transition-all duration-1000 italic font-black 
                                    ${isProtected ? 'text-emerald-500 drop-shadow-[0_0_20px_rgba(52,211,153,0.5)]' : 'text-gray-800'}
                                `}
                            >
                                {isConnecting ? '...' : 'PX'}
                            </motion.div>

                            <div className="flex flex-col items-center gap-1 opacity-80">
                                <span className={`text-[10px] lg:text-[11px] font-black uppercase tracking-[0.4em] ${isProtected ? 'text-emerald-400' : 'text-gray-500'}`}>
                                    {isProtected ? 'Disarm' : 'Activate'}
                                </span>
                                <div className={`w-8 h-[2px] rounded-full transition-all duration-1000 ${isProtected ? 'bg-emerald-500' : 'bg-gray-800'}`} />
                            </div>
                        </div>

                        {isConnecting && (
                            <div className="absolute inset-0 flex items-center justify-center">
                                <motion.div
                                    animate={{ scale: [1, 1.5], opacity: [0.5, 0] }}
                                    transition={{ repeat: Infinity, duration: 1.5 }}
                                    className="w-full h-full border-[10px] border-cyan-500/20 rounded-full"
                                />
                            </div>
                        )}
                    </button>
                </motion.div>


                {/* Telemetry Display (Responsive Density) */}
                <div className="w-full space-y-6 lg:space-y-8 mt-2 lg:mt-4">
                    <div className="text-center space-y-3">
                        <p className={`text-[12px] lg:text-[13px] font-bold uppercase tracking-[0.3em] transition-colors duration-500 drop-shadow-sm ${isError ? 'text-red-400' : 'text-white/80'}`}>
                            {statusMsg}
                        </p>
                        <div className="h-px w-24 bg-gradient-to-r from-transparent via-white/10 to-transparent mx-auto" />
                    </div>

                    {isProtected && lastResult && (
                        <motion.div
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full px-4 lg:px-0"
                        >
                            <div className="glass-emerald p-5 lg:p-7 rounded-[1.5rem] lg:rounded-[2.5rem] shadow-xl space-y-1 group transition-all flex flex-col justify-center">
                                <p className="text-[8px] lg:text-[9px] text-emerald-500/60 font-black uppercase tracking-[0.3em] transition-colors">Integrity</p>
                                <p className="text-xs lg:text-sm font-black text-white/90 uppercase tracking-widest">SST-Verified</p>
                            </div>
                            <div className="glass-cyan p-5 lg:p-7 rounded-[1.5rem] lg:rounded-[2.5rem] shadow-xl space-y-1 group transition-all flex flex-col justify-center">
                                <p className="text-[8px] lg:text-[9px] text-cyan-500/60 font-black uppercase tracking-[0.3em] transition-colors">Session Hash</p>
                                <p className="text-xs lg:text-sm font-mono text-cyan-500/70 font-bold truncate">A1-FX90-B2C3...</p>
                            </div>
                        </motion.div>
                    )}

                </div>

                {/* System Capabilities Footer (Stacked on mobile) */}
                <div className="flex flex-wrap justify-center gap-6 lg:gap-10 opacity-30 mt-6 lg:mt-8 px-4">
                    {['TLS-13', 'PX-SST', 'AES-GCM'].map(cap => (
                        <span key={cap} className="text-[8px] lg:text-[9px] font-black uppercase tracking-[0.4em] lg:tracking-[0.5em] text-gray-400 text-center">{cap}</span>
                    ))}
                </div>

            </div>
        </div>
    );
}

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { useEngine } from "@/src/context/EngineContext";

interface SidebarProps {
    children: React.ReactNode;
    credits: {
        name: string;
        role: string;
    };
}

export default function SidebarLayout({ children, credits }: SidebarProps) {
    const pathname = usePathname();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const { notifications, dismissNotification } = useEngine();

    // Close mobile menu on route change
    useEffect(() => {
        setIsMobileMenuOpen(false);
    }, [pathname]);

    const navItems = [
        { name: "Engine Core", href: "/", icon: "⏣" },
        { name: "Network Trace", href: "/monitor", icon: "⚡" },
        { name: "Secure Search", href: "/browser", icon: "🌐" },
        { name: "Threat Intel", href: "/threats", icon: "🛡️" },
    ];

    return (
        <div className="flex h-screen w-screen overflow-hidden bg-[#020202] text-white font-sans selection:bg-emerald-500/30">

            {/* Real-time Notification Overlay (Adaptive Positioning) */}
            <div className="fixed bottom-6 right-6 lg:top-8 lg:right-8 lg:bottom-auto z-[100] flex flex-col gap-4 w-[calc(100%-3rem)] max-w-sm pointer-events-none mx-auto lg:mx-0">
                {notifications.map((n) => (
                    <div
                        key={n.id}
                        className={`
                            pointer-events-auto p-5 rounded-2xl border backdrop-blur-3xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] flex flex-col gap-2 
                            animate-in slide-in-from-bottom-10 lg:slide-in-from-right-10 fade-in duration-500 hover:scale-[1.02] transition-transform
                            ${n.type === 'warning' ? 'bg-red-500/[0.08] border-red-500/20' : 'bg-emerald-500/[0.08] border-emerald-500/20'}
                        `}
                    >
                        <div className="flex justify-between items-center">
                            <h4 className={`text-[10px] font-black uppercase tracking-[0.3em] ${n.type === 'warning' ? 'text-red-400' : 'text-emerald-400'}`}>
                                {n.title}
                            </h4>
                            <button onClick={() => dismissNotification(n.id)} className="text-gray-600 hover:text-white transition-colors text-xs p-1">✕</button>
                        </div>
                        <p className="text-[13px] text-white/70 font-medium leading-relaxed tracking-tight">{n.message}</p>
                        <div className="flex items-center gap-2 mt-1">
                            <div className={`w-1 h-1 rounded-full ${n.type === 'warning' ? 'bg-red-500' : 'bg-emerald-500'}`} />
                            <span className="text-[9px] text-gray-600 font-bold uppercase tracking-widest">{n.time}</span>
                        </div>
                    </div>
                ))}
            </div>

            {/* Desktop Sidebar (Persistent) */}
            <aside className="hidden lg:flex flex-col w-[280px] border-r border-white/[0.03] bg-[#050505] relative z-50">
                <div className="absolute inset-y-0 right-0 w-px bg-gradient-to-b from-transparent via-white/5 to-transparent" />

                <div className="p-10 mb-2">
                    <div className="flex items-center gap-4">
                        <div className="relative group">
                            <div className="w-11 h-11 rounded-xl bg-emerald-500 flex items-center justify-center font-black text-black text-xl italic transition-transform group-hover:scale-105 duration-500 shadow-[0_0_25px_rgba(16,185,129,0.2)]">
                                PX
                            </div>
                            <div className="absolute inset-x-0 -bottom-2 h-4 bg-emerald-500/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                        <div className="flex flex-col">
                            <h1 className="text-[13px] font-black tracking-[0.3em] uppercase text-white/95">Sovereign</h1>
                            <span className="text-[9px] font-black text-gray-600 uppercase tracking-[0.4em] mt-0.5 ml-0.5 opacity-60 italic">V2.1.0-PRO</span>
                        </div>
                    </div>
                </div>

                <nav className="flex-1 px-5 mt-4 space-y-1.5">
                    {navItems.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                className={`
                                    flex items-center gap-4 px-6 py-4 rounded-[1.25rem] transition-all duration-500 group relative
                                    ${isActive
                                        ? "bg-white/[0.03] text-emerald-400 border border-white/[0.03] shadow-[0_10px_30px_rgba(0,0,0,0.3)]"
                                        : "text-gray-500/70 hover:text-white hover:bg-white/[0.015]"}
                                `}
                            >
                                {isActive && (
                                    <div className="absolute left-0 w-1 h-6 bg-emerald-500 rounded-r-full shadow-[0_0_15px_rgba(16,185,129,0.5)]" />
                                )}
                                <span className={`text-xl transition-all duration-700 ${isActive ? "scale-110 drop-shadow-[0_0_8px_rgba(52,211,153,0.3)]" : "group-hover:scale-110 grayscale group-hover:grayscale-0 opacity-40 group-hover:opacity-100"}`}>
                                    {item.icon}
                                </span>
                                <span className={`text-[10px] font-black uppercase tracking-[0.35em] transition-colors ${isActive ? 'text-white/90' : 'text-gray-600 group-hover:text-gray-300'}`}>
                                    {item.name}
                                </span>
                            </Link>
                        );
                    })}
                </nav>

                <div className="p-10 border-t border-white/[0.03]">
                    <div className="flex flex-col gap-2 relative">
                        <div className="flex items-center gap-2 mb-1">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500/40 animate-pulse" />
                            <span className="text-[8px] font-black text-emerald-500/60 uppercase tracking-[0.4em]">Engine Secure</span>
                        </div>
                        <p className="text-[11px] font-black tracking-[0.25em] text-white/80 uppercase">{credits.name}</p>
                        <p className="text-[9px] font-bold text-gray-700 uppercase tracking-widest leading-tight">{credits.role}</p>
                    </div>
                </div>
            </aside>

            {/* Mobile Header (Refined) */}
            <div className="lg:hidden fixed top-0 left-0 right-0 h-16 px-6 flex items-center justify-between border-b border-white/[0.03] bg-black/60 backdrop-blur-2xl z-[60]">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center font-black text-black italic text-sm">PX</div>
                    <span className="text-[11px] font-black tracking-[0.3em] uppercase text-white/90">Sovereign</span>
                </div>
                <button
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    className="flex items-center gap-2 group"
                >
                    <span className={`text-[9px] font-black tracking-[0.3em] uppercase transition-colors ${isMobileMenuOpen ? 'text-emerald-400' : 'text-gray-500'}`}>
                        {isMobileMenuOpen ? "CLOSE" : "MENU"}
                    </span>
                    <div className="w-5 h-4 flex flex-col justify-between items-end">
                        <div className={`h-[1.5px] bg-current transition-all ${isMobileMenuOpen ? 'w-5 translate-y-[7.5px] rotate-45 text-emerald-400' : 'w-5 text-gray-500'}`} />
                        <div className={`h-[1.5px] bg-current transition-all ${isMobileMenuOpen ? 'opacity-0' : 'w-3 text-gray-500'}`} />
                        <div className={`h-[1.5px] bg-current transition-all ${isMobileMenuOpen ? 'w-5 -translate-y-[7.5px] -rotate-45 text-emerald-400' : 'w-5 text-gray-500'}`} />
                    </div>
                </button>
            </div>

            {/* Mobile Overlay (Full-screen Adaptive) */}
            <div className={`
                lg:hidden fixed inset-0 bg-black/95 backdrop-blur-2xl z-[50] transition-all duration-500
                ${isMobileMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}
            `}>
                <div className="flex flex-col h-full pt-32 pb-12 px-10">
                    <div className="mb-12">
                        <h2 className="text-[10px] font-black text-emerald-500/60 uppercase tracking-[0.6em] mb-4">Navigation Hub</h2>
                        <div className="w-12 h-[2px] bg-emerald-500/20" />
                    </div>

                    <nav className="flex flex-col gap-10">
                        {navItems.map((item, idx) => {
                            const isActive = pathname === item.href;
                            return (
                                <Link
                                    key={idx}
                                    href={item.href}
                                    className={`flex items-center gap-6 group transition-all duration-300 ${isMobileMenuOpen ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}
                                    style={{ transitionDelay: `${idx * 75}ms` }}
                                >
                                    <span className={`text-3xl transition-transform duration-500 ${isActive ? 'text-emerald-400 scale-110 drop-shadow-[0_0_10px_rgba(52,211,153,0.3)]' : 'text-gray-800 group-hover:scale-110 group-hover:text-gray-400'}`}>
                                        {item.icon}
                                    </span>
                                    <div className="flex flex-col">
                                        <span className={`text-[16px] font-black uppercase tracking-[0.3em] leading-none transition-colors ${isActive ? 'text-white' : 'text-gray-700'}`}>
                                            {item.name}
                                        </span>
                                        {isActive && <div className="h-px w-full bg-emerald-500/30 mt-2" />}
                                    </div>
                                </Link>
                            );
                        })}
                    </nav>

                    <div className="mt-auto space-y-4 border-t border-white/5 pt-10">
                        <div className="flex items-center gap-3">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            <p className="text-[11px] font-black text-white/90 uppercase tracking-[0.3em]">{credits.name}</p>
                        </div>
                        <p className="text-[9px] text-gray-700 uppercase tracking-[0.2em] font-bold ml-4.5">{credits.role}</p>
                    </div>
                </div>
            </div>

            {/* Main Content Space (Fluid Scaling) */}
            <main className="flex-1 relative bg-[#020202] flex flex-col items-center pt-16 lg:pt-0">
                {/* Background Ambience (Layered) */}
                <div className="absolute top-0 right-0 w-[80vw] lg:w-[60vw] h-[80vh] lg:h-[60vh] bg-emerald-500/[0.04] blur-[150px] lg:blur-[180px] -z-10 rounded-full animate-pulse duration-[12s]" />
                <div className="absolute bottom-0 left-0 w-[70vw] lg:w-[50vw] h-[70vh] lg:h-[50vh] bg-blue-500/[0.03] blur-[150px] lg:blur-[180px] -z-10 rounded-full" />

                {/* Scrollable Viewport with Hidden Scrollbar */}
                <div className="w-full h-full overflow-y-auto scrollbar-hide flex flex-col">
                    {children}
                </div>
            </main>

            <style jsx global>{`
                .scrollbar-hide::-webkit-scrollbar {
                    display: none;
                }
                .scrollbar-hide {
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                }
            `}</style>
        </div>
    );
}

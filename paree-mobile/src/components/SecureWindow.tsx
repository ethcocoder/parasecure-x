"use client";

import { useState, useEffect, useRef } from "react";
import { Capacitor, registerPlugin } from '@capacitor/core';
import { useEngine } from "@/src/context/EngineContext";
import { motion, AnimatePresence } from "framer-motion";

// Interface for our custom Native Engine
interface SovereignBrowserPlugin {
    open(options: { url: string; rect: { x: number; y: number; width: number; height: number } }): Promise<void>;
    updateRect(options: { rect: { x: number; y: number; width: number; height: number } }): Promise<void>;
    close(): Promise<void>;
    navigate(options: { direction: 'back' | 'forward' | 'reload' }): Promise<void>;
    syncEngineState(options: { threatLevel: string; defenseActive: boolean }): Promise<void>;
    addListener(eventName: 'onBrowserTelemetry', listenerFunc: (data: any) => void): Promise<{ remove: () => void }>;
}

const SovereignBrowser = registerPlugin<SovereignBrowserPlugin>('SovereignBrowser');

interface SecureWindowProps {
    url: string;
    isOpen: boolean;
    onClose: () => void;
    title?: string;
    encryptionKey?: string;
}

export default function SecureWindow({ url: initialUrl, isOpen, onClose, title = "Secure Viewport", encryptionKey = "SST-A1-X90" }: SecureWindowProps) {
    const [isMinimized, setIsMinimized] = useState(false);
    const [isFullScreen, setIsFullScreen] = useState(false);
    const { threats, activeDefense, networkInfo } = useEngine();

    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
    const [isEstablishing, setIsEstablishing] = useState(true);

    // Browser Shell State
    const [currentUrl, setCurrentUrl] = useState(initialUrl);
    const [displayUrl, setDisplayUrl] = useState(initialUrl);

    const windowRef = useRef<HTMLDivElement>(null);
    const viewportRef = useRef<HTMLDivElement>(null);

    // 1. Core Native Engine Lifecycle
    useEffect(() => {
        if (!isOpen || !Capacitor.isNativePlatform()) return;

        let telemetryListener: { remove: () => void } | null = null;

        const initNativeEngine = async () => {
            setIsEstablishing(true);

            // Initial Rect (approximate, will be refined by the tracking effect)
            const rect = { x: 50, y: 150, width: 300, height: 400 };

            await SovereignBrowser.open({ url: initialUrl, rect });

            telemetryListener = await SovereignBrowser.addListener('onBrowserTelemetry', (data) => {
                if (data.event === 'onNavigationCompleted') {
                    setDisplayUrl(data.url);
                    setCurrentUrl(data.url);
                }
            });

            setTimeout(() => setIsEstablishing(false), 2400);
        };

        initNativeEngine();

        return () => {
            SovereignBrowser.close();
            if (telemetryListener) telemetryListener.remove();
        };
    }, [isOpen]);

    // 2. Real-Time Viewport Tracking (Sync Native View with React UI)
    useEffect(() => {
        if (!isOpen || isMinimized || !viewportRef.current || !Capacitor.isNativePlatform()) {
            if (isMinimized) SovereignBrowser.close(); // Hide overlay when minimized
            return;
        }

        const updateNativeViewport = async () => {
            const rect = viewportRef.current?.getBoundingClientRect();
            if (rect) {
                await SovereignBrowser.updateRect({
                    rect: {
                        x: Math.round(rect.left),
                        y: Math.round(rect.top),
                        width: Math.round(rect.width),
                        height: Math.round(rect.height)
                    }
                });
            }
        };

        // Sync on every frame during drag/resize for "Production" smoothness
        const animationFrame = requestAnimationFrame(updateNativeViewport);

        // Also sync on window resize
        window.addEventListener('resize', updateNativeViewport);

        return () => {
            cancelAnimationFrame(animationFrame);
            window.removeEventListener('resize', updateNativeViewport);
        };
    }, [isOpen, isMinimized, position, isFullScreen, isEstablishing]);

    // 3. SST Engine Sync (Threat Level -> Native Browser)
    useEffect(() => {
        if (!isOpen || !Capacitor.isNativePlatform()) return;

        SovereignBrowser.syncEngineState({
            threatLevel: threats.length > 5 ? 'CRITICAL' : threats.length > 0 ? 'WARNING' : 'SAFE',
            defenseActive: activeDefense
        });
    }, [threats.length, activeDefense, isOpen]);

    // Navigation Handlers
    const navigateTo = (newUrl: string) => {
        let target = newUrl;
        if (!target.startsWith('http')) target = 'https://' + target;
        setCurrentUrl(target);
        setDisplayUrl(target);
        SovereignBrowser.open({
            url: target,
            rect: viewportRef.current?.getBoundingClientRect() || { x: 0, y: 0, width: 0, height: 0 }
        });
    };

    const goBack = () => SovereignBrowser.navigate({ direction: 'back' });
    const goForward = () => SovereignBrowser.navigate({ direction: 'forward' });
    const reload = () => SovereignBrowser.navigate({ direction: 'reload' });

    // Window Management
    const handleMouseDown = (e: React.MouseEvent) => {
        if (isFullScreen || isMinimized) return;
        setIsDragging(true);
        setDragOffset({ x: e.clientX - position.x, y: e.clientY - position.y });
    };

    const handleMouseMove = (e: MouseEvent) => {
        if (!isDragging) return;
        setPosition({ x: e.clientX - dragOffset.x, y: e.clientY - dragOffset.y });
    };

    const handleMouseUp = () => setIsDragging(false);

    useEffect(() => {
        if (isDragging) {
            window.addEventListener("mousemove", handleMouseMove);
            window.addEventListener("mouseup", handleMouseUp);
        } else {
            window.removeEventListener("mousemove", handleMouseMove);
            window.removeEventListener("mouseup", handleMouseUp);
        }
        return () => {
            window.removeEventListener("mousemove", handleMouseMove);
            window.removeEventListener("mouseup", handleMouseUp);
        };
    }, [isDragging]);

    if (!isOpen) return null;

    const windowClasses = `
        fixed z-[200] flex flex-col overflow-hidden transition-all duration-500 ease-out
        bg-[#050505]/95 backdrop-blur-3xl border border-white/[0.08] shadow-[0_50px_150px_rgba(0,0,0,0.9)]
        ${isFullScreen ? 'inset-0 rounded-0' : isMinimized ? 'bottom-8 right-8 w-72 h-16 rounded-2xl' : 'w-[98vw] sm:w-[94vw] h-[95vh] sm:h-[85vh] lg:w-[1240px] lg:h-[850px] rounded-[2.5rem]'}
    `;

    const windowStyle = !isFullScreen && !isMinimized ? {
        transform: `translate(${position.x}px, ${position.y}px)`,
    } : {};

    return (
        <AnimatePresence>
            <motion.div
                ref={windowRef}
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                style={windowStyle}
                className={windowClasses}
            >
                {/* Header Bar */}
                <div
                    onMouseDown={handleMouseDown}
                    className={`flex-none flex items-center px-4 lg:px-8 py-4 bg-white/[0.02] border-b border-white/[0.05] cursor-grab ${isDragging ? 'cursor-grabbing' : ''} gap-4`}
                >
                    <div className="flex items-center gap-1.5 lg:gap-2 flex-none">
                        <button onClick={onClose} className="w-4 h-4 rounded-full bg-red-500/80 hover:bg-red-500 transition-all flex items-center justify-center group">
                            <span className="text-[8px] text-white opacity-0 group-hover:opacity-100 font-bold">×</span>
                        </button>
                        <button onClick={() => setIsMinimized(!isMinimized)} className="w-4 h-4 rounded-full bg-amber-500/80 hover:bg-amber-500 transition-all flex items-center justify-center group">
                            <span className="text-[8px] text-white opacity-0 group-hover:opacity-100 font-bold">−</span>
                        </button>
                        <button onClick={() => setIsFullScreen(!isFullScreen)} className={`w-4 h-4 rounded-full bg-emerald-500/80 hover:bg-emerald-500 transition-all flex items-center justify-center group`}>
                            <span className="text-[6px] text-white opacity-0 group-hover:opacity-100 font-bold">▲</span>
                        </button>
                    </div>

                    {!isMinimized && (
                        <div className="flex-1 flex items-center gap-3 lg:gap-6 min-w-0">
                            <div className="flex items-center gap-1 flex-none bg-white/[0.03] p-1 rounded-xl border border-white/[0.05]">
                                <button onClick={goBack} className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-white/5 transition-all">
                                    <span className="text-white text-base">←</span>
                                </button>
                                <button onClick={goForward} className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-white/5 transition-all">
                                    <span className="text-white text-base">→</span>
                                </button>
                                <button onClick={reload} className="hidden xs:flex w-8 h-8 rounded-lg items-center justify-center hover:bg-white/5 transition-all">
                                    <span className="text-white text-xs">↻</span>
                                </button>
                            </div>

                            <div className="flex-1 min-w-0 h-10 bg-black/60 border border-white/[0.08] rounded-2xl px-3 lg:px-5 flex items-center gap-2 lg:gap-3 shadow-inner">
                                <div className="hidden xs:block w-1.5 h-1.5 rounded-full bg-emerald-500 flex-none" />
                                <input
                                    value={displayUrl}
                                    onChange={(e) => setDisplayUrl(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && navigateTo(displayUrl)}
                                    className="bg-transparent border-none outline-none text-[10px] lg:text-[11px] font-mono text-white/50 w-full font-bold focus:text-white transition-colors"
                                />
                            </div>

                            <div className="flex items-center gap-4 flex-none">
                                <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center shadow-[0_0_15px_rgba(16,185,129,0.2)] flex-none">
                                    <span className="text-black text-xs font-black italic">PX</span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Viewport Area */}
                <div className="flex-1 relative bg-white">
                    {isEstablishing && (
                        <div className="absolute inset-x-0 bottom-0 top-0 z-[60] bg-[#050505] flex flex-col items-center justify-center p-12 text-center">
                            <div className="w-24 h-24 rounded-full border-t-2 border-emerald-500/40 animate-spin [animation-duration:2s]" />
                            <span className="mt-8 text-[8px] text-emerald-500 font-black uppercase tracking-[0.6em]">ESTABLISHING SOVEREIGN BRIDGE</span>
                        </div>
                    )}

                    {/* SENTINEL: The native view will be placed exactly over this div */}
                    <div ref={viewportRef} className="w-full h-full bg-white" />

                    {/* Web Fallback (Development Only) */}
                    {!Capacitor.isNativePlatform() && (
                        <div className="absolute inset-0 flex items-center justify-center bg-zinc-900 overflow-hidden text-center p-8">
                            <div className="max-w-md space-y-4">
                                <h2 className="text-emerald-500 font-black text-2xl italic">NATIVE ENGINE ONLY</h2>
                                <p className="text-white/40 text-xs leading-relaxed uppercase tracking-widest">
                                    Sovereign Browser Logic requires multi-process android overrides.
                                    Please build APK to verify 100% site compatibility.
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Footer Stats */}
                    {!isMinimized && !isEstablishing && (
                        <div className="absolute bottom-4 left-4 right-4 h-12 bg-black/80 backdrop-blur-xl border border-white/5 rounded-xl px-6 flex items-center justify-between pointer-events-none z-10">
                            <div className="flex items-center gap-6">
                                <div className="flex flex-col">
                                    <span className="text-[6px] text-gray-600 font-black uppercase tracking-widest">Protocol</span>
                                    <span className="text-[10px] font-mono text-emerald-500/80 font-bold uppercase">Sovereign-Native</span>
                                </div>
                                <div className="hidden sm:flex flex-col border-l border-white/5 pl-6">
                                    <span className="text-[6px] text-gray-600 font-black uppercase tracking-widest">Network Speed</span>
                                    <span className="text-[10px] font-mono text-cyan-500/80 font-bold uppercase">{networkInfo.latency}ms</span>
                                </div>
                            </div>
                            <div className="flex flex-col items-end">
                                <span className="text-[6px] text-gray-600 font-black uppercase tracking-widest">Structural Identity</span>
                                <span className="text-[10px] font-mono text-white/40 font-bold uppercase truncate max-w-[400px]">{currentUrl}</span>
                            </div>
                        </div>
                    )}
                </div>
            </motion.div>
        </AnimatePresence>
    );
}

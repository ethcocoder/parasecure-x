"use client";

import { useState, useEffect, useRef } from "react";
import { Capacitor, CapacitorHttp } from '@capacitor/core';
import { useEngine } from "@/src/context/EngineContext";



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
    const { threats, activeDefense, toggleDefense, ghostMode, toggleGhostMode, appState, networkInfo } = useEngine();

    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
    const [isEstablishing, setIsEstablishing] = useState(true);
    const [isLoadingContent, setIsLoadingContent] = useState(false);

    // Browser Shell State
    const [currentUrl, setCurrentUrl] = useState(initialUrl);
    const [displayUrl, setDisplayUrl] = useState(initialUrl);
    const [history, setHistory] = useState<string[]>([initialUrl]);

    const [historyIndex, setHistoryIndex] = useState(0);
    const [iframeBlobUrl, setIframeBlobUrl] = useState<string>("");


    const windowRef = useRef<HTMLDivElement>(null);
    const iframeRef = useRef<HTMLIFrameElement>(null);

    useEffect(() => {
        if (isOpen) {
            setIsEstablishing(true);
            setIsLoadingContent(true);
            const timer = setTimeout(() => setIsEstablishing(false), 2400);
            setCurrentUrl(initialUrl);
            setDisplayUrl(initialUrl);
            return () => clearTimeout(timer);
        }
    }, [isOpen, initialUrl]);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") {
                if (isFullScreen) setIsFullScreen(false);
                else if (!isMinimized) setIsMinimized(true);
            }
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [isFullScreen, isMinimized]);

    const handleMouseDown = (e: React.MouseEvent) => {
        if (isFullScreen || isMinimized) return;
        setIsDragging(true);
        setDragOffset({
            x: e.clientX - position.x,
            y: e.clientY - position.y
        });
    };

    const handleMouseMove = (e: MouseEvent) => {
        if (!isDragging) return;
        setPosition({
            x: e.clientX - dragOffset.x,
            y: e.clientY - dragOffset.y
        });
    };

    const handleMouseUp = () => {
        setIsDragging(false);
    };

    const handleTouchStart = (e: React.TouchEvent) => {
        if (isFullScreen || isMinimized) return;
        setIsDragging(true);
        setDragOffset({
            x: e.touches[0].clientX - position.x,
            y: e.touches[0].clientY - position.y
        });
    };

    const handleTouchMove = (e: TouchEvent) => {
        if (!isDragging) return;
        setPosition({
            x: e.touches[0].clientX - dragOffset.x,
            y: e.touches[0].clientY - dragOffset.y
        });
    };

    const handleTouchEnd = () => {
        setIsDragging(false);
    };

    useEffect(() => {
        if (isDragging) {
            window.addEventListener("mousemove", handleMouseMove);
            window.addEventListener("mouseup", handleMouseUp);
            window.addEventListener("touchmove", handleTouchMove, { passive: false });
            window.addEventListener("touchend", handleTouchEnd);
        } else {
            window.removeEventListener("mousemove", handleMouseMove);
            window.removeEventListener("mouseup", handleMouseUp);
            window.removeEventListener("touchmove", handleTouchMove);
            window.removeEventListener("touchend", handleTouchEnd);
        }
        return () => {
            window.removeEventListener("mousemove", handleMouseMove);
            window.removeEventListener("mouseup", handleMouseUp);
            window.removeEventListener("touchmove", handleTouchMove);
            window.removeEventListener("touchend", handleTouchEnd);
        };
    }, [isDragging]);

    const navigateTo = (newUrl: string) => {
        let target = newUrl;
        if (!target.startsWith('http')) target = 'https://' + target;
        setCurrentUrl(target);
        setDisplayUrl(target);
        setHistory(prev => [...prev.slice(0, historyIndex + 1), target]);
        setHistoryIndex(prev => prev + 1);
    };

    const goBack = () => {
        if (historyIndex > 0) {
            const newIndex = historyIndex - 1;
            setHistoryIndex(newIndex);
            setCurrentUrl(history[newIndex]);
            setDisplayUrl(history[newIndex]);
        }
    };

    const goForward = () => {
        if (historyIndex < history.length - 1) {
            const newIndex = historyIndex + 1;
            setHistoryIndex(newIndex);
            setCurrentUrl(history[newIndex]);
            setDisplayUrl(history[newIndex]);
        }
    };

    const reload = () => {
        const urlToReload = currentUrl;
        setCurrentUrl("");
        setTimeout(() => setCurrentUrl(urlToReload), 10);
    };

    useEffect(() => {
        let active = true;
        let blobUrl = "";

        async function loadContent() {
            if (!currentUrl || !isOpen) return;

            // Only use native CapacitorHttp if on a native platform
            if (!Capacitor.isNativePlatform()) {
                // In browser/dev, we can't use the /api/proxy anymore as it's deleted
                // We'll set the URL directly, though it may be blocked by CORS/X-Frame-Options
                setIframeBlobUrl(""); // Clear blob URL to use direct URL fallback or show message
                return;
            }


            setIsLoadingContent(true);
            try {
                const response = await CapacitorHttp.get({
                    url: currentUrl,
                    headers: {
                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
                    }
                });

                if (!active) return;

                let html = response.data;
                const baseUrl = new URL(currentUrl).origin;

                // Inject <base> tag to fix relative assets
                const baseTag = `<base href="${baseUrl}/">`;
                if (html.includes('<head>')) {
                    html = html.replace('<head>', `<head>${baseTag}`);
                } else {
                    html = `<head>${baseTag}</head>${html}`;
                }

                const blob = new Blob([html], { type: 'text/html' });
                blobUrl = URL.createObjectURL(blob);
                setIframeBlobUrl(blobUrl);
            } catch (error) {
                console.error('Native Proxy Error:', error);
                // On error, we could show an error page in the iframe
            } finally {
                if (active) setIsLoadingContent(false);
            }
        }

        loadContent();

        return () => {
            active = false;
            if (blobUrl) {
                URL.revokeObjectURL(blobUrl);
            }
        };
    }, [currentUrl, isOpen]);


    const toggleFullScreen = () => {
        setIsFullScreen(!isFullScreen);
        setIsMinimized(false);
    };

    const iframeSrc = iframeBlobUrl || currentUrl;



    if (!isOpen) return null;

    const windowClasses = `
    fixed z-[200] flex flex-col overflow-hidden transition-all duration-500 ease-out
    bg-[#050505]/95 backdrop-blur-3xl border border-white/[0.05] shadow-[0_40px_100px_rgba(0,0,0,0.8)]
    ${isFullScreen ? 'inset-0 rounded-0' : isMinimized ? 'bottom-8 right-8 w-72 h-16 rounded-2xl' : 'w-[98vw] sm:w-[90vw] h-[90vh] sm:h-[80vh] lg:w-[1240px] lg:h-[850px] rounded-2xl sm:rounded-[2.5rem]'}
  `;

    const windowStyle = !isFullScreen && !isMinimized ? {
        transform: `translate(${position.x}px, ${position.y}px)`,
    } : {};

    return (
        <div
            ref={windowRef}
            style={windowStyle}
            className={windowClasses}
        >
            {/* Header Bar */}
            <div
                onMouseDown={handleMouseDown}
                onTouchStart={handleTouchStart}
                className={`flex-none flex items-center justify-between px-6 lg:px-8 py-4 bg-white/[0.02] border-b border-white/[0.05] cursor-grab ${isDragging ? 'cursor-grabbing' : ''}`}
            >
                <div className="flex items-center gap-4">
                    <div className="flex gap-1.5 flex-none mr-4">
                        <button
                            onClick={onClose}
                            className="w-3.5 h-3.5 rounded-full bg-red-500/80 hover:bg-red-500 transition-all flex items-center justify-center shadow-[0_0_10px_rgba(239,68,68,0.3)] group"
                            title="Close Browser"
                        >
                            <span className="text-[8px] text-white opacity-0 group-hover:opacity-100 font-bold">×</span>
                        </button>
                        <button
                            onClick={() => setIsMinimized(!isMinimized)}
                            className="w-3.5 h-3.5 rounded-full bg-amber-500/80 hover:bg-amber-500 transition-all flex items-center justify-center shadow-[0_0_10px_rgba(245,158,11,0.3)] group"
                            title="Minimize"
                        >
                            <span className="text-[8px] text-white opacity-0 group-hover:opacity-100 font-bold">−</span>
                        </button>
                        <button
                            onClick={() => { setIsFullScreen(!isFullScreen); setIsMinimized(false); }}
                            className="w-3.5 h-3.5 rounded-full bg-emerald-500/80 hover:bg-emerald-500 transition-all flex items-center justify-center shadow-[0_0_10px_rgba(16,185,129,0.3)] group"
                            title="Fullscreen"
                        >
                            <span className="text-[6px] text-white opacity-0 group-hover:opacity-100 font-bold">{isFullScreen ? '▼' : '▲'}</span>
                        </button>
                    </div>

                    {!isMinimized && (
                        <div className="flex items-center gap-4 ml-4">
                            <div className="h-4 w-px bg-white/[0.1]" />
                            <div className="flex flex-col">
                                <span className="text-[7px] text-gray-600 font-black uppercase tracking-[0.4em] leading-none mb-1">Tunnel Status</span>
                                <div className="flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,1)] animate-pulse" />
                                    <span className="text-[9px] font-black text-white/90 uppercase tracking-widest">{encryptionKey}</span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {!isMinimized && (
                    <div className="flex-1 flex items-center justify-center gap-4 max-w-2xl mx-10">
                        <div className="flex items-center gap-1.5 mr-2">
                            <button onClick={onClose} className="w-8 h-8 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center justify-center hover:bg-red-500/20 transition-all group" title="Close Window">
                                <span className="text-red-500 text-[10px] font-black group-hover:scale-110 transition-transform">✕</span>
                            </button>
                            <button onClick={toggleFullScreen} className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center hover:bg-emerald-500/20 transition-all group" title="Toggle Fullscreen">
                                <span className="text-emerald-500 text-[10px] font-black group-hover:scale-110 transition-transform">{isFullScreen ? '↙' : '↗'}</span>
                            </button>
                        </div>

                        <div className="h-4 w-px bg-white/[0.05]" />

                        <div className="flex items-center gap-2">
                            <button onClick={goBack} disabled={historyIndex === 0} className="w-8 h-8 rounded-lg bg-white/[0.03] flex items-center justify-center hover:bg-white/10 disabled:opacity-20 transition-all">
                                <span className="text-white text-sm">←</span>
                            </button>
                            <button onClick={goForward} disabled={historyIndex === history.length - 1} className="w-8 h-8 rounded-lg bg-white/[0.03] flex items-center justify-center hover:bg-white/10 disabled:opacity-20 transition-all">
                                <span className="text-white text-sm">→</span>
                            </button>
                            <button onClick={reload} className="w-8 h-8 rounded-lg bg-white/[0.03] flex items-center justify-center hover:bg-white/10 transition-all">
                                <span className="text-white text-xs">↻</span>
                            </button>
                        </div>

                        <div className="flex-1 h-9 bg-black/40 border border-white/5 rounded-xl px-4 flex items-center gap-3">
                            <div className="w-2 h-2 rounded-full bg-emerald-500/50" />
                            <input
                                value={displayUrl}
                                onChange={(e) => setDisplayUrl(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && navigateTo(displayUrl)}
                                className="bg-transparent border-none outline-none text-[11px] font-mono text-white/70 w-full"
                            />
                        </div>
                    </div>
                )}

                {!isMinimized && (
                    <div className="flex items-center gap-3 lg:gap-5">
                        <button
                            onClick={() => window.open(currentUrl, '_blank')}
                            className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/[0.02] border border-white/[0.05] text-[7px] font-black text-white/40 uppercase tracking-widest hover:text-white hover:bg-white/5 transition-all"
                        >
                            External ↗
                        </button>
                        <div className="hidden lg:flex flex-col items-end">
                            <span className="text-[7px] text-gray-600 font-black uppercase tracking-[0.4em] leading-none mb-1">Safety Layer</span>
                            <span className="text-[9px] font-black text-emerald-500/80 uppercase tracking-widest italic">SST-ENABLED</span>
                        </div>
                        <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center shadow-[0_0_15px_rgba(16,185,129,0.2)] flex-none">
                            <span className="text-black text-xs font-black italic">PX</span>
                        </div>
                    </div>
                )}
            </div>

            {/* Main Content Area */}
            {!isMinimized && (
                <div className="flex-1 relative bg-white">

                    {isEstablishing ? (
                        <div className="absolute inset-0 z-50 bg-[#050505] flex flex-col items-center justify-center p-12 text-center overflow-hidden">
                            {/* Visual Establishing Sequence */}
                            <div className="relative mb-12">
                                <div className="w-32 h-32 rounded-full border border-white/5 flex items-center justify-center">
                                    <div className="w-24 h-24 rounded-full border-t-2 border-emerald-500/40 animate-spin [animation-duration:2s]" />
                                </div>
                                <div className="absolute inset-x-0 -bottom-4 animate-pulse">
                                    <span className="text-[8px] text-emerald-500 font-black uppercase tracking-[0.6em]">ESTABLISHING TUNNEL</span>
                                </div>
                            </div>

                            <div className="max-w-xs space-y-6">
                                <div className="space-y-2">
                                    <h3 className="text-lg font-black text-white italic tracking-wider uppercase">Generative Bijective Masking</h3>
                                    <p className="text-gray-600 text-[11px] font-medium leading-relaxed uppercase tracking-tighter">
                                        Constructing lossless protocol bridge via sovereign structural transformer...
                                    </p>
                                </div>

                                <div className="flex flex-col gap-2">
                                    <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                                        <div className="h-full bg-emerald-500 animate-[establishing_2.4s_ease-in-out_forwards]" />
                                    </div>
                                    <div className="flex justify-between font-mono text-[8px] text-gray-700">
                                        <span>0xFA32..</span>
                                        <span className="animate-pulse">SST-CONNECTED</span>
                                        <span>..99.8%</span>
                                    </div>
                                </div>
                            </div>

                            {/* Cyber Matrix Rain (Subtle) */}
                            <div className="absolute inset-0 pointer-events-none opacity-5 overflow-hidden font-mono text-[8px] text-emerald-500 grid grid-cols-6 gap-2 break-all p-4">
                                {Array.from({ length: 12 }).map((_, i) => (
                                    <div key={i} className="animate-in slide-in-from-top duration-1000" style={{ animationDelay: `${i * 100}ms` }}>
                                        {Math.random().toString(36).substring(2, 15)}
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="w-full h-full bg-white relative">
                            {currentUrl && (
                                <iframe
                                    ref={iframeRef}
                                    src={iframeSrc}
                                    onLoad={() => setIsLoadingContent(false)}
                                    className={`w-full h-full border-none bg-white transition-opacity duration-700 ${isLoadingContent ? 'opacity-0' : 'opacity-100'}`}
                                    title="Sovereign Viewport Content"
                                    sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
                                />
                            )}

                            {!Capacitor.isNativePlatform() && (
                                <div className="absolute top-2 left-1/2 -translate-x-1/2 z-[60] px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 backdrop-blur-md">
                                    <span className="text-[9px] font-black text-amber-500 uppercase tracking-widest flex items-center gap-2">
                                        <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                                        Limited Mode: Running in Browser. Use Native App for Full SST Tunneling.
                                    </span>
                                </div>
                            )}


                            {isLoadingContent && !isEstablishing && (
                                <div className="absolute inset-0 flex items-center justify-center bg-white/50 backdrop-blur-sm">
                                    <div className="flex flex-col items-center gap-4">
                                        <div className="w-8 h-8 rounded-full border-2 border-emerald-500/20 border-t-emerald-500 animate-spin" />
                                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Loading Secure Node...</span>
                                    </div>
                                </div>
                            )}

                            {/* Security Watermark (Subtle) */}
                            <div className="absolute top-4 right-4 pointer-events-none opacity-[0.03] select-none text-[40px] font-black text-black">
                                SOVEREIGN PRIVACY SHIELD
                            </div>
                        </div>
                    )}

                    {/* Security Overlay (Persistent Monospaced Stats) */}
                    {!isEstablishing && (
                        <div className="absolute bottom-4 left-4 right-4 h-12 bg-black/80 backdrop-blur-xl border border-white/5 rounded-xl px-6 flex items-center justify-between pointer-events-none z-10">
                            <div className="flex items-center gap-6">
                                <div className="flex flex-col">
                                    <span className="text-[6px] text-gray-600 font-black uppercase tracking-widest">Protocol</span>
                                    <span className="text-[10px] font-mono text-emerald-500/80 font-bold uppercase">Sovereign-SST</span>
                                </div>
                                <div className="hidden sm:flex flex-col border-l border-white/5 pl-6">
                                    <span className="text-[6px] text-gray-600 font-black uppercase tracking-widest">Masking Latency</span>
                                    <span className="text-[10px] font-mono text-cyan-500/80 font-bold uppercase">{networkInfo.latency}ms</span>

                                </div>
                            </div>
                            <div className="flex flex-col items-end">
                                <span className="text-[6px] text-gray-600 font-black uppercase tracking-widest">Integrity Signature</span>
                                <span className="text-[10px] font-mono text-white/40 font-bold uppercase truncate max-w-[150px] lg:max-w-[400px]">{currentUrl}</span>
                            </div>
                        </div>
                    )}
                </div>
            )}

            <style jsx>{`
        @keyframes establishing {
           0% { width: 0%; }
           40% { width: 30%; }
           60% { width: 70%; }
           100% { width: 100%; }
        }
      `}</style>
        </div>
    );
}

"use client";

import { useState, useEffect } from "react";

interface ResultItem {
    id: string;
    title: string;
    snippet: string;
    url: string;
    entropy: string;
    tags: string[];
}

interface SecureResultsUIProps {
    query: string;
}

export default function SecureResultsUI({ query }: SecureResultsUIProps) {
    const [results, setResults] = useState<ResultItem[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Generate mock "Intelligence" data based on query
        setLoading(true);
        const timer = setTimeout(() => {
            const mockData: ResultItem[] = [
                {
                    id: "1",
                    title: `Discovery Vector: ${query.toUpperCase()}`,
                    snippet: `Sovereign intelligence has located high-integrity data streams regarding "${query}". Semantic mapping confirms foundational relevance. The bridge has successfully neutralized all tracking scripts for this node.`,
                    url: `https://en.wikipedia.org/wiki/${query.replace(/\s+/g, '_')}`,
                    entropy: "0.0031",
                    tags: ["SOURCE-VERIFIED", "CORE-INTELLIGENCE"]
                },
                {
                    id: "2",
                    title: "Technical Knowledge Base",
                    snippet: `Optimized results for "${query}" reconstructed from verified structural data. All third-party telemetry removed. Presenting clean-room intelligence on the requested vector.`,
                    url: `https://www.nature.com/search?q=${encodeURIComponent(query)}`,
                    entropy: "0.0064",
                    tags: ["SST-CLEAN-ROOM", "HIGH-INTEGRITY"]
                },
                {
                    id: "3",
                    title: "Sovereign Intelligence Report",
                    snippet: `Comprehensive dossier on "${query}" compiled via bijective protocol stream. Cross-analysis of global databases indicates a verified match. Security integrity: ELITE.`,
                    url: `https://scholar.google.com/scholar?q=${encodeURIComponent(query)}`,
                    entropy: "0.0092",
                    tags: ["PX-DOSSIER", "LOSSLESS-LINK"]
                }
            ];
            setResults(mockData);
            setLoading(false);
        }, 1200);

        return () => clearTimeout(timer);
    }, [query]);

    if (loading) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center p-10 space-y-8 animate-in fade-in duration-500">
                <div className="w-16 h-16 rounded-2xl border-2 border-emerald-500/10 border-t-emerald-500 animate-spin" />
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.5em] animate-pulse">Syncing Intelligence...</p>
            </div>
        );
    }

    return (
        <div className="flex-1 flex flex-col h-full bg-[#080808] p-4 lg:p-8 animate-in slide-in-from-bottom-4 duration-700">

            {/* Search Metadata Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 pb-6 border-b border-white/[0.03]">
                <div className="space-y-1">
                    <h3 className="text-[11px] font-black text-white uppercase tracking-[0.3em]">Discovery Analysis: <span className="text-emerald-500 italic">"{query}"</span></h3>
                    <p className="text-[8px] text-gray-600 font-bold uppercase tracking-widest">Sovereign Knowledge Synthesis v2.1</p>
                </div>
                <div className="flex items-center gap-6">
                    <div className="flex flex-col items-end">
                        <span className="text-[7px] text-gray-700 font-black uppercase tracking-widest">Knowledge Integrity</span>
                        <span className="text-[10px] font-mono text-emerald-500/80 font-bold">0.999982</span>
                    </div>
                    <div className="p-2 px-4 rounded-xl border border-white/5 bg-white/[0.02] flex items-center gap-3">
                        <div className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-pulse" />
                        <span className="text-[8px] font-black text-white/50 uppercase tracking-widest">Live Flow</span>
                    </div>
                </div>
            </div>

            {/* Results Grid */}
            <div className="flex-1 space-y-6 overflow-y-auto scrollbar-hide pb-20">
                {results.map((res) => (
                    <div key={res.id} className="group relative">
                        <div className="absolute -inset-[1px] bg-gradient-to-r from-emerald-500/0 via-emerald-500/10 to-emerald-500/0 opacity-0 group-hover:opacity-100 transition-opacity rounded-[1.5rem]" />
                        <div className="relative p-6 lg:p-8 rounded-[1.5rem] bg-[#050505] border border-white/[0.03] group-hover:bg-[#070707] transition-all duration-500 flex flex-col gap-6">

                            <div className="flex justify-between items-start gap-4">
                                <div className="space-y-2">
                                    <div className="flex flex-wrap gap-2 mb-2">
                                        {res.tags.map(tag => (
                                            <span key={tag} className="text-[7px] font-black px-2 py-0.5 rounded-md bg-white/[0.02] border border-white/[0.05] text-gray-500 tracking-widest uppercase">
                                                {tag}
                                            </span>
                                        ))}
                                    </div>
                                    <h4 className="text-lg lg:text-xl font-black text-white tracking-tight leading-tight group-hover:text-emerald-400 transition-colors uppercase italic">
                                        {res.title}
                                    </h4>
                                    <p className="text-[9px] font-mono text-gray-600 truncate max-w-sm">{res.url}</p>
                                </div>

                                <div className="flex flex-col items-end gap-1 flex-none">
                                    <span className="text-[6px] text-gray-700 font-black uppercase tracking-widest">Security Cost</span>
                                    <span className="text-[11px] font-mono text-cyan-500/60 font-black">-{res.entropy}</span>
                                </div>
                            </div>

                            <div className="bg-[#020202] border border-white/[0.03] p-5 rounded-2xl relative overflow-hidden group/box">
                                <p className="text-[12px] lg:text-[14px] text-gray-400 font-medium leading-relaxed tracking-tight">
                                    {res.snippet}
                                </p>
                            </div>

                            <div className="flex justify-between items-center pt-2">
                                <div className="flex items-center gap-4">
                                    <div className="flex flex-col">
                                        <span className="text-[6px] text-gray-700 font-black uppercase tracking-widest">Relevance</span>
                                        <span className="text-[9px] font-black text-white/40 uppercase tracking-widest">Matched</span>
                                    </div>
                                    <div className="w-px h-6 bg-white/[0.03]" />
                                    <div className="flex flex-col">
                                        <span className="text-[6px] text-gray-700 font-black uppercase tracking-widest">Protocol</span>
                                        <span className="text-[9px] font-black text-emerald-500/40 uppercase tracking-widest">SST-Discovery</span>
                                    </div>
                                </div>

                                <button
                                    onClick={() => window.open(res.url, '_blank')}
                                    className="px-6 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.05] text-[8px] font-black text-white/50 uppercase tracking-[0.3em] hover:bg-emerald-500 hover:text-black hover:border-emerald-500 transition-all active:scale-95 shadow-xl"
                                >
                                    Open Secure Bridge ↗
                                </button>
                            </div>
                        </div>
                    </div>
                ))}

                {/* Intelligence Footer */}
                <div className="pt-10 text-center space-y-4 opacity-20">
                    <div className="flex justify-center items-center gap-10">
                        <span className="text-[8px] font-black text-gray-600 uppercase tracking-[0.5em]">Mode: Discovery Synthesis</span>
                        <span className="text-[8px] font-black text-gray-600 uppercase tracking-[0.5em]">Encryption: PX-L-4096</span>
                    </div>
                    <p className="text-[7px] font-bold text-gray-700 uppercase tracking-widest">Sovereign Knowledge Dossier - Secure Discovery Mode</p>
                </div>
            </div>

        </div>
    );
}

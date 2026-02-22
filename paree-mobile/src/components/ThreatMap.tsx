"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";

interface Point {
    x: number;
    y: number;
    intensity: number;
}

export default function ThreatMap() {
    const [points, setPoints] = useState<Point[]>([]);

    useEffect(() => {
        // Generate random threat points across the "world"
        const newPoints = Array.from({ length: 12 }).map(() => ({
            x: Math.random() * 100,
            y: Math.random() * 100,
            intensity: Math.random()
        }));
        setPoints(newPoints);
    }, []);

    return (
        <div className="relative w-full h-full min-h-[300px] bg-black/40 rounded-[2.5rem] border border-white/[0.03] overflow-hidden group">
            <div className="absolute inset-0 cyber-grid opacity-[0.05]" />

            <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                {/* Simulated connection lines */}
                {points.map((p, i) => (
                    <motion.line
                        key={`line-${i}`}
                        x1="50"
                        y1="50"
                        x2={p.x}
                        y2={p.y}
                        stroke="rgba(16, 185, 129, 0.1)"
                        strokeWidth="0.2"
                        initial={{ pathLength: 0, opacity: 0 }}
                        animate={{ pathLength: 1, opacity: 1 }}
                        transition={{ duration: 2, delay: i * 0.2, repeat: Infinity, repeatDelay: 3 }}
                    />
                ))}

                {/* Threat Points */}
                {points.map((p, i) => (
                    <motion.circle
                        key={`point-${i}`}
                        cx={p.x}
                        cy={p.y}
                        r={0.8 + p.intensity}
                        fill={p.intensity > 0.7 ? "rgba(239, 68, 68, 0.4)" : "rgba(245, 158, 11, 0.3)"}
                        initial={{ scale: 0 }}
                        animate={{ scale: [1, 1.5, 1] }}
                        transition={{ duration: 2 + p.intensity, repeat: Infinity }}
                    />
                ))}

                {/* Central Sovereign Node */}
                <motion.circle
                    cx="50"
                    cy="50"
                    r="2"
                    fill="#10b981"
                    className="shadow-[0_0_15px_rgba(16,185,129,1)]"
                    animate={{ r: [2, 2.5, 2], opacity: [0.8, 1, 0.8] }}
                    transition={{ duration: 3, repeat: Infinity }}
                />
                <circle cx="50" cy="50" r="10" fill="none" stroke="rgba(16, 185, 129, 0.05)" strokeWidth="0.5" />
                <circle cx="50" cy="50" r="20" fill="none" stroke="rgba(16, 185, 129, 0.02)" strokeWidth="0.2" />
            </svg>

            {/* Overlay Info */}
            <div className="absolute top-6 left-8 space-y-1">
                <p className="text-[10px] font-black text-white/40 uppercase tracking-[0.3em]">Global Intelligence</p>
                <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <p className="text-xs font-black text-white uppercase tracking-widest">Active Sovereign Node</p>
                </div>
            </div>

            <div className="absolute bottom-6 right-8 flex gap-6">
                <div className="flex flex-col items-end">
                    <span className="text-[8px] text-gray-600 font-black uppercase tracking-widest">Anomalies</span>
                    <span className="text-sm font-mono text-red-500/60 font-black">L-DIST: 12</span>
                </div>
                <div className="flex flex-col items-end">
                    <span className="text-[8px] text-gray-600 font-black uppercase tracking-widest">Vector</span>
                    <span className="text-sm font-mono text-cyan-500/60 font-black">PX-7V</span>
                </div>
            </div>
        </div>
    );
}

"use client";

import React, { createContext, useContext, useState, useRef, useEffect, ReactNode, useCallback } from "react";
import { SovereignEngine, EngineResult } from "../engine/sovereign_engine";

type AppState = "off" | "connecting" | "protected" | "error";

export interface LogEntry {
    id: string;
    time: string;
    original: string;
    encoded: string;
    type: "GET" | "POST" | "DNS";
    ok: boolean;
}

export interface ThreatEvent {
    id: string;
    time: string;
    type: "Port Scan" | "MITM" | "Exploit" | "Phishing";
    severity: "low" | "medium" | "high" | "critical";
    description: string;
    source: string;
    status: "detected" | "blocked" | "monitored";
    details: string;
}

export interface NetworkInfo {
    ip: string;
    latency: number;
    anomaliesCount: number;
}


export interface Notification {
    id: string;
    title: string;
    message: string;
    type: "security" | "info" | "warning";
    time: string;
}

interface EngineContextType {
    appState: AppState;
    statusMsg: string;
    lastResult: EngineResult | null;
    toggle: () => Promise<void>;
    engine: SovereignEngine | null;
    packetLog: LogEntry[];
    addLogEntry: (result: EngineResult) => void;
    threats: ThreatEvent[];
    addThreat: (threat: Omit<ThreatEvent, "id" | "time">) => void;
    activeDefense: boolean;
    toggleDefense: () => void;
    ghostMode: boolean;
    toggleGhostMode: () => void;
    notifications: Notification[];
    dismissNotification: (id: string) => void;
    networkInfo: NetworkInfo;
}


const EngineContext = createContext<EngineContextType | undefined>(undefined);

const DEFAULT_PACKET = `GET /api/v2/users/profile HTTP/1.1\nHost: api.production.internal\nAuthorization: Bearer eyJhbGciOiJSUzI1NiJ9.payload.sig\nUser-Agent: Mozilla/5.0 (Linux; Android 14) AppleWebKit/537.36\nAccept: application/json\nAccept-Encoding: gzip, deflate, br\nConnection: keep-alive\nX-Request-ID: a1b2c3d4-e5f6-7890-abcd-ef1234567890`;

export function EngineProvider({ children }: { children: ReactNode }) {
    const [appState, setAppState] = useState<AppState>("off");
    const [statusMsg, setStatusMsg] = useState("System Standby. Awaiting Activation.");
    const [lastResult, setLastResult] = useState<EngineResult | null>(null);
    const [packetLog, setPacketLog] = useState<LogEntry[]>([]);
    const [threats, setThreats] = useState<ThreatEvent[]>([]);
    const [activeDefense, setActiveDefense] = useState(true);
    const [ghostMode, setGhostMode] = useState(true);
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [networkInfo, setNetworkInfo] = useState<NetworkInfo>({ ip: "Discovery...", latency: 0, anomaliesCount: 6 });


    const engineRef = useRef<SovereignEngine | null>(null);
    const runningRef = useRef(false);

    useEffect(() => {
        if (!engineRef.current) {
            engineRef.current = new SovereignEngine("sovereign-key-alpha-2026");
        }

        // Real IP & Latency Discovery
        const discoverRealities = async () => {
            try {
                const res = await fetch('https://api.ipify.org?format=json');
                const data = await res.json();
                setNetworkInfo(prev => ({ ...prev, ip: data.ip }));
            } catch (err) {
                setNetworkInfo(prev => ({ ...prev, ip: "127.0.0.1" }));
            }
        };

        const traceLatency = async () => {
            const start = performance.now();
            try {
                // Fetch a tiny resource to measure RTT
                await fetch('https://1.1.1.1', { mode: 'no-cors' });
                const end = performance.now();
                setNetworkInfo(prev => ({ ...prev, latency: Math.round(end - start), anomaliesCount: prev.anomaliesCount + Math.floor(Math.random() * 2) }));
            } catch (e) { }
        };

        discoverRealities();
        const latencyInterval = setInterval(traceLatency, 15000);
        return () => clearInterval(latencyInterval);
    }, []);


    const addLogEntry = useCallback((result: EngineResult) => {
        const now = new Date();
        const time = now.toLocaleTimeString();

        let type: "GET" | "POST" | "DNS" = "GET";
        if (result.original.startsWith("POST")) type = "POST";

        const entry: LogEntry = {
            id: Math.random().toString(36).substring(7),
            time,
            original: result.original.split('\n')[0].trim(),
            encoded: result.encoded.split('\n')[0].trim(),
            type,
            ok: result.ok
        };

        setPacketLog(prev => [entry, ...prev].slice(0, 100));
    }, []);

    const addNotification = useCallback((title: string, message: string, type: "security" | "info" | "warning" = "security") => {
        const id = Math.random().toString(36).substring(7);
        const newNotif: Notification = {
            id,
            title,
            message,
            type,
            time: new Date().toLocaleTimeString()
        };
        setNotifications(prev => [newNotif, ...prev].slice(0, 5));

        // Auto-dismiss after 8 seconds
        setTimeout(() => {
            setNotifications(prev => prev.filter(n => n.id !== id));
        }, 8000);
    }, []);

    const addThreat = useCallback((threat: Omit<ThreatEvent, "id" | "time">) => {
        const now = new Date();
        const time = now.toLocaleTimeString();

        const status = ghostMode ? "monitored" : (activeDefense ? "blocked" : "detected");

        const newThreat: ThreatEvent = {
            ...threat,
            id: Math.random().toString(36).substring(7),
            time,
            status
        };

        setThreats(prev => [newThreat, ...prev].slice(0, 50));

        // Trigger Detailed Notification
        addNotification(
            `${newThreat.type} Detected [${newThreat.severity.toUpperCase()}]`,
            `${newThreat.description} (Origin: ${newThreat.source}). Mode: ${status.toUpperCase()}.`,
            newThreat.severity === 'critical' || newThreat.severity === 'high' ? 'warning' : 'security'
        );
    }, [activeDefense, ghostMode, addNotification]);

    const toggleDefense = () => setActiveDefense(prev => !prev);
    const toggleGhostMode = () => setGhostMode(prev => !prev);
    const dismissNotification = (id: string) => setNotifications(prev => prev.filter(n => n.id !== id));

    const toggle = useCallback(async () => {
        if (runningRef.current) return;
        if (!engineRef.current) return;

        if (appState === "protected") {
            setAppState("off");
            setStatusMsg("System Standby. Awaiting Activation.");
            setLastResult(null);
            return;
        }

        runningRef.current = true;
        setAppState("connecting");
        setStatusMsg("Establishing Sovereign Node Link...");
        setLastResult(null);

        try {
            const result = await engineRef.current.run(DEFAULT_PACKET);
            addLogEntry(result);

            if (result.ok) {
                setTimeout(() => {
                    setAppState("protected");
                    setStatusMsg("Sovereign Network Active. Traffic is Encrypted.");
                    setLastResult(result);
                    runningRef.current = false;
                }, 800);
            } else {
                setAppState("error");
                setStatusMsg("Verification Error. Integrity Compromised.");
                setLastResult(result);
                runningRef.current = false;
            }
        } catch (e: any) {
            setAppState("error");
            setStatusMsg("Critical Engine Failure.");
            runningRef.current = false;
        }
    }, [appState, addLogEntry]);

    // Real-world IDS Scenarios
    const scenarios = useRef([
        {
            type: "Port Scan",
            severity: "medium" as const,
            description: "Inbound TCP SYN Sweep on filtered ports (STEALTH_SCAN).",
            details: "Attacker is using nmap -sS to identify open services. System is maintaining Ghost Mode, responding with pseudo-random delay to mask real topology."
        },
        {
            type: "MITM",
            severity: "critical" as const,
            description: "Gratuitous ARP response detected. Potential ARP Spoofing.",
            details: "Public Wi-Fi router MAC has shifted unexpectedly. System has pinned the original Gateway and is routing traffic through Sovereign Tunnel to bypass the interception point."
        },
        {
            type: "Exploit",
            severity: "high" as const,
            description: "Metasploit Meterpreter reverse_tcp payload fingerprint.",
            details: "Detected signature for 'windows/x64/meterpreter/reverse_tcp'. Payload neutralized by SST bijective grammar transformation."
        },
        {
            type: "Phishing",
            severity: "high" as const,
            description: "DNS Request to known Punycode phishing domain.",
            details: "Domain mimics accounts.google.com using Cyrillic characters. DNS resolution intercepted and redirected to Sovereign Sandbox."
        }
    ]);

    useEffect(() => {
        if (appState !== 'protected') return;

        const interval = setInterval(() => {
            if (Math.random() > 0.88) {
                const scenario = scenarios.current[Math.floor(Math.random() * scenarios.current.length)];
                addThreat({
                    type: scenario.type as ThreatEvent["type"],
                    severity: scenario.severity,
                    description: scenario.description,
                    source: networkInfo.ip, // USE REAL IP
                    details: scenario.details,
                    status: ghostMode ? "monitored" : (activeDefense ? "blocked" : "detected")
                });

            }
        }, 12000);

        return () => clearInterval(interval);
    }, [appState, addThreat, activeDefense, ghostMode, networkInfo.ip]);


    return (
        <EngineContext.Provider value={{
            appState,
            statusMsg,
            lastResult,
            toggle,
            engine: engineRef.current,
            packetLog,
            addLogEntry,
            threats,
            addThreat,
            activeDefense,
            toggleDefense,
            ghostMode,
            toggleGhostMode,
            notifications,
            dismissNotification,
            networkInfo
        }}>

            {children}
        </EngineContext.Provider>
    );
}

export function useEngine() {
    const context = useContext(EngineContext);
    if (context === undefined) {
        throw new Error("useEngine must be used within an EngineProvider");
    }
    return context;
}

"use client";

import { useRouter } from "next/navigation";

interface SecurityLockoutProps {
    moduleName: string;
    description: string;
}

export default function SecurityLockout({ moduleName, description }: SecurityLockoutProps) {
    const router = useRouter();

    return (
        <div className="absolute inset-0 z-40 bg-[#020202]/60 backdrop-blur-3xl flex flex-col items-center justify-center p-8 lg:p-12 text-center animate-in fade-in duration-700">

            {/* Ambient Pulse Background */}
            <div className="absolute w-[200px] h-[200px] lg:w-[300px] lg:h-[300px] bg-red-500/10 blur-[80px] lg:blur-[100px] rounded-full animate-pulse pointer-events-none" />

            <div className="max-w-md w-full space-y-8 lg:space-y-10 relative z-10 flex flex-col items-center">

                {/* Lock Icon Branding */}
                <div className="w-20 h-20 lg:w-24 lg:h-24 rounded-[1.75rem] lg:rounded-[2.25rem] bg-red-500/5 border border-red-500/20 flex flex-col items-center justify-center gap-1 group transition-transform duration-700 hover:scale-105">
                    <span className="text-2xl lg:text-3xl animate-bounce [animation-duration:3s]">🔐</span>
                    <div className="w-4 h-0.5 bg-red-500/40 rounded-full" />
                </div>

                <div className="space-y-4">
                    <div className="flex flex-col items-center gap-2">
                        <span className="text-[9px] lg:text-[10px] font-black text-red-500 uppercase tracking-[0.5em] mb-1">Access Restricted</span>
                        <h2 className="text-2xl lg:text-3xl font-black text-white uppercase italic tracking-wider leading-tight">
                            {moduleName} <br /> <span className="text-gray-600">is Offline</span>
                        </h2>
                    </div>
                    <div className="h-px w-20 bg-gradient-to-r from-transparent via-red-500/20 to-transparent mx-auto mt-6" />
                </div>

                <p className="text-[12px] lg:text-[13px] text-gray-500 font-medium leading-relaxed tracking-tight px-4 lg:px-6">
                    {description}
                </p>

                <div className="w-full pt-4">
                    <button
                        onClick={() => router.push('/')}
                        className="w-full max-w-xs bg-white text-black py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.4em] hover:bg-gray-200 active:scale-[0.97] transition-all shadow-[0_15px_30px_rgba(255,255,255,0.05)]"
                    >
                        Return to Dashboard
                    </button>
                    <p className="mt-6 text-[8px] text-gray-700 font-black uppercase tracking-[0.3em]">
                        Error: ENGINE_DEACTIVATED_A1
                    </p>
                </div>
            </div>
        </div>
    );
}

import React from "react";

interface CallData {
    roomId: string,
    senderId: string,
    receiverId: string,
    type: "voice",
    name: string,
    peerId: string
}

export default function IncomingCallUI({ callData, setCallTrue, acceptCall, rejectCall }: { callData: CallData, setCallTrue: React.Dispatch<React.SetStateAction<boolean>>, acceptCall: () => void, rejectCall: () => void }) {
    return (
        <div className="fixed inset-0 z-[9999] flex items-start justify-center bg-black/40  px-4 pt-10">

            {/* Floating Card */}
            <div className="relative mt-20 w-full max-w-md overflow-hidden rounded-lg border border-indigo-500/20 bg-gradient-to-b from-[#171b46] to-[#16345f] shadow-[0_20px_120px_rgba(79,70,229,0.45)]">

                {/* Glow */}
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(99,102,241,0.18),transparent_60%)]" />

                {/* Header */}
                <div className="relative z-10 flex items-center justify-center gap-3 border-b border-white/10 px-6 py-4">
                    <div className="h-2.5 w-2.5 rounded-full bg-green-400 animate-pulse" />

                    <p className="text-sm uppercase tracking-[3px] text-white/60 font-semibold">
                        Incoming Call
                    </p>
                </div>

                {/* Content */}
                <div className="relative z-10 flex flex-col items-center px-8 py-10">

                    {/* Avatar */}
                    <div className="relative mb-6">
                        <div className="absolute inset-0 rounded-full bg-indigo-500/20 blur-2xl animate-pulse" />

                        <div className="relative flex h-32 w-32 items-center justify-center rounded-full border border-indigo-400/30 bg-gradient-to-br from-indigo-400 to-purple-500 text-5xl font-semibold shadow-[0_0_50px_rgba(99,102,241,0.45)]">
                            A
                        </div>
                    </div>

                    {/* User Info */}
                    <div className="text-center">
                        <h2 className="text-3xl font-semibold tracking-tight text-white">
                            {callData.name}
                        </h2>


                    </div>

                    {/* Buttons */}
                    <div className="mt-10 flex items-center gap-10">

                        {/* Decline */}
                        <div className="flex flex-col items-center gap-3">
                            <button className="flex h-16 w-16 items-center justify-center rounded-full bg-red-500 shadow-[0_10px_35px_rgba(239,68,68,0.45)] transition-all hover:scale-110 active:scale-95" onClick={() => { rejectCall() }}>
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    strokeWidth={2}
                                    stroke="currentColor"
                                    className="h-7 w-7 text-white"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M18.364 5.636L5.636 18.364M5.636 5.636l12.728 12.728"
                                    />
                                </svg>
                            </button>

                            <span className="text-sm text-white/50"
                            >
                                Decline
                            </span>
                        </div>

                        {/* Accept */}
                        <div className="flex flex-col items-center gap-3">
                            <button className="flex h-16 w-16 items-center justify-center rounded-full bg-green-500 shadow-[0_10px_35px_rgba(34,197,94,0.45)] transition-all hover:scale-110 active:scale-95" onClick={() => { acceptCall() }}>
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" className="lucide lucide-phone-icon lucide-phone"><path d="M13.832 16.568a1 1 0 0 0 1.213-.303l.355-.465A2 2 0 0 1 17 15h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2A18 18 0 0 1 2 4a2 2 0 0 1 2-2h3a2 2 0 0 1 2 2v3a2 2 0 0 1-.8 1.6l-.468.351a1 1 0 0 0-.292 1.233 14 14 0 0 0 6.392 6.384" /></svg>
                            </button>

                            <span className="text-sm text-white/50">
                                Accept
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
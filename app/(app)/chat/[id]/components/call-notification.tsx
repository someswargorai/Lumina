import React, { useState, useEffect, useRef } from "react";

interface CallData {
    roomId: string;
    senderId: string;
    receiverId: string;
    type: "voice";
    name: string;
    peerId: string;
    audioStream?: React.MutableRefObject<MediaStream | null>;
}

export default function IncomingCallUI({
    callData,
    acceptCall,
    rejectCall,
}: {
    callData: CallData;
    acceptCall: () => void;
    rejectCall: () => void;
}) {
    const [callAccepted, setCallAccepted] = useState(false);
    const [elapsed, setElapsed] = useState(0);
    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

    useEffect(() => {
        if (callAccepted) {
            timerRef.current = setInterval(() => {
                setElapsed((prev) => prev + 1);
            }, 1000);
        }
        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, [callAccepted]);

    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60).toString().padStart(2, "0");
        const s = (seconds % 60).toString().padStart(2, "0");
        return `${m}:${s}`;
    };

    const handleAccept = () => {
        setCallAccepted(true);
        acceptCall();
    };

    const handleDecline = () => {
        if (timerRef.current) clearInterval(timerRef.current);
        rejectCall();
    };

    return (
        <div className="fixed inset-x-0 top-12 z-[9999] flex justify-center px-4">
            {/* Compact Banner Card */}
            <div className="w-full max-w-sm rounded-lg bg-[#5c5c5c] shadow-2xl overflow-hidden backdrop-blur-md">

                {/* Top row: name + subtitle + avatar */}
                <div className="flex items-center justify-between px-5 pt-4 pb-3">

                    {/* Left: text info */}
                    <div className="flex flex-col">
                        <span className="text-white font-semibold text-base leading-tight capitalize">
                            {callData.name}
                        </span>
                        <div className="flex items-center gap-1.5 mt-0.5">
                            {callAccepted ? (
                                /* Timer shown when call is ongoing */
                                <>
                                    <span className="h-1.5 w-1.5 rounded-full bg-green-400 animate-pulse inline-block" />
                                    <span className="text-green-400 text-xs font-medium">
                                        {formatTime(elapsed)}
                                    </span>
                                </>
                            ) : (
                                /* "Incoming Audio Call" shown before accepting */
                                <>
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        className="h-3.5 w-3.5 text-white/60"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth={2}
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    >
                                        <path d="M13.832 16.568a1 1 0 0 0 1.213-.303l.355-.465A2 2 0 0 1 17 15h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2A18 18 0 0 1 2 4a2 2 0 0 1 2-2h3a2 2 0 0 1 2 2v3a2 2 0 0 1-.8 1.6l-.468.351a1 1 0 0 0-.292 1.233 14 14 0 0 0 6.392 6.384" />
                                    </svg>
                                    <span className="text-white/60 text-xs">
                                        Incoming Audio Call
                                    </span>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Right: avatar */}
                    <div className="h-12 w-12 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-xl font-semibold text-white capitalize flex-shrink-0 ring-2 ring-white/10">
                        {callData.name?.charAt(0)}
                    </div>
                </div>

                {/* Bottom row: Decline + Accept/Ongoing buttons */}
                <div className="grid grid-cols-2 py-2 px-5 gap-2 pb-4">
                    {/* Decline — always visible */}
                    <button
                        className="py-2.5 text-white font-normal text-sm bg-[#ff3b30] hover:bg-[#e0352b] active:bg-[#c42f28] transition-colors cursor-pointer rounded-md"
                        onClick={handleDecline}
                    >
                        {callAccepted ? "End Call" : "Decline"}
                    </button>

                    {/* Accept / Ongoing */}
                    {callAccepted ? (
                        <div className="py-2.5 text-white font-normal text-sm bg-green-600 rounded-md flex items-center justify-center gap-1.5 select-none">
                            <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse inline-block" />
                            Ongoing
                        </div>
                    ) : (
                        <button
                            className="py-2 text-white font-normal text-sm bg-[#30a2ff] hover:bg-[#2b92e6] active:bg-[#2680cc] transition-colors cursor-pointer rounded-md"
                            onClick={handleAccept}
                        >
                            Accept
                        </button>
                    )}
                </div>
            </div>
            {callAccepted === false && <audio src="/call.mp3" autoPlay loop ></audio>}
        </div>
    );
}
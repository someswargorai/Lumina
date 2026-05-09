'use client';

import { useParams, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import io, { Socket } from "socket.io-client";
import Peer, { MediaConnection } from "peerjs";
import { toast } from "sonner";
import { Mic, MicOff, PhoneOff, ScreenShare, ScreenShareOff, Video, VideoOff } from "lucide-react";

export default function Page() {
    const { data: session } = useSession();
    const params = useParams();
    const { id: userId } = params;

    const socketRef = useRef<Socket | null>(null);
    const peerRef = useRef<Peer | null>(null);
    const localStreamRef = useRef<MediaStream | null>(null);
    const remotePeerIdRef = useRef<string | null>(null);
    const screenShareCallRef = useRef<MediaConnection | null>(null);
    const screenShareStreamRef = useRef<MediaStream | null>(null);

    const [micOff, setMicOff] = useState(false);
    const [videoOff, setVideoOff] = useState(false);
    const [screenShare, setScreenShare] = useState(false);   // sharer is sharing
    const [receivingScreen, setReceivingScreen] = useState(false); // receiver is watching
    const router = useRouter();
    const [videoData, setVideoData] = useState("");

    const cleanup = () => {
        peerRef.current?.destroy();
        localStreamRef.current?.getTracks().forEach((t) => t.stop());
        localStreamRef.current = null;
    };

    const stopScreenShare = () => {
        screenShareStreamRef.current?.getTracks().forEach((t) => t.stop());
        screenShareStreamRef.current = null;
        screenShareCallRef.current?.close();
        screenShareCallRef.current = null;
        setScreenShare(false);

        // Restore remote webcam video
        const remoteVideo = document.getElementById("remoteVideo") as HTMLVideoElement;
        const screenVideo = document.getElementById("screenVideo") as HTMLVideoElement;
        if (remoteVideo) remoteVideo.style.display = "block";
        if (screenVideo) { screenVideo.srcObject = null; screenVideo.style.display = "none"; }
    };

    useEffect(() => {
        navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then((stream) => {
            localStreamRef.current = stream;
            const v = document.getElementById("localVideo") as HTMLVideoElement;
            if (v) { v.srcObject = stream; v.play().catch(() => { }); }
        });
    }, []);

    useEffect(() => {
        if (!session?.accessToken || !session?.id) return;

        const roomId = `room_${[userId, session.id].sort().join("_")}`;

        const socket = io(`${process.env.NEXT_PUBLIC_SOCKET_URL}`, {
            autoConnect: false,
            auth: { token: session.accessToken, userId: session.id },
        });
        socketRef.current = socket;


        socket.on("video", (data: { senderId: string; peerId: string; name: string }) => {
            if (data.senderId === session.id) return;
            setVideoData(data.name);

            const stream = localStreamRef.current;
            if (!stream) return;
            const call = peerRef.current?.call(data.peerId, stream);
            remotePeerIdRef.current = data.peerId;

            call?.on("stream", (remoteStream) => {
                const v = document.getElementById("remoteVideo") as HTMLVideoElement;
                if (v) { v.srcObject = remoteStream; v.play().catch(() => { }); }
            });
            call?.on("error", (err) => toast.error("Call error: " + err.message));
        });

        socket.on("connect", () => {
            socket.emit("joinRoom", roomId);

            const peer = new Peer();
            peerRef.current = peer;

            peer.on("open", (myPeerId) => {
                socket.emit("video", {
                    roomId,
                    senderId: session.id,
                    receiverId: userId,
                    peerId: myPeerId,
                    type: "video",
                    name: session?.name,
                });
            });

            peer.on("call", (call) => {
                if (call.metadata?.type === "screenShare") {
                    call.answer();

                    call.on("stream", (remoteStream) => {
                        // ✅ Show screen in screenVideo, hide remoteVideo
                        const remoteVideo = document.getElementById("remoteVideo") as HTMLVideoElement;
                        const screenVideo = document.getElementById("screenVideo") as HTMLVideoElement;

                        if (remoteVideo) remoteVideo.style.display = "none";
                        if (screenVideo) {
                            screenVideo.srcObject = remoteStream;
                            screenVideo.style.display = "block";
                            screenVideo.play().catch(() => { });
                        }
                        setReceivingScreen(true);
                    });

                    call.on("close", () => {
                        // ✅ Sharer stopped — restore remote webcam
                        const remoteVideo = document.getElementById("remoteVideo") as HTMLVideoElement;
                        const screenVideo = document.getElementById("screenVideo") as HTMLVideoElement;

                        if (screenVideo) { screenVideo.srcObject = null; screenVideo.style.display = "none"; }
                        if (remoteVideo) remoteVideo.style.display = "block";
                        setReceivingScreen(false);
                    });
                } else {
                    const stream = localStreamRef.current;
                    if (!stream) return;
                    call.answer(stream);
                    call.on("stream", (remoteStream) => {
                        const v = document.getElementById("remoteVideo") as HTMLVideoElement;
                        if (v) { v.srcObject = remoteStream; v.play().catch(() => { }); }
                    });
                }
            });


            socket.on("call_rejected", () => {
                toast.error("Call rejected");
                router.push(`/chat/${userId}`);
            });

            socket.on("call_end", () => {
                toast.info("Call ended");
                cleanup();
                window.location.assign(`/chat/${userId}`);
            });
        });

        socket.on("connect_error", (err) => toast.error(`Connection error: ${err.message}`));
        socket.connect();

        return () => {
            socket.disconnect();
            cleanup();
        };
    }, [session?.accessToken, session?.id, userId, session?.name]);

    const startScreenShare = async () => {
        try {
            const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
            screenShareStreamRef.current = screenStream;

            // ✅ Show sharer's own preview in screenVideo too
            const remoteVideo = document.getElementById("remoteVideo") as HTMLVideoElement;
            const screenVideo = document.getElementById("screenVideo") as HTMLVideoElement;
            if (remoteVideo) remoteVideo.style.display = "none";
            if (screenVideo) {
                screenVideo.srcObject = screenStream;
                screenVideo.style.display = "block";
                screenVideo.play().catch(() => { });
            }

            setScreenShare(true);

            const call = peerRef.current?.call(remotePeerIdRef.current!, screenStream, {
                metadata: { type: "screenShare" },
            });

            screenShareCallRef.current = call ?? null;

            // ✅ User clicked "Stop sharing" in browser's native UI
            screenStream.getVideoTracks()[0].onended = () => {
                stopScreenShare();
            };

            call?.on("error", (err) => toast.error("Screen share error: " + err.message));
        } catch {
            toast.error("Screen share cancelled");
        }
    };

    const hangUp = () => {
        socketRef.current?.emit("leaveRoom", {
            roomId: `room_${[userId, session?.id].sort().join("_")}`,
        });
        cleanup();
        window.location.assign(`/chat/${userId}`);
    };

    return (
        <div className="h-[calc(100vh-4rem)] w-full flex justify-center items-center p-4">
            <div className="relative flex-1 bg-black flex items-center justify-center border border-gray-200 w-full h-full rounded-md overflow-hidden">

                {/* Remote webcam — hidden when screen sharing is active */}
                <video
                    id="remoteVideo"
                    className="w-full h-full object-cover rounded-md"
                    playsInline
                />

                {/* ✅ Screen share video — hidden by default, shown when sharing */}
                <video
                    id="screenVideo"
                    className="w-full h-full object-contain rounded-md"
                    playsInline
                    style={{ display: "none" }}
                />

                <p className="text-white absolute top-4 left-4 font-semibold capitalize">
                    {receivingScreen ? `${videoData}'s screen` : videoData}
                </p>

                {/* Controls */}
                <div className="absolute bottom-4 flex gap-3">
                    <button
                        className="p-2 size-10 rounded-md bg-gray-900/50 backdrop-blur-sm hover:bg-gray-900/80 flex justify-center items-center cursor-pointer"
                        onClick={hangUp}
                    >
                        <PhoneOff className="text-red-500 size-5" />
                    </button>

                    {screenShare ? (
                        <button
                            className="p-2 size-10 rounded-md bg-blue-600/80 backdrop-blur-sm hover:bg-blue-600 flex justify-center items-center cursor-pointer"
                            onClick={stopScreenShare}
                        >
                            <ScreenShareOff className="text-white size-5" />
                        </button>
                    ) : (
                        <button
                            className="p-2 size-10 rounded-md bg-gray-900/50 backdrop-blur-sm hover:bg-gray-900/80 flex justify-center items-center cursor-pointer"
                            onClick={startScreenShare}
                            disabled={receivingScreen} // can't share while receiving
                        >
                            <ScreenShare className="text-white size-5" />
                        </button>
                    )}

                    <button
                        className="p-2 size-10 rounded-md bg-gray-900/50 backdrop-blur-sm hover:bg-gray-900/80 flex justify-center items-center cursor-pointer"
                        onClick={() => {
                            const next = !micOff;
                            setMicOff(next);
                            localStreamRef.current?.getAudioTracks().forEach((t) => (t.enabled = !next));
                        }}
                    >
                        {micOff ? <MicOff className="text-white size-5" /> : <Mic className="text-white size-5" />}
                    </button>

                    <button
                        className="p-2 size-10 rounded-md bg-gray-900/50 backdrop-blur-sm hover:bg-gray-900/80 flex justify-center items-center cursor-pointer"
                        onClick={() => {
                            const next = !videoOff;
                            setVideoOff(next);
                            localStreamRef.current?.getVideoTracks().forEach((t) => (t.enabled = !next));
                        }}
                    >
                        {videoOff ? <VideoOff className="text-white size-5" /> : <Video className="text-white size-5" />}
                    </button>
                </div>

                {/* Local video */}
                <div className="absolute top-4 right-4 bg-black border border-gray-300 rounded-md overflow-hidden">
                    <video
                        id="localVideo"
                        className="w-40 h-25 md:w-60 md:h-40 object-cover rounded-md"
                        muted
                        playsInline
                    />
                    <div className="absolute bottom-2 left-4">
                        <p className="text-white text-sm capitalize">{session?.name}</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
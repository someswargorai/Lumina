"use client";

import { useSession } from "next-auth/react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import {
    Send, Paperclip, Smile, Phone, Video, Info,
    Image as ImageIcon, MoreVertical, Search, Check, CheckCheck,
    Mic,
    MicOff
} from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import Peer from "peerjs";
import CallNotification from "./components/call-notification";

interface Message {
    id: string;
    text: string;
    senderId: string;
    timestamp: Date;
    status?: "sent" | "delivered" | "read";
    name?: string;
}

const formatTime = (date: Date) =>
    new Intl.DateTimeFormat("en-US", { hour: "2-digit", minute: "2-digit", hour12: true }).format(date);

const formatDateDivider = (date: Date) => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    if (date.toDateString() === today.toDateString()) return "Today";
    if (date.toDateString() === yesterday.toDateString()) return "Yesterday";
    return new Intl.DateTimeFormat("en-US", { month: "long", day: "numeric" }).format(date);
};

const shouldShowDateDivider = (messages: Message[], index: number): boolean => {
    if (index === 0) return true;
    const prev = messages[index - 1].timestamp;
    const curr = messages[index].timestamp;
    return prev.toDateString() !== curr.toDateString();
};

function useCallTimer(running: boolean) {
    const [elapsed, setElapsed] = useState(0);
    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

    useEffect(() => {
        if (running) {
            timerRef.current = setInterval(() => setElapsed((p) => p + 1), 1000);
        } else {
            if (timerRef.current) clearInterval(timerRef.current);
        }
        return () => { if (timerRef.current) clearInterval(timerRef.current); };
    }, [running]);

    return `${Math.floor(elapsed / 60).toString().padStart(2, "0")}:${(elapsed % 60).toString().padStart(2, "0")}`;
}

function stopTracks(stream: MediaStream | null) {
    stream?.getTracks().forEach((t) => t.stop());
}

const EMPTY_CALL_DATA = {
    roomId: "",
    senderId: "",
    receiverId: "",
    type: "voice" as const,
    name: "",
    peerId: "",
};

const ChatPage = () => {
    const { data: session } = useSession();
    const { id } = useParams();
    const router = useRouter();

    const socketRef = useRef<Socket | null>(null);
    const peerRef = useRef<Peer | null>(null);
    const audioRef = useRef<MediaStream | null>(null);       // YOUR local mic — same meaning on both sides
    const remoteAudioRef = useRef<MediaStream | null>(null); // what YOU hear — same meaning on both sides

    const [callTrue, setCallTrue] = useState(false);
    const [showCallerUI, setShowCallerUI] = useState(false);
    const [showOngoingUI, setShowOngoingUI] = useState(false);
    const [callData, setCallData] = useState(EMPTY_CALL_DATA);
    const [micOff, setMicOff] = useState(false); // one state, used by BOTH banners

    const callerTimer = useCallTimer(showCallerUI);
    const calleeTimer = useCallTimer(showOngoingUI);

    const { data: profileData } = useQuery({
        queryKey: ["profile", id],
        queryFn: async () => {
            const res = await axios.get(`${process.env.NEXT_PUBLIC_BLOG_URL}/blog/get-profile/${id}`, {
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${session?.accessToken}`
                }
            });
            return res.data;
        },
        enabled: !!session?.accessToken && !!id,
    });

    const otherUser = profileData?.user;

    const [messages, setMessages] = useState<Message[]>([]);
    const [inputValue, setInputValue] = useState("");
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    useEffect(() => { scrollToBottom(); }, [messages]);

    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = "auto";
            textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 128)}px`;
        }
    }, [inputValue]);

    const resetCallState = () => {
        stopTracks(audioRef.current);
        stopTracks(remoteAudioRef.current);
        audioRef.current = null;
        remoteAudioRef.current = null;
        setCallTrue(false);
        setShowCallerUI(false);
        setShowOngoingUI(false);
        setCallData(EMPTY_CALL_DATA);
        setMicOff(false); // always reset mic state on call end
    };

    // Shared mic toggle — works identically for caller and callee
    // because audioRef is always YOUR local mic stream on both sides
    const toggleMic = () => {
        audioRef.current?.getAudioTracks().forEach((t) => {
            t.enabled = micOff; // if muted (micOff=true) → re-enable; if live → disable
        });
        setMicOff((prev) => !prev);
    };

    useEffect(() => {
        if (!session?.accessToken || !session?.id) return;

        const socket = io(`${process.env.NEXT_PUBLIC_SOCKET_URL}`, {
            autoConnect: false,
            auth: { token: session.accessToken, userId: session.id },
        });
        socketRef.current = socket;

        socket.on("connect", () => {
            const roomId = `room_${[id, session?.id].sort().join("_")}`;
            socket.emit("joinRoom", roomId);
        });

        socket.on("message", (data) => {
            if (data.senderId === session.id) return;
            setIsTyping(false);
            const newMsg: Message = {
                id: Math.random().toString(36).substring(7),
                text: data.message,
                senderId: data.senderId || id?.toString() || "other",
                timestamp: new Date(),
                status: "read",
                name: data.name,
            };
            setMessages((prev) => [...prev, newMsg]);
        });

        socket.on("call", (data) => {
            setCallData(data);
            setCallTrue(true);
        });

        socket.on("call_rejected", () => {
            toast.error("Call was declined");
            resetCallState();
        });

        socket.on("call_end", () => {
            toast.info("Call ended");
            resetCallState();
        });

        socket.on("connect_error", (err) => toast.error(`Connection error: ${err.message}`));
        socket.connect();

        return () => {
            socket.off("connect");
            socket.off("message");
            socket.off("call");
            socket.off("call_rejected");
            socket.off("call_end");
            socket.off("connect_error");
            socket.disconnect();
        };
    }, [session?.accessToken, session?.id, id]);

    useEffect(() => {
        const peer = new Peer();
        peer.on("open", () => { peerRef.current = peer; });

        // Callee-side WebRTC: A calls peer.call(B.peerId), B answers here
        peer.on("call", async (call) => {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
            audioRef.current = stream; // B's mic
            call.answer(stream);

            call.on("stream", (remoteStream) => {
                remoteAudioRef.current = remoteStream; // A's voice, heard by B
                const audio = document.getElementById("remoteAudioStream") as HTMLAudioElement;
                if (audio) { audio.srcObject = remoteAudioRef.current; audio.play().catch(console.error); }
                setShowOngoingUI(true);
            });

            call.on("close", () => resetCallState());
        });

        return () => { peer.destroy(); };
    }, []);

    // Caller initiates — grabs mic immediately so toggleMic works before callee answers
    const startCall = async () => {
        if (!peerRef.current?.id) return;
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
        audioRef.current = stream; // A's mic — available right away for muting

        const roomId = `room_${[id, session?.id].sort().join("_")}`;
        socketRef.current?.emit("call", {
            roomId,
            senderId: session?.id,
            receiverId: id,
            peerId: peerRef.current.id,
            type: "voice",
            name: session?.name,
        });

        setShowCallerUI(true);
        setCallData({
            roomId,
            senderId: session?.id as string,
            receiverId: id as string,
            type: "voice",
            name: otherUser?.name || "User",
            peerId: peerRef.current.id,
        });
    };

    // Callee accepts — B becomes WebRTC initiator toward A
    const UserAcceptCall = async () => {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
        audioRef.current = stream; // B's mic

        const call = peerRef.current?.call(callData.peerId, stream);

        call?.on("stream", (remoteStream) => {
            remoteAudioRef.current = remoteStream; // A's voice, heard by B
            const audio = document.getElementById("remoteAudioStream") as HTMLAudioElement;
            if (audio) { audio.srcObject = remoteAudioRef.current; audio.play().catch(console.error); }
            setShowOngoingUI(true);
            setCallTrue(false);
        });

        call?.on("close", () => resetCallState());
    };

    const endCall = () => {
        socketRef.current?.emit("call_end", {
            roomId: callData.roomId,
            senderId: callData.senderId,
            receiverId: callData.receiverId,
        });
        resetCallState();
    };

    const rejectCall = () => {
        socketRef.current?.emit("call_rejected", {
            roomId: callData.roomId,
            senderId: callData.senderId,
            receiverId: callData.receiverId,
        });
        resetCallState();
    };

    const sendMessage = async (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!inputValue.trim() || !session?.accessToken || !session?.id) return;

        const roomId = `room_${[id, session?.id].sort().join("_")}`;
        const messageText = inputValue.trim();

        const newMsg: Message = {
            id: Math.random().toString(36).substring(7),
            text: messageText,
            senderId: session.id as string,
            timestamp: new Date(),
            status: "sent",
            name: session?.name || "You",
        };

        setMessages((prev) => [...prev, newMsg]);
        setInputValue("");
        socketRef.current?.emit("sendMessage", { roomId, message: messageText, senderId: session.id });
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); }
    };

    // Shared mic button JSX — identical for both banners
    const MicButton = (
        micOff
            ? <MicOff className="h-4 w-4 cursor-pointer text-red-400" onClick={toggleMic} />
            : <Mic className="h-4 w-4 cursor-pointer text-white" onClick={toggleMic} />
    );

    const initials = otherUser?.name?.charAt(0).toUpperCase() || id?.toString().slice(0, 1).toUpperCase() || "U";

    return (
        <>
            <TooltipProvider delayDuration={300}>
                <div className="w-full h-full min-h-[calc(100vh-100px)] flex items-center justify-center bg-[#f4f4f8] dark:bg-[#09090b] p-4 font-sans">
                    <div className="relative w-full max-w-6xl h-[calc(100vh-100px)] flex flex-col rounded-2xl overflow-hidden border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-xl shadow-zinc-200/60 dark:shadow-black/50">

                        {/* ── Header ── */}
                        <div className="flex items-center justify-between px-5 py-3.5 border-b border-zinc-100 dark:border-zinc-800/80 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md z-10">
                            <div className="flex items-center gap-3.5">
                                <div className="relative">
                                    <Avatar className="h-10 w-10 ring-2 ring-violet-500/20 ring-offset-2 ring-offset-white dark:ring-offset-zinc-950">
                                        <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${otherUser?.name || id}`} />
                                        <AvatarFallback className="bg-gradient-to-br from-violet-500 to-indigo-600 text-white text-sm font-semibold">
                                            {initials}
                                        </AvatarFallback>
                                    </Avatar>
                                    <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-emerald-500 border-2 border-white dark:border-zinc-950 shadow-sm" />
                                </div>
                                <div className="leading-tight">
                                    <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-50 tracking-tight">
                                        {otherUser?.name || `User ${id?.toString().slice(0, 8)}`}
                                    </p>
                                    <div className="flex items-center gap-1.5 mt-0.5">
                                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                        <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">Active now</span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-1">
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full text-zinc-500 hover:text-violet-600 hover:bg-violet-50 dark:hover:bg-violet-500/10">
                                            <Search className="h-4 w-4" />
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>Search messages</TooltipContent>
                                </Tooltip>

                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-9 w-9 rounded-full text-zinc-500 hover:text-violet-600 hover:bg-violet-50 dark:hover:bg-violet-500/10"
                                            onClick={startCall}
                                        >
                                            <Phone className="h-4 w-4" />
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>Voice call</TooltipContent>
                                </Tooltip>

                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-9 w-9 rounded-full text-zinc-500 hover:text-violet-600 hover:bg-violet-50 dark:hover:bg-violet-500/10"
                                            onClick={() => {
                                                socketRef.current?.emit("video_call", {
                                                    senderId: session?.id,
                                                    receiverId: id,
                                                    peerId: peerRef.current?.id,
                                                    type: "video",
                                                    name: session?.name,
                                                });
                                                router.push(`/video/${id}`);
                                            }}
                                        >
                                            <Video className="h-4 w-4" />
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>Video call</TooltipContent>
                                </Tooltip>

                                <Separator orientation="vertical" className="h-5 mx-1" />

                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800">
                                            <MoreVertical className="h-4 w-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end" className="w-44">
                                        <DropdownMenuItem onClick={() => router.push(`/profile/${id}`)}>
                                            <Info className="mr-2 h-4 w-4" />View profile
                                        </DropdownMenuItem>
                                        <DropdownMenuItem>Mute notifications</DropdownMenuItem>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem className="text-red-600 focus:text-red-600">Block user</DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                        </div>

                        {/* ── Messages ── */}
                        <ScrollArea className="flex-1 min-h-0">
                            <div className="px-5 py-2 space-y-1">
                                {messages.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center min-h-[400px] gap-4 select-none">
                                        <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-violet-100 to-indigo-100 dark:from-violet-500/10 dark:to-indigo-500/10 flex items-center justify-center shadow-inner border border-violet-100 dark:border-violet-500/20">
                                            <Send className="h-8 w-8 text-violet-400 dark:text-violet-500 translate-x-0.5 -translate-y-0.5" />
                                        </div>
                                        <div className="text-center space-y-1">
                                            <p className="font-semibold text-zinc-800 dark:text-zinc-200 text-lg">No messages yet</p>
                                            <p className="text-sm text-zinc-400 dark:text-zinc-500">Send a message to start the conversation</p>
                                        </div>
                                        <Badge variant="outline" className="text-xs text-zinc-400 border-zinc-200 dark:border-zinc-800">
                                            Chats will automatically delete if you close the chat.
                                        </Badge>
                                    </div>
                                ) : (
                                    messages.map((msg, i) => {
                                        const isMe = msg.senderId === session?.id;
                                        const isConsecutive = i > 0 && messages[i - 1].senderId === msg.senderId;
                                        const isLastInGroup = i === messages.length - 1 || messages[i + 1].senderId !== msg.senderId;
                                        const showDateDivider = shouldShowDateDivider(messages, i);

                                        return (
                                            <div key={msg.id}>
                                                {showDateDivider && (
                                                    <div className="flex items-center gap-3 my-4">
                                                        <div className="flex-1 h-px bg-zinc-100 dark:bg-zinc-800" />
                                                        <span className="text-[11px] font-medium text-zinc-400 dark:text-zinc-500 uppercase tracking-wider px-2">
                                                            {formatDateDivider(msg.timestamp)}
                                                        </span>
                                                        <div className="flex-1 h-px bg-zinc-100 dark:bg-zinc-800" />
                                                    </div>
                                                )}
                                                <div className={cn(
                                                    "flex gap-2.5 animate-in fade-in slide-in-from-bottom-1 duration-200",
                                                    isMe ? "justify-end" : "justify-start",
                                                    isConsecutive ? "mt-0.5" : "mt-3"
                                                )}>
                                                    {!isMe && (
                                                        <div className="w-7 shrink-0 flex items-end pb-0.5">
                                                            {isLastInGroup ? (
                                                                <Avatar className="h-7 w-7 ring-1 ring-zinc-100 dark:ring-zinc-800">
                                                                    <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${otherUser?.name || id}`} />
                                                                    <AvatarFallback className="bg-gradient-to-br from-violet-500 to-indigo-600 text-white text-[10px] font-bold">
                                                                        {initials}
                                                                    </AvatarFallback>
                                                                </Avatar>
                                                            ) : (
                                                                <div className="w-7" />
                                                            )}
                                                        </div>
                                                    )}
                                                    <div className={cn("flex flex-col max-w-[68%]", isMe ? "items-end" : "items-start")}>
                                                        <div className={cn(
                                                            "relative px-4 py-2.5 text-sm leading-relaxed",
                                                            isMe
                                                                ? "bg-violet-600 text-white shadow-md shadow-violet-500/20"
                                                                : "bg-zinc-100 dark:bg-zinc-800/80 text-zinc-800 dark:text-zinc-100",
                                                            isMe
                                                                ? cn("rounded-2xl rounded-br-sm", !isConsecutive && "rounded-tr-2xl", isConsecutive && "rounded-tr-sm")
                                                                : cn("rounded-2xl rounded-bl-sm", !isConsecutive && "rounded-tl-2xl", isConsecutive && "rounded-tl-sm")
                                                        )}>
                                                            <p className="whitespace-pre-wrap wrap-break-word">{msg.text}</p>
                                                        </div>
                                                        {isLastInGroup && (
                                                            <div className={cn("flex items-center gap-1 mt-1 px-1", isMe ? "flex-row-reverse" : "flex-row")}>
                                                                <span className="text-[10px] text-zinc-400 dark:text-zinc-500">
                                                                    {formatTime(msg.timestamp)}
                                                                </span>
                                                                {isMe && (
                                                                    msg.status === "read"
                                                                        ? <CheckCheck className="h-3 w-3 text-violet-500" />
                                                                        : <Check className="h-3 w-3 text-zinc-400" />
                                                                )}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })
                                )}
                                {isTyping && (
                                    <div className="flex items-center gap-2.5 mt-3 animate-in fade-in duration-300">
                                        <Avatar className="h-7 w-7">
                                            <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${otherUser?.name || id}`} />
                                            <AvatarFallback className="bg-gradient-to-br from-violet-500 to-indigo-600 text-white text-[10px] font-bold">{initials}</AvatarFallback>
                                        </Avatar>
                                        <div className="bg-zinc-100 dark:bg-zinc-800 rounded-2xl rounded-bl-sm px-4 py-3 flex items-center gap-1">
                                            {[0, 1, 2].map((i) => (
                                                <span key={i} className="h-1.5 w-1.5 rounded-full bg-zinc-400 dark:bg-zinc-500 animate-bounce" style={{ animationDelay: `${i * 150}ms` }} />
                                            ))}
                                        </div>
                                    </div>
                                )}
                                <div ref={messagesEndRef} className="h-1" />
                            </div>
                        </ScrollArea>

                        {/* ── Input ── */}
                        <div className="border-t border-zinc-100 dark:border-zinc-800/80 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md px-4 py-3">
                            <div className="flex items-end gap-2 max-w-full">
                                <div className="flex items-center gap-0.5 pb-1.5">
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <Button type="button" variant="ghost" size="icon" className="h-8 w-8 rounded-full text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 shrink-0">
                                                <Paperclip className="h-4 w-4" />
                                            </Button>
                                        </TooltipTrigger>
                                        <TooltipContent>Attach file</TooltipContent>
                                    </Tooltip>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <Button type="button" variant="ghost" size="icon" className="h-8 w-8 rounded-full text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 shrink-0 hidden sm:flex">
                                                <ImageIcon className="h-4 w-4" />
                                            </Button>
                                        </TooltipTrigger>
                                        <TooltipContent>Send image</TooltipContent>
                                    </Tooltip>
                                </div>
                                <div className={cn(
                                    "flex-1 flex items-end gap-1 rounded-2xl border bg-zinc-50 dark:bg-zinc-900 px-3 py-1.5 transition-all duration-200",
                                    "border-zinc-200 dark:border-zinc-800",
                                    "focus-within:border-violet-400 dark:focus-within:border-violet-500/60 focus-within:ring-4 focus-within:ring-violet-500/8 focus-within:bg-white dark:focus-within:bg-zinc-900"
                                )}>
                                    <Button type="button" variant="ghost" size="icon" className="h-7 w-7 rounded-full text-zinc-400 hover:text-amber-500 hover:bg-transparent shrink-0 mb-0.5">
                                        <Smile className="h-4.5 w-4.5" />
                                    </Button>
                                    <Textarea
                                        ref={textareaRef}
                                        value={inputValue}
                                        onChange={(e) => setInputValue(e.target.value)}
                                        onKeyDown={handleKeyDown}
                                        placeholder="Write a message…"
                                        rows={1}
                                        className="flex-1 min-h-[36px] max-h-32 bg-transparent border-none shadow-none focus-visible:ring-0 resize-none text-sm text-zinc-800 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-600 p-0 py-1.5 leading-relaxed"
                                    />
                                </div>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button
                                            type="button"
                                            onClick={sendMessage}
                                            disabled={!inputValue.trim()}
                                            size="icon"
                                            className={cn(
                                                "h-10 w-10 rounded-full shrink-0 mb-0.5 transition-all duration-200",
                                                inputValue.trim()
                                                    ? "bg-violet-600 hover:bg-violet-500 text-white shadow-lg shadow-violet-500/30 hover:shadow-violet-500/40 hover:-translate-y-0.5 scale-100"
                                                    : "bg-zinc-100 dark:bg-zinc-800 text-zinc-400 dark:text-zinc-600 scale-95 shadow-none"
                                            )}
                                        >
                                            <Send className={cn("h-4 w-4 transition-transform", inputValue.trim() && "translate-x-px -translate-y-px")} />
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>Send (Enter)</TooltipContent>
                                </Tooltip>
                            </div>
                            <p className="text-center text-[10px] text-zinc-300 dark:text-zinc-700 mt-2 select-none">
                                Press <kbd className="font-mono">Enter</kbd> to send · <kbd className="font-mono">Shift+Enter</kbd> for new line
                            </p>
                        </div>
                    </div>
                    <audio id="remoteAudioStream" />
                </div>
            </TooltipProvider>

            {/* Incoming call ringing UI (callee) */}
            {callTrue && (
                <CallNotification
                    callData={callData}
                    acceptCall={UserAcceptCall}
                    rejectCall={rejectCall}
                />
            )}

            {/* Ongoing callee banner (after accepting) */}
            {showOngoingUI && (
                <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[9999] w-full max-w-sm rounded-lg bg-[#5c5c5c] shadow-2xl overflow-hidden backdrop-blur-md">
                    <div className="flex items-center justify-between px-5 pt-4 pb-3">
                        <div className="flex flex-col">
                            <span className="text-white font-semibold text-base leading-tight capitalize">
                                {callData.name}
                            </span>
                            <div className="flex items-center gap-1.5 mt-0.5">
                                <span className="h-1.5 w-1.5 rounded-full bg-green-400 animate-pulse inline-block" />
                                <span className="text-green-400 text-xs font-medium">{calleeTimer}</span>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            {/* MicButton controls audioRef — YOUR mic — same on both sides */}
                            {MicButton}
                            <div className="h-12 w-12 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-xl font-semibold text-white capitalize shrink-0 ring-2 ring-white/10">
                                {callData.name?.charAt(0)}
                            </div>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 py-2 px-5 gap-2 pb-4">
                        <button
                            className="py-2.5 text-white font-normal text-sm bg-[#ff3b30] hover:bg-[#e0352b] active:bg-[#c42f28] transition-colors cursor-pointer rounded-md"
                            onClick={endCall}
                        >
                            End Call
                        </button>
                        <div className="py-2.5 text-white font-normal text-sm bg-green-600 rounded-md flex items-center justify-center gap-1.5 select-none">
                            <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse inline-block" />
                            Ongoing
                        </div>
                    </div>
                </div>
            )}

            {/* Caller's banner (shown immediately after pressing call) */}
            {showCallerUI && (
                <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[9999] w-full max-w-sm rounded-lg bg-[#5c5c5c] shadow-2xl overflow-hidden backdrop-blur-md">
                    <div className="flex items-center justify-between px-5 pt-4 pb-3">
                        <div className="flex flex-col">
                            <span className="text-white font-semibold text-base leading-tight capitalize">
                                {otherUser?.name || "Calling…"}
                            </span>
                            <div className="flex items-center gap-1.5 mt-0.5">
                                <span className="h-1.5 w-1.5 rounded-full bg-green-400 animate-pulse inline-block" />
                                <span className="text-green-400 text-xs font-medium">{callerTimer}</span>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            {/* Same MicButton — audioRef is caller's mic, grabbed in startCall() */}
                            {MicButton}
                            <div className="h-12 w-12 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-xl font-semibold text-white capitalize shrink-0 ring-2 ring-white/10">
                                {(otherUser?.name || "U").charAt(0)}
                            </div>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 py-2 px-5 gap-2 pb-4">
                        <button
                            className="py-2.5 text-white font-normal text-sm bg-[#ff3b30] hover:bg-[#e0352b] active:bg-[#c42f28] transition-colors cursor-pointer rounded-md col-span-2"
                            onClick={endCall}
                        >
                            End Call
                        </button>
                    </div>
                </div>
            )}
        </>
    );
};

export default ChatPage;
"use client";

import React, { useEffect, useRef, useState } from 'react';
import {
    Share2,
    Trash2,
    MessageSquare,
    Globe,
    Loader2,
    Bell, Rocket,
    Menu
} from 'lucide-react';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

import { Button } from "@/components/ui/button";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { useAppDispatch, useAppSelector } from '@/store/hook';
import { useParams, useRouter } from 'next/navigation';
import { moveToTrash, updatePost } from '@/store/slices/blogSlice';
import { toast } from 'sonner';
import { useMutation } from '@tanstack/react-query';
import axios from 'axios';
import { useSession } from 'next-auth/react';
import { ModeToggle } from '../../common/toggle-button';
import { DynamicBreadcrumbs } from '../../common/breadcrumbs';
import { setNotifications } from '@/store/slices/notificationSlice';
import { io, Socket } from 'socket.io-client';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";

const TOPICS = [
    { value: "system-design", label: "System Design" },
    { value: "frontend", label: "Frontend Development" },
    { value: "backend", label: "Backend Development" },
    { value: "frontend-system-design", label: "Frontend System Design" },
    { value: "backend-system-design", label: "Backend System Design" },
    { value: "devops", label: "DevOps & Infrastructure" },
    { value: "databases", label: "Databases" },
    { value: "ai-ml", label: "AI & Machine Learning" },
    { value: "open-source", label: "Open Source" },
    { value: "career", label: "Career & Growth" },
    { value: "web3", label: "Web3 & Blockchain" },
    { value: "security", label: "Security" },
];

export default function Navbar({ onMobileSidebarOpen }: { onMobileSidebarOpen?: () => void }) {

    const { data: session } = useSession();
    const { currentBlogId, blogs } = useAppSelector((state) => state.blog);
    const blog = blogs.find((b) => String(b._id) === String(currentBlogId));
    const { id } = useParams();
    const [loading, setLoading] = useState(false);
    const [selectedTopic, setSelectedTopic] = useState<string>("");
    const dispatch = useAppDispatch();
    const [isPublished, setIsPublished] = useState(blogs.find((b) => String(b._id) === String(id))?.publish);
    const { notifications } = useAppSelector((state) => state.notification);
    const socketRef = useRef<Socket | null>(null);
    const [getVideoCall, setGetVideoCall] = useState<{

        receiverId: string,
        roomId: string,
        senderId: string,
        type: string,
        name: string,

    }>({ receiverId: "", roomId: "", senderId: "", type: "", name: "" });
    const router = useRouter();

    useEffect(() => {

        if (!session?.accessToken || !session?.id) return;

        const socket = io("http://localhost:8002", {
            autoConnect: false,
            auth: {
                token: session.accessToken,
                userId: session.id,
            },
        });

        socket.connect();

        socket.on("notification", (data) => {
            console.log(data);
            dispatch(setNotifications(data.data));
        });

        socket.on("follow_notification", (data) => {
            console.log(data);
            dispatch(setNotifications(data.data));
        });

        socket.on("notification_message", (data) => {
            console.log("from navbar", data);
            dispatch(setNotifications(data.data));
        });

        socket.on("connect_error", (err) => {
            console.error("Socket error:", err.message);
        });

        return () => {
            socket.off("notification");
            socket.off("follow_notification");
            socket.disconnect();
        };

    }, [session?.accessToken, session?.id, dispatch]);


    useEffect(() => {
        if (!session?.accessToken || !session?.id) return;

        const socket = io(`${process.env.NEXT_PUBLIC_SOCKET_URL}`, {
            autoConnect: false,
            auth: {
                token: session.accessToken,
                userId: session.id,
            },
        });
        if (!socketRef.current) {
            socketRef.current = socket;
        }
        socket.connect();

        socket.on("video_call", (data) => {
            console.log("video_call", data);
            setGetVideoCall(data);
        })

        return () => {
            socket.off("video_call");
            socket.disconnect();
        };
    }, [session?.accessToken, session?.id]);

    const moveToTrashMutation = useMutation({
        mutationFn: async () => {
            const response = await axios.delete(`${process.env.NEXT_PUBLIC_BLOG_URL}/blog/delete-blog/${id}`, {
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${session?.accessToken}`
                }
            });
            return response.data;
        },
        onSuccess: (data) => {
            toast.success(data.message);

        },
        onError: (err) => {
            if (axios.isAxiosError(err)) {
                toast.error("Failed to move blog to trash");
                toast.error(err.response?.data.message);
            }
        }
    })

    const publishBlogMutation = useMutation({
        onMutate: () => {
            setLoading(true);
        },
        mutationFn: async () => {
            const response = await axios.patch(`${process.env.NEXT_PUBLIC_BLOG_URL}/blog/make-public/${id}`, {
                topic: selectedTopic
            }, {
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${session?.accessToken}`
                }
            });
            setIsPublished(!isPublished);
            dispatch(updatePost({ _id: String(id), publish: !isPublished }))
            return response.data;
        },
        onSuccess: (data) => {
            toast.success(data.message);
            setLoading(false);
        },
        onError: (err) => {
            if (axios.isAxiosError(err)) {
                toast.error("Failed to publish blog");
                toast.error(err.response?.data.message);
                setLoading(false);
            }
        }
    })

    const handleShare = async () => {
        try {
            await navigator.share({
                title: blog?.title,
                text: blog?.content,
                url: window.location.href,
            })
            toast.success("Blog shared successfully");
        } catch (e) {
            console.log(e);
        }
    }

    return (
        <nav className="h-14 border-b border-editorial-border bg-white/80 backdrop-blur-md flex items-center justify-between px-6 sticky top-0 z-30 p-3 dark:bg-black/80 dark:backdrop-blur-md">
            {/* Left: Breadcrumbs */}
            <div className="flex items-center gap-4">
                <button
                    onClick={onMobileSidebarOpen}
                    className="lg:hidden p-2 rounded-md text-slate-500 hover:text-slate-900 hover:bg-slate-100 dark:text-neutral-400 dark:hover:text-white dark:hover:bg-white/10 transition-all"
                    aria-label="Open sidebar"
                >
                    <Menu size={20} />
                </button>
                <div className="hidden md:block">
                    <DynamicBreadcrumbs lastSegmentTitle={blog?.title} />
                </div>
            </div>

            <div className="flex items-center gap-2 sm:gap-4">
                {/* Right: Actions */}
                <div className="flex items-center gap-1 ">
                    <TooltipProvider>
                        <div className="flex items-center gap-1 border-r border-editorial-border pr-2 mr-2 dark:border-white">
                            {/* <div onClick={()=>{ 
                            dispatch(addToFavourites(Number(id))); 
                        }}>
                            <NavAction icon={<Star size={16} color={favourites.includes(Number(id))? "black" : "gray"}/>} tooltip="Favorite" />     
                        </div>   */}
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <ModeToggle />
                                </TooltipTrigger>
                                <TooltipContent side="bottom" className="bg-slate-900 text-white text-[10px]">
                                    Change Theme
                                </TooltipContent>
                            </Tooltip>
                            <div>
                                <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                        <div className="cursor-pointer">
                                            <NavAction icon={<Globe size={16} />} tooltip={isPublished ? "Unpublish Blog" : "Publish Blog"} />
                                        </div>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent className='rounded-sm'>
                                        <AlertDialogHeader>
                                            <AlertDialogTitle>Make blog {isPublished ? "private" : "public"}?</AlertDialogTitle>
                                            <AlertDialogDescription className='text-[13px]'>
                                                Are you sure you want to make your blog {isPublished ? "private" : "public"}? This will allow anyone to view your post.
                                            </AlertDialogDescription>
                                        </AlertDialogHeader>

                                        {!isPublished && (
                                            <div className="py-2 space-y-2">
                                                <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                                                    Select a topic
                                                </label>
                                                <Select value={selectedTopic} onValueChange={setSelectedTopic}>
                                                    <SelectTrigger className="w-full rounded-sm bg-white dark:bg-neutral-900 border-editorial-border dark:border-neutral-800 h-[30px]">
                                                        <SelectValue placeholder="Select a topic" />
                                                    </SelectTrigger>
                                                    <SelectContent className="bg-white dark:bg-neutral-900 border-editorial-border dark:border-neutral-800 h-[200px] ">
                                                        {TOPICS.map((topic) => (
                                                            <SelectItem key={topic.value} value={topic.value} className="cursor-pointer">
                                                                {topic.label}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        )}
                                        <AlertDialogFooter>
                                            <AlertDialogCancel className='cursor-pointer rounded-sm font-normal'>Cancel</AlertDialogCancel>
                                            <AlertDialogAction className='cursor-pointer rounded-sm' onClick={() => {
                                                if (!selectedTopic && !isPublished) {
                                                    toast.error("Please select a topic");
                                                    return;
                                                }
                                                publishBlogMutation.mutate();
                                            }}>
                                                {loading ? <Loader2 className='animate-spin' size={18} /> : isPublished ? "Unpublish" : "Publish"}
                                            </AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                            </div>
                            <div className="hidden lg:block" onClick={() => { document.getElementById("comments")?.scrollIntoView({ behavior: "smooth" }); }}>
                                <NavAction icon={<MessageSquare size={16} />} tooltip="Click here to view comments" />
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <Button
                                variant="ghost"
                                size="sm"
                                className="text-xs font-medium text-editorial-secondary hover:text-editorial-text hover:bg-editorial-hover h-8 px-3 transition-all cursor-pointer"
                                onClick={handleShare}
                            >
                                <Share2 size={14} className="mr-2" />
                                Share
                            </Button>



                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 text-editorial-muted hover:text-red-600 hover:bg-red-50 transition-all cursor-pointer"
                                        onClick={() => {
                                            dispatch(moveToTrash((id)));
                                            moveToTrashMutation.mutate();
                                        }}
                                    >
                                        <Trash2 size={16} />
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent side="bottom" className="bg-slate-900 text-white text-[10px]">
                                    Move to trash
                                </TooltipContent>
                            </Tooltip>

                            {/* <NavAction icon={<MoreHorizontal size={16} />} tooltip="More options" /> */}
                        </div>
                    </TooltipProvider>
                </div>
                <div className="flex items-center gap-4">

                    {/* Global Action Icons */}
                    <div className="flex items-center gap-1 border-slate-100 px-2">
                        <Popover>
                            <PopoverTrigger asChild>
                                <button className="p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-50 dark:hover:text-slate-100 dark:hover:bg-slate-800 rounded-md transition-all relative">
                                    <Bell size={20} />
                                    {notifications && notifications.length > 0 && (
                                        <span className="absolute top-2 right-2.5 h-2 w-2 rounded-full border-2 border-white dark:border-background bg-blue-600"></span>
                                    )}
                                </button>
                            </PopoverTrigger>
                            <PopoverContent align="end" className="w-80 p-0">
                                <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 dark:border-slate-800">
                                    <h3 className="font-semibold text-sm">Notifications</h3>
                                    {notifications && notifications.length > 0 && (
                                        <span className="text-xs bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full ">
                                            {notifications.length} new
                                        </span>
                                    )}
                                </div>
                                <ScrollArea className="h-80">
                                    {notifications && notifications.length > 0 ? (
                                        <div className="flex flex-col">
                                            {notifications.map((notif: {
                                                message: string
                                            }, i: number) => (
                                                <div key={i} className="px-4 py-3 border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer text-xs">
                                                    <p className="font-normal text-slate-900 dark:text-slate-100">{notif.message || 'New Notification'}</p>

                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="flex flex-col items-center justify-center h-full p-6 text-center mt-10">
                                            <Bell className="h-8 w-8 text-slate-200 dark:text-slate-700 mb-2" />
                                            <p className="text-sm font-medium text-slate-900 dark:text-slate-100">No notifications</p>
                                            <p className="text-xs text-slate-500 mt-1">You&apos;re all caught up!</p>
                                        </div>
                                    )}
                                </ScrollArea>
                            </PopoverContent>
                        </Popover>
                    </div>

                    {/* CTA/Profile */}
                    <div className="flex items-center gap-3">

                        <button className="hidden lg:flex items-center gap-2 bg-black text-white dark:bg-white dark:text-black px-3.5 py-2 rounded-sm text-sm font-medium tracking-wide hover:bg-black/90 dark:hover:bg-gray-100 transition-all active:scale-95 shadow-[1px_2px_2px_0px_#84361140] dark:shadow-none cursor-pointer ease-linear duration-200">
                            <Rocket size={16} className="text-white dark:text-black" />
                            <span className="flex items-center justify-center gap-2.5 h-full w-full rounded transition-colors ease-linear text-white dark:text-black">Upgrade Plan</span>
                        </button>
                        <div className="h-8 w-8 rounded-full border border-slate-200 bg-slate-100 overflow-hidden cursor-pointer ring-offset-2 hover:ring-2 hover:ring-blue-500 transition-all hidden md:block">
                            <Avatar>
                                <AvatarImage
                                    src={""}
                                    alt="profile"
                                    className="h-full w-full"
                                />
                                <AvatarFallback>
                                    <span>{session?.user?.name?.charAt(0).toUpperCase()}</span>
                                </AvatarFallback>
                            </Avatar>
                        </div>
                    </div>
                </div>
            </div>
            {getVideoCall?.receiverId !== "" && (
                <>
                    <div className="fixed inset-x-0 top-12 z-9999 flex justify-center px-4">

                        {/* Compact Banner Card */}
                        <div className="w-full max-w-sm rounded-lg bg-[#5c5c5c] shadow-2xl overflow-hidden backdrop-blur-md">

                            {/* Top row: name + subtitle + avatar */}
                            <div className="flex items-center justify-between px-5 pt-4 pb-3">

                                {/* Left: text info */}
                                <div className="flex flex-col">
                                    <span className="text-white font-semibold text-base leading-tight capitalize">
                                        {getVideoCall?.name}
                                    </span>
                                    <div className="flex items-center gap-1.5 mt-0.5">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 text-white/60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M13.832 16.568a1 1 0 0 0 1.213-.303l.355-.465A2 2 0 0 1 17 15h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2A18 18 0 0 1 2 4a2 2 0 0 1 2-2h3a2 2 0 0 1 2 2v3a2 2 0 0 1-.8 1.6l-.468.351a1 1 0 0 0-.292 1.233 14 14 0 0 0 6.392 6.384" />
                                        </svg>
                                        <span className="text-white/60 text-xs">
                                            {getVideoCall?.type === "video" ? "Incoming Video Call" : "Incoming Audio Call"}
                                        </span>
                                    </div>
                                </div>

                                {/* Right: avatar */}
                                <div className="h-12 w-12 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-xl font-semibold text-white capitalize flex-shrink-0 ring-2 ring-white/10">
                                    {getVideoCall?.name?.charAt(0)}
                                </div>
                            </div>

                            {/* Bottom row: Decline + Accept buttons */}
                            <div className="grid grid-cols-2 py-2 px-5 gap-2 pb-4">
                                {/* Decline */}
                                <button
                                    className="py-2.5 text-white font-normal text-sm bg-[#ff3b30] hover:bg-[#e0352b] active:bg-[#c42f28] transition-colors border-r border-white/10 cursor-pointer rounded-md"
                                    onClick={() => {
                                        socketRef.current?.emit("call_rejected", {
                                            roomId: `room_${[getVideoCall?.senderId, getVideoCall?.receiverId].sort().join("_")}`,
                                            senderId: getVideoCall?.senderId,
                                            receiverId: getVideoCall?.receiverId,
                                            type: getVideoCall?.type,
                                            name: getVideoCall?.name,
                                        });
                                        setGetVideoCall({
                                            receiverId: "",
                                            roomId: "",
                                            senderId: "",
                                            type: "",
                                            name: "",
                                        });
                                    }}
                                >
                                    Decline
                                </button>

                                {/* Accept */}
                                <button
                                    className="py-2 text-white font-normal text-sm bg-[#30a2ff] hover:bg-[#2b92e6] active:bg-[#2680cc] transition-colors cursor-pointer rounded-md"
                                    onClick={() => {
                                        router.push(`/video/${getVideoCall?.senderId}`);
                                        setGetVideoCall({
                                            receiverId: "",
                                            roomId: "",
                                            senderId: "",
                                            type: "",
                                            name: "",
                                        });
                                    }}
                                >
                                    Accept
                                </button>
                            </div>
                        </div>
                    </div>
                    <audio src="/call.mp3" autoPlay loop></audio>
                </>
            )}

        </nav>
    );
}

function NavAction({ icon, tooltip }: { icon: React.ReactNode; tooltip: string }) {
    return (
        <Tooltip>
            <TooltipTrigger asChild>
                <button className="p-2 text-editorial-muted hover:text-editorial-text hover:bg-editorial-hover rounded-md transition-all cursor-pointer dark:text-white dark:border-white dark:hover:bg-gray-700">
                    {icon}
                </button>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="bg-slate-900 text-white text-[10px]">
                {tooltip}
            </TooltipContent>
        </Tooltip>
    );
}

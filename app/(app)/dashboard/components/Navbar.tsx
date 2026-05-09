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
                <div className="fixed inset-0 z-9999 flex items-start justify-center px-4 pt-10">

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
                                    {getVideoCall?.name}
                                </h2>


                            </div>

                            {/* Buttons */}
                            <div className="mt-10 flex items-center gap-10">

                                {/* Decline */}
                                <div className="flex flex-col items-center gap-3">
                                    <button className="flex h-16 w-16 items-center justify-center rounded-full bg-red-500 shadow-[0_10px_35px_rgba(239,68,68,0.45)] transition-all hover:scale-110 active:scale-95" onClick={() => {

                                        socketRef.current?.emit("call_rejected", {
                                            roomId: `room_${[getVideoCall?.senderId, getVideoCall?.receiverId].sort().join("_")}`,
                                            senderId: getVideoCall?.senderId,
                                            receiverId: getVideoCall?.receiverId,

                                            type: getVideoCall?.type,
                                            name: getVideoCall?.name,
                                        })
                                        setGetVideoCall({

                                            receiverId: "",
                                            roomId: "",
                                            senderId: "",
                                            type: "",
                                            name: "",

                                        })
                                    }}>
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
                                    <button className="flex h-16 w-16 items-center justify-center rounded-full bg-green-500 shadow-[0_10px_35px_rgba(34,197,94,0.45)] transition-all hover:scale-110 active:scale-95" onClick={() => {

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

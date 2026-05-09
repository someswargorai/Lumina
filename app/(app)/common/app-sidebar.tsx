"use client";

import React, { useEffect, useRef, useState } from 'react';
import {
    Plus,
    Search,
    Settings,
    Clock,
    LogOut,
    User,
    MoreVertical,
    Trash,
    Star,
    Bookmark,
    Rss
} from 'lucide-react';
import { useSession, signOut } from 'next-auth/react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { useAppDispatch, useAppSelector } from '@/store/hook';
import { setBlogs, setCurrentBlogId, updatePost } from '@/store/slices/blogSlice';
import { Input } from '@/components/ui/input';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { toast } from 'sonner';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';


export default function Sidebar({
    onOpenChange,
}: {
    onOpenChange?: (open: boolean) => void;
}) {
    const { data: session } = useSession();
    const { blogs = [] } = useAppSelector(state => state.blog || {});
    const [currentPostId, setCurrentPostId] = useState<string>("");
    const [edit, setEdit] = useState<boolean>(false);
    const dispatch = useAppDispatch();
    const router = useRouter();
    const queryClient = useQueryClient();
    const debounceRef = useRef<NodeJS.Timeout | null>(null);

    const updateBlogTitle = useMutation({
        mutationFn: async ({ title, id }: { title: string, id: string }) => {
            const response = await axios.put(`${process.env.NEXT_PUBLIC_BLOG_URL}/blog/update-blog-title/${id}`, {
                title
            }, {
                headers: {
                    Authorization: `Bearer ${session?.accessToken}`
                }
            })

            return response.data;
        },
        onSuccess: (data) => {
            if (data?.success) {

            }
        },
        onError: (err) => {
            console.error(err);
            if (axios.isAxiosError(err) && err.response?.data) {
                toast.error(err.response.data.message || "Failed to update blog title");
            } else {
                toast.error("An error occurred while updating the blog title");
            }
        }
    })

    const createBlogMutation = useMutation({
        mutationFn: async () => {
            const response = await axios.post(`${process.env.NEXT_PUBLIC_BLOG_URL}/blog/create-blog`, {
                title: "Untitled",
                content: "Untitled"
            }, { headers: { Authorization: `Bearer ${session?.accessToken}` } });
            return response.data;
        },
        onSuccess: (data) => {
            if (data?.success) {
                toast.success("Blog created successfully");
                console.log(data?.data);
                const blogId = data?.data?._id;
                router.push(`/dashboard/${blogId}`);
                queryClient.invalidateQueries({ queryKey: ['blogs'] });
            }
        },
        onError: (err) => {
            console.error(err);
            if (axios.isAxiosError(err) && err.response?.data) {
                toast.error(err.response.data.message || "Failed to create blog");
            } else {
                toast.error("An error occurred while creating the blog");
            }
        }
    });

    const { data, isLoading, isError } = useQuery({
        queryKey: ['blogs'],
        queryFn: async () => {
            const response = await axios.get(`${process.env.NEXT_PUBLIC_BLOG_URL}/blog/get-blogs?owned=true`, { headers: { Authorization: `Bearer ${session?.accessToken}` } });
            return response.data;
        },
        enabled: !!session?.accessToken,
    })


    useEffect(() => {
        if (data?.success && data.data) {
            dispatch(setBlogs(data.data));
        }
    }, [data, dispatch]);



    if (isError) {
        return (
            <div className="w-64 h-screen bg-editorial-sidebar border-r border-editorial-border flex flex-col p-6 text-xs text-red-500 italic">
                Failed to load workspaces. Please try again later.
            </div>
        );
    }

    const onNewPost = () => {
        createBlogMutation.mutate();
        onOpenChange?.(false);
    }

    const onSave = (title: string, id: string) => {
        dispatch(updatePost({ title, id }));

        if (debounceRef.current) {
            clearTimeout(debounceRef.current);
        }

        debounceRef.current = setTimeout(() => {

            updateBlogTitle.mutate({ title, id });
        }, 3000);
    }


    return (
        <div className="w-full h-screen  border-r border-editorial-border flex flex-col pt-6 overflow-y-auto custom-scrollbar dark:bg-black dark:border-white dark:text-white!">
            {/* Header */}
            <div className="px-6 mb-10 flex items-center justify-between">
                <div className="flex items-center gap-3 font-medium tracking-tight text-editorial-text">
                    <div className="w-8 h-8 bg-editorial-text rounded flex items-center justify-center text-white text-[12px] font-bold shadow-sm">
                        L
                    </div>
                    <span className="dark:text-white dark:border-white!">Lumina</span>
                </div>

            </div>

            {/* Top Navigation */}

            <div className="px-4 space-y-0.5 mb-1" onClick={() => {
                router.push("/updates")
                onOpenChange?.(false);
            }}>
                <SidebarItem icon={<Clock size={16} />} label="Updates" />
            </div>
            <div className="px-4 space-y-0.5 mb-1" onClick={() => {
                router.push("/settings")
                onOpenChange?.(false);
            }}>
                <SidebarItem icon={<Settings size={16} />} label="Settings" />
            </div>
            <div className="px-4 space-y-0.5 mb-1" onClick={() => {
                router.push("/trash");
                onOpenChange?.(false);
            }}>
                <SidebarItem icon={<Trash size={16} />} label="Trash" />
            </div >

            <div className="px-4 space-y-0.5 mb-1" onClick={() => {
                router.push("/feed");
                onOpenChange?.(false);
            }}>
                <SidebarItem icon={<Rss size={16} />} label="Feed" />
            </div >

            <div className="px-4 space-y-0.5 mb-8" onClick={() => {
                router.push("/saved");
                onOpenChange?.(false);
            }}>
                <SidebarItem icon={<Bookmark size={16} />} label="Saved" />
            </div >

            {/* Workspaces Section */}
            < div className="flex-1" >
                <div className="px-6 mb-2 flex items-center justify-between">
                    <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-editorial-muted">Workspaces</span>
                    <Tooltip>
                        <TooltipTrigger>
                            <button onClick={onNewPost} className="p-1 hover:bg-editorial-hover rounded-md transition-colors cursor-pointer">
                                <Plus size={18} className="text-editorial-text opacity-60" />
                            </button>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>Create New Post</p>
                        </TooltipContent>
                    </Tooltip>

                </div>

                <ScrollArea className="px-4 space-y-0.5 h-[140px]">
                    {!isLoading && blogs?.map(blog => {
                        const blogId = blog._id as string;
                        const isActive = currentPostId === blogId;

                        return (
                            <button
                                key={blogId}
                                onClick={() => {
                                    dispatch(setCurrentBlogId(blogId));
                                    setCurrentPostId(blogId);
                                    router.push(`/dashboard/${blogId}`)
                                }}
                                onDoubleClick={() => {
                                    setEdit(true);
                                    setCurrentPostId(blogId);
                                }}
                                className={`w-full flex items-center gap-3 px-3 py-2 rounded-sm text-sm transition-all duration-200 cursor-pointer ${isActive
                                    ? 'bg-editorial-hover text-editorial-text font-medium border-l-2 border-editorial-text ml-[-1px] dark:bg-white/10 dark:text-white dark:border-white'
                                    : 'text-editorial-secondary hover:bg-editorial-hover hover:text-editorial-text dark:text-neutral-400 dark:hover:bg-white/10 dark:hover:text-white'
                                    }`}
                            >
                                <span className={`opacity-40 text-[8px] ${isActive ? 'opacity-100 dark:text-white' : ''}`}>
                                    {isActive ? '●' : '○'}
                                </span>
                                {edit && isActive ?
                                    <Input
                                        type='text'
                                        defaultValue={blog.title}
                                        onChange={(e) => {
                                            onSave(e.target.value, blogId)
                                        }}
                                        onBlur={() => {
                                            setEdit(false);
                                        }}
                                        autoFocus
                                        className="h-6 text-sm"
                                    /> :
                                    <span className="truncate text-[14px] text-left">{blog.title || 'Untitled'}</span>}
                            </button>
                        );
                    })}
                </ScrollArea>
            </div >

            {/* Footer / User Profile */}
            < div className="mt-auto border-t border-editorial-border backdrop-blur-sm " >
                <div className="p-4 flex flex-col gap-3 dark:bg-black dark:border-white dark:text-white!">
                    <div className="flex items-center justify-between group">
                        <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8 border border-editorial-border">
                                <AvatarImage src={session?.user?.image || ""} />
                                <AvatarFallback className="bg-editorial-text text-white text-[10px] dark:bg-black dark:border-white dark:text-white!">
                                    <span className="dark:text-white! dark:border-white!">{session?.user?.name?.charAt(0) || <User size={12} />}</span>
                                </AvatarFallback>
                            </Avatar>
                            <div className="flex flex-col min-w-0">
                                <span className="text-xs font-medium text-editorial-text truncate dark:text-white!">
                                    {session?.user?.name || "Guest User"}
                                </span>
                                <span className="text-[10px] text-editorial-muted truncate">
                                    {session?.user?.email || "Free Plan"}
                                </span>
                            </div>
                        </div>

                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <button className="p-1 hover:bg-editorial-hover dark:hover:bg-neutral-800 rounded transition-colors cursor-pointer text-editorial-muted dark:text-neutral-400">
                                    <MoreVertical size={14} />
                                </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48 bg-white dark:bg-black border-editorial-border dark:border-white">
                                <DropdownMenuItem className="text-xs cursor-pointer dark:text-white dark:focus:bg-neutral-800 dark:focus:text-white">
                                    <User className="mr-2 h-4 w-4" /> Profile
                                </DropdownMenuItem>
                                <DropdownMenuItem className="text-xs cursor-pointer dark:text-white dark:focus:bg-neutral-800 dark:focus:text-white">
                                    <Settings className="mr-2 h-4 w-4" /> Account
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                    onClick={() => signOut({ callbackUrl: "/login" })}
                                    className="text-xs cursor-pointer text-red-600 focus:text-red-600 dark:text-red-500 dark:focus:text-red-500 dark:focus:bg-neutral-800"
                                >
                                    <LogOut className="mr-2 h-4 w-4" /> Sign Out
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>


                </div>
            </div >
        </div >
    );
}

function SidebarItem({ icon, label }: { icon: React.ReactNode, label: string }) {
    return (
        <button className="w-full flex items-center gap-3 px-3 py-1.5 rounded-sm text-sm text-editorial-secondary hover:bg-editorial-hover hover:text-editorial-text dark:text-neutral-400 dark:hover:bg-white/10 dark:hover:text-white transition-all cursor-pointer group">
            <span className="opacity-60 group-hover:opacity-100 transition-opacity">{icon}</span>
            <span className="text-[14px]">{label}</span>
        </button>
    );
}

"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { useSession } from "next-auth/react";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { motion } from "framer-motion";
import {
    MessageSquare,
    MapPin,
    Link as LinkIcon,
    Calendar,
    MoreHorizontal,
    ArrowLeft,
    Check
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { ScrollArea } from "@/components/ui/scroll-area";
import { PostCard } from "../../updates/components/cards";
import { Post } from "../../updates/types";
import { BlogFromBackend } from "../../updates/page";

export default function ProfilePage() {
    const { id } = useParams();
    const { data: session } = useSession();
    const router = useRouter();
    const queryClient = useQueryClient();


    const [isFollowing, setIsFollowing] = useState(false);
    const [followersCount, setFollowersCount] = useState(0);
    const [activeTab, setActiveTab] = useState<"articles" | "saved">("articles");

    const { data, isLoading, isError } = useQuery({
        queryKey: ["profile", id],
        queryFn: async () => {
            const res = await axios.get(`http://localhost:8002/api/v1/blog/get-profile/${id}`, {
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${session?.accessToken}`
                }
            });
            setIsFollowing(res?.data.stats.isFollowing);
            setFollowersCount(res?.data.stats.followersCount);
            return res.data;
        },
        enabled: !!session?.accessToken && !!id,
    });

    const { data: blogsData, isLoading: isBlogsLoading } = useQuery({
        queryKey: ["user-blogs", id],
        queryFn: async () => {
            const res = await axios.get(`http://localhost:8002/api/v1/blog/get-user-blogs/${id}`, {
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${session?.accessToken}`
                }
            });
            return res.data;
        },
        enabled: !!session?.accessToken && !!id,
    });

    const { data: savedBlogsData, isLoading: isSavedBlogsLoading } = useQuery({
        queryKey: ["saved-blogs", id],
        queryFn: async () => {
            const res = await axios.get(`http://localhost:8002/api/v1/blog/get-saved-blogs/${id}`, {
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${session?.accessToken}`
                }
            });
            return res.data;
        },
        enabled: !!session?.accessToken && !!id && activeTab === "saved",
    });



    const toggleFollowMutation = useMutation({
        mutationFn: async () => {
            const res = await axios.patch(`http://localhost:8002/api/v1/blog/toggle-follow/${id}`, {}, {
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${session?.accessToken}`
                }
            });
            return res.data;
        },
        onMutate: async () => {
            const prevFollowing = isFollowing;
            setIsFollowing(!prevFollowing);
            setFollowersCount(prev => prevFollowing ? prev - 1 : prev + 1);
            return { prevFollowing };
        },
        onSuccess: (data) => {
            toast.success(data.message);
            queryClient.invalidateQueries({ queryKey: ["profile", id] });
        },
        onError: (err, variables, context: { prevFollowing: boolean } | undefined) => {
            // Rollback
            setIsFollowing(context?.prevFollowing as boolean);
            setFollowersCount(prev => context?.prevFollowing ? prev + 1 : prev - 1);
            if (axios.isAxiosError(err)) {
                toast.error(err.response?.data?.message || "Failed to update follow status");
            } 
        }
    });

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center h-screen gap-4">
                <div className="w-24 h-24 rounded-full bg-slate-100 animate-pulse" />
                <div className="h-8 w-48 bg-slate-100 animate-pulse rounded" />
                <div className="h-4 w-64 bg-slate-50 animate-pulse rounded" />
            </div>
        );
    }

    if (isError || !data?.user) {
        return (
            <div className="flex flex-col items-center justify-center h-[80vh] gap-4">
                <p className="text-slate-500">User not found or an error occurred.</p>
                <Button variant="outline" onClick={() => router.back()}>Go Back</Button>
            </div>
        );
    }

    const user = data.user;
    const isOwnProfile = session?.user?.id === id;

    return (
        <ScrollArea className="h-full">
            <div className="max-w-6xl mx-auto pb-20">
                {/* Header/Cover Area */}
                <div className="h-48 bg-gradient-to-r from-slate-900 to-slate-800 relative">
                    <button
                        onClick={() => router.back()}
                        className="absolute top-6 left-6 p-2 rounded-full bg-black/20 hover:bg-black/40 text-white backdrop-blur-sm transition-all"
                    >
                        <ArrowLeft size={20} />
                    </button>
                </div>

                {/* Profile Content */}
                <div className="px-6 sm:px-8 -mt-16">
                    <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="relative"
                        >
                            <Avatar className="w-32 h-32 border-4 border-white shadow-xl dark:border-black">
                                <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}`} />
                                <AvatarFallback className="text-2xl font-bold">
                                    {user.name?.charAt(0).toUpperCase()}
                                </AvatarFallback>
                            </Avatar>
                        </motion.div>

                        <div className="flex items-center gap-3 pb-2">
                            {!isOwnProfile && (
                                <>
                                    <Button
                                        onClick={() => toggleFollowMutation.mutate()}
                                        variant={isFollowing ? "outline" : "default"}
                                        className={`rounded-full px-8 font-semibold transition-all h-10 ${isFollowing
                                                ? "border-slate-200 hover:border-red-200 hover:text-red-600 hover:bg-red-50"
                                                : "bg-black text-white hover:bg-slate-800"
                                            }`}
                                    >
                                        {isFollowing ? (
                                            <span className="flex items-center gap-2">
                                                Following
                                            </span>
                                        ) : (
                                            <span className="flex items-center gap-2">
                                                Follow
                                            </span>
                                        )}
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        className="rounded-full h-10 w-10 border-slate-200"
                                        onClick={() => toast.info("Chat feature coming soon!")}
                                    >
                                        <MessageSquare size={18} />
                                    </Button>
                                </>
                            )}
                            {isOwnProfile && (
                                <Button
                                    variant="outline"
                                    className="rounded-full px-8 border-slate-200"
                                    onClick={() => router.push('/settings')}
                                >
                                    Edit Profile
                                </Button>
                            )}
                            <Button variant="outline" size="icon" className="rounded-full h-10 w-10 border-slate-200">
                                <MoreHorizontal size={18} />
                            </Button>
                        </div>
                    </div>

                    {/* Bio Section */}
                    <div className="mt-8 flex flex-col gap-1">
                        <div className="flex items-center gap-2">
                            <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                                {user.name}
                            </h1>
                            {user.isVerified && <div className="bg-blue-500 rounded-full p-0.5"><Check size={12} className="text-white" /></div>}
                        </div>
                        <p className="text-slate-500 font-medium">@{user.username}</p>
                    </div>

                    <div className="mt-4">
                        <p className="text-slate-700 dark:text-slate-300 leading-relaxed max-w-2xl">
                            {user.bio || "No bio yet. This user is a man of few words."}
                        </p>
                    </div>

                    {/* Metadata */}
                    <div className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-[14px] text-slate-500">
                        <div className="flex items-center gap-1.5">
                            <MapPin size={16} />
                            <span>{user.city}, {user.country}</span>
                        </div>
                        {user.website && (
                            <div className="flex items-center gap-1.5 text-blue-600 hover:underline cursor-pointer">
                                <LinkIcon size={16} />
                                <span>{user.website}</span>
                            </div>
                        )}
                        <div className="flex items-center gap-1.5">
                            <Calendar size={16} />
                            <span>Joined March 2024</span>
                        </div>
                    </div>

                    {/* Stats */}
                    <div className="mt-6 flex gap-6 pb-10 border-b border-slate-100 dark:border-neutral-800">
                        <div className="flex gap-1.5 text-[15px]">
                            <span className="font-bold text-slate-900 dark:text-white">{data.stats.followingCount}</span>
                            <span className="text-slate-500">Following</span>
                        </div>
                        <div className="flex gap-1.5 text-[15px]">
                            <span className="font-bold text-slate-900 dark:text-white">{followersCount}</span>
                            <span className="text-slate-500">Followers</span>
                        </div>
                    </div>

                    {/* Tabs / Recent Activity */}
                    <div className="mt-8">
                        <div className="flex gap-8 border-b border-slate-100 dark:border-neutral-800 mb-6">
                            <button 
                                onClick={() => setActiveTab("articles")}
                                className={`pb-4 text-[15px] transition-all cursor-pointer ${
                                    activeTab === "articles" 
                                        ? "font-bold text-slate-900 border-b-2 border-black dark:text-white dark:border-white" 
                                        : "font-medium text-slate-400 hover:text-slate-600"
                                }`}
                            >
                                Articles
                            </button>
                            <button 
                                onClick={() => setActiveTab("saved")}
                                className={`pb-4 text-[15px] transition-all cursor-pointer ${
                                    activeTab === "saved" 
                                        ? "font-bold text-slate-900 border-b-2 border-black dark:text-white dark:border-white" 
                                        : "font-medium text-slate-400 hover:text-slate-600"
                                }`}
                            >
                                Saved
                            </button>
                        </div>

                        <div className="flex flex-col gap-4">
                            {activeTab === "articles" ? (
                                isBlogsLoading ? (
                                    [1, 2].map((i) => (
                                        <div key={i} className="animate-pulse flex flex-col gap-4 py-6 border-b border-slate-100">
                                            <div className="h-4 w-32 bg-slate-100 rounded" />
                                            <div className="h-8 w-3/4 bg-slate-100 rounded" />
                                            <div className="h-20 w-full bg-slate-50 rounded" />
                                        </div>
                                    ))
                                ) : !blogsData?.data || blogsData.data.length === 0 ? (
                                    <div className="flex flex-col items-center py-20 text-center bg-slate-50 rounded-3xl border-2 border-dashed border-slate-100 dark:bg-neutral-900 dark:border-neutral-800">
                                        <p className="text-slate-400">No articles posted yet.</p>
                                    </div>
                                ) : (
                                    blogsData.data.map((blog: BlogFromBackend) => {
                                        const post: Post = {
                                            id: blog._id,
                                            title: blog.title,
                                            excerpt: typeof blog.content === 'object' && Array.isArray(blog.content)
                                                ? `${blog.content?.[0]?.content?.[0]?.text || ''} ${blog.content?.[1]?.content?.[0]?.text || ''}`.trim().slice(0, 450) + "..."
                                                : "No preview available",
                                            content: JSON.stringify(blog.content),
                                            author: {
                                                id: user._id,
                                                name: user.name,
                                                handle: `@${user.username}`,
                                                avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}`,
                                                role: "Author"
                                            },
                                            createdAt: blog.createdAt,
                                            likes: blog.upvotes?.length || 0,
                                            comments: blog.comments?.length || 0,
                                            tags: [],
                                            readTime: "5 min read"
                                        };
                                        return (
                                            <PostCard 
                                                key={post.id} 
                                                post={post} 
                                                bookmarked={blogsData?.bookmarks?.includes(post.id)} 
                                            />
                                        );
                                    })
                                )
                            ) : (
                                // Saved Tab
                                isSavedBlogsLoading ? (
                                    [1, 2].map((i) => (
                                        <div key={i} className="animate-pulse flex flex-col gap-4 py-6 border-b border-slate-100">
                                            <div className="h-4 w-32 bg-slate-100 rounded" />
                                            <div className="h-8 w-3/4 bg-slate-100 rounded" />
                                            <div className="h-20 w-full bg-slate-50 rounded" />
                                        </div>
                                    ))
                                ) : !savedBlogsData?.data || savedBlogsData.data.length === 0 ? (
                                    <div className="flex flex-col items-center py-20 text-center bg-slate-50 rounded-3xl border-2 border-dashed border-slate-100 dark:bg-neutral-900 dark:border-neutral-800">
                                        <p className="text-slate-400">No saved articles yet.</p>
                                    </div>
                                ) : (
                                    savedBlogsData.data.map((blog: BlogFromBackend) => {
                                        const post: Post = {
                                            id: blog._id,
                                            title: blog.title, 
                                            excerpt: typeof blog.content === 'object' && Array.isArray(blog.content)
                                                ? `${blog.content?.[0]?.content?.[0]?.text || ''} ${blog.content?.[1]?.content?.[0]?.text || ''}`.trim().slice(0, 450) + "..."
                                                : "No preview available",
                                            content: JSON.stringify(blog.content),
                                            author: {
                                                id: blog.author?._id || "unknown",
                                                name: blog.author?.name || "Anonymous",
                                                handle: `@${blog.author?.username || 'user'}`,
                                                avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${blog.author?.name || 'default'}`,
                                                role: "Author"
                                            },
                                            createdAt: blog.createdAt,
                                            likes: blog.upvotes?.length || 0,
                                            comments: blog.comments?.length || 0,
                                            tags: [],
                                            readTime: "5 min read"
                                        };
                                        return (
                                            <PostCard 
                                                key={post.id} 
                                                post={post} 
                                                bookmarked={true}
                                            />
                                        );
                                    })
                                )
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </ScrollArea>
    );
}
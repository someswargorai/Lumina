"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { useSession } from "next-auth/react";
import { useParams } from "next/navigation";
import { useState } from "react";
import dynamic from "next/dynamic";
import {
    Hand,
    MessageSquare,
    Bookmark,
    Share2,
    MoreHorizontal,
    ShieldCheck,
} from "lucide-react";
import { motion } from "motion/react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { format } from "date-fns";

const Editor = dynamic(() => import("../../dashboard/components/editor"), { ssr: false });

export default function BlogPage() {
    const { id } = useParams();
    const { data: session } = useSession();
    const queryClient = useQueryClient();
    const [commentText, setCommentText] = useState("");
    const [optimisticBookmark, setOptimisticBookmark] = useState<boolean | null>(null);
    const [totalFollowers, setTotalFollowers] = useState(0);
    const [isFollowing, setIsFollowing] = useState(false);

    const { data, isLoading, isError } = useQuery({
        queryKey: ["blog", id],
        queryFn: async () => {
            const res = await axios.get(`${process.env.NEXT_PUBLIC_BLOG_URL}/blog/get-blog/${id}`, {
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${session?.accessToken}`
                }
            });
            if (res?.data?.success) {
                setTotalFollowers(res?.data?.totalFollowers);
                setIsFollowing(res?.data?.isFollowing);
            }
            return res.data;
        },
        enabled: !!session?.accessToken,
    });

    const hitBookmark = optimisticBookmark !== null ? optimisticBookmark : !!data?.userBookmarked;

    const upvoteMutation = useMutation({
        mutationFn: async () => {
            const res = await axios.patch(`${process.env.NEXT_PUBLIC_BLOG_URL}/blog/toggle-upvote/${id}`, {}, {
                headers: { Authorization: `Bearer ${session?.accessToken}` }
            });
            return res.data;
        },
        onSuccess: (res) => {
            queryClient.invalidateQueries({ queryKey: ["blog", id] });
            toast.success(res.message);
        }
    });

    const commentMutation = useMutation({
        mutationFn: async () => {
            const res = await axios.post(`${process.env.NEXT_PUBLIC_BLOG_URL}/blog/add-comment/${id}`, { text: commentText }, {
                headers: { Authorization: `Bearer ${session?.accessToken}` }
            });
            return res.data;
        },
        onSuccess: (res) => {
            queryClient.invalidateQueries({ queryKey: ["blog", id] });
            setCommentText("");
            toast.success(res.message);
        }
    });

    const bookMarkBlogMutation = useMutation({
        mutationFn: async (id: string) => {
            const res = await axios.patch(`${process.env.NEXT_PUBLIC_BLOG_URL}/blog/toggle-bookmark/${id}`, {}, {
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${session?.accessToken}`
                }
            })
            return res.data;
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['blog', id] });
            setOptimisticBookmark(null); // Clear optimistic state once server data is refreshed
            toast.success(data.message);
        },
        onError: (err) => {
            if (axios.isAxiosError(err)) {
                toast.error(err.response?.data?.message || "Failed to bookmark blog");
            }
        }
    })

    const toggleFollowMutation = useMutation({
        mutationFn: async (id: string) => {
            const res = await axios.patch(`${process.env.NEXT_PUBLIC_BLOG_URL}/blog/toggle-follow/${id}`, {}, {
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${session?.accessToken}`
                }
            })
            return res.data;
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['follow', id] });
            toast.success(data.message);
        },
        onError: (err) => {
            if (axios.isAxiosError(err)) {
                toast.error(err.response?.data?.message || "Failed to follow blog");
            }
        }
    })

    const BookmarkTheBlog = async (id: string) => {
        bookMarkBlogMutation.mutate(id);
    }

    const blog = data?.data;
    const author = blog?.author;
    const isUpvoted = blog?.upvotes?.includes(session?.id);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-screen bg-white">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-slate-100 border-t-slate-900 rounded-full animate-spin" />
                    <p className="text-slate-400 font-medium tracking-tight animate-pulse">Fetching the story...</p>
                </div>
            </div>
        );
    }

    if (isError) {
        return (
            <div className="flex flex-col items-center justify-center h-screen gap-4">
                <ShieldCheck size={48} className="text-slate-200" />
                <h2 className="text-xl font-bold text-slate-900">Story not found</h2>
                <p className="text-slate-500 max-w-xs text-center">It might have been deleted or moved to a different location.</p>
                <Button variant="outline" onClick={() => window.history.back()}>Go Back</Button>
            </div>
        );
    }

    return (
        <div className="bg-white min-h-screen pb-24">
            {/* Main Content */}
            <div className="max-w-8xl mx-auto px-6 py-12">
                <Editor
                    id={id as string}
                    initialContent={blog?.content}
                    disabled={true}
                />
            </div>

            {/* Interaction Bar */}
            <div className="sticky bottom-8 z-50 flex justify-center px-4">
                <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="flex items-center gap-6 px-6 py-3 bg-white border border-slate-200 shadow-2xl shadow-slate-200/50 rounded-full"
                >
                    <div className="flex items-center gap-6 border-r border-slate-200 pr-6 mr-2">
                        <button
                            onClick={() => upvoteMutation.mutate()}
                            className={`flex items-center gap-2 group transition-colors cursor-pointer ${isUpvoted ? 'text-black' : 'text-slate-500 hover:text-black'}`}
                        >
                            <Hand size={18} className={isUpvoted ? 'fill-current rotate-12' : 'group-hover:rotate-12 transition-transform'} />
                            <span className="text-sm font-bold">{blog?.upvotes?.length || 0}</span>
                        </button>
                        <button className="flex items-center gap-2 text-slate-500 hover:text-black transition-colors cursor-pointer" onClick={() => document.getElementById('comment')?.scrollIntoView({ behavior: 'smooth' })}>
                            <MessageSquare size={18} />
                            <span className="text-sm font-bold">{blog?.comments?.length || 0}</span>
                        </button>
                    </div>

                    <div className="flex items-center gap-5">
                        <button
                            className="text-slate-400 hover:text-black transition-colors cursor-pointer"
                            onClick={() => {
                                setOptimisticBookmark(!hitBookmark);
                                BookmarkTheBlog(id as string)
                            }}
                        >
                            <Bookmark size={18} className={hitBookmark ? 'fill-current' : ''} />
                        </button>
                        <button className="text-slate-400 hover:text-black transition-colors cursor-pointer">
                            <Share2 size={18} />
                        </button>
                        {/* <button className="text-slate-400 hover:text-black transition-colors cursor-pointer">
                            <MoreHorizontal size={18} />
                        </button> */}
                    </div>
                </motion.div>
            </div>

            {/* Author Section */}
            <div className="max-w-3xl mx-auto px-6 mt-12 border-t border-slate-100 pt-16">
                <div className="grid gap-12">
                    {/* Publication Spot (Mockup) */}
                    {/* <div className="flex items-start justify-between gap-4">
                        <div className="flex gap-4">
                            <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center text-white text-2xl font-black shadow-lg shadow-blue-200">
                                L
                            </div>
                            <div className="space-y-1">
                                <h3 className="text-lg font-bold text-slate-900 leading-tight">Published in Lumina Editorial</h3>
                                <p className="text-sm text-slate-500 leading-relaxed max-w-md">
                                    Exploring the intersection of deep tech, design, and storytelling.
                                    A community of forward-thinking writers and creators.
                                </p>
                            </div>
                        </div>
                        <Button variant="outline" className="rounded-full px-6 font-bold border-slate-200">{followed ? "Unfollow" : "Follow"}</Button>
                    </div> */}

                    {/* Writer Spot */}
                    <div className="flex items-start justify-between gap-4">
                        <div className="flex gap-4">
                            <Avatar className="w-16 h-16 shadow-lg">
                                <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${author?.name}`} />
                                <AvatarFallback className="text-xl">{author?.name?.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div className="space-y-1">
                                <h3 className="text-lg font-bold text-slate-900 leading-tight">Written by <span className="capitalize">{author?.name}</span></h3>
                                <div className="flex items-center gap-2 text-xs font-bold text-slate-400 capitalize mb-1 ml-1">
                                    <span className="text-blue-600">{totalFollowers} Followers</span>
                                    <span>•</span>
                                    <span className="capitalize">{author?.username}</span>
                                </div>
                                <p className="text-sm text-slate-500 leading-relaxed max-w-md">
                                    {author?.bio}
                                </p>
                            </div>
                        </div>
                        <Button variant="outline" className="rounded-full px-6 font-bold border-slate-200" onClick={() => {
                            setIsFollowing(!isFollowing);
                            if (isFollowing) {
                                setTotalFollowers(totalFollowers - 1);
                            } else {
                                setTotalFollowers(totalFollowers + 1);
                            }
                            toggleFollowMutation.mutate(author?._id)
                        }}>{isFollowing ? "Unfollow" : "Follow"}</Button>
                    </div>
                </div>
            </div>

            {/* Responses Section */}
            <section className="max-w-3xl mx-auto px-6 mt-20">
                <div className="flex items-center justify-between mb-8">
                    <h2 className="text-xl font-normal text-slate-900 tracking-tight">
                        Responses ( {blog?.comments?.length || 0} )
                    </h2>
                    <ShieldCheck size={18} className="text-slate-300" />
                </div>

                {/* Comment Input */}
                <div className="bg-slate-50 border border-slate-100 rounded-md p-4 mb-10 group focus-within:bg-white focus-within:border-slate-200 focus-within:shadow-xl focus-within:shadow-slate-100 transition-all" id="comment">
                    <div className="flex items-center gap-3 mb-3">
                        <Avatar className="h-6 w-6">
                            <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${session?.user?.name}`} />
                            <AvatarFallback>U</AvatarFallback>
                        </Avatar>
                        <span className="text-sm font-bold text-slate-900 capitalize">{session?.user?.name}</span>
                    </div>
                    <textarea
                        value={commentText}
                        onChange={(e) => setCommentText(e.target.value)}
                        placeholder="What are your thoughts?"
                        className="w-full border-none bg-transparent p-2 focus:ring-0 text-[15px] text-slate-800 placeholder-slate-400 resize-none min-h-[80px]"
                    />
                    <div className="flex justify-end mt-2">
                        <Button
                            disabled={!commentText.trim() || commentMutation.isPending}
                            onClick={() => commentMutation.mutate()}
                            className="bg-slate-900 text-white rounded-full px-6 font-bold h-9 hover:bg-black transition-colors"
                        >
                            Respond
                        </Button>
                    </div>
                </div>

                {/* Comment List */}
                <div className="space-y-8">
                    {blog?.comments?.length === 0 ? (
                        <div className="text-center py-10">
                            <p className="text-slate-400 italic text-sm">Be the first to share your thoughts.</p>
                        </div>
                    ) : (
                        blog?.comments?.map((comment: {
                            user: {
                                name: string
                            },
                            comment: string
                        }, idx: number) => (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.1 }}
                                key={idx}
                                className="space-y-3"
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <Avatar className="h-8 w-8">
                                            <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${comment.user?.name}`} />
                                            <AvatarFallback>C</AvatarFallback>
                                        </Avatar>
                                        <div className="flex flex-col">
                                            <span className="text-[13px] font-bold text-slate-900 leading-tight capitalize">
                                                {comment.user?.name || "Reader"}
                                            </span>
                                            <span className="text-[11px] text-slate-400 font-medium">
                                                {format(new Date(blog.createdAt), "MMM d, yyyy")}
                                            </span>
                                        </div>
                                    </div>
                                    <button className="text-slate-400 hover:text-black">
                                        <MoreHorizontal size={16} />
                                    </button>
                                </div>
                                <p className="text-[15px] text-slate-700 leading-relaxed pl-11">
                                    {comment.comment}
                                </p>
                            </motion.div>
                        ))
                    )}
                </div>
            </section>
        </div>
    );
}
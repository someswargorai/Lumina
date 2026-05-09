import { Post } from "../types";
import { motion } from "motion/react";
import { Star, MessageSquare, Bookmark, MoreHorizontal, ThumbsDown, Hand } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { format } from "date-fns";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { useState } from "react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import Link from "next/link";

interface PostCardProps {
    post: Post;
    bookmarked?: boolean;
}

export function PostCard({ post, bookmarked }: PostCardProps) {
    // Format long numbers
    const formatCount = (count: number) => {
        return count > 1000 ? (count / 1000).toFixed(1) + "K" : count;
    };

    const queryClient = useQueryClient();
    const router = useRouter();
    const { data: session } = useSession();
    const [hitBookmark, setHitBookmark] = useState(bookmarked);

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
            queryClient.invalidateQueries({ queryKey: ['blogs'] });

            toast.success(data.message);
        },
        onError: (err) => {
            if (axios.isAxiosError(err)) {
                toast.error(err.response?.data?.message || "Failed to bookmark blog");
            }
        }
    })

    const BookmarkTheBlog = async (id: string) => {
        bookMarkBlogMutation.mutate(id);
    }

    return (
        <motion.article
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="group flex flex-col gap-3 py-6 border-b border-slate-100 last:border-0 bg-transparent"
        >
            {/* Top Section: Community & Author */}
            <div className="flex items-center gap-2 text-[13px] text-slate-700 ">
                {post.community ? (
                    <div className="flex items-center gap-1.5">
                        <div className="w-5 h-5 flex items-center justify-center bg-orange-500 rounded text-[10px] font-bold text-white shadow-sm ">
                            {post.community.icon}
                        </div>
                        <span className="font-medium text-slate-800 dark:text-white">In {post.community.name}</span>
                        <span className="text-slate-400 dark:text-white">by</span>
                    </div>
                ) : null}

                <div className="flex items-center gap-1.5">
                    {!post.community && (
                        <Avatar className="w-5 h-5">
                            <AvatarImage src={post.author.avatar} alt={post.author.name} />
                            <AvatarFallback className="text-[10px]">
                                {post.author.name.charAt(0).toUpperCase()}
                            </AvatarFallback>
                        </Avatar>
                    )}
                    <Link href={`/profile/${post?.author?.id}`} className="font-semibold text-slate-900 dark:text-white capitalize" >
                        {post.author.name}
                    </Link>
                </div>
            </div>

            <div className="flex gap-6 items-start">
                {/* Left: Content */}
                <div className="flex-1 flex flex-col gap-1.5">
                    <h2 className="text-[22px] font-extrabold leading-tight text-slate-900 hover:text-blue-600 transition-colors cursor-pointer hover:underline dark:text-white" onClick={() => router.push(`/blog/${post.id}`)}>
                        {post.title}
                    </h2>
                    <p className="text-slate-500 text-[15px] leading-relaxed line-clamp-3 dark:text-white">
                        {post.excerpt}
                    </p>

                    {/* Bottom row: Meta & Actions */}
                    <div className="mt-3 flex items-center justify-between">
                        <div className="flex items-center gap-4 text-slate-500 text-[13px]">
                            <div className="flex items-center gap-1 text-yellow-500">
                                <Star size={14} fill="currentColor" />
                            </div>
                            <span>{format(new Date(post.createdAt), "MMM d")}</span>
                            <Tooltip>
                                <TooltipTrigger>
                                    <div className="flex items-center gap-1.5 transition-colors">
                                        <Hand size={14} className="rotate-12" />
                                        <span className="font-medium">{formatCount(post.likes)}</span>
                                    </div>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p>Upvotes</p>
                                </TooltipContent>
                            </Tooltip>
                            <Tooltip>
                                <TooltipTrigger>
                                    <div className="flex items-center gap-1.5 transition-colors">
                                        <MessageSquare size={14} />
                                        <span className="font-medium">{post.comments}</span>
                                    </div>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p>Comments</p>
                                </TooltipContent>
                            </Tooltip>
                        </div>

                        <div className="flex items-center gap-2">

                            <button className={`p-2 rounded-full hover:bg-slate-50 transition-all cursor-pointer ${hitBookmark ? " text-black" : "border-gray-400 text-gray-500"}`} onClick={() => {
                                setHitBookmark(prev => !prev);
                                BookmarkTheBlog(post.id)
                            }}>
                                {hitBookmark ? <Bookmark size={18} fill="currentColor" /> : <Bookmark size={18} />}
                            </button>

                        </div>
                    </div>
                </div>

                {/* Right: Thumbnail */}
                {post.thumbnail && (
                    <div className="w-28 h-20 sm:w-40 sm:h-28 flex-shrink-0 rounded-lg overflow-hidden border border-slate-100 bg-slate-50 shadow-sm transition-transform group-hover:scale-[1.02]">
                        <Image
                            src={post.thumbnail}
                            alt={post.title}
                            className="w-full h-full object-cover"
                            referrerPolicy="no-referrer"
                        />
                    </div>
                )}
            </div>
        </motion.article>
    );
}

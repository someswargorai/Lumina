"use client";

import dynamic from "next/dynamic";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { useSession } from "next-auth/react";
import { useParams } from "next/navigation";
import { motion } from "motion/react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import {
    Hand,
    MoreHorizontal,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

const Editor = dynamic(() => import("../components/editor"), { ssr: false });

export default function Dashboard() {
    const { data: session, status } = useSession();
    const { id } = useParams();
    const queryClient = useQueryClient();
    const [commentText, setCommentText] = useState("");
    const [upvoteLength, setUpvoteLength] = useState(0);


    const { data, isLoading, isError } = useQuery({
        queryKey: ["blog", id],
        queryFn: async () => {
            const res = await axios.get(`${process.env.NEXT_PUBLIC_BLOG_URL}/blog/get-blog/${id}`, {
                headers: {
                    Authorization: `Bearer ${session?.accessToken}`
                }
            });
            if (res?.data?.success) {
                setUpvoteLength(res?.data?.data?.upvotes?.length);
            }
            return res.data;
        },
        enabled: !!id && !!session?.accessToken,
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

    if (isLoading) {
        return (
            <div className="animate-pulse">
                {/* Editor Skeleton */}
                <div className="max-w-6xl mx-auto px-12 mt-16 space-y-6">
                    {/* Title Skeleton */}
                    <div className="h-14 bg-slate-100 rounded-md w-3/4"></div>

                    {/* Content Skeletons */}
                    <div className="space-y-4 mt-8">
                        <div className="h-4 bg-slate-100 rounded w-full"></div>
                        <div className="h-4 bg-slate-100 rounded w-full"></div>
                        <div className="h-4 bg-slate-100 rounded w-5/6"></div>
                    </div>

                    <div className="space-y-4 mt-8">
                        <div className="h-4 bg-slate-100 rounded w-full"></div>
                        <div className="h-4 bg-slate-100 rounded w-4/6"></div>
                    </div>

                    {/* Big image block skeleton */}
                    <div className="h-[300px] bg-slate-100 rounded-lg w-full mt-10"></div>
                </div>

                {/* Responses Section Skeleton */}
                <section className="max-w-3xl mx-auto px-6 mt-24">
                    <div className="flex items-center justify-between mb-8">
                        <div className="h-6 bg-slate-100 rounded w-40"></div>
                        <div className="h-6 bg-slate-100 rounded w-12"></div>
                    </div>

                    <div className="bg-slate-50 border border-slate-100 rounded-md p-4 mb-10">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="h-6 w-6 bg-slate-200 rounded-full"></div>
                            <div className="h-4 bg-slate-200 rounded w-24"></div>
                        </div>
                        <div className="h-20 bg-slate-100 rounded w-full mb-3"></div>
                        <div className="flex justify-end mt-2">
                            <div className="h-9 w-24 bg-slate-200 rounded-full"></div>
                        </div>
                    </div>

                    <div className="space-y-10">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="h-8 w-8 bg-slate-100 rounded-full"></div>
                                        <div className="flex flex-col gap-2">
                                            <div className="h-3 bg-slate-100 rounded w-24"></div>
                                            <div className="h-2 bg-slate-100 rounded w-16"></div>
                                        </div>
                                    </div>
                                    <div className="h-4 w-4 bg-slate-100 rounded"></div>
                                </div>
                                <div className="pl-11 space-y-2.5">
                                    <div className="h-3 bg-slate-100 rounded w-full"></div>
                                    <div className="h-3 bg-slate-100 rounded w-5/6"></div>
                                    <div className="h-3 bg-slate-100 rounded w-4/6"></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            </div>
        );
    }

    if (isError) {
        return (
            <div className="flex items-center justify-center h-screen bg-editorial-sidebar text-red-500">
                Error loading document. Please check your connection.
            </div>
        );
    }

    const isLoadingOrNot = status === "loading" || status === "authenticated" && isLoading;


    return (
        <>
            <Editor
                id={id as string}
                initialContent={data?.data?.content}
            />
            {!isLoadingOrNot && data?.data?.isPublish &&
                <section className="max-w-3xl mx-auto px-6 mt-10">
                    <div className="flex items-center justify-between mb-8">
                        <h2 className="text-xl font-normal text-slate-900 tracking-tight">
                            Responses ( {data?.data?.comments?.length || 0} )
                        </h2>

                        <button
                            onClick={() => { setUpvoteLength(data?.data?.upvotes?.includes(session?.id) ? upvoteLength - 1 : upvoteLength + 1); upvoteMutation.mutate() }}
                            className={`flex items-center gap-2 group transition-colors cursor-pointer ${data?.data?.upvotes?.includes(session?.id) ? 'text-black' : 'text-slate-500 hover:text-black'}`}
                        >
                            <Hand size={18} className={data?.data?.upvotes?.includes(session?.id) ? 'fill-current rotate-12' : 'group-hover:rotate-12 transition-transform'} />
                            <span className="text-sm font-bold">{upvoteLength}</span>
                        </button>
                    </div>

                    {/* Comment Input */}
                    <div className="bg-slate-50 border border-slate-100 rounded-md p-4 mb-10 group focus-within:bg-white focus-within:border-slate-200 focus-within:shadow-xl focus-within:shadow-slate-100 transition-all">
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
                    <div className="space-y-8" id="comments">
                        {data?.data?.comments?.length === 0 ? (
                            <div className="text-center py-10">
                                <p className="text-slate-400 italic text-sm">Be the first to share your thoughts.</p>
                            </div>
                        ) : (
                            data?.data?.comments?.map((comment: {
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
                                                    {format(new Date(data?.data.createdAt), "MMM d, yyyy")}
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
                </section>}
        </>
    );
}

"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { useSession } from "next-auth/react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface UserToFollow {
    _id: string;
    name: string;
    username: string;
    bio?: string;
}

export default function Sidebar() {
    const { data: session, status } = useSession();
    const [isFollowing, setIsFollowing] = useState(false);
    const [currentId, setCurrentId] = useState("");
    const queryClient = useQueryClient();
    const router = useRouter();

    const { data, isLoading } = useQuery({
        queryKey: ["users-to-follow"],
        queryFn: async () => {
            const res = await axios.get(`${process.env.NEXT_PUBLIC_BLOG_URL}/blog/get-users`, {
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${session?.accessToken}`
                }
            });
            return res.data;
        },
        enabled: !!session?.accessToken,
    });

    const { data: topics, isLoading: topicLoading } = useQuery({
        queryKey: ["topics"],
        queryFn: async () => {
            const res = await axios.get(`${process.env.NEXT_PUBLIC_BLOG_URL}/blog/get-topics`, {
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${session?.accessToken}`
                }
            });
            return res.data;
        },
        enabled: !!session?.accessToken
    })

    const users: UserToFollow[] = data?.data || [];
    const isLoadingOrNot = status === "loading" || status === "authenticated" && isLoading;
    const isTopicLoadingOrNot = status === "loading" || status === "authenticated" && topicLoading;


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
            queryClient.invalidateQueries({ queryKey: ['follow', currentId] });
            toast.success(data.message);
        },
        onError: (err) => {
            if (axios.isAxiosError(err)) {
                toast.error(err.response?.data?.message || "Failed to follow blog");
            }
        }
    })

    return (
        <aside className="sticky top-0 hidden h-fit w-[400px] flex-col gap-10 xl:flex py-10 px-8">
            {/* Recommended Topics */}
            <section className="flex flex-col gap-4 border-b border-slate-100 pb-10">
                <h3 className="text-base font-bold text-slate-900 dark:text-white">Recommended topics</h3>
                <div className="flex flex-wrap gap-2">
                    {isTopicLoadingOrNot ?
                        ["w-16", "w-24", "w-20", "w-28"].map((width, i) => (
                            <div
                                key={i}
                                className={`animate-pulse rounded-full bg-slate-100 h-9 ${width}`}
                            />
                        )) : topics?.data?.length === 0 ?
                            <p className="text-sm text-slate-400 italic">No topics found.</p> :
                            topics?.data?.filter((item: { _id: string }) => item && item._id)?.map((item: { _id: string }) => (
                                <button
                                    key={item._id}
                                    className="rounded-full bg-slate-100 px-4 py-2 text-[13px] font-normal cursor-pointer text-slate-800 hover:bg-slate-200 transition-colors capitalize"
                                    onClick={() => {
                                        router.push(`/blog_topics/${item._id}`)
                                    }}
                                >
                                    {item._id.replace(/-/g, ' ')}
                                </button>
                            ))}
                </div>

            </section>

            {/* Who to follow */}
            <section className="flex flex-col gap-6">
                <h3 className="text-base font-bold text-slate-900 dark:text-white">Who to follow</h3>
                <div className="flex flex-col gap-6">
                    {isLoadingOrNot ? (
                        [1, 2, 3].map((i) => (
                            <div key={i} className="flex gap-3 animate-pulse">
                                <div className="h-10 w-10 rounded-full bg-slate-100" />
                                <div className="flex-1 space-y-2">
                                    <div className="h-3 w-24 bg-slate-100 rounded" />
                                    <div className="h-2 w-full bg-slate-50 rounded" />
                                </div>
                            </div>
                        ))
                    ) : users.length === 0 ? (
                        <p className="text-sm text-slate-400 italic">No users found to follow.</p>
                    ) : (
                        users.slice(0, 5).map((user) => (
                            <div key={user._id} className="flex items-start gap-3 group">
                                <Avatar className="h-10 w-10">
                                    <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}`} />
                                    <AvatarFallback>{user.name.charAt(0).toUpperCase()}</AvatarFallback>
                                </Avatar>
                                <div className="flex flex-col gap-0.5 flex-1 min-w-0">
                                    <h4 className="text-[14px] font-bold text-slate-900 line-clamp-1 group-hover:text-blue-600 transition-colors">
                                        {user.name}
                                    </h4>
                                    <p className="text-[12px] text-slate-500 leading-snug line-clamp-2">
                                        {user.bio || `Creative mind writing stories as @${user.username}`}
                                    </p>
                                </div>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="rounded-full h-8 text-[12px] font-bold px-4 border-slate-200 hover:bg-slate-900 hover:text-white transition-all shrink-0 cursor-pointer"
                                    onClick={() => {
                                        setCurrentId(user._id);
                                        setIsFollowing(!isFollowing);
                                        toggleFollowMutation.mutate(user._id);
                                    }}
                                >
                                    {currentId === user._id ? "Unfollow" : "Follow"}
                                </Button>
                            </div>
                        ))
                    )}
                </div>
                {users.length > 5 && (
                    <button className="text-[11px] font-medium text-blue-600 hover:text-blue-700 text-left w-fit uppercase tracking-tight ml-1">
                        See more suggestions
                    </button>
                )}
            </section>


        </aside>
    );
}
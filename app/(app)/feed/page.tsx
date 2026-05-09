"use client";

import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { useSession } from "next-auth/react";
import { PostCard } from "../updates/components/cards";
import { Post } from "../updates/types";
import { Rss, Users } from "lucide-react";

interface BlogFromBackend {
    _id: string;
    title: string;
    content: {
        content: {
            text: string;
        }[]
    }[],
    author: {
        _id: string;
        name: string;
        username: string;
    };
    createdAt: string;
    upvotes?: string[];
    comments?: [];
}

export default function FeedPage() {
    const { data: session, status } = useSession();

    const { data, isLoading, isError } = useQuery({
        queryKey: ["feed-blogs"],
        queryFn: async () => {
            const res = await axios.get(`${process.env.NEXT_PUBLIC_BLOG_URL}/blog/get-feed-of-followings`, {
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${session?.accessToken}`
                }
            });
            return res.data;
        },
        enabled: !!session?.accessToken,
    });

    const isPageLoading = status === "loading" || (status === "authenticated" && isLoading);

    if (isPageLoading) {
        return (
            <div className="flex flex-col px-5 md:px-20">
                <header className="py-8 border-b border-slate-100 mb-4 flex flex-col gap-2">
                    <div className="flex items-center gap-2 text-blue-600">
                        <Rss size={20} fill="currentColor" />
                        <span className="text-xs font-bold tracking-[0.2em] uppercase">Following</span>
                    </div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">Your Feed</h1>
                    <p className="text-slate-500 mt-1">The latest stories from writers you follow.</p>
                </header>
                <div className="flex flex-col gap-8 py-4">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="animate-pulse flex flex-col gap-4">
                            <div className="h-4 w-32 bg-slate-100 rounded" />
                            <div className="h-8 w-3/4 bg-slate-100 rounded" />
                            <div className="h-20 w-full bg-slate-50 rounded" />
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    if (isError) {
        return (
            <div className="flex flex-col px-5 md:px-20">
                <header className="py-8 border-b border-slate-100 mb-4 flex flex-col gap-2">
                    <div className="flex items-center gap-2 text-blue-600">
                        <Rss size={20} fill="currentColor" />
                        <span className="text-xs font-bold tracking-[0.2em] uppercase">Following</span>
                    </div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">Your Feed</h1>
                    <p className="text-slate-500 mt-1">The latest stories from writers you follow.</p>
                </header>
                <div className="py-20 text-center">
                    <p className="text-slate-500">Failed to load feed. Please try again later.</p>
                </div>
            </div>
        );
    }

    // Transform backend data to match Post interface
    const posts: Post[] = (data?.data || []).map((blog: BlogFromBackend) => ({
        id: blog._id,
        title: blog.title,
        excerpt: typeof blog.content === 'object' && Array.isArray(blog.content)
            ? `${blog.content?.[0]?.content?.[0]?.text || ''} ${blog.content?.[1]?.content?.[0]?.text || ''}`.trim().slice(0, 450) + "..."
            : "No preview available",
        content: blog.content,
        author: {
            id: blog.author?._id || "unknown",
            name: blog.author?.name || "Anonymous",
            handle: `@${blog.author?.username || 'user'}`,
            avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${blog.author?.name || 'default'}`,
            role: "Contributor"
        },
        createdAt: blog.createdAt,
        likes: blog.upvotes?.length || 0,
        comments: blog.comments?.length || 0,
        tags: [],
        readTime: "5 min read"
    }));

    return (
        <div className="flex flex-col px-5 md:px-20">
            <header className="py-8 border-b border-slate-100 mb-4 flex flex-col gap-2">
                <div className="flex items-center gap-2 text-blue-600">
                    <Rss size={20} fill="currentColor" />
                    <span className="text-xs font-bold tracking-[0.2em] uppercase">Following</span>
                </div>
                <h1 className="text-3xl font-black text-slate-900 tracking-tight">Your Feed</h1>
                <p className="text-slate-500 mt-1">The latest stories from writers you follow.</p>
            </header>

            <div className="grid grid-cols-12 gap-4">
                {posts.length === 0 ? (
                    <div className="col-span-12 py-24 flex flex-col items-center justify-center border-2 border-dashed border-slate-100 rounded-3xl bg-slate-50/50">
                        <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center mb-6">
                            <Users size={28} className="text-slate-200" />
                        </div>
                        <h3 className="text-lg font-bold text-slate-900 mb-2">It&apos;s quiet here</h3>
                        <p className="text-slate-400 text-sm text-center max-w-xs">
                            Follow more writers to see their latest stories appear in your feed.
                        </p>
                    </div>
                ) : (
                    posts.map((post) => (
                        <div key={post.id} className="col-span-12">
                            <PostCard post={post} />
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
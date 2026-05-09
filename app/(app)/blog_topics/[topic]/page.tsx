"use client";

import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { useSession } from "next-auth/react";
import { useParams, useRouter } from "next/navigation";
import { PostCard } from "../../updates/components/cards";
import { Post } from "../../updates/types";

interface BlogFromBackend {
    _id: string;
    title: string;
    content: {
        content: {
            text: string;
        }[]
    }[];
    author: {
        _id: string;
        name: string;
        username: string;
    };
    createdAt: string;
    upvotes?: string[];
    comments?: string[];
}

export default function BlogTopicsPage() {
    const { topic } = useParams();
    const { data: session, status } = useSession();
    const router = useRouter();

    const formattedTopic = typeof topic === 'string'
        ? topic.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
        : '';

    const { data, isLoading, isError } = useQuery({
        queryKey: ["blogs-by-topic", topic],
        queryFn: async () => {
            const res = await axios.get(`${process.env.NEXT_PUBLIC_BLOG_URL}/blog/get-blogs-by-topic/${topic}`, {
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${session?.accessToken}`
                }
            });
            return res.data;
        },
        enabled: !!session?.accessToken && !!topic,
    });

    const isPageLoading = status === "loading" || (status === "authenticated" && isLoading);

    if (isPageLoading) {
        return (
            <div className="flex flex-col gap-8 py-8 px-6">
                <div className="h-10 w-64 bg-slate-100 animate-pulse rounded mb-8" />
                {[1, 2, 3].map((i) => (
                    <div key={i} className="animate-pulse flex flex-col gap-4">
                        <div className="h-4 w-32 bg-slate-100 rounded" />
                        <div className="h-8 w-3/4 bg-slate-100 rounded" />
                        <div className="h-20 w-full bg-slate-50 rounded" />
                    </div>
                ))}
            </div>
        );
    }

    if (isError) {
        return (
            <div className="py-20 text-center">
                <p className="text-slate-500">Failed to load blogs for this topic. Please try again later.</p>
            </div>
        );
    }

    // Transform backend data to match Post interface
    const posts: Post[] = (data?.data || []).map((blog: BlogFromBackend) => ({
        id: blog._id,
        title: blog.title,
        excerpt: typeof blog.content === 'object' && Array.isArray(blog.content)
            ? `${blog.content?.[0]?.content?.[0]?.text || ''} ${blog.content?.[1]?.content?.[0]?.text || ''} ${blog.content?.[2]?.content?.[0]?.text || ''} ${blog.content?.[3]?.content?.[0]?.text || ''}`.trim().slice(0, 450) + "..."
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
        <div className="flex flex-col px-6">
            <header className="py-8 border-b border-slate-100 mb-4">
                <h1 className="text-3xl font-black text-slate-900 tracking-tight dark:text-white capitalize">
                    {formattedTopic}
                </h1>
                <p className="text-slate-500 mt-1 dark:text-white">Explore the latest stories in {formattedTopic}.</p>
            </header>

            <div className="grid grid-cols-12 gap-4">
                {posts?.length === 0 ? (
                    <div className="col-span-12 py-20 text-center border-2 border-dashed border-slate-100 rounded-3xl">
                        <p className="text-slate-400">No blogs found for this topic yet.</p>
                    </div>
                ) : (
                    posts.map((post) => (
                        <div key={post.id} className="col-span-12">
                            <PostCard post={post} bookmarked={data?.bookmarks?.includes(post.id)} />
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}

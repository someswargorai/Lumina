"use client";

import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { useSession } from "next-auth/react";
import { PostCard } from "./components/cards";
import { Post } from "./types";

export interface BlogFromBackend {
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
    comments?: string[];
}

export default function Updates() {
    const { data: session, status } = useSession();

    const { data, isLoading, isError } = useQuery({
        queryKey: ["updated-blogs"],
        queryFn: async () => {
            const res = await axios.get(`${process.env.NEXT_PUBLIC_BLOG_URL}/blog/updated-blogs`, {
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY5ZmYzODdjNWI1MDk0YTA2YmQ4MmMzNSIsImVtYWlsIjoic29tZ29yYWk3MjZAZ21haWwuY29tIiwibmFtZSI6ImFsZXggbGFiIiwiaWF0IjoxNzc4MzMzODcwLCJleHAiOjE3Nzg1MDY2NzB9.aij-2YCOrumvInVrbID1CiDNX1AJpVPGbLvXbiHecL8`
                }
            });
            return res.data;
        },
        enabled: true,
    });

    const isPageLoading = status === "loading" || (status === "authenticated" && isLoading);

    if (isPageLoading) {
        return (
            <div className="flex flex-col gap-8 py-8">
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
                <p className="text-slate-500">Failed to load updates. Please try again later.</p>
            </div>
        );
    }

    // Transform backend data to match Post interface
    const posts: Post[] = (data?.message || []).map((blog: BlogFromBackend) => ({
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
        <div className="flex flex-col">
            <header className="py-8 border-b border-slate-100 mb-4">
                <h1 className="text-3xl font-black text-slate-900 tracking-tight dark:text-white">Recent Updates</h1>
                <p className="text-slate-500 mt-1 dark:text-white">Stay tuned with the latest stories from the community.</p>
            </header>

            <div className="grid grid-cols-12 gap-4">
                {posts?.length === 0 ? (
                    <div className="col-span-12 py-20 text-center border-2 border-dashed border-slate-100 rounded-3xl">
                        <p className="text-slate-400">No recent updates found.</p>
                    </div>
                ) : (
                    posts.map((post) => (
                        <div key={post.id} className="col-span-12">
                            <PostCard post={post} bookmarked={data?.data?.bookmarks?.includes(post.id)} />
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
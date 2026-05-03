"use client";


import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Layout, Cpu, Database, Palette, Code, Shield, Bitcoin, Rocket, BookOpen, Users, Brain } from "lucide-react";
import { type LucideIcon } from 'lucide-react';

const TOPIC_ICONS: Record<string, LucideIcon> = {
    "system-design": Layout,
    "frontend": Palette,
    "backend": Database,
    "frontend-system-design": Layout,
    "backend-system-design": Cpu,
    "devops": Rocket,
    "databases": Database,
    "ai-ml": Brain,
    "open-source": Code,
    "career": Users,
    "web3": Bitcoin,
    "security": Shield,
};

export default function BlogTopicsIndex() {
    const { data: session, status } = useSession();
    const router = useRouter();

    const { data: topics, isLoading } = useQuery({
        queryKey: ["all-topics"],
        queryFn: async () => {
            const res = await axios.get("http://localhost:8002/api/v1/blog/get-topics", {
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
            <div className="flex flex-col gap-8 py-8 px-6">
                <div className="h-10 w-64 bg-slate-100 animate-pulse rounded mb-8" />
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                        <div key={i} className="h-32 bg-slate-50 animate-pulse rounded-2xl border border-slate-100" />
                    ))}
                </div>
            </div>
        );
    }

    const availableTopics = topics?.data?.filter((t: {_id: string}) => t._id) || [];

    return (
        <div className="flex flex-col px-6">
            <header className="py-8 border-b border-slate-100 mb-8">
                <h1 className="text-3xl font-black text-slate-900 tracking-tight dark:text-white">Discover Topics</h1>
                <p className="text-slate-500 mt-1 dark:text-white">Explore community stories by your favorite categories.</p>
            </header>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {availableTopics.length === 0 ? (
                    <div className="col-span-full py-20 text-center border-2 border-dashed border-slate-100 rounded-3xl">
                        <p className="text-slate-400">No topics found yet.</p>
                    </div>
                ) : (
                    availableTopics.map((topic: {_id: string}) => {
                        const Icon = TOPIC_ICONS[topic._id] || BookOpen;
                        return (
                            <div
                                key={topic._id}
                                onClick={() => router.push(`/blog_topics/${topic._id}`)}
                                className="group p-6 rounded-2xl border border-slate-100 bg-white hover:border-blue-200 hover:shadow-md transition-all cursor-pointer dark:bg-neutral-900 dark:border-neutral-800 dark:hover:border-blue-500"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-xl bg-slate-50 flex items-center justify-center text-slate-600 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors dark:bg-neutral-800 dark:text-neutral-400">
                                        <Icon size={24} />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-slate-900 group-hover:text-blue-600 transition-colors dark:text-white capitalize">
                                            {topic._id.replace(/-/g, ' ')}
                                        </h3>
                                        <p className="text-sm text-slate-500 line-clamp-1">
                                            View all articles in this category
                                        </p>
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
}

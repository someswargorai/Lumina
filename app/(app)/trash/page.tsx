"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { useSession } from "next-auth/react";
import {
    Trash2,
    RotateCcw,
    Search,
    FileText,
    AlertCircle,
    MoreVertical,
    Clock
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { toast } from "sonner";
import { format } from "date-fns";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { useRef, useState } from "react";

interface TrashBlog {
    _id: string;
    title: string;
    content: string;
    updatedAt: string;
}

export default function Trash() {

    const [search, setSearch] = useState("");
    const debounceRef = useRef<NodeJS.Timeout | null>(null);
    const { data: session } = useSession();
    const queryClient = useQueryClient();

    const { data, isLoading, isError } = useQuery({
        queryKey: ["trash-blogs", search],
        queryFn: async () => {
            const params = new URLSearchParams();
            params.set("search", search);

            const res = await axios.get(`${process.env.NEXT_PUBLIC_BLOG_URL}/blog/trash-blogs?${params.toString()}`, {
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${session?.accessToken}`
                }
            });
            return res.data;
        },
        enabled: !!session?.accessToken,
    });

    const restoreMutation = useMutation({
        mutationFn: async (id: string) => {
            const res = await axios.put(`${process.env.NEXT_PUBLIC_BLOG_URL}/blog/restore-blog/${id}`, {}, {
                headers: { Authorization: `Bearer ${session?.accessToken}` }
            });
            return res.data;
        },
        onSuccess: (res) => {
            queryClient.invalidateQueries({ queryKey: ["trash-blogs"] });
            queryClient.invalidateQueries({ queryKey: ["blogs"] });
            toast.success(res.message || "Blog restored successfully");
        },
        onError: () => toast.error("Failed to restore blog"),
    });

    const permanentDeleteMutation = useMutation({
        mutationFn: async (id: string) => {
            const res = await axios.delete(`${process.env.NEXT_PUBLIC_BLOG_URL}/blog/permanent-delete-blog/${id}`, {
                headers: { Authorization: `Bearer ${session?.accessToken}` }
            });
            return res.data;
        },
        onSuccess: (res) => {
            queryClient.invalidateQueries({ queryKey: ["trash-blogs"] });
            toast.success(res.message || "Blog permanently deleted");
        },
        onError: () => toast.error("Failed to delete blog permanently"),
    });

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {

        if (debounceRef?.current) {
            clearTimeout(debounceRef.current);
        }

        debounceRef.current = setTimeout(() => {
            setSearch(e.target.value);
        }, 500);
    }

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
                <div className="w-8 h-8 border-2 border-slate-200 border-t-slate-800 rounded-full animate-spin" />
                <p className="text-sm text-slate-500 font-medium animate-pulse">Scanning the archives...</p>
            </div>
        );
    }

    const trashBlogs: TrashBlog[] = data?.data || [];

    return (
        <div className="max-w-6xl mx-auto px-6 py-12">
            {/* Header */}
            <header className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="space-y-2">
                    <div className="flex items-center gap-3 text-slate-400 mb-1">
                        <Trash2 size={20} className="text-red-500" />
                        <span className="text-xs font-bold tracking-[0.2em] uppercase">Trash Bin</span>
                    </div>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight">Trash</h1>
                    <p className="text-slate-500 text-sm max-w-md leading-relaxed">
                        Manage items you&apos;ve deleted. You can either restore them to your workspace or clear them permanently.
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <div className="relative group">
                        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 transition-colors group-focus-within:text-slate-900" />
                        <input
                            type="text"
                            placeholder="Search trash"
                            defaultValue={search}
                            onChange={handleSearch}
                            className="pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-sm text-sm w-64 focus:outline-none focus:ring-2 focus:ring-slate-100 transition-all"
                        />
                    </div>
                </div>
            </header>

            <AnimatePresence mode="popLayout">
                {trashBlogs.length === 0 ? (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex flex-col items-center justify-center py-24 px-6 border-2 border-dashed border-slate-100 rounded-3xl bg-slate-50/50"
                    >
                        <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center mb-6">
                            <RotateCcw size={28} className="text-slate-300" />
                        </div>
                        <h3 className="text-lg font-bold text-slate-900 mb-2">Trash is empty</h3>
                        <p className="text-slate-500 text-sm text-center max-w-xs">
                            Good job keeping it clean. Items you delete from your workspace will appear here.
                        </p>
                    </motion.div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {trashBlogs.map((blog, index) => (
                            <motion.div
                                key={blog._id}
                                layout
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                transition={{ duration: 0.2, delay: index * 0.05 }}
                                className="group relative bg-white border border-slate-200 rounded-2xl p-6 hover:shadow-xl hover:shadow-slate-200/50 hover:border-slate-300 transition-all cursor-default"
                            >
                                <div className="flex items-start justify-between mb-4">
                                    <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 group-hover:bg-red-50 group-hover:text-red-500 transition-colors">
                                        <FileText size={20} />
                                    </div>

                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                                                <MoreVertical size={16} />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end" className="w-48 rounded-xl shadow-xl border-slate-200">
                                            <DropdownMenuItem
                                                onClick={() => restoreMutation.mutate(blog._id)}
                                                className="gap-2 cursor-pointer py-2.5"
                                            >
                                                <RotateCcw size={14} className="text-blue-500" />
                                                <span>Restore Blog</span>
                                            </DropdownMenuItem>
                                            <DropdownMenuItem
                                                onClick={() => permanentDeleteMutation.mutate(blog._id)}
                                                className="gap-2 text-red-600 focus:text-red-600 focus:bg-red-50 cursor-pointer py-2.5"
                                            >
                                                <Trash2 size={14} />
                                                <span>Delete Permanently</span>
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>

                                <div className="space-y-2">
                                    <h3 className="font-normal text-slate-600 line-clamp-1 leading-tight tracking-tight text-lg group-hover:text-blue-600 transition-colors">
                                        {blog.title || "Untitled Document"}
                                    </h3>
                                    <p className="text-slate-500 text-sm line-clamp-2 leading-relaxed">
                                        {blog.content ? "Document contains content" : "No additional content."}
                                    </p>
                                </div>

                                <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                                    <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                                        <Clock size={12} />
                                        <span>Deleted {format(new Date(blog.updatedAt), "MMM d, yyyy")}</span>
                                    </div>

                                    <button
                                        onClick={() => restoreMutation.mutate(blog._id)}
                                        className="text-[11px] font-black text-blue-600 uppercase tracking-widest hover:text-blue-700 transition-colors"
                                    >
                                        Revert
                                    </button>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </AnimatePresence>

            {/* Warning Banner */}
            {trashBlogs.length > 0 && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="mt-12 flex items-center gap-3 p-4 bg-orange-50 border border-orange-100 rounded-md text-orange-700"
                >
                    <AlertCircle size={18} />
                    <p className="text-xs font-medium">
                        Items in the trash will not be automatically deleted yet. You can restore them at any time.
                    </p>
                </motion.div>
            )}
        </div>
    );
}
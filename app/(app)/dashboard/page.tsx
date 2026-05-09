'use client';

import { motion } from 'motion/react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';
import {
  Plus,
  FileText,
  LayoutDashboard,
  Clock,
  MoreVertical,
  Sparkles,
  ArrowRight,
  Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

export default function Dashboard() {
  const { data: session } = useSession();
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data: blogsResponse, isLoading } = useQuery({
    queryKey: ['blogs'],
    queryFn: async () => {
      const response = await axios.get(`${process.env.NEXT_PUBLIC_BLOG_URL}/blog/get-blogs?owned=true`, {
        headers: { Authorization: `Bearer ${session?.accessToken}` }
      });
      return response.data;
    },
    enabled: !!session?.accessToken,
  });

  const createBlogMutation = useMutation({
    mutationFn: async () => {
      const response = await axios.post("${process.env.NEXT_PUBLIC_BLOG_URL}/blog/create-blog", {
        title: "Untitled",
        content: "Untitled"
      }, {
        headers: { Authorization: `Bearer ${session?.accessToken}` }
      });
      return response.data;
    },
    onSuccess: (data) => {
      if (data?.success) {
        toast.success("Project created successfully");
        const blogId = data?.data?._id;
        queryClient.invalidateQueries({ queryKey: ['blogs'] });
        router.push(`/dashboard/${blogId}`);
      }
    },
    onError: (err) => {
      console.error(err);
      if (axios.isAxiosError(err) && err.response?.data) {
        toast.error(err.response.data.message || "Failed to create project");
      } else {
        toast.error("An error occurred while creating the project");
      }
    }
  });

  const blogs = blogsResponse?.data || [];
  const recentBlogs = [...blogs].sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()).slice(0, 3);

  const handleCreateNew = () => {
    createBlogMutation.mutate();
  };

  return (
    <div className="min-h-screen bg-neutral-50/50 dark:bg-neutral-950/50 p-6 md:p-10 lg:p-12">
      <div className="max-w-6xl mx-auto space-y-5">

        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-2"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100/50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400 text-sm font-medium mb-4">
              <Sparkles className="w-4 h-4" />
              <span>Workspace</span>
            </div>
            <h1 className="text-4xl font-semibold tracking-tight capitalize text-neutral-900 dark:text-neutral-50">
              Hi There{session?.user?.name ? `, ${session.user.name.split(' ')[0]}` : ''}.
            </h1>
            <p className="text-neutral-500 dark:text-neutral-400 text-sm">
              Here&apos;s what&apos;s happening with your projects today.
            </p>
          </motion.div>

        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-2"
        >

          <div
            onClick={handleCreateNew}
            className={`group block h-full ${createBlogMutation.isPending ? 'opacity-70 pointer-events-none' : ''}`}
          >
            <Card className="h-full border-dashed border  bg-transparent hover:bg-blue-50/50 dark:hover:bg-blue-950/20 hover:border-blue-300 dark:hover:border-blue-800 transition-all duration-300 cursor-pointer flex flex-col items-center justify-center py-12">

              <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                {createBlogMutation.isPending ? (
                  <Loader2 className="h-6 w-6 text-blue-600 dark:text-blue-400 animate-spin" />
                ) : (
                  <Plus className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                )}
              </div>
              <CardTitle className="text-lg text-neutral-700 dark:text-neutral-300">Blank Project</CardTitle>
              <p className="text-sm text-neutral-500 dark:text-neutral-500 mt-2 text-center px-6">
                Start from scratch with a new canvas.
              </p>
            </Card>
          </div>


        </motion.div>

        {/* Recent Documents Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="space-y-6"
        >
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-normal tracking-tight">Recent Files</h2>
          </div>

          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-md overflow-hidden">
            {isLoading ? (
              <div className="p-12 flex justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-neutral-400" />
              </div>
            ) : recentBlogs.length === 0 ? (
              <div className="p-12 flex flex-col items-center justify-center text-center">
                <div className="h-12 w-12 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center mb-4">
                  <FileText className="h-6 w-6 text-neutral-400" />
                </div>
                <h3 className="text-lg font-medium text-neutral-900 dark:text-neutral-100 mb-1">No projects yet</h3>
                <p className="text-neutral-500 max-w-sm mb-4">Create your first project to get started with your premium workspace.</p>
                <Button onClick={handleCreateNew} variant="outline" disabled={createBlogMutation.isPending}>
                  Create New Project
                </Button>
              </div>
            ) : (
              <div className="divide-y divide-neutral-100 dark:divide-neutral-800">
                {recentBlogs.map((blog: {
                  _id: string;
                  title: string;
                  updatedAt: string;
                }, idx: number) => {
                  const colors = [
                    'bg-blue-500/10 text-blue-500',
                    'bg-purple-500/10 text-purple-500',
                    'bg-emerald-500/10 text-emerald-500',
                    'bg-amber-500/10 text-amber-500',
                    'bg-rose-500/10 text-rose-500'
                  ];
                  const colorClass = colors[idx % colors.length];
                  const formattedTime = blog.updatedAt ? formatDistanceToNow(new Date(blog.updatedAt), { addSuffix: true }) : 'Recently';

                  return (
                    <div
                      key={blog._id}
                      onClick={() => router.push(`/dashboard/${blog._id}`)}
                      className="p-4 sm:px-6 flex items-center justify-between hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors group cursor-pointer"
                    >
                      <div className="flex items-center gap-4">
                        <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${colorClass}`}>
                          <FileText className="h-5 w-5" />
                        </div>
                        <div>
                          <h3 className="font-medium text-neutral-900 dark:text-neutral-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                            {blog.title || 'Untitled'}
                          </h3>
                          <div className="flex items-center gap-3 text-sm text-neutral-500 mt-1">
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {formattedTime}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100"
                          onClick={(e) => {
                            e.stopPropagation();
                            // Future: Add menu actions here
                          }}
                        >
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </motion.div>

      </div>
    </div>
  );
}
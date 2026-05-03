"use client";

import React, { useState } from 'react';
import {
    Share2,
    MoreHorizontal,
    Trash2,
    Star,
    ChevronRight,
    History,
    MessageSquare,
    Globe,
    Loader2
} from 'lucide-react';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { useAppDispatch, useAppSelector } from '@/store/hook';
import { useParams, useRouter } from 'next/navigation';
import { addToFavourites, moveToTrash, updatePost } from '@/store/slices/blogSlice';
import { toast } from 'sonner';
import { useMutation } from '@tanstack/react-query';
import axios from 'axios';
import { useSession } from 'next-auth/react';
import { ModeToggle } from '../../common/toggle-button';
import { DynamicBreadcrumbs } from '../../common/breadcrumbs';

const TOPICS = [
    { value: "system-design", label: "System Design" },
    { value: "frontend", label: "Frontend Development" },
    { value: "backend", label: "Backend Development" },
    { value: "frontend-system-design", label: "Frontend System Design" },
    { value: "backend-system-design", label: "Backend System Design" },
    { value: "devops", label: "DevOps & Infrastructure" },
    { value: "databases", label: "Databases" },
    { value: "ai-ml", label: "AI & Machine Learning" },
    { value: "open-source", label: "Open Source" },
    { value: "career", label: "Career & Growth" },
    { value: "web3", label: "Web3 & Blockchain" },
    { value: "security", label: "Security" },
];

export default function Navbar() {

    const {data:session} = useSession();
    const { currentBlogId, blogs, favourites } = useAppSelector((state) => state.blog);
    const blog = blogs.find((b) => String(b._id) === String(currentBlogId));
    const {id} = useParams();
    const [loading, setLoading] = useState(false);
    const [selectedTopic, setSelectedTopic] = useState<string>("");
    const dispatch = useAppDispatch();
    const [isPublished, setIsPublished] = useState(blogs.find((b) => String(b._id) === String(id))?.publish);
    const router = useRouter();

    const moveToTrashMutation = useMutation({
        mutationFn: async()=>{
            const response = await axios.delete(`http://localhost:8002/api/v1/blog/delete-blog/${id}`,{
                headers:{
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${session?.accessToken}`
                }
            });
            return response.data;
        },
        onSuccess:(data)=>{
            toast.success(data.message);
         
        },
        onError:(err)=>{
            if(axios.isAxiosError(err)){
                toast.error("Failed to move blog to trash");
                toast.error(err.response?.data.message);
            }
        }
    })

    const publishBlogMutation = useMutation({
        onMutate: () => {
            setLoading(true);
        },
        mutationFn: async()=>{
            const response = await axios.patch(`http://localhost:8002/api/v1/blog/make-public/${id}`,{
                topic: selectedTopic
            },{
                headers:{
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${session?.accessToken}`
                }
            });
           setIsPublished(!isPublished);
           dispatch(updatePost({_id:String(id), publish:!isPublished}))
           return response.data;
        },
        onSuccess:(data)=>{
            toast.success(data.message);
            setLoading(false);
        },
        onError:(err)=>{
            if(axios.isAxiosError(err)){
                toast.error("Failed to publish blog");
                toast.error(err.response?.data.message);
                setLoading(false);
            }
        }
    })

    const handleShare = async() => {
        try{
            await navigator.share({
                title: blog?.title,
                text: blog?.content,
                url: window.location.href,
            }) 
            toast.success("Blog shared successfully");
        }catch(e){
            console.log(e);
        } 
    }
    
    return (
        <nav className="h-14 border-b border-editorial-border bg-white/80 backdrop-blur-md flex items-center justify-between px-6 sticky top-0 z-30 p-3 dark:bg-black/80 dark:backdrop-blur-md">
            {/* Left: Breadcrumbs */}
            <div className="flex items-center gap-4">
                <DynamicBreadcrumbs lastSegmentTitle={blog?.title} />
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-1 ">
                <TooltipProvider>
                    <div className="flex items-center gap-1 border-r border-editorial-border pr-2 mr-2 dark:border-white">
                        {/* <div onClick={()=>{ 
                            dispatch(addToFavourites(Number(id))); 
                        }}>
                            <NavAction icon={<Star size={16} color={favourites.includes(Number(id))? "black" : "gray"}/>} tooltip="Favorite" />     
                        </div>   */}
                         <Tooltip>
                            <TooltipTrigger asChild>
                               <ModeToggle/>
                            </TooltipTrigger>
                            <TooltipContent side="bottom" className="bg-slate-900 text-white text-[10px]">
                                Change Theme
                            </TooltipContent>
                        </Tooltip>
                        <div>
                            <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <div className="cursor-pointer">
                                        <NavAction icon={<Globe size={16} />} tooltip={isPublished ? "Unpublish Blog" : "Publish Blog"} />
                                    </div>
                                </AlertDialogTrigger>
                                <AlertDialogContent className='rounded-sm'>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>Make blog {isPublished ? "private" : "public"}?</AlertDialogTitle>
                                        <AlertDialogDescription className='text-[13px]'>
                                            Are you sure you want to make your blog {isPublished ? "private" : "public"}? This will allow anyone to view your post.
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>

                                    {!isPublished && (
                                        <div className="py-2 space-y-2">
                                            <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                                                Select a topic
                                            </label>
                                            <Select value={selectedTopic} onValueChange={setSelectedTopic}>
                                                <SelectTrigger className="w-full rounded-sm bg-white dark:bg-neutral-900 border-editorial-border dark:border-neutral-800 h-[30px]">
                                                    <SelectValue placeholder="Select a topic" />
                                                </SelectTrigger>
                                                <SelectContent className="bg-white dark:bg-neutral-900 border-editorial-border dark:border-neutral-800 h-[200px] ">
                                                    {TOPICS.map((topic) => (
                                                        <SelectItem key={topic.value} value={topic.value} className="cursor-pointer">
                                                            {topic.label}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    )}
                                    <AlertDialogFooter>
                                        <AlertDialogCancel className='cursor-pointer rounded-sm font-normal'>Cancel</AlertDialogCancel>
                                        <AlertDialogAction className='cursor-pointer rounded-sm' onClick={() => {
                                            publishBlogMutation.mutate();
                                        }}>
                                            {loading ? <Loader2 className='animate-spin' size={18}/> : isPublished ? "Unpublish" : "Publish"}
                                        </AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        </div>
                        <div onClick={()=>{document.getElementById("comments")?.scrollIntoView({behavior: "smooth"});}}>
                        <NavAction icon={<MessageSquare size={16} />} tooltip="Click here to view comments" />
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <Button
                            variant="ghost"
                            size="sm"
                            className="text-xs font-medium text-editorial-secondary hover:text-editorial-text hover:bg-editorial-hover h-8 px-3 transition-all cursor-pointer"
                            onClick={handleShare}
                        >
                            <Share2 size={14} className="mr-2" />
                            Share
                        </Button>

                       

                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-editorial-muted hover:text-red-600 hover:bg-red-50 transition-all cursor-pointer"
                                    onClick={()=>{
                                        dispatch(moveToTrash((id)));
                                        moveToTrashMutation.mutate();
                                    }}
                                >
                                    <Trash2 size={16}  />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent side="bottom" className="bg-slate-900 text-white text-[10px]">
                                Move to trash
                            </TooltipContent>
                        </Tooltip>

                        {/* <NavAction icon={<MoreHorizontal size={16} />} tooltip="More options" /> */}
                    </div>
                </TooltipProvider>
            </div>
        </nav>
    );
}

function NavAction({ icon, tooltip }: { icon: React.ReactNode; tooltip: string }) {
    return (
        <Tooltip>
            <TooltipTrigger asChild>
                <button className="p-2 text-editorial-muted hover:text-editorial-text hover:bg-editorial-hover rounded-md transition-all cursor-pointer dark:text-white dark:border-white dark:hover:bg-gray-700">
                    {icon}
                </button>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="bg-slate-900 text-white text-[10px]">
                {tooltip}
            </TooltipContent>
        </Tooltip>
    );
}

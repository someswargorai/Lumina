import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Bell, Rocket, Menu } from "lucide-react";
import { useSession } from "next-auth/react";
import { ModeToggle } from "./toggle-button";

import { DynamicBreadcrumbs } from "./breadcrumbs";
import { useEffect } from "react";
import io from "socket.io-client";
import { toast } from "sonner";
import { useAppDispatch, useAppSelector } from "@/store/hook";
import { setNotifications } from "@/store/slices/notificationSlice";

export default function Navbar({ onMobileSidebarOpen }: { onMobileSidebarOpen?: () => void }) {
    const { data: session } = useSession();
    const dispatch = useAppDispatch();
    const {notifications} = useAppSelector((state)=>state.notification);

    useEffect(() => {
       
        if (!session?.accessToken || !session?.id) return;

        const socket = io("http://localhost:8002", {
            autoConnect: false,
            auth: {
                token: session.accessToken,
                userId: session.id,
            },
        });

        socket.connect();

        socket.on("notification", (data) => {
            console.log(data);
            // toast.info(`New blog published: ${data.data.title}`);
            dispatch(setNotifications(data));
        });

        socket.on("connect_error", (err) => {
            console.error("Socket error:", err.message);
        });

        return () => {
            socket.off("notification");
            socket.disconnect();
        };

}, [session?.accessToken, session?.id]);

    return (
        <header className="sticky top-0 z-50 h-16 w-full border-b border-slate-200 bg-white/80 backdrop-blur-md px-6 flex items-center justify-between shrink-0 dark:bg-background dark:border-amber-50 dark:text-white">
            <div className="flex items-center gap-4">

                {/* Mobile sidebar trigger — only visible on < lg */}
                <button
                    onClick={onMobileSidebarOpen}
                    className="lg:hidden p-2 rounded-md text-slate-500 hover:text-slate-900 hover:bg-slate-100 dark:text-neutral-400 dark:hover:text-white dark:hover:bg-white/10 transition-all"
                    aria-label="Open sidebar"
                >
                    <Menu size={20} />
                </button>

                <div className="hidden md:block">
                    <DynamicBreadcrumbs />
                </div>
            </div>

            <div className="flex items-center gap-4">

                {/* Global Action Icons */}
                <div className="flex items-center gap-1 border-slate-100 px-2">
                    <Popover>
                        <PopoverTrigger asChild>
                            <button className="p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-50 dark:hover:text-slate-100 dark:hover:bg-slate-800 rounded-md transition-all relative">
                                <Bell size={20} />
                                {notifications && notifications.length > 0 && (
                                    <span className="absolute top-2 right-2.5 h-2 w-2 rounded-full border-2 border-white dark:border-background bg-blue-600"></span>
                                )}
                            </button>
                        </PopoverTrigger>
                        <PopoverContent align="end" className="w-80 p-0">
                            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 dark:border-slate-800">
                                <h3 className="font-semibold text-sm">Notifications</h3>
                                {notifications && notifications.length > 0 && (
                                    <span className="text-xs bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full ">
                                        {notifications.length} new
                                    </span> 
                                )}
                            </div>
                            <ScrollArea className="h-80">
                                {notifications && notifications.length > 0 ? (
                                    <div className="flex flex-col">
                                        {notifications.map((notif: any, i: number) => (
                                            <div key={i} className="px-4 py-3 border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer text-sm">
                                                <p className="font-medium text-slate-900 dark:text-slate-100">{notif?.data?.title || 'New Notification'}</p>
                                                <p className="text-xs text-slate-500 mt-1 line-clamp-2">{notif?.message || notif?.data?.message || 'A new blog has been published.'}</p>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center justify-center h-full p-6 text-center mt-10">
                                        <Bell className="h-8 w-8 text-slate-200 dark:text-slate-700 mb-2" />
                                        <p className="text-sm font-medium text-slate-900 dark:text-slate-100">No notifications</p>
                                        <p className="text-xs text-slate-500 mt-1">You&apos;re all caught up!</p>
                                    </div>
                                )}
                            </ScrollArea>
                        </PopoverContent>
                    </Popover>

                    <ModeToggle />
                </div>

                {/* CTA/Profile */}
                <div className="flex items-center gap-3">
                    <button className="hidden lg:flex items-center gap-2 bg-black text-white dark:bg-white dark:text-black px-3.5 py-2 rounded-sm text-sm font-medium tracking-wide hover:bg-black/90 dark:hover:bg-gray-100 transition-all active:scale-95 shadow-[1px_2px_2px_0px_#84361140] dark:shadow-none cursor-pointer ease-linear duration-200">
                        <Rocket size={16} className="text-white dark:text-black" />
                        <span className="flex items-center justify-center gap-2.5 h-full w-full rounded transition-colors ease-linear text-white dark:text-black">Upgrade Plan</span>
                    </button>
                    <div className="h-8 w-8 rounded-full border border-slate-200 bg-slate-100 overflow-hidden cursor-pointer ring-offset-2 hover:ring-2 hover:ring-blue-500 transition-all">
                        <Avatar>
                            <AvatarImage
                                src={""}
                                alt="profile"
                                className="h-full w-full"
                            />
                            <AvatarFallback>
                                <span>{session?.user?.name?.charAt(0).toUpperCase()}</span>
                            </AvatarFallback>
                        </Avatar>
                    </div>
                </div>
            </div>
        </header>
    );
}

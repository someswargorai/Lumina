import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {  Bell, Rocket, Menu } from "lucide-react";
import { useSession } from "next-auth/react";
import { ModeToggle } from "./toggle-button";

import { DynamicBreadcrumbs } from "./breadcrumbs";

export default function Navbar({ onMobileSidebarOpen }: { onMobileSidebarOpen?: () => void }) {
    const { data: session } = useSession();

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
                    <button className="p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-50 rounded-md transition-all relative">
                        <Bell size={20} />
                        <span className="absolute top-2 right-2.5 h-2 w-2 rounded-full border-2 border-white bg-blue-600"></span>
                    </button>

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

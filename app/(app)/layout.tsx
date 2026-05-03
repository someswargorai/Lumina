"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Sidebar from "./common/app-sidebar";
import Navbar from "./common/navbar";
import { usePathname } from "next/navigation";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "next-themes";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { useState } from "react";

const queryClient = new QueryClient();

export default function AppLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

    return (
        <QueryClientProvider client={queryClient}>
            <ThemeProvider attribute="class"
                defaultTheme="system"
                enableSystem
                disableTransitionOnChange>
                <TooltipProvider>
                    <div className="flex h-screen overflow-hidden">
                        {/* Desktop sidebar — hidden on small screens */}
                        <div className="hidden lg:flex w-64">
                            <Sidebar />
                        </div>

                        {/* Mobile sidebar — rendered in a Sheet */}
                        <Sheet open={mobileSidebarOpen} onOpenChange={setMobileSidebarOpen}>
                            <SheetContent side="left" className="p-0 w-64 dark:bg-black">
                                <Sidebar />
                            </SheetContent>
                        </Sheet>

                        <div className="flex-1 flex flex-col min-w-0">
                            {!pathname?.includes("/dashboard") && <Navbar onMobileSidebarOpen={() => setMobileSidebarOpen(true)} />}
                            <ScrollArea className="flex-1 overflow-y-auto bg-white dark:bg-black dark:border-white dark:text-white">
                                <div className="max-w-8xl mx-auto">
                                    {children}
                                </div>
                            </ScrollArea>
                        </div>
                    </div>
                </TooltipProvider>
            </ThemeProvider>
        </QueryClientProvider>
    );
}
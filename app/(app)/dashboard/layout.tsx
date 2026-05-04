"use client";

import { ScrollArea } from "@/components/ui/scroll-area";


export default function DashboardLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
   

    return (
        <div className="flex flex-col h-screen">
            <ScrollArea className="flex-1 overflow-y-auto p-0 md:p-6 ">
                {children}
            </ScrollArea>
        </div>
    );
}
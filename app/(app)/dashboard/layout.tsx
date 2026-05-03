import { ScrollArea } from "@/components/ui/scroll-area";
import Navbar from "./components/Navbar";


export default function DashboardLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <div className="flex flex-col h-screen">
            <Navbar/>
            <ScrollArea className="flex-1 overflow-y-auto p-6">
                {children}
            </ScrollArea>
        </div>
    );
}
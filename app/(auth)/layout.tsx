import { Toaster } from "@/components/ui/sonner";
import Footer from "../components/footer";
import Navbar from "../components/navbar";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
    return (
        <main className="min-h-screen bg-slate-50 flex flex-col">
            <Navbar />
            <div className="flex flex-col items-center justify-center flex-1 px-4">
                <Toaster />
                    <div className="w-full">
                        {children}
                    </div>
                </div>
                <Footer />
        </main>
    );
}
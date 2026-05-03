import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function Navbar() {
    return (
        <nav className="flex justify-between items-center px-10 md:px-20 xl:px-46 py-3 border border-b sticky top-0 z-50 backdrop-blur-lg bg-white/70"> 

            <ul className="flex gap-4 items-center justify-start">
                <span className="logo text-2xl font-bold uppercase text-black"><Link href="/">Lumina</Link></span>
                <li className="text-gray-600 hidden md:block"><a href="#features">Features</a></li>
                <li className="text-gray-600 hidden md:block"><a href="#marketplace">Marketplace</a></li>
                <li className="text-gray-600 hidden md:block"><a href="#pricing">Pricing</a></li>
                <li className="text-gray-600 hidden md:block"><a href="#resources">Resources</a></li>
            </ul>   
            <div className="gap-2 flex">
                <Link href="/login"><Button variant="outline" className="cursor-pointer border-none bg-transparent text-md text-gray-600 hidden md:block">Start Writing</Button></Link>
                <Link href="/login"><Button variant="outline" className="cursor-pointer bg-black text-white rounded-full"><span className="text-sm pb-0.5">Try Lumina Pro</span></Button></Link>
            </div>
        </nav>
    );
}
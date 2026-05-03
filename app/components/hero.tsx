"use client";

import { ArrowRight,  Sparkles } from "lucide-react";
import {motion} from 'framer-motion';
import Link from "next/link";

export default function Hero() {
    
    return (
        <section className="text-center py-20 px-2 md:px-20 lg:px-36 xl:px-46 flex flex-col items-center">
            <div>
                <span className="uppercase px-4 rounded-full bg-blue-50 text-blue-600 text-[11px] py-1.5 font-bold flex items-center gap-2 justify-center w-fit mx-auto"><Sparkles className="animate-star size-4 transition-all duration-300"/> Empowering Modern Storytellers</span>
                <motion.div initial={{opacity: 0, y: 20}} animate={{opacity: 1, y: 0}} transition={{duration: 1}} className="py-7">
                    <p className="serif mx-auto max-w-4xl text-5xl font-bold tracking-tight text-slate-950 sm:text-7xl lg:text-8xl text-balance">
                        Where words find
                        <span className="block">
                            their <span className="text-blue-700 italic tracking-[-0.3rem]">truest</span> form
                        </span>
                    </p>

                    <p className="text-gray-500 py-6 text-xl leading-relaxed">
                        Lumina is the high-end platform for writers who demand elegance.
                        <span className="block">
                            Craft beautiful narratives with distraction-free tools and a community
                        </span>
                        <span className="block">
                            that values quality.
                        </span>
                    </p>
                </motion.div>
                <div className="flex justify-center gap-2">
                    <Link href={"/login"} className="group flex py-3 items-center gap-2 rounded-full bg-slate-900 px-4 md:px-10  text-white hover:bg-slate-800 hover:shadow-xl hover:shadow-slate-200 cursor-pointer transition-all duration-300 font-semibold text-base text-[12px] md:text-[15px]">Create <span className="hidden md:block">your </span>publication <ArrowRight className="transition-all duration-300 group-hover:translate-x-1 hidden md:block"/></Link>

                    <button className="bg-white px-4 py-2 rounded-full border font-semibold cursor-pointer  transition-all duration-300 hover:bg-slate-100">Browse the library</button>
                </div>
            </div>
        </section>
    );
}
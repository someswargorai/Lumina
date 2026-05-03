"use client";
import { CheckCircle2, Play } from "lucide-react";
import {motion} from "framer-motion";
import Image from "next/image";

export default function Demo() {
    return (
        <section className="py-24 overflow-hidden">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
              >
                <h2 className="serif text-4xl font-bold text-slate-950 sm:text-5xl leading-tight">
                  Design for the <br />
                  <span className="text-blue-600">discerning reader.</span>
                </h2>
                <p className="mt-6 text-lg text-slate-600 leading-relaxed">
                  Lumina&apos;s interface is built on the principle of &quot;Zen Writing.&quot; 
                  No distractions, just you and your canvas. Every font-size, line-height, and margin is mathematically optimized for focus.
                </p>
                <ul className="mt-10 space-y-4">
                  {[
                    'Dynamic scale typography for all devices',
                    'Automatic dark-mode optimization',
                    'Zero-latency real-time collaboration',
                    'One-click multi-platform export'
                  ].map((item) => (
                    <li key={item} className="flex items-center gap-3 text-slate-700 font-medium">
                      <CheckCircle2 className="h-5 w-5 text-blue-600" />
                      {item}
                    </li>
                  ))}
                </ul>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                className="relative"
              >
                <div className="relative w-[250px] h-[250px] md:w-[575px] md:h-[300px] bg-slate-100 shadow-2xl overflow-hidden border border-slate-200 group">

                  <Image
                    src="/demo.png" 
                    alt="Lumina Interface" 
                    fill
                    className="w-full h-full object-cover transition-transform duration-700"
                    loading="eager"
                    fetchPriority="high"
                  />
                  <div className="absolute inset-0 bg-slate-950/20 flex items-center justify-center">
                    <button className="h-20 w-20 rounded-full bg-white flex items-center justify-center shadow-2xl hover:scale-110 transition-transform cursor-pointer">
                      <Play className="h-8 w-8 text-blue-600 fill-blue-600 ml-1 " />
                    </button>
                  </div>
                </div>
                
                <div className="absolute -bottom-6 -right-6 hidden md:block w-48 rounded-2xl bg-white p-4 shadow-xl border border-slate-100">
                  <div className="flex gap-2 items-center mb-2">
                    <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Live Now</span>
                  </div>
                  <div className="h-3 w-3/4 bg-slate-100 rounded mb-2"></div>
                  <div className="h-2 w-1/2 bg-slate-100 rounded"></div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

    );
}

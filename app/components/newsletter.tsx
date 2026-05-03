"use client";

import { motion } from 'motion/react';
import { Send } from 'lucide-react';

export default function Newsletter() {
  return (
    <section className="mx-auto max-w-7xl px-2 py-20 sm:px-6 lg:px-8">
      <div className="relative overflow-hidden rounded-[1rem] bg-slate-950 px-8 py-20 text-center shadow-2xl">
        <div className="absolute -top-24 -left-24 h-64 w-64 rounded-full bg-blue-600/20 blur-3xl"></div>
        <div className="absolute -bottom-24 -right-24 h-64 w-64 rounded-full bg-purple-600/20 blur-3xl"></div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1}}
          className="relative z-10"
        >
          <h2 className="serif text-4xl font-bold text-white md:text-5xl">
            Ready to start writing?
          </h2>
          <p className="mt-6 text-lg text-slate-400 max-w-2xl mx-auto">
            Join 50,000+ creators who have already built their digital legacy with Lumina. 
            Start your 14-day free trial today.
          </p>
          
          <form className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4 max-w-lg mx-auto">
            <input 
              type="email" 
              placeholder="Enter your email"
              className="w-full rounded-full bg-white/10 px-6 py-4 text-white placeholder-slate-500 outline-none ring-1 ring-white/20 focus:ring-white/40 transition-all"
            />
            <button className="flex w-full sm:w-auto items-center justify-center gap-2 rounded-full bg-white px-8 py-4 font-bold text-slate-950 hover:bg-slate-200 transition-colors whitespace-nowrap cursor-pointer">
              Start Free Trial <Send className="h-4 w-4 transition-all duration-300 hover:translate-x-1.5 hover:-translate-y-1.5" />
            </button>
          </form>
          <p className="mt-4 text-xs text-slate-500">
            No credit card required. Cancel anytime.
          </p>
        </motion.div>
      </div>
    </section>
  );
}

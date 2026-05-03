"use client";

import { motion } from 'motion/react';
import Image from 'next/image';

export default function Testimonial() {

    return (
        <section className="py-24 bg-white relative overflow-hidden border-t border-slate-100">
            <div className="mx-auto max-w-4xl px-4 text-center">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                >
                    <span className="text-blue-600 font-bold text-sm tracking-widest uppercase mb-8 block">Words from the visionaries</span>
                    <blockquote className="serif text-3xl font-medium text-slate-900 md:text-5xl leading-tight">
                        &apos;We spent years looking for a platform that respected the craft of writing as much as we do. Lumina is that platform.&apos;
                    </blockquote>
                    <div className="mt-12 flex flex-col items-center gap-4">
                        <Image
                            src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=facearea&facepad=3&w=256&h=256&q=80"
                            alt="Testimonial"
                            width={100}
                            height={100}
                            className="h-16 w-16 rounded-full border-4 border-slate-50 shadow-lg"
                        />
                        <div>
                            <div className="text-lg font-bold text-slate-950">Dr. Elias Sterling</div>
                            <div className="text-sm font-medium text-slate-500 italic">Editor-in-Chief, Paradigm Magazine</div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </section>
    )
}
"use client";

import { useState } from "react";
import Form1 from "./components/Form1";
import Form2 from "./components/Form2";
import Form3 from "./components/Form3";
import Form4 from "./components/Form4";
import { Check } from "lucide-react";
import { RegistrationData } from "./types";
import { AnimatePresence } from "motion/react";
import { motion } from "framer-motion";

const steps = [
    { id: 1, title: 'Basic Information', label: 'Step 1' },
    { id: 2, title: 'Your Location', label: 'Step 2' },
    { id: 3, title: 'Public Profile', label: 'Step 3' },
    { id: 4, title: 'Security Check', label: 'Step 4' }
];

export default function Register() {
    const [data, setData] = useState<RegistrationData>({
        step: 1,
        basicInfo: { name: '', email: '', password: '' },
        location: { country: 'India', state: '', city: '' },
        profile: { username: '', bio: '', interests: [] },
        verification: { otp: '' }
    });
    const [step, setStep] = useState<1 | 2 | 3 | 4>(1);



    return (
        <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4 md:p-8 font-sans antialiased text-slate-900">
            <div className="w-full max-w-5xl h-[700px] bg-white rounded-3xl overflow-hidden flex step-card-shadow border border-slate-200">
                <aside className="hidden md:flex w-1/3 bg-slate-900 p-10 flex-col justify-between border-r border-slate-800">
                    <div className="space-y-8">
                        <div>
                            <h1 className="text-white text-3xl font-serif italic tracking-tight">Lumina</h1>
                            <p className="text-slate-400 text-xs mt-2 font-medium uppercase tracking-[0.2em]">Registration</p>
                        </div>

                        <nav className="space-y-6">
                            {steps.map((s) => (
                                <div
                                    key={s.id}
                                    className={`flex items-center gap-4 transition-all duration-500 ${step < s.id ? 'opacity-40' : 'opacity-100'}`}
                                >
                                    <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center font-bold text-xs transition-colors duration-300 ${step > s.id
                                        ? 'border-emerald-500 bg-emerald-500/10 text-emerald-500'
                                        : step === s.id
                                            ? 'border-white bg-white text-slate-900'
                                            : 'border-slate-500 text-slate-500'
                                        }`}>
                                        {data.step > s.id ? <Check size={14} strokeWidth={3} /> : s.id}
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{s.label}</p>
                                        <p className={`font-medium text-sm transition-colors ${data.step === s.id ? 'text-white' : 'text-slate-300'}`}>
                                            {s.title}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </nav>
                    </div>

                    <div className="text-slate-500 text-xs leading-relaxed italic pr-4">
                        &apos;Your stories deserve a home that knows exactly where they&apos;re coming from.&apos;
                    </div>
                </aside>

                <main className="flex-1 overflow-y-auto p-8 md:p-14 flex flex-col items-center justify-center relative">
                    <div className="max-w-md w-full mx-auto">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={data.step}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                transition={{ duration: 0.4, ease: "easeOut" }}
                                className="w-full"
                            >
                                {step === 1 && <Form1 setStep={setStep}/>}
                                {step === 2 && <Form2 setStep={setStep}/>}
                                {step === 3 && <Form3 setStep={setStep}/>}
                                {step === 4 && <Form4 setStep={setStep}/>}
                            </motion.div>
                        </AnimatePresence>
                    </div>
                </main>
            </div>
        </div>
    );
}
"use client";

import React, { useEffect, useState } from 'react';
import { BlockNoteView } from "@blocknote/mantine";
import "@blocknote/mantine/style.css";
import { useCreateBlockNote } from "@blocknote/react";
import { motion } from 'motion/react';
import { Save, Info } from 'lucide-react';
import { MantineProvider } from '@mantine/core';
import "@mantine/core/styles.css";
import { getFromCookies, saveToCookies } from '@/utils/cookie';
import { ScrollArea } from '@/components/ui/scroll-area';

const COOKIE_NAME = 'lumina_editor_content';

function Editor({ initialContent, setIsSaved }: { initialContent: string | null | undefined, setIsSaved: (saved: boolean) => void }) {
    const editor = useCreateBlockNote({
        initialContent: typeof initialContent === "string" ? JSON.parse(initialContent) : initialContent, 
    });

    return (
        <MantineProvider>
            <BlockNoteView
                editor={editor}
                theme="light"
                onChange={async () => {
                    const content = JSON.stringify(editor.document);
                    await saveToCookies(COOKIE_NAME, content);
                    setIsSaved(true);
                    setTimeout(() => setIsSaved(false), 2000);
                }}
            />
        </MantineProvider>
    );
}

export default function EditorSection() {

    const [isSaved, setIsSaved] = useState(false);
    const [initialContent, setInitialContent] = useState<string | undefined | "loading">("loading");



    useEffect(() => {
        const initialLoad = async () => {
            try {
                const content = await getFromCookies(COOKIE_NAME);
                if (content) {
                    const parsed = JSON.parse(content);
                    // Handle potential double stringification if they used the app before we fixed utils/cookie.ts
                    setInitialContent(typeof parsed === "string" ? JSON.parse(parsed) : parsed);
                } else {
                    setInitialContent(undefined);
                }
            } catch (error) {
                console.error("Failed to parse initial content", error);
                setInitialContent(undefined);
            }
        };


        initialLoad();
    }, []);

    return (
        <section className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
            <div className="mb-12 flex flex-col lg:flex-row lg:items-end justify-between gap-6">
                <div>
                    <motion.div
                        initial={{ opacity: 0, x: -10 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        className="mb-4 inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-600 uppercase tracking-tighter"
                    >
                        Live Demo
                    </motion.div>
                    <h2 className="serif text-4xl font-bold text-slate-950 sm:text-5xl">
                        Experience the editor.
                    </h2>
                    <p className="mt-4 text-slate-600 max-w-xl">
                        Type anything below. This is an interactive block-based editor. Your progress is automatically saved to your browser&apos;s cookies.
                    </p>
                </div>

                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-slate-100 text-xs font-medium text-slate-500">
                        {isSaved ? (
                            <motion.span
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="text-green-600 flex items-center gap-1"
                            >
                                <Save className="h-3 w-3" /> All changes saved
                            </motion.span>
                        ) : (
                            <span className="flex items-center gap-1">
                                <Info className="h-3 w-3" /> Auto-saving to cookies
                            </span>
                        )}
                    </div>
                </div>
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="relative min-h-[400px] rounded-3xl border border-slate-200 bg-white shadow-xl shadow-slate-100 overflow-hidden"
            >
                <div className="border-b border-slate-100 bg-slate-50/50 px-6 py-3 flex items-center justify-between">
                    <div className="flex gap-1.5">
                        <div className="h-2.5 w-2.5 rounded-full bg-slate-300"></div>
                        <div className="h-2.5 w-2.5 rounded-full bg-slate-300"></div>
                        <div className="h-2.5 w-2.5 rounded-full bg-slate-300"></div>
                    </div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Untitled Draft</span>
                    <div className="w-10"></div>
                </div>

                <ScrollArea className="p-4 md:p-8 h-[400px] overflow-auto">
                    {initialContent === "loading" ? (
                        <div className="flex h-[200px] items-center justify-center text-sm text-slate-500">
                            Loading editor...
                        </div>
                    ) : (
                        <Editor initialContent={initialContent} setIsSaved={setIsSaved} />
                    )}
                </ScrollArea>
            </motion.div>
        </section>
    );
}

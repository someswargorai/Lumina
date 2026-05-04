"use client";

import { Block } from "@blocknote/core";
import "@blocknote/core/fonts/inter.css";
import { BlockNoteView } from "@blocknote/mantine";
import "@blocknote/mantine/style.css";
import { useCreateBlockNote, } from "@blocknote/react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { useSession } from "next-auth/react";
import { useTheme } from "next-themes";
import { useRef } from "react";
import { toast } from "sonner";
import "@blocknote/xl-ai/style.css";

interface EditorProps {
    id: string;
    initialContent?: Block[];
    disabled?: boolean;
}

export default function Editor({ id, initialContent, disabled }: EditorProps) {
    const { data: session } = useSession();
    const queryClient = useQueryClient();
    const debounceRef = useRef<NodeJS.Timeout | null>(null);

    const editor = useCreateBlockNote({
        initialContent: Array.isArray(initialContent)
            ? initialContent
            : [
                {
                    type: "paragraph",
                    content: typeof initialContent === "string" ? initialContent : "Start writing...",
                },
            ]
    });

    const updateBlog = useMutation({
        mutationFn: async (blocks: Block[]) => {
            const response = await axios.put(`http://localhost:8002/api/v1/blog/update-blog/${id}`, {
                content: blocks
            }, {
                headers: {
                    Authorization: `Bearer ${session?.accessToken}`
                }
            });
            return response.data;
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['blog'] });
            // Optional: toast.success("Saved");
        },
        onError: (err) => {
            if (axios.isAxiosError(err)) {
                toast.error(err.response?.data?.message || "Failed to save");
            }
        }
    });

    const handleSaveDocs = (docs: Block[]) => {
        if (debounceRef.current) {
            clearTimeout(debounceRef.current);
        }

        debounceRef.current = setTimeout(() => {
            updateBlog.mutate(docs);
        }, 3000); // 3 second debounce
    };

    const { theme } = useTheme();

    return (
        <div className="wrapper">
            <div className="item">
                <BlockNoteView
                    editor={editor}
                    theme={theme === 'dark' ? 'dark' : 'light'}
                    onChange={() => {
                        handleSaveDocs(editor.document);
                    }}
                    editable={!disabled}
                />
            </div>
        </div>
    );
}

'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import Typography from '@tiptap/extension-typography';
import { useEffect } from 'react';
import { cn } from '@/lib/utils';

interface RichTextEditorProps {
    content: string;
    onChange: (html: string) => void;
    placeholder?: string;
    className?: string;
    autofocus?: boolean;
}

export function RichTextEditor({
    content,
    onChange,
    placeholder = 'Write something...',
    className,
    autofocus = false,
}: RichTextEditorProps) {
    const editor = useEditor({
        extensions: [
            StarterKit,
            Typography,
            Placeholder.configure({
                placeholder,
            }),
        ],
        content,
        onUpdate: ({ editor }) => {
            onChange(editor.getHTML());
        },
        editorProps: {
            attributes: {
                class: cn(
                    'prose prose-sm sm:prose-base dark:prose-invert max-w-none focus:outline-none min-h-[1em]',
                    className
                ),
            },
        },
        autofocus: autofocus ? 'end' : false,
        immediatelyRender: false, // Critical for Next.js SSR
    });

    // Sync content if it changes externally (e.g. undo/redo from parent or initial load)
    useEffect(() => {
        if (editor && content !== editor.getHTML()) {
            // Only update if content is significantly different to avoid cursor jumps
            // A simple check: if editor is empty and content provided, or completely different.
            // But for real-time typing, we shouldn't update from props usually.
            // This is mainly for initial load or external resets.
            if (editor.getText() === '' && content) {
                editor.commands.setContent(content);
            }
        }
    }, [content, editor]);

    if (!editor) {
        return null;
    }

    return <EditorContent editor={editor} />;
}

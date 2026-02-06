'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import Typography from '@tiptap/extension-typography';
import { Button } from '@/components/ui/button';
import {
    Bold,
    Italic,
    List,
    ListOrdered,
    Heading1,
    Heading2,
    Heading3,
    Quote,
    Undo,
    Redo,
    Code
} from 'lucide-react';

interface EditorProps {
    content?: any;
    onChange: (content: any) => void;
    editable?: boolean;
}

export function Editor({ content, onChange, editable = true }: EditorProps) {
    const editor = useEditor({
        extensions: [
            StarterKit,
            Typography,
            Placeholder.configure({
                placeholder: 'Start writing...',
            }),
        ],
        content: content || '',
        editable,
        onUpdate: ({ editor }) => {
            onChange(editor.getJSON());
        },
        editorProps: {
            attributes: {
                class: 'prose prose-invert max-w-none focus:outline-none min-h-[300px] p-4',
            },
        },
        immediatelyRender: false,
    });

    if (!editor) {
        return null;
    }

    return (
        <div className="flex flex-col border border-white/10 rounded-xl overflow-hidden bg-white/[0.02]">
            {/* Toolbar */}
            {editable && (
                <div className="flex items-center gap-1 p-2 border-b border-white/5 bg-white/5 flex-wrap">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => editor.chain().focus().toggleBold().run()}
                        className={editor.isActive('bold') ? 'bg-white/10 text-white' : 'text-white/40 hover:text-white'}
                        title="Bold (Cmd+B)"
                    >
                        <Bold className="w-4 h-4" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => editor.chain().focus().toggleItalic().run()}
                        className={editor.isActive('italic') ? 'bg-white/10 text-white' : 'text-white/40 hover:text-white'}
                        title="Italic (Cmd+I)"
                    >
                        <Italic className="w-4 h-4" />
                    </Button>
                    <div className="w-px h-6 bg-white/10 mx-1" />
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                        className={editor.isActive('heading', { level: 1 }) ? 'bg-white/10 text-white' : 'text-white/40 hover:text-white'}
                        title="Heading 1"
                    >
                        <Heading1 className="w-4 h-4" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                        className={editor.isActive('heading', { level: 2 }) ? 'bg-white/10 text-white' : 'text-white/40 hover:text-white'}
                        title="Heading 2"
                    >
                        <Heading2 className="w-4 h-4" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
                        className={editor.isActive('heading', { level: 3 }) ? 'bg-white/10 text-white' : 'text-white/40 hover:text-white'}
                        title="Heading 3"
                    >
                        <Heading3 className="w-4 h-4" />
                    </Button>
                    <div className="w-px h-6 bg-white/10 mx-1" />
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => editor.chain().focus().toggleBulletList().run()}
                        className={editor.isActive('bulletList') ? 'bg-white/10 text-white' : 'text-white/40 hover:text-white'}
                        title="Bullet List"
                    >
                        <List className="w-4 h-4" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => editor.chain().focus().toggleOrderedList().run()}
                        className={editor.isActive('orderedList') ? 'bg-white/10 text-white' : 'text-white/40 hover:text-white'}
                        title="Ordered List"
                    >
                        <ListOrdered className="w-4 h-4" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => editor.chain().focus().toggleBlockquote().run()}
                        className={editor.isActive('blockquote') ? 'bg-white/10 text-white' : 'text-white/40 hover:text-white'}
                        title="Quote"
                    >
                        <Quote className="w-4 h-4" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => editor.chain().focus().toggleCodeBlock().run()}
                        className={editor.isActive('codeBlock') ? 'bg-white/10 text-white' : 'text-white/40 hover:text-white'}
                        title="Code Block"
                    >
                        <Code className="w-4 h-4" />
                    </Button>
                    <div className="w-px h-6 bg-white/10 mx-1" />
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => editor.chain().focus().undo().run()}
                        disabled={!editor.can().undo()}
                        className="text-white/40 hover:text-white disabled:opacity-30"
                        title="Undo (Cmd+Z)"
                    >
                        <Undo className="w-4 h-4" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => editor.chain().focus().redo().run()}
                        disabled={!editor.can().redo()}
                        className="text-white/40 hover:text-white disabled:opacity-30"
                        title="Redo (Cmd+Shift+Z)"
                    >
                        <Redo className="w-4 h-4" />
                    </Button>
                </div>
            )}

            <EditorContent editor={editor} className="flex-1 overflow-y-auto" />

            <style jsx global>{`
                .ProseMirror p.is-editor-empty:first-child::before {
                    color: rgba(255,255,255,0.3);
                    content: attr(data-placeholder);
                    float: left;
                    height: 0;
                    pointer-events: none;
                }
            `}</style>
        </div>
    );
}

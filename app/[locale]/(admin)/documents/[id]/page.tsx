'use client';

import { useState, useRef, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Document } from '@/domain/documents/types';
import { documentsService } from '@/domain/documents/services/documents-service';
import { Editor } from '@/components/documents/Editor';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Save, Loader2, Check } from 'lucide-react';
import { Link, useRouter } from '@/i18n/routing';
import { toast } from 'sonner';

export const dynamic = 'force-dynamic';

export default function DocumentEditPage({ params: { locale, id } }: { params: { locale: string; id: string } }) {
    console.log('Rendering DocumentEditPage', id);
    const router = useRouter();
    const [title, setTitle] = useState('');
    const [content, setContent] = useState<any>(null);
    const [isSaving, setIsSaving] = useState(false);
    const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    const { data: doc, isLoading, error } = useQuery<Document>({
        queryKey: ['document', id],
        queryFn: async () => {
            console.log('Fetching document...', id);
            try {
                const d = await documentsService.get(id);
                console.log('Document fetched:', d);
                setTitle(d.title);
                setContent(d.content);
                return d;
            } catch (err) {
                console.error('Error fetching document:', err);
                throw err;
            }
        },
    });

    if (error) {
        console.error('Query error:', error);
    }

    const updateMutation = useMutation({
        mutationFn: (data: { title?: string; content?: any }) => documentsService.update(id, data),
        onMutate: () => setIsSaving(true),
        onSuccess: () => {
            setTimeout(() => setIsSaving(false), 500); // Show "Saved" for a bit
        },
        onError: () => {
            setIsSaving(false);
            toast.error('Failed to save');
        }
    });

    // Auto-save logic
    const handleContentChange = (newContent: any) => {
        setContent(newContent);

        if (saveTimeoutRef.current) {
            clearTimeout(saveTimeoutRef.current);
        }

        saveTimeoutRef.current = setTimeout(() => {
            updateMutation.mutate({ content: newContent });
        }, 2000); // Auto-save after 2s inactivity
    };

    const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setTitle(e.target.value);

        if (saveTimeoutRef.current) {
            clearTimeout(saveTimeoutRef.current);
        }

        saveTimeoutRef.current = setTimeout(() => {
            updateMutation.mutate({ title: e.target.value });
        }, 1000);
    };

    // Manual save
    const handleSave = () => {
        if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
        updateMutation.mutate({ title, content });
    };

    if (isLoading) {
        return <div className="flex items-center justify-center h-full text-white/20">Loading...</div>;
    }

    if (!doc) {
        return <div className="flex items-center justify-center h-full text-white/40">Document not found</div>;
    }

    return (
        <div className="flex flex-col h-full bg-zinc-950">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-white/5 sticky top-0 bg-zinc-950 z-10">
                <div className="flex items-center gap-4 flex-1">
                    <Link href={`/documents`} className="p-2 -ml-2 rounded-xl text-white/40 hover:text-white hover:bg-white/5 transition-colors">
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                    <div className="w-px h-6 bg-white/10" />
                    <Input
                        value={title}
                        onChange={handleTitleChange}
                        className="text-lg font-bold bg-transparent border-none px-0 focus-visible:ring-0 h-auto w-full max-w-lg"
                        placeholder="Untitled Document"
                    />
                </div>
                <div className="flex items-center gap-2">
                    <div className="text-xs text-white/40 mr-2 flex items-center gap-2">
                        {isSaving ? (
                            <>
                                <Loader2 className="w-3 h-3 animate-spin" />
                                Saving...
                            </>
                        ) : (
                            <>
                                <Check className="w-3 h-3 text-green-500" />
                                Saved
                            </>
                        )}
                    </div>
                    <Button onClick={handleSave} size="sm" className="bg-primary text-white font-bold h-8">
                        <Save className="w-4 h-4 mr-2" />
                        Save
                    </Button>
                </div>
            </div>

            {/* Editor */}
            <div className="flex-1 overflow-hidden p-6 max-w-4xl mx-auto w-full">
                <Editor content={content} onChange={handleContentChange} />
            </div>
        </div>
    );
}

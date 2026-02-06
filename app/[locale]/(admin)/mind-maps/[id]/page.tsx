'use client';

import { useState, useRef } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { mindMapsService } from '@/domain/mind-maps/services/mind-maps-service';
import { MindMapEditor } from '@/components/mind-maps/MindMapEditor';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Loader2, Check } from 'lucide-react';
import { Link, useRouter } from '@/i18n/routing';
import { toast } from 'sonner';

export default function MindMapEditPage({ params: { locale, id } }: { params: { locale: string; id: string } }) {
    const router = useRouter();
    const [title, setTitle] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    const { data: map, isLoading } = useQuery({
        queryKey: ['mind-map', id],
        queryFn: async () => {
            const m = await mindMapsService.get(id);
            setTitle(m.title);
            return m;
        },
    });

    const updateMutation = useMutation({
        mutationFn: (data: { title?: string; nodes?: any[]; edges?: any[] }) => mindMapsService.update(id, data),
        onMutate: () => setIsSaving(true),
        onSuccess: () => {
            setTimeout(() => setIsSaving(false), 500);
        },
        onError: () => {
            setIsSaving(false);
            toast.error('Failed to save');
        }
    });

    const handleSave = (nodes: any[], edges: any[]) => {
        updateMutation.mutate({ nodes, edges });
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

    if (isLoading) {
        return <div className="flex items-center justify-center h-full text-white/20">Loading...</div>;
    }

    if (!map) {
        return <div className="flex items-center justify-center h-full text-white/40">Mind Map not found</div>;
    }

    return (
        <div className="flex flex-col h-full bg-zinc-950">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-white/5 sticky top-0 bg-zinc-950 z-10 w-full">
                <div className="flex items-center gap-4 flex-1">
                    <Link href={`/${locale}/mind-maps`} className="p-2 -ml-2 rounded-xl text-white/40 hover:text-white hover:bg-white/5 transition-colors">
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                    <div className="w-px h-6 bg-white/10" />
                    <Input
                        value={title}
                        onChange={handleTitleChange}
                        className="text-lg font-bold bg-transparent border-none px-0 focus-visible:ring-0 h-auto w-full max-w-lg"
                        placeholder="Untitled Mind Map"
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
                </div>
            </div>

            {/* Editor */}
            <div className="flex-1 overflow-hidden w-full h-full relative">
                <div style={{ width: '100%', height: 'calc(100vh - 70px)' }}> {/* Fixed height container */}
                    <MindMapEditor
                        initialNodes={map.nodes}
                        initialEdges={map.edges}
                        onSave={handleSave}
                    />
                </div>
            </div>
        </div>
    );
}

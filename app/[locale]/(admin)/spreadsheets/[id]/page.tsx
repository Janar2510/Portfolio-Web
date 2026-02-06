'use client';

import { useState, useRef } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { spreadsheetsService } from '@/domain/spreadsheets/services/spreadsheets-service';
import dynamicImport from 'next/dynamic';
const SpreadsheetEditor = dynamicImport(() => import('@/components/spreadsheets/SpreadsheetEditor').then(mod => mod.SpreadsheetEditor), {
    ssr: false,
    loading: () => <div className="text-white/20 p-10">Loading Editor...</div>
});
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Loader2, Check } from 'lucide-react';
import { Link, useRouter } from '@/i18n/routing';
import { toast } from 'sonner';

export default function SpreadsheetEditPage({ params: { locale, id } }: { params: { locale: string; id: string } }) {
    const router = useRouter();
    const [title, setTitle] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    const { data: sheet, isLoading } = useQuery({
        queryKey: ['spreadsheet', id],
        queryFn: async () => {
            const s = await spreadsheetsService.get(id);
            setTitle(s.title);
            return s;
        },
    });

    const updateMutation = useMutation({
        mutationFn: (data: { title?: string; columns?: any[]; rows?: any[] }) => spreadsheetsService.update(id, data),
        onMutate: () => setIsSaving(true),
        onSuccess: () => {
            setTimeout(() => setIsSaving(false), 500);
        },
        onError: () => {
            setIsSaving(false);
            toast.error('Failed to save');
        }
    });

    const handleSave = (columns: any[], rows: any[]) => {
        updateMutation.mutate({ columns, rows });
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

    if (!sheet) {
        return <div className="flex items-center justify-center h-full text-white/40">Spreadsheet not found</div>;
    }

    return (
        <div className="flex flex-col h-full bg-zinc-950">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-white/5 sticky top-0 bg-zinc-950 z-10">
                <div className="flex items-center gap-4 flex-1">
                    <Link href={`/${locale}/spreadsheets`} className="p-2 -ml-2 rounded-xl text-white/40 hover:text-white hover:bg-white/5 transition-colors">
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                    <div className="w-px h-6 bg-white/10" />
                    <Input
                        value={title}
                        onChange={handleTitleChange}
                        className="text-lg font-bold bg-transparent border-none px-0 focus-visible:ring-0 h-auto w-full max-w-lg"
                        placeholder="Untitled Spreadsheet"
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
            <div className="flex-1 overflow-hidden p-6 max-w-6xl mx-auto w-full">
                <SpreadsheetEditor
                    initialColumns={sheet.columns}
                    initialRows={sheet.rows}
                    onSave={handleSave}
                />
            </div>
        </div>
    );
}

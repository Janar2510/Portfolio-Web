'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { AlertCircle } from 'lucide-react';

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error('Page Error:', error);
    }, [error]);

    return (
        <div className="flex flex-col items-center justify-center h-full p-6 text-center">
            <div className="w-12 h-12 bg-red-500/10 rounded-full flex items-center justify-center mb-4">
                <AlertCircle className="w-6 h-6 text-red-500" />
            </div>
            <h2 className="text-xl font-bold text-white mb-2">Something went wrong!</h2>
            <p className="text-white/40 mb-6 max-w-md">
                {error.message || 'An unexpected error occurred while loading this document.'}
            </p>
            <div className="flex gap-4">
                <Button onClick={() => reset()} variant="secondary">
                    Try again
                </Button>
            </div>
        </div>
    );
}

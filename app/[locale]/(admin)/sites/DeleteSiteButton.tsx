'use client';

import { useFormState, useFormStatus } from 'react-dom';
import { Trash2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { deleteSiteAction } from './actions';
import { toast } from 'sonner';
import { useEffect } from 'react';

interface DeleteSiteButtonProps {
    siteId: string;
    locale: string;
}

export function DeleteSiteButton({ siteId, locale }: DeleteSiteButtonProps) {
    const [state, formAction] = useFormState(deleteSiteAction, { ok: false });

    useEffect(() => {
        if (state.ok) {
            toast.success('Site deleted successfully');
        } else if (state.errorKey) {
            toast.error(state.errorKey);
        }
    }, [state]);

    return (
        <form action={formAction}>
            <input type="hidden" name="siteId" value={siteId} />
            <input type="hidden" name="locale" value={locale} />
            <SubmitButton />
        </form>
    );
}

function SubmitButton() {
    const { pending } = useFormStatus();

    return (
        <Button
            type="submit"
            variant="ghost"
            size="icon"
            disabled={pending}
            className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors h-9 w-9"
            title="Delete Site"
        >
            {pending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
                <Trash2 className="w-4 h-4" />
            )}
        </Button>
    );
}

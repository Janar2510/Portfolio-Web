'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';
import { EmailService } from '@/domain/email/email';
import { EmailThreadView } from '@/components/email/EmailThreadView';
import { Button } from '@/components/ui/button';
import { RefreshCw, Mail } from 'lucide-react';
import { toast } from 'sonner';

export default function EmailPage() {
    const queryClient = useQueryClient();
    const supabase = createClient();
    const emailService = new EmailService(supabase);

    const { data: accounts = [], isLoading: loadingAccounts } = useQuery({
        queryKey: ['email-accounts'],
        queryFn: () => emailService.getAccounts(),
    });

    // Simple view: just show first account's emails for now or placeholder
    const { data: emailsData, isLoading: loadingEmails } = useQuery({
        queryKey: ['emails', accounts[0]?.id],
        queryFn: () => accounts[0] ? emailService.getEmails(accounts[0].id) : { emails: [], total: 0 },
        enabled: !!accounts.length,
    });

    const syncMutation = useMutation({
        mutationFn: () => emailService.syncAllAccounts(),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['emails'] });
            toast.success('Sync started');
        }
    });

    if (loadingAccounts) return <div className="p-8 text-white/20">Loading email accounts...</div>;

    if (accounts.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-full p-8 text-center">
                <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-4">
                    <Mail className="w-8 h-8 text-white/40" />
                </div>
                <h2 className="text-xl font-bold text-white mb-2">Connect your email</h2>
                <p className="text-white/40 mb-6 max-w-md">Connect your Outlook or Apple Mail account to manage emails directly from here.</p>
                <Button>Connect Account</Button>
            </div>
        );
    }

    return (
        <div className="h-full flex flex-col bg-zinc-950">
            <div className="p-4 border-b border-white/5 flex justify-between items-center">
                <h1 className="text-xl font-bold text-white">Inbox</h1>
                <Button variant="ghost" size="sm" onClick={() => syncMutation.mutate()} disabled={syncMutation.isPending}>
                    <RefreshCw className={`w-4 h-4 mr-2 ${syncMutation.isPending ? 'animate-spin' : ''}`} />
                    Sync
                </Button>
            </div>
            <div className="flex-1 overflow-auto p-4">
                {/* Placeholder list until full EmailList component is available */}
                <div className="space-y-2">
                    {emailsData?.emails.map(email => (
                        <div key={email.id} className="p-4 bg-white/5 rounded-lg hover:bg-white/10 cursor-pointer transition-colors">
                            <div className="flex justify-between mb-1">
                                <span className="font-bold text-white">{email.from_address}</span>
                                <span className="text-xs text-white/40">{new Date(email.sent_at).toLocaleDateString()}</span>
                            </div>
                            <h3 className="text-white/80 font-medium">{email.subject}</h3>
                            <p className="text-sm text-white/40 line-clamp-1">{email.body_preview}</p>
                        </div>
                    ))}
                    {emailsData?.emails.length === 0 && (
                        <div className="text-center text-white/20 py-12">No emails found</div>
                    )}
                </div>
            </div>
        </div>
    );
}

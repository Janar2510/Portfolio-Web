'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Mail,
  Plus,
  Trash2,
  CheckCircle2,
  XCircle,
  Loader2,
  RefreshCw,
  Settings,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { createClient } from '@/lib/supabase/client';
import { EmailService } from '@/lib/services/email';
import type { EmailAccount } from '@/lib/services/email';

export default function EmailAccountsPage() {
  const [isAppleDialogOpen, setIsAppleDialogOpen] = useState(false);
  const [appleEmail, setAppleEmail] = useState('');
  const [applePassword, setApplePassword] = useState('');
  const [appleDisplayName, setAppleDisplayName] = useState('');
  const queryClient = useQueryClient();

  // Fetch email accounts
  const {
    data: accounts = [],
    isLoading,
    error: accountsError,
  } = useQuery({
    queryKey: ['email-accounts'],
    queryFn: async () => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('email_accounts')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) {
        console.error('Error fetching email accounts:', error);
        throw error;
      }
      return (data || []) as EmailAccount[];
    },
    retry: 1,
  });

  // Connect Microsoft account
  const connectMicrosoftMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/email/oauth/microsoft');
      if (!response.ok) throw new Error('Failed to initiate OAuth');
      window.location.href = response.url;
    },
  });

  // Connect Apple account
  const connectAppleMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/email/connect-apple', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: appleEmail,
          password: applePassword,
          displayName: appleDisplayName || appleEmail,
        }),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to connect account');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['email-accounts'] });
      setIsAppleDialogOpen(false);
      setAppleEmail('');
      setApplePassword('');
      setAppleDisplayName('');
    },
  });

  // Delete account
  const deleteAccountMutation = useMutation({
    mutationFn: async (accountId: string) => {
      const supabase = createClient();
      const { error } = await supabase
        .from('email_accounts')
        .delete()
        .eq('id', accountId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['email-accounts'] });
    },
  });

  // Sync account
  const syncAccountMutation = useMutation({
    mutationFn: async (accountId: string) => {
      const supabase = createClient();
      const emailService = new EmailService(supabase);
      return emailService.syncAccount(accountId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['email-accounts'] });
    },
  });

  // Toggle account active status
  const toggleAccountMutation = useMutation({
    mutationFn: async ({
      accountId,
      isActive,
    }: {
      accountId: string;
      isActive: boolean;
    }) => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('email_accounts')
        .update({ is_active: !isActive })
        .eq('id', accountId)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['email-accounts'] });
    },
  });

  const handleConnectMicrosoft = () => {
    connectMicrosoftMutation.mutate();
  };

  const handleConnectApple = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    connectAppleMutation.mutate();
  };

  // Check for OAuth callback success/error
  const searchParams = new URLSearchParams(window.location.search);
  const success = searchParams.get('success');
  const error = searchParams.get('error');

  if (accountsError) {
    console.error('Email accounts error:', accountsError);
  }

  return (
    <div className="flex h-[calc(100vh-4rem)] flex-col bg-gradient-to-br from-[hsl(var(--background))] via-[hsl(142_60%_6%)] to-[hsl(var(--background))] animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border bg-card/50 backdrop-blur-sm p-4 animate-slide-down">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Email Accounts</h1>
          <p className="text-sm text-muted-foreground">
            Connect and manage your email accounts
          </p>
          {accountsError && (
            <p className="text-sm text-error-main mt-2">
              Error loading accounts:{' '}
              {accountsError instanceof Error
                ? accountsError.message
                : 'Unknown error'}
            </p>
          )}
        </div>
        <div className="flex gap-2">
          <Button onClick={handleConnectMicrosoft} variant="outline">
            <Mail className="mr-2 h-4 w-4" />
            Connect Microsoft
          </Button>
          <Dialog open={isAppleDialogOpen} onOpenChange={setIsAppleDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Mail className="mr-2 h-4 w-4" />
                Connect Apple Mail
              </Button>
            </DialogTrigger>
            <DialogContent>
              <form onSubmit={handleConnectApple}>
                <DialogHeader>
                  <DialogTitle>Connect Apple Mail</DialogTitle>
                  <DialogDescription>
                    Enter your iCloud email credentials to connect your account.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="apple-email">Email Address *</Label>
                    <Input
                      id="apple-email"
                      type="email"
                      value={appleEmail}
                      onChange={e => setAppleEmail(e.target.value)}
                      required
                      placeholder="your.email@icloud.com"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="apple-password">Password *</Label>
                    <Input
                      id="apple-password"
                      type="password"
                      value={applePassword}
                      onChange={e => setApplePassword(e.target.value)}
                      required
                      placeholder="Your iCloud password"
                    />
                    <p className="text-xs text-muted-foreground">
                      Your password is encrypted and stored securely.
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="apple-display-name">
                      Display Name (optional)
                    </Label>
                    <Input
                      id="apple-display-name"
                      type="text"
                      value={appleDisplayName}
                      onChange={e => setAppleDisplayName(e.target.value)}
                      placeholder="Your Name"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsAppleDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={connectAppleMutation.isPending}
                  >
                    {connectAppleMutation.isPending && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    Connect
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Success/Error Messages */}
      {success && (
        <div className="border-b bg-green-50 p-4">
          <div className="flex items-center gap-2 text-green-800">
            <CheckCircle2 className="h-4 w-4" />
            <span>Account connected successfully!</span>
          </div>
        </div>
      )}
      {error && (
        <div className="border-b bg-red-50 p-4">
          <div className="flex items-center gap-2 text-red-800">
            <XCircle className="h-4 w-4" />
            <span>Error: {error}</span>
          </div>
        </div>
      )}

      {/* Accounts List */}
      <div className="flex-1 overflow-y-auto p-4">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : accounts.length === 0 ? (
          <div className="flex h-full items-center justify-center animate-fade-in">
            <div className="text-center animate-scale-in">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center shadow-lg">
                <Mail className="w-8 h-8 text-white" />
              </div>
              <p className="mt-4 text-lg font-semibold text-foreground">
                No email accounts
              </p>
              <p className="mt-2 text-sm text-muted-foreground">
                Connect your first email account to get started
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-4 animate-fade-in">
            {accounts.map(account => (
              <div
                key={account.id}
                className="flex items-center justify-between rounded-lg border p-4"
              >
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                    <Mail className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="font-medium">
                      {account.display_name || account.email_address}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {account.email_address} • {account.provider}
                    </div>
                    {account.last_sync_at && (
                      <div className="text-xs text-muted-foreground">
                        Last synced:{' '}
                        {new Date(account.last_sync_at).toLocaleString()}
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => syncAccountMutation.mutate(account.id)}
                    disabled={syncAccountMutation.isPending}
                    title="Sync emails"
                  >
                    {syncAccountMutation.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <RefreshCw className="h-4 w-4" />
                    )}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      toggleAccountMutation.mutate({
                        accountId: account.id,
                        isActive: account.is_active,
                      })
                    }
                    title={account.is_active ? 'Deactivate' : 'Activate'}
                  >
                    {account.is_active ? (
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                    ) : (
                      <XCircle className="h-4 w-4 text-muted-foreground" />
                    )}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-destructive"
                    onClick={() => {
                      if (
                        confirm(
                          'Are you sure you want to disconnect this account?'
                        )
                      ) {
                        deleteAccountMutation.mutate(account.id);
                      }
                    }}
                    title="Delete account"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

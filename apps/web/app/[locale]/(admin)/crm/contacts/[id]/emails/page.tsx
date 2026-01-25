'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams } from 'next/navigation';
import { Mail, Send, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { EmailThreadView } from '@/components/email/EmailThreadView';
import { EmailCompose } from '@/components/email/EmailCompose';
import { createClient } from '@/lib/supabase/client';
import { EmailService } from '@/lib/services/email';
import type { Email, EmailAccount, EmailTemplate } from '@/lib/services/email';
import type { Contact, Deal } from '@/lib/services/crm';

export default function ContactEmailsPage() {
  const params = useParams();
  const contactId = params.id as string;
  const [selectedThreadId, setSelectedThreadId] = useState<string | null>(null);
  const [isComposeOpen, setIsComposeOpen] = useState(false);
  const [replyToEmail, setReplyToEmail] = useState<Email | null>(null);
  const queryClient = useQueryClient();

  // Fetch contact
  const { data: contact } = useQuery({
    queryKey: ['crm-contact', contactId],
    queryFn: async () => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('contacts')
        .select('*')
        .eq('id', contactId)
        .single();
      if (error) throw error;
      return data as Contact;
    },
  });

  // Fetch deals for this contact
  const { data: deals = [] } = useQuery({
    queryKey: ['crm-deals', contactId],
    queryFn: async () => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('deals')
        .select('*')
        .eq('contact_id', contactId)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return (data || []) as Deal[];
    },
  });

  // Fetch email accounts
  const { data: accounts = [] } = useQuery({
    queryKey: ['email-accounts'],
    queryFn: async () => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('email_accounts')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return (data || []) as EmailAccount[];
    },
  });

  // Fetch emails for this contact
  const { data: emails = [] } = useQuery({
    queryKey: ['emails', contactId],
    queryFn: async () => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('emails')
        .select('*')
        .eq('contact_id', contactId)
        .order('sent_at', { ascending: false });
      if (error) throw error;
      return (data || []) as Email[];
    },
  });

  // Fetch email templates
  const { data: templates = [] } = useQuery({
    queryKey: ['email-templates'],
    queryFn: async () => {
      const supabase = createClient();
      const emailService = new EmailService(supabase);
      return emailService.getTemplates();
    },
  });

  // Group emails by thread
  const emailsByThread = emails.reduce(
    (acc, email) => {
      const threadId = email.thread_id || 'unthreaded';
      if (!acc[threadId]) {
        acc[threadId] = [];
      }
      acc[threadId].push(email);
      return acc;
    },
    {} as Record<string, Email[]>
  );

  const threadIds = Object.keys(emailsByThread);
  const selectedThread = selectedThreadId
    ? emailsByThread[selectedThreadId] || []
    : [];
  const selectedDeal = deals.find(d =>
    selectedThread.some(e => e.deal_id === d.id)
  );

  // Send email mutation
  const sendEmailMutation = useMutation({
    mutationFn: async (emailData: {
      account_id: string;
      to: string[];
      cc?: string[];
      bcc?: string[];
      subject: string;
      body: string;
      bodyHtml?: string;
    }) => {
      // TODO: Implement actual email sending via provider
      // For now, just create a record
      const supabase = createClient();
      const account = accounts.find(a => a.id === emailData.account_id);
      if (!account) throw new Error('Account not found');

      const { data, error } = await supabase
        .from('emails')
        .insert({
          account_id: emailData.account_id,
          external_id: `sent-${Date.now()}`,
          thread_id: replyToEmail?.thread_id || null,
          contact_id: contactId,
          deal_id: selectedDeal?.id || null,
          direction: 'outbound',
          subject: emailData.subject,
          body_preview: emailData.body.substring(0, 200),
          body_html: emailData.bodyHtml || emailData.body,
          from_address: account.email_address,
          to_addresses: emailData.to,
          cc_addresses: emailData.cc,
          sent_at: new Date().toISOString(),
          is_read: true,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['emails', contactId] });
      setIsComposeOpen(false);
      setReplyToEmail(null);
    },
  });

  const handleReply = (email: Email) => {
    setReplyToEmail(email);
    setIsComposeOpen(true);
  };

  const handleReplyAll = (email: Email) => {
    setReplyToEmail(email);
    setIsComposeOpen(true);
  };

  const handleForward = (email: Email) => {
    setReplyToEmail(email);
    setIsComposeOpen(true);
  };

  const handleCompose = () => {
    setReplyToEmail(null);
    setIsComposeOpen(true);
  };

  const getReplySubject = (email: Email): string => {
    const subject = email.subject || '';
    return subject.toLowerCase().startsWith('re:') ? subject : `Re: ${subject}`;
  };

  const getReplyBody = (email: Email): string => {
    return `\n\n---\nOn ${new Date(email.sent_at).toLocaleString()}, ${email.from_address} wrote:\n\n${email.body_preview || email.body_html || ''}`;
  };

  if (!contact) {
    return <div>Loading...</div>;
  }

  const accountEmail = accounts[0]?.email_address || '';

  return (
    <div className="flex h-[calc(100vh-4rem)] flex-col">
      {/* Header */}
      <div className="flex items-center justify-between border-b p-4">
        <div>
          <h1 className="text-2xl font-bold">Email Threads</h1>
          <p className="text-sm text-muted-foreground">
            {contact.first_name} {contact.last_name} • {contact.email}
          </p>
        </div>
        <Button onClick={handleCompose}>
          <Plus className="mr-2 h-4 w-4" />
          Compose
        </Button>
      </div>

      {/* Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Thread List */}
        <div className="w-80 border-r overflow-y-auto">
          {threadIds.length === 0 ? (
            <div className="p-4 text-center text-sm text-muted-foreground">
              No email threads
            </div>
          ) : (
            <div className="divide-y">
              {threadIds.map(threadId => {
                const threadEmails = emailsByThread[threadId];
                const latestEmail = threadEmails[0];
                const isSelected = selectedThreadId === threadId;

                return (
                  <button
                    key={threadId}
                    onClick={() => setSelectedThreadId(threadId)}
                    className={cn(
                      'w-full p-4 text-left hover:bg-muted/50 transition-colors',
                      isSelected && 'bg-muted'
                    )}
                  >
                    <div className="font-medium text-sm">
                      {latestEmail.subject || 'No Subject'}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {threadEmails.length}{' '}
                      {threadEmails.length === 1 ? 'message' : 'messages'}
                      {' • '}
                      {new Date(latestEmail.sent_at).toLocaleDateString()}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Thread View */}
        <div className="flex-1 overflow-hidden">
          {selectedThreadId && selectedThread.length > 0 ? (
            <EmailThreadView
              emails={selectedThread}
              accountEmail={accountEmail}
              contact={contact}
              deal={selectedDeal || undefined}
              onReply={handleReply}
              onReplyAll={handleReplyAll}
              onForward={handleForward}
              onCompose={handleCompose}
            />
          ) : (
            <div className="flex h-full items-center justify-center">
              <div className="text-center text-muted-foreground">
                <Mail className="mx-auto h-12 w-12 mb-4" />
                <p>Select a thread to view</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Compose Dialog */}
      {isComposeOpen && (
        <EmailCompose
          isOpen={isComposeOpen}
          onClose={() => {
            setIsComposeOpen(false);
            setReplyToEmail(null);
          }}
          onSend={async emailData => {
            await sendEmailMutation.mutateAsync(emailData);
          }}
          accounts={accounts}
          templates={templates}
          initialTo={contact.email || undefined}
          initialSubject={
            replyToEmail ? getReplySubject(replyToEmail) : undefined
          }
          initialBody={replyToEmail ? getReplyBody(replyToEmail) : undefined}
          contactId={contactId}
          dealId={selectedDeal?.id}
        />
      )}
    </div>
  );
}

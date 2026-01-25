'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import {
  Mail,
  Reply,
  ReplyAll,
  Forward,
  User,
  Building2,
  Briefcase,
  Send,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { Email } from '@/lib/services/email';
import type { Contact, Deal } from '@/lib/services/crm';

interface EmailThreadViewProps {
  emails: Email[];
  accountEmail: string;
  contact?: Contact | null;
  deal?: Deal | null;
  onReply?: (email: Email) => void;
  onReplyAll?: (email: Email) => void;
  onForward?: (email: Email) => void;
  onCompose?: () => void;
}

export function EmailThreadView({
  emails,
  accountEmail,
  contact,
  deal,
  onReply,
  onReplyAll,
  onForward,
  onCompose,
}: EmailThreadViewProps) {
  const [expandedEmails, setExpandedEmails] = useState<Set<string>>(
    new Set([emails[0]?.id])
  );

  const toggleEmail = (emailId: string) => {
    const newExpanded = new Set(expandedEmails);
    if (newExpanded.has(emailId)) {
      newExpanded.delete(emailId);
    } else {
      newExpanded.add(emailId);
    }
    setExpandedEmails(newExpanded);
  };

  // Sort emails by sent_at (oldest first for thread view)
  const sortedEmails = [...emails].sort(
    (a, b) => new Date(a.sent_at).getTime() - new Date(b.sent_at).getTime()
  );

  return (
    <div className="flex h-full flex-col">
      {/* Thread Header */}
      <div className="border-b p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h2 className="text-lg font-semibold">
              {emails[0]?.subject || 'No Subject'}
            </h2>
            <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
              {contact && (
                <div className="flex items-center gap-1">
                  <User className="h-3 w-3" />
                  <span>
                    {contact.first_name} {contact.last_name}
                  </span>
                </div>
              )}
              {deal && (
                <div className="flex items-center gap-1">
                  <Briefcase className="h-3 w-3" />
                  <span>{deal.title}</span>
                </div>
              )}
              <span>•</span>
              <span>
                {emails.length} {emails.length === 1 ? 'message' : 'messages'}
              </span>
            </div>
          </div>
          <div className="flex gap-2">
            {onCompose && (
              <Button size="sm" onClick={onCompose}>
                <Send className="mr-2 h-4 w-4" />
                New Email
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Email Thread */}
      <div className="flex-1 overflow-y-auto">
        {sortedEmails.length === 0 ? (
          <div className="flex h-full items-center justify-center">
            <div className="text-center text-muted-foreground">
              <Mail className="mx-auto h-12 w-12 mb-4" />
              <p>No emails in this thread</p>
            </div>
          </div>
        ) : (
          <div className="divide-y">
            {sortedEmails.map((email, index) => {
              const isExpanded = expandedEmails.has(email.id);
              const isOutbound = email.direction === 'outbound';
              const isFirst = index === 0;

              return (
                <div
                  key={email.id}
                  className={cn(
                    'p-4 transition-colors',
                    isOutbound && 'bg-muted/30',
                    !isExpanded && 'cursor-pointer hover:bg-muted/50'
                  )}
                  onClick={() => !isExpanded && toggleEmail(email.id)}
                >
                  {/* Email Header */}
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <div
                          className={cn(
                            'flex h-8 w-8 items-center justify-center rounded-full',
                            isOutbound
                              ? 'bg-blue-100 text-blue-600'
                              : 'bg-gray-100 text-gray-600'
                          )}
                        >
                          <Mail className="h-4 w-4" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">
                              {isOutbound ? accountEmail : email.from_address}
                            </span>
                            {isOutbound && (
                              <Badge variant="outline" className="text-xs">
                                Sent
                              </Badge>
                            )}
                            {!email.is_read && !isOutbound && (
                              <Badge
                                variant="outline"
                                className="bg-blue-100 text-blue-800"
                              >
                                New
                              </Badge>
                            )}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {isOutbound ? 'To' : 'From'}:{' '}
                            {isOutbound
                              ? email.to_addresses.join(', ')
                              : email.from_address}
                            {email.cc_addresses &&
                              email.cc_addresses.length > 0 && (
                                <>
                                  {' • '}CC: {email.cc_addresses.join(', ')}
                                </>
                              )}
                          </div>
                        </div>
                      </div>
                      {isExpanded && (
                        <div className="mt-2 text-sm font-medium">
                          {email.subject}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="text-xs text-muted-foreground">
                        {format(new Date(email.sent_at), 'MMM d, yyyy h:mm a')}
                      </div>
                      {isExpanded && (
                        <div className="flex gap-1">
                          {onReply && !isOutbound && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7"
                              onClick={e => {
                                e.stopPropagation();
                                onReply(email);
                              }}
                            >
                              <Reply className="h-3.5 w-3.5" />
                            </Button>
                          )}
                          {onReplyAll && !isOutbound && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7"
                              onClick={e => {
                                e.stopPropagation();
                                onReplyAll(email);
                              }}
                            >
                              <ReplyAll className="h-3.5 w-3.5" />
                            </Button>
                          )}
                          {onForward && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7"
                              onClick={e => {
                                e.stopPropagation();
                                onForward(email);
                              }}
                            >
                              <Forward className="h-3.5 w-3.5" />
                            </Button>
                          )}
                        </div>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={e => {
                          e.stopPropagation();
                          toggleEmail(email.id);
                        }}
                      >
                        {isExpanded ? '−' : '+'}
                      </Button>
                    </div>
                  </div>

                  {/* Email Body */}
                  {isExpanded && (
                    <div className="mt-4 space-y-2">
                      {email.body_preview && (
                        <div className="text-sm text-muted-foreground">
                          {email.body_preview}
                        </div>
                      )}
                      {email.body_html && (
                        <div
                          className="prose prose-sm max-w-none"
                          dangerouslySetInnerHTML={{ __html: email.body_html }}
                        />
                      )}
                      {email.has_attachments && (
                        <div className="mt-2 text-xs text-muted-foreground">
                          📎 This email has attachments
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

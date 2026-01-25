'use client';

import { useState, useEffect } from 'react';
import { Send, X, FileText, Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { EmailAccount, EmailTemplate } from '@/lib/services/email';

interface EmailComposeProps {
  isOpen: boolean;
  onClose: () => void;
  onSend: (email: {
    account_id: string;
    to: string[];
    cc?: string[];
    bcc?: string[];
    subject: string;
    body: string;
    bodyHtml?: string;
  }) => Promise<void>;
  accounts: EmailAccount[];
  templates?: EmailTemplate[];
  initialTo?: string;
  initialSubject?: string;
  initialBody?: string;
  contactId?: string;
  dealId?: string;
}

export function EmailCompose({
  isOpen,
  onClose,
  onSend,
  accounts,
  templates = [],
  initialTo,
  initialSubject,
  initialBody,
  contactId,
  dealId,
}: EmailComposeProps) {
  const [selectedAccountId, setSelectedAccountId] = useState<string>('');
  const [to, setTo] = useState<string>(initialTo || '');
  const [cc, setCc] = useState<string>('');
  const [bcc, setBcc] = useState<string>('');
  const [subject, setSubject] = useState<string>(initialSubject || '');
  const [body, setBody] = useState<string>(initialBody || '');
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('');
  const [templateVariables, setTemplateVariables] = useState<
    Record<string, string>
  >({});
  const [isSending, setIsSending] = useState(false);
  const [showCc, setShowCc] = useState(false);
  const [showBcc, setShowBcc] = useState(false);

  // Set default account if only one
  useEffect(() => {
    if (accounts.length === 1 && !selectedAccountId) {
      setSelectedAccountId(accounts[0].id);
    }
  }, [accounts, selectedAccountId]);

  // Reset form when dialog closes
  useEffect(() => {
    if (!isOpen) {
      setTo(initialTo || '');
      setCc('');
      setBcc('');
      setSubject(initialSubject || '');
      setBody(initialBody || '');
      setSelectedTemplateId('');
      setTemplateVariables({});
      setShowCc(false);
      setShowBcc(false);
    }
  }, [isOpen, initialTo, initialSubject, initialBody]);

  const handleTemplateSelect = async (templateId: string) => {
    if (!templateId || templateId === '__none__') {
      setSelectedTemplateId('');
      setTemplateVariables({});
      return;
    }

    const template = templates.find(t => t.id === templateId);
    if (!template) return;

    setSelectedTemplateId(templateId);

    // Extract variables from template
    const variableMatches = [
      ...template.subject.matchAll(/\{\{(\w+)\}\}/g),
      ...template.body_html.matchAll(/\{\{(\w+)\}\}/g),
    ];

    const variables = new Set<string>();
    variableMatches.forEach(match => {
      if (match[1]) {
        variables.add(match[1]);
      }
    });

    // Initialize template variables
    const vars: Record<string, string> = {};
    variables.forEach(varName => {
      vars[varName] = '';
    });
    setTemplateVariables(vars);

    // Apply template (without variables filled)
    setSubject(template.subject);
    setBody(template.body_html.replace(/<[^>]*>/g, '')); // Strip HTML for textarea
  };

  const handleApplyTemplate = () => {
    if (!selectedTemplateId) return;

    const template = templates.find(t => t.id === selectedTemplateId);
    if (!template) return;

    // Replace variables
    let renderedSubject = template.subject;
    let renderedBody = template.body_html;

    Object.entries(templateVariables).forEach(([key, value]) => {
      const placeholder = `{{${key}}}`;
      renderedSubject = renderedSubject.replace(
        new RegExp(placeholder, 'g'),
        value
      );
      renderedBody = renderedBody.replace(new RegExp(placeholder, 'g'), value);
    });

    setSubject(renderedSubject);
    setBody(renderedBody.replace(/<[^>]*>/g, '')); // Strip HTML for textarea
  };

  const handleSend = async () => {
    if (!selectedAccountId || !to.trim()) {
      return;
    }

    setIsSending(true);
    try {
      const toAddresses = to
        .split(',')
        .map(email => email.trim())
        .filter(Boolean);
      const ccAddresses = cc
        ? cc
            .split(',')
            .map(email => email.trim())
            .filter(Boolean)
        : undefined;
      const bccAddresses = bcc
        ? bcc
            .split(',')
            .map(email => email.trim())
            .filter(Boolean)
        : undefined;

      await onSend({
        account_id: selectedAccountId,
        to: toAddresses,
        cc: ccAddresses,
        bcc: bccAddresses,
        subject: subject.trim(),
        body: body.trim(),
        bodyHtml: body.trim(), // In production, convert to HTML
      });

      onClose();
    } catch (error) {
      console.error('Error sending email:', error);
      // Error handling would go here
    } finally {
      setIsSending(false);
    }
  };

  const selectedTemplate = templates.find(t => t.id === selectedTemplateId);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Compose Email</DialogTitle>
          <DialogDescription>
            Send an email from your connected account
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Account Selection */}
          <div className="space-y-2">
            <Label htmlFor="account">From *</Label>
            <Select
              value={selectedAccountId}
              onValueChange={setSelectedAccountId}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select account" />
              </SelectTrigger>
              <SelectContent>
                {accounts.map(account => (
                  <SelectItem key={account.id} value={account.id}>
                    {account.display_name || account.email_address}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Template Selection */}
          {templates.length > 0 && (
            <div className="space-y-2">
              <Label htmlFor="template">Template (optional)</Label>
              <Select
                value={selectedTemplateId}
                onValueChange={handleTemplateSelect}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select template" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none__">None</SelectItem>
                  {templates.map(template => (
                    <SelectItem key={template.id} value={template.id}>
                      {template.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Template Variables */}
          {selectedTemplate && Object.keys(templateVariables).length > 0 && (
            <div className="space-y-2 rounded-lg border p-3">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">
                  Template Variables
                </Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleApplyTemplate}
                >
                  Apply Template
                </Button>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {Object.keys(templateVariables).map(varName => (
                  <div key={varName} className="space-y-1">
                    <Label htmlFor={`var-${varName}`} className="text-xs">
                      {varName}
                    </Label>
                    <Input
                      id={`var-${varName}`}
                      value={templateVariables[varName]}
                      onChange={e =>
                        setTemplateVariables({
                          ...templateVariables,
                          [varName]: e.target.value,
                        })
                      }
                      placeholder={`Enter ${varName}`}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* To */}
          <div className="space-y-2">
            <Label htmlFor="to">To *</Label>
            <Input
              id="to"
              value={to}
              onChange={e => setTo(e.target.value)}
              placeholder="recipient@example.com"
              required
            />
          </div>

          {/* CC */}
          {showCc && (
            <div className="space-y-2">
              <Label htmlFor="cc">CC</Label>
              <Input
                id="cc"
                value={cc}
                onChange={e => setCc(e.target.value)}
                placeholder="cc@example.com"
              />
            </div>
          )}

          {/* BCC */}
          {showBcc && (
            <div className="space-y-2">
              <Label htmlFor="bcc">BCC</Label>
              <Input
                id="bcc"
                value={bcc}
                onChange={e => setBcc(e.target.value)}
                placeholder="bcc@example.com"
              />
            </div>
          )}

          {/* Show CC/BCC buttons */}
          <div className="flex gap-2">
            {!showCc && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setShowCc(true)}
              >
                + CC
              </Button>
            )}
            {!showBcc && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setShowBcc(true)}
              >
                + BCC
              </Button>
            )}
          </div>

          {/* Subject */}
          <div className="space-y-2">
            <Label htmlFor="subject">Subject *</Label>
            <Input
              id="subject"
              value={subject}
              onChange={e => setSubject(e.target.value)}
              placeholder="Email subject"
              required
            />
          </div>

          {/* Body */}
          <div className="space-y-2">
            <Label htmlFor="body">Message *</Label>
            <Textarea
              id="body"
              value={body}
              onChange={e => setBody(e.target.value)}
              placeholder="Your message..."
              rows={12}
              required
            />
          </div>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleSend}
            disabled={
              !selectedAccountId ||
              !to.trim() ||
              !subject.trim() ||
              !body.trim() ||
              isSending
            }
          >
            {isSending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <Send className="mr-2 h-4 w-4" />
                Send
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

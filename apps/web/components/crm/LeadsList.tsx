'use client';

import { useState } from 'react';
import {
  Plus,
  Mail,
  Phone,
  Building2,
  TrendingUp,
  CheckCircle2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { LabelPicker } from './LabelPicker';
import type { Lead, Label as LabelType } from '@/lib/crm/types';

interface LeadsListProps {
  leads: Lead[];
  labels: LabelType[];
  onCreateLead: (lead: Partial<Lead>) => Promise<void>;
  onUpdateLead: (leadId: string, updates: Partial<Lead>) => Promise<void>;
  onConvertLead: (leadId: string) => Promise<void>;
  onCreateLabel?: (name: string, color: string) => Promise<LabelType>;
}

const statusColors: Record<Lead['status'], string> = {
  new: 'bg-blue-100 text-blue-700',
  contacted: 'bg-yellow-100 text-yellow-700',
  qualified: 'bg-green-100 text-green-700',
  converted: 'bg-purple-100 text-purple-700',
  archived: 'bg-gray-100 text-gray-700',
};

export function LeadsList({
  leads,
  labels,
  onCreateLead,
  onUpdateLead,
  onConvertLead,
  onCreateLabel,
}: LeadsListProps) {
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const handleCreate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    await onCreateLead({
      title: formData.get('title') as string,
      source_name: formData.get('source_name')?.toString(),
      person_name: formData.get('person_name')?.toString(),
      organization_name: formData.get('organization_name')?.toString(),
      email: formData.get('email')?.toString(),
      phone: formData.get('phone')?.toString(),
      expected_value: formData.get('expected_value')
        ? Number(formData.get('expected_value'))
        : undefined,
      currency: (formData.get('currency') as string) || 'EUR',
    });

    setIsCreateOpen(false);
    e.currentTarget.reset();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Leads</h2>
          <p className="text-sm text-muted-foreground">
            Manage and convert your leads
          </p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Lead
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <form onSubmit={handleCreate}>
              <DialogHeader>
                <DialogTitle>Create Lead</DialogTitle>
                <DialogDescription>
                  Add a new lead to your pipeline
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4 max-h-[60vh] overflow-y-auto">
                <div className="space-y-2">
                  <Label htmlFor="title">Lead Title *</Label>
                  <Input
                    id="title"
                    name="title"
                    required
                    placeholder="e.g. Interested in Product X"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="source_name">Source</Label>
                  <Input
                    id="source_name"
                    name="source_name"
                    placeholder="e.g. Website, Referral, Trade Show"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="person_name">Contact Name</Label>
                    <Input id="person_name" name="person_name" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="organization_name">Company Name</Label>
                    <Input id="organization_name" name="organization_name" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" name="email" type="email" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone</Label>
                    <Input id="phone" name="phone" type="tel" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="expected_value">Expected Value</Label>
                    <Input
                      id="expected_value"
                      name="expected_value"
                      type="number"
                      step="0.01"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="currency">Currency</Label>
                    <Select name="currency" defaultValue="EUR">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="EUR">EUR</SelectItem>
                        <SelectItem value="USD">USD</SelectItem>
                        <SelectItem value="GBP">GBP</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsCreateOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit">Create Lead</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Leads Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {leads.map(lead => (
          <Card key={lead.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-3">
                <h3 className="font-semibold text-lg">{lead.title}</h3>
                <Badge className={statusColors[lead.status]}>
                  {lead.status}
                </Badge>
              </div>

              <div className="space-y-2 mb-3">
                {lead.person_name && (
                  <div className="flex items-center gap-2 text-sm">
                    <Building2 className="h-4 w-4 text-muted-foreground" />
                    <span>{lead.person_name}</span>
                  </div>
                )}
                {lead.organization_name && (
                  <div className="flex items-center gap-2 text-sm">
                    <Building2 className="h-4 w-4 text-muted-foreground" />
                    <span>{lead.organization_name}</span>
                  </div>
                )}
                {lead.email && (
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span>{lead.email}</span>
                  </div>
                )}
                {lead.phone && (
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span>{lead.phone}</span>
                  </div>
                )}
                {lead.expected_value && (
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    <span>
                      {lead.expected_value.toFixed(2)} {lead.currency}
                    </span>
                  </div>
                )}
              </div>

              {lead.source_name && (
                <Badge variant="outline" className="mb-2">
                  Source: {lead.source_name}
                </Badge>
              )}

              <div className="flex items-center justify-between mt-4 pt-4 border-t">
                {lead.status !== 'converted' && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onConvertLead(lead.id)}
                    className="gap-2"
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    Convert
                  </Button>
                )}
                {lead.status === 'converted' && (
                  <span className="text-sm text-muted-foreground">
                    Converted to deal
                  </span>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {leads.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <p>No leads yet. Create your first lead to get started.</p>
        </div>
      )}
    </div>
  );
}

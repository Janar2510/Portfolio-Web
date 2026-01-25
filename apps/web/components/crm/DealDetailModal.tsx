'use client';

import { useState, useEffect } from 'react';
import {
  X,
  Calendar,
  DollarSign,
  Percent,
  FileText,
  Edit2,
  Trash2,
  User,
  Building2,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
import { cn } from '@/lib/utils';
import type { Deal, Contact, Company, PipelineStage } from '@/lib/services/crm';

interface DealDetailModalProps {
  deal: Deal | null;
  stages: PipelineStage[];
  contacts: Contact[];
  companies: Company[];
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (dealId: string, updates: Partial<Deal>) => Promise<void>;
  onDelete: (dealId: string) => Promise<void>;
}

export function DealDetailModal({
  deal,
  stages,
  contacts,
  companies,
  isOpen,
  onClose,
  onUpdate,
  onDelete,
}: DealDetailModalProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editFormData, setEditFormData] = useState<Partial<Deal>>({});

  useEffect(() => {
    if (deal) {
      setEditFormData({
        title: deal.title,
        value: deal.value,
        currency: deal.currency,
        stage_id: deal.stage_id,
        contact_id: deal.contact_id,
        company_id: deal.company_id,
        expected_close_date: deal.expected_close_date || undefined,
        probability: deal.probability,
        notes: deal.notes,
      });
      setIsEditing(false);
    }
  }, [deal]);

  if (!deal) return null;

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    await onUpdate(deal.id, editFormData);
    setIsEditing(false);
  };

  const currentStage = stages.find(s => s.id === deal.stage_id);
  const contact = deal.contact_id
    ? contacts.find(c => c.id === deal.contact_id)
    : null;
  const company = deal.company_id
    ? companies.find(c => c.id === deal.company_id)
    : null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              {isEditing ? (
                <Input
                  value={editFormData.title || ''}
                  onChange={e =>
                    setEditFormData({ ...editFormData, title: e.target.value })
                  }
                  className="mb-2 text-lg font-semibold"
                  placeholder="Deal title"
                />
              ) : (
                <DialogTitle className="text-lg font-semibold">
                  {deal.title}
                </DialogTitle>
              )}
            </div>
            <div className="flex gap-2">
              {!isEditing && (
                <>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsEditing(true)}
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-destructive"
                    onClick={async () => {
                      if (
                        confirm('Are you sure you want to delete this deal?')
                      ) {
                        await onDelete(deal.id);
                        onClose();
                      }
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </>
              )}
              <Button variant="ghost" size="icon" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </DialogHeader>

        {isEditing ? (
          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="stage_id">Stage *</Label>
                <Select
                  value={editFormData.stage_id || ''}
                  onValueChange={value =>
                    setEditFormData({ ...editFormData, stage_id: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {stages.map(stage => (
                      <SelectItem key={stage.id} value={stage.id}>
                        {stage.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="value">Value</Label>
                <div className="flex gap-2">
                  <Input
                    id="value"
                    type="number"
                    step="0.01"
                    value={editFormData.value || ''}
                    onChange={e =>
                      setEditFormData({
                        ...editFormData,
                        value: e.target.value
                          ? parseFloat(e.target.value)
                          : undefined,
                      })
                    }
                  />
                  <Select
                    value={editFormData.currency || 'EUR'}
                    onValueChange={value =>
                      setEditFormData({ ...editFormData, currency: value })
                    }
                  >
                    <SelectTrigger className="w-24">
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

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="contact_id">Contact</Label>
                <Select
                  value={editFormData.contact_id || '__none__'}
                  onValueChange={value =>
                    setEditFormData({
                      ...editFormData,
                      contact_id: value === '__none__' ? undefined : value,
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select contact" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__none__">None</SelectItem>
                    {contacts.map(contact => (
                      <SelectItem key={contact.id} value={contact.id}>
                        {contact.first_name} {contact.last_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="company_id">Company</Label>
                <Select
                  value={editFormData.company_id || '__none__'}
                  onValueChange={value =>
                    setEditFormData({
                      ...editFormData,
                      company_id: value === '__none__' ? undefined : value,
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select company" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__none__">None</SelectItem>
                    {companies.map(company => (
                      <SelectItem key={company.id} value={company.id}>
                        {company.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="expected_close_date">Expected Close Date</Label>
                <Input
                  id="expected_close_date"
                  type="date"
                  value={editFormData.expected_close_date || ''}
                  onChange={e =>
                    setEditFormData({
                      ...editFormData,
                      expected_close_date: e.target.value || undefined,
                    })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="probability">Probability (%)</Label>
                <Input
                  id="probability"
                  type="number"
                  min="0"
                  max="100"
                  value={editFormData.probability || ''}
                  onChange={e =>
                    setEditFormData({
                      ...editFormData,
                      probability: e.target.value
                        ? parseInt(e.target.value)
                        : undefined,
                    })
                  }
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={editFormData.notes || ''}
                onChange={e =>
                  setEditFormData({ ...editFormData, notes: e.target.value })
                }
                rows={4}
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsEditing(false)}
              >
                Cancel
              </Button>
              <Button type="submit">Save</Button>
            </div>
          </form>
        ) : (
          <div className="space-y-6">
            {/* Deal Details */}
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-xs text-muted-foreground">Stage</div>
                  <div className="mt-1 flex items-center gap-2">
                    {currentStage && (
                      <>
                        <div
                          className="h-3 w-3 rounded-full"
                          style={{
                            backgroundColor: currentStage.color || '#3b82f6',
                          }}
                        />
                        <span className="font-medium">{currentStage.name}</span>
                      </>
                    )}
                  </div>
                </div>
                {deal.value && (
                  <div>
                    <div className="text-xs text-muted-foreground">Value</div>
                    <div className="mt-1 text-lg font-semibold">
                      {new Intl.NumberFormat('en-US', {
                        style: 'currency',
                        currency: deal.currency || 'EUR',
                      }).format(deal.value)}
                    </div>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                {contact && (
                  <div>
                    <div className="text-xs text-muted-foreground">Contact</div>
                    <div className="mt-1 flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span>
                        {contact.first_name} {contact.last_name}
                      </span>
                    </div>
                  </div>
                )}
                {company && (
                  <div>
                    <div className="text-xs text-muted-foreground">Company</div>
                    <div className="mt-1 flex items-center gap-2">
                      <Building2 className="h-4 w-4 text-muted-foreground" />
                      <span>{company.name}</span>
                    </div>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                {deal.expected_close_date && (
                  <div>
                    <div className="text-xs text-muted-foreground">
                      Expected Close Date
                    </div>
                    <div className="mt-1 flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span>
                        {new Date(deal.expected_close_date).toLocaleDateString(
                          'en-US',
                          {
                            month: 'long',
                            day: 'numeric',
                            year: 'numeric',
                          }
                        )}
                      </span>
                    </div>
                  </div>
                )}
                {deal.probability !== null && (
                  <div>
                    <div className="text-xs text-muted-foreground">
                      Probability
                    </div>
                    <div className="mt-1 flex items-center gap-2">
                      <Percent className="h-4 w-4 text-muted-foreground" />
                      <span>{deal.probability}%</span>
                    </div>
                  </div>
                )}
              </div>

              {deal.notes && (
                <div>
                  <div className="text-xs text-muted-foreground">Notes</div>
                  <div className="mt-1 whitespace-pre-wrap text-sm">
                    {deal.notes}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

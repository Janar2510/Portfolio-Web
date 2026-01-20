'use client';

import { useState } from 'react';
import { Plus, Building2, Globe, Edit2, Trash2, Users } from 'lucide-react';
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
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import type { Company } from '@/lib/services/crm';

interface CompanyListProps {
  companies: Company[];
  currentCompanyId?: string;
  onCompanySelect: (companyId: string) => void;
  onCompanyCreate: (data: Partial<Company>) => Promise<void>;
  onCompanyUpdate: (companyId: string, data: Partial<Company>) => Promise<void>;
  onCompanyDelete: (companyId: string) => Promise<void>;
  contactCounts?: Record<string, number>;
}

export function CompanyList({
  companies,
  currentCompanyId,
  onCompanySelect,
  onCompanyCreate,
  onCompanyUpdate,
  onCompanyDelete,
  contactCounts = {},
}: CompanyListProps) {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingCompany, setEditingCompany] = useState<Company | null>(null);

  const handleCreateCompany = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const address = {
      street: formData.get('street')?.toString(),
      city: formData.get('city')?.toString(),
      country: formData.get('country')?.toString(),
      postal: formData.get('postal')?.toString(),
    };

    await onCompanyCreate({
      name: formData.get('name') as string,
      website: formData.get('website')?.toString() || undefined,
      industry: formData.get('industry')?.toString() || undefined,
      size: formData.get('size')?.toString() as Company['size'] || undefined,
      address: Object.values(address).some(Boolean) ? address : undefined,
      notes: formData.get('notes')?.toString() || undefined,
    });
    setIsCreateDialogOpen(false);
    e.currentTarget.reset();
  };

  const handleEditCompany = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingCompany) return;

    const formData = new FormData(e.currentTarget);
    const address = {
      street: formData.get('street')?.toString(),
      city: formData.get('city')?.toString(),
      country: formData.get('country')?.toString(),
      postal: formData.get('postal')?.toString(),
    };

    await onCompanyUpdate(editingCompany.id, {
      name: formData.get('name') as string,
      website: formData.get('website')?.toString() || undefined,
      industry: formData.get('industry')?.toString() || undefined,
      size: formData.get('size')?.toString() as Company['size'] || undefined,
      address: Object.values(address).some(Boolean) ? address : undefined,
      notes: formData.get('notes')?.toString() || undefined,
    });
    setIsEditDialogOpen(false);
    setEditingCompany(null);
  };

  const handleDeleteCompany = async (companyId: string) => {
    if (!confirm('Are you sure you want to delete this company? Associated contacts will be unlinked.')) {
      return;
    }
    await onCompanyDelete(companyId);
  };

  return (
    <div className="flex h-full flex-col border-r bg-muted/30">
      {/* Header */}
      <div className="flex items-center justify-between border-b p-4">
        <h2 className="text-lg font-semibold">Companies</h2>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button size="icon" variant="ghost">
              <Plus className="h-4 w-4" />
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <form onSubmit={handleCreateCompany}>
              <DialogHeader>
                <DialogTitle>Create New Company</DialogTitle>
                <DialogDescription>
                  Add a new company to your CRM.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Company Name *</Label>
                  <Input id="name" name="name" required />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="website">Website</Label>
                    <Input id="website" name="website" type="url" placeholder="https://..." />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="industry">Industry</Label>
                    <Input id="industry" name="industry" placeholder="e.g., Technology" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="size">Company Size</Label>
                  <Select name="size">
                    <SelectTrigger>
                      <SelectValue placeholder="Select size" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="small">Small (1-50)</SelectItem>
                      <SelectItem value="medium">Medium (51-200)</SelectItem>
                      <SelectItem value="large">Large (201-1000)</SelectItem>
                      <SelectItem value="enterprise">Enterprise (1000+)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Address</Label>
                  <div className="grid grid-cols-2 gap-2">
                    <Input name="street" placeholder="Street" />
                    <Input name="city" placeholder="City" />
                    <Input name="country" placeholder="Country" />
                    <Input name="postal" placeholder="Postal Code" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea id="notes" name="notes" rows={3} />
                </div>
              </div>
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsCreateDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit">Create</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Companies List */}
      <div className="flex-1 overflow-y-auto">
        {companies.length === 0 ? (
          <div className="p-4 text-center text-sm text-muted-foreground">
            No companies yet. Create your first company!
          </div>
        ) : (
          <div className="p-2">
            {companies.map((company) => (
              <div
                key={company.id}
                className={cn(
                  'group relative mb-1 rounded-md border p-3 transition-colors hover:bg-accent',
                  currentCompanyId === company.id && 'bg-accent'
                )}
              >
                <button
                  onClick={() => onCompanySelect(company.id)}
                  className="flex w-full items-start gap-3 text-left"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <Building2 className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium">{company.name}</h3>
                    <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                      {company.website && (
                        <div className="flex items-center gap-1">
                          <Globe className="h-3 w-3" />
                          {company.website}
                        </div>
                      )}
                      {company.industry && (
                        <span>{company.industry}</span>
                      )}
                      {contactCounts[company.id] !== undefined && (
                        <div className="flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          {contactCounts[company.id]} contacts
                        </div>
                      )}
                    </div>
                  </div>
                </button>
                <div className="absolute right-2 top-2 flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-7 w-7"
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditingCompany(company);
                      setIsEditDialogOpen(true);
                    }}
                  >
                    <Edit2 className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-7 w-7 text-destructive hover:text-destructive"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteCompany(company.id);
                    }}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          {editingCompany && (
            <form onSubmit={handleEditCompany}>
              <DialogHeader>
                <DialogTitle>Edit Company</DialogTitle>
                <DialogDescription>
                  Update company information.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-name">Company Name *</Label>
                  <Input
                    id="edit-name"
                    name="name"
                    defaultValue={editingCompany.name}
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-website">Website</Label>
                    <Input
                      id="edit-website"
                      name="website"
                      type="url"
                      defaultValue={editingCompany.website || ''}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-industry">Industry</Label>
                    <Input
                      id="edit-industry"
                      name="industry"
                      defaultValue={editingCompany.industry || ''}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-size">Company Size</Label>
                  <Select name="size" defaultValue={editingCompany.size || ''}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select size" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="small">Small (1-50)</SelectItem>
                      <SelectItem value="medium">Medium (51-200)</SelectItem>
                      <SelectItem value="large">Large (201-1000)</SelectItem>
                      <SelectItem value="enterprise">Enterprise (1000+)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Address</Label>
                  <div className="grid grid-cols-2 gap-2">
                    <Input
                      name="street"
                      placeholder="Street"
                      defaultValue={editingCompany.address?.street || ''}
                    />
                    <Input
                      name="city"
                      placeholder="City"
                      defaultValue={editingCompany.address?.city || ''}
                    />
                    <Input
                      name="country"
                      placeholder="Country"
                      defaultValue={editingCompany.address?.country || ''}
                    />
                    <Input
                      name="postal"
                      placeholder="Postal Code"
                      defaultValue={editingCompany.address?.postal || ''}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-notes">Notes</Label>
                  <Textarea
                    id="edit-notes"
                    name="notes"
                    rows={3}
                    defaultValue={editingCompany.notes || ''}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsEditDialogOpen(false);
                    setEditingCompany(null);
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit">Save</Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

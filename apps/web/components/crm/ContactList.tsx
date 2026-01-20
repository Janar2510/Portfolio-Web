'use client';

import { useState, useMemo } from 'react';
import { Search, Plus, Filter, X, Mail, Phone, Building2, Tag, Edit2, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import type { Contact, Company } from '@/lib/services/crm';

interface ContactListProps {
  contacts: Contact[];
  companies: Company[];
  onContactSelect: (contactId: string) => void;
  onContactCreate: (data: Partial<Contact>) => Promise<void>;
  onContactUpdate: (contactId: string, data: Partial<Contact>) => Promise<void>;
  onContactDelete: (contactId: string) => Promise<void>;
}

export function ContactList({
  contacts,
  companies,
  onContactSelect,
  onContactCreate,
  onContactUpdate,
  onContactDelete,
}: ContactListProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCompany, setSelectedCompany] = useState<string>('all');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingContact, setEditingContact] = useState<Contact | null>(null);

  // Get all unique tags from contacts
  const allTags = useMemo(() => {
    const tags = new Set<string>();
    contacts.forEach((contact) => {
      contact.tags.forEach((tag) => tags.add(tag));
    });
    return Array.from(tags).sort();
  }, [contacts]);

  // Filter contacts
  const filteredContacts = useMemo(() => {
    return contacts.filter((contact) => {
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesSearch =
          contact.first_name.toLowerCase().includes(query) ||
          contact.last_name?.toLowerCase().includes(query) ||
          contact.email?.toLowerCase().includes(query) ||
          contact.phone?.toLowerCase().includes(query);
        if (!matchesSearch) return false;
      }

      // Company filter
      if (selectedCompany !== 'all') {
        if (contact.company_id !== selectedCompany) return false;
      }

      // Tags filter
      if (selectedTags.length > 0) {
        const hasAllTags = selectedTags.every((tag) => contact.tags.includes(tag));
        if (!hasAllTags) return false;
      }

      return true;
    });
  }, [contacts, searchQuery, selectedCompany, selectedTags]);

  const handleCreateContact = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const tags = formData.get('tags')?.toString().split(',').filter(Boolean) || [];

    await onContactCreate({
      company_id: formData.get('company_id')?.toString() || undefined,
      first_name: formData.get('first_name') as string,
      last_name: formData.get('last_name')?.toString() || undefined,
      email: formData.get('email')?.toString() || undefined,
      phone: formData.get('phone')?.toString() || undefined,
      job_title: formData.get('job_title')?.toString() || undefined,
      lead_source: formData.get('lead_source')?.toString() || undefined,
      tags: tags.length > 0 ? tags : undefined,
    });
    setIsCreateDialogOpen(false);
    e.currentTarget.reset();
  };

  const handleEditContact = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingContact) return;

    const formData = new FormData(e.currentTarget);
    const tags = formData.get('tags')?.toString().split(',').filter(Boolean) || [];

    await onContactUpdate(editingContact.id, {
      company_id: formData.get('company_id')?.toString() || null,
      first_name: formData.get('first_name') as string,
      last_name: formData.get('last_name')?.toString() || undefined,
      email: formData.get('email')?.toString() || undefined,
      phone: formData.get('phone')?.toString() || undefined,
      job_title: formData.get('job_title')?.toString() || undefined,
      lead_source: formData.get('lead_source')?.toString() || undefined,
      tags: tags.length > 0 ? tags : undefined,
    });
    setIsEditDialogOpen(false);
    setEditingContact(null);
  };

  const handleDeleteContact = async (contactId: string) => {
    if (!confirm('Are you sure you want to delete this contact?')) {
      return;
    }
    await onContactDelete(contactId);
  };

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const getCompanyName = (companyId: string | null) => {
    if (!companyId) return null;
    return companies.find((c) => c.id === companyId)?.name;
  };

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex items-center justify-between border-b p-4">
        <h2 className="text-lg font-semibold">Contacts</h2>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button size="icon" variant="ghost">
              <Plus className="h-4 w-4" />
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <form onSubmit={handleCreateContact}>
              <DialogHeader>
                <DialogTitle>Create New Contact</DialogTitle>
                <DialogDescription>
                  Add a new contact to your CRM.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="first_name">First Name *</Label>
                    <Input id="first_name" name="first_name" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="last_name">Last Name</Label>
                    <Input id="last_name" name="last_name" />
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
                    <Label htmlFor="company_id">Company</Label>
                    <Select name="company_id">
                      <SelectTrigger>
                        <SelectValue placeholder="Select company" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">None</SelectItem>
                        {companies.map((company) => (
                          <SelectItem key={company.id} value={company.id}>
                            {company.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="job_title">Job Title</Label>
                    <Input id="job_title" name="job_title" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lead_source">Lead Source</Label>
                  <Input id="lead_source" name="lead_source" placeholder="e.g., website, referral" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tags">Tags (comma-separated)</Label>
                  <Input id="tags" name="tags" placeholder="lead, customer, vip" />
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

      {/* Filters */}
      <div className="border-b p-4 space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search contacts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <Select value={selectedCompany} onValueChange={setSelectedCompany}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="All Companies" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Companies</SelectItem>
              {companies.map((company) => (
                <SelectItem key={company.id} value={company.id}>
                  {company.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {allTags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {allTags.map((tag) => (
                <Badge
                  key={tag}
                  variant={selectedTags.includes(tag) ? 'default' : 'outline'}
                  className="cursor-pointer"
                  onClick={() => toggleTag(tag)}
                >
                  <Tag className="mr-1 h-3 w-3" />
                  {tag}
                </Badge>
              ))}
            </div>
          )}
          {(selectedCompany !== 'all' || selectedTags.length > 0) && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setSelectedCompany('all');
                setSelectedTags([]);
              }}
            >
              <X className="mr-1 h-3 w-3" />
              Clear
            </Button>
          )}
        </div>
      </div>

      {/* Contacts List */}
      <div className="flex-1 overflow-y-auto">
        {filteredContacts.length === 0 ? (
          <div className="p-4 text-center text-sm text-muted-foreground">
            {contacts.length === 0
              ? 'No contacts yet. Create your first contact!'
              : 'No contacts match your filters.'}
          </div>
        ) : (
          <div className="p-2">
            {filteredContacts.map((contact) => (
              <div
                key={contact.id}
                className="group relative mb-1 rounded-md border p-3 transition-colors hover:bg-accent"
              >
                <button
                  onClick={() => onContactSelect(contact.id)}
                  className="flex w-full items-start gap-3 text-left"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                    {contact.avatar_url ? (
                      <img
                        src={contact.avatar_url}
                        alt={`${contact.first_name} ${contact.last_name || ''}`}
                        className="h-full w-full rounded-full object-cover"
                      />
                    ) : (
                      <span className="text-sm font-semibold">
                        {contact.first_name[0]}
                        {contact.last_name?.[0]}
                      </span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium">
                        {contact.first_name} {contact.last_name}
                      </h3>
                      {contact.job_title && (
                        <span className="text-xs text-muted-foreground">
                          {contact.job_title}
                        </span>
                      )}
                    </div>
                    <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                      {contact.email && (
                        <div className="flex items-center gap-1">
                          <Mail className="h-3 w-3" />
                          {contact.email}
                        </div>
                      )}
                      {contact.phone && (
                        <div className="flex items-center gap-1">
                          <Phone className="h-3 w-3" />
                          {contact.phone}
                        </div>
                      )}
                      {contact.company_id && (
                        <div className="flex items-center gap-1">
                          <Building2 className="h-3 w-3" />
                          {getCompanyName(contact.company_id)}
                        </div>
                      )}
                    </div>
                    {contact.tags.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {contact.tags.map((tag) => (
                          <Badge key={tag} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </button>
                <div className="absolute right-2 top-2 flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-7 w-7"
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditingContact(contact);
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
                      handleDeleteContact(contact.id);
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
          {editingContact && (
            <form onSubmit={handleEditContact}>
              <DialogHeader>
                <DialogTitle>Edit Contact</DialogTitle>
                <DialogDescription>
                  Update contact information.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-first_name">First Name *</Label>
                    <Input
                      id="edit-first_name"
                      name="first_name"
                      defaultValue={editingContact.first_name}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-last_name">Last Name</Label>
                    <Input
                      id="edit-last_name"
                      name="last_name"
                      defaultValue={editingContact.last_name || ''}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-email">Email</Label>
                    <Input
                      id="edit-email"
                      name="email"
                      type="email"
                      defaultValue={editingContact.email || ''}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-phone">Phone</Label>
                    <Input
                      id="edit-phone"
                      name="phone"
                      type="tel"
                      defaultValue={editingContact.phone || ''}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-company_id">Company</Label>
                    <Select name="company_id" defaultValue={editingContact.company_id || ''}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select company" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">None</SelectItem>
                        {companies.map((company) => (
                          <SelectItem key={company.id} value={company.id}>
                            {company.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-job_title">Job Title</Label>
                    <Input
                      id="edit-job_title"
                      name="job_title"
                      defaultValue={editingContact.job_title || ''}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-lead_source">Lead Source</Label>
                  <Input
                    id="edit-lead_source"
                    name="lead_source"
                    defaultValue={editingContact.lead_source || ''}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-tags">Tags (comma-separated)</Label>
                  <Input
                    id="edit-tags"
                    name="tags"
                    defaultValue={editingContact.tags.join(', ')}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsEditDialogOpen(false);
                    setEditingContact(null);
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

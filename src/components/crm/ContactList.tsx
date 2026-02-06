'use client';

import { useState, useMemo } from 'react';
import {
  Search,
  Plus,
  Filter,
  X,
  Mail,
  Phone,
  Building2,
  Tag,
  Edit2,
  Trash2,
  LayoutGrid,
  List,
  TrendingUp,
  User,
  MoreHorizontal,
  ArrowRight,
  Sparkles
} from 'lucide-react';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import type { Person as Contact, Organization as Company } from '@/domain/crm/types';
import { AddContactDialog } from './AddContactDialog';

interface ContactListProps {
  contacts: Contact[];
  companies: Company[];
  onContactSelect: (contactId: string) => void;
  onContactCreate: (data: Partial<Contact>) => Promise<void>;
  onContactUpdate: (contactId: string, data: Partial<Contact>) => Promise<void>;
  onContactDelete: (contactId: string) => Promise<void>;
  onCreateDeal?: (contact: Contact) => void;
}

export function ContactList({
  contacts,
  companies,
  onContactSelect,
  onContactCreate,
  onContactUpdate,
  onContactDelete,
  onCreateDeal,
}: ContactListProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCompany, setSelectedCompany] = useState<string>('all');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingContact, setEditingContact] = useState<Contact | null>(null);

  // Get all unique tags from contacts
  const allTags = useMemo(() => {
    const tags = new Set<string>();
    contacts.forEach(contact => {
      contact.label_ids?.forEach(tag => tags.add(tag));
    });
    return Array.from(tags).sort();
  }, [contacts]);

  // Filter contacts
  const filteredContacts = useMemo(() => {
    return contacts.filter(contact => {
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesSearch =
          contact.first_name?.toLowerCase().includes(query) ||
          contact.last_name?.toLowerCase().includes(query) ||
          contact.emails?.[0]?.value?.toLowerCase().includes(query) ||
          contact.phones?.[0]?.value?.toLowerCase().includes(query);
        if (!matchesSearch) return false;
      }

      // Company filter
      if (selectedCompany !== 'all') {
        if (contact.organization_id !== selectedCompany) return false;
      }

      // Tags filter (label_ids)
      if (selectedTags.length > 0) {
        const hasAllTags = selectedTags.every(tag =>
          contact.label_ids?.includes(tag)
        );
        if (!hasAllTags) return false;
      }

      return true;
    });
  }, [contacts, searchQuery, selectedCompany, selectedTags]);

  const handleCreateContact = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    const tags =
      formData.get('tags')?.toString().split(',').filter(Boolean) || [];

    await onContactCreate({
      organization_id: formData.get('company_id')?.toString() || undefined,
      first_name: formData.get('first_name') as string,
      last_name: formData.get('last_name')?.toString() || undefined,
      emails: [{ value: formData.get('email')?.toString() || '', label: 'work', primary: true }],
      phones: [{ value: formData.get('phone')?.toString() || '', label: 'work', primary: true }],
      job_title: formData.get('job_title')?.toString() || undefined,
      label_ids: tags,
    });

    form.reset();
    setIsCreateDialogOpen(false);
  };

  const handleEditContact = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingContact) return;

    const formData = new FormData(e.currentTarget);
    const tags =
      formData.get('tags')?.toString().split(',').filter(Boolean) || [];

    await onContactUpdate(editingContact.id, {
      organization_id:
        formData.get('company_id')?.toString() === '__none__'
          ? undefined
          : formData.get('company_id')?.toString() || undefined,
      first_name: formData.get('first_name') as string,
      last_name: formData.get('last_name')?.toString() || undefined,
      emails: [{ value: formData.get('email')?.toString() || '', label: 'work', primary: true }],
      phones: [{ value: formData.get('phone')?.toString() || '', label: 'work', primary: true }],
      job_title: formData.get('job_title')?.toString() || undefined,
      label_ids: tags,
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
    setSelectedTags(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  const getCompanyName = (companyId: string | undefined | null) => {
    if (!companyId) return null;
    return companies.find(c => c.id === companyId)?.name;
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-bold uppercase tracking-widest">
            <Sparkles className="w-3 h-3" />
            CRM Database
          </div>
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-white m-0 font-display uppercase">Contacts</h2>
          <p className="text-[11px] font-black uppercase tracking-widest text-white/20">
            {contacts.length} people in your network
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center bg-white/5 p-1 rounded-xl border border-white/5 mr-2">
            <button
              onClick={() => setViewMode('grid')}
              className={cn(
                "p-2 rounded-lg transition-all",
                viewMode === 'grid'
                  ? "bg-primary/20 text-primary shadow-glow-seafoam-sm"
                  : "text-white/40 hover:text-white/60"
              )}
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={cn(
                "p-2 rounded-lg transition-all",
                viewMode === 'list'
                  ? "bg-primary/20 text-primary shadow-glow-seafoam-sm"
                  : "text-white/40 hover:text-white/60"
              )}
            >
              <List className="w-4 h-4" />
            </button>
          </div>

          <Button
            onClick={() => setIsCreateDialogOpen(true)}
            className="rounded-2xl bg-primary text-white hover:bg-primary/90 shadow-glow-seafoam px-6 h-11 transition-all active:scale-95"
          >
            <Plus className="mr-2 h-4 w-4" />
            <span className="font-bold">Add Contact</span>
          </Button>

          <AddContactDialog
            isOpen={isCreateDialogOpen}
            onClose={() => setIsCreateDialogOpen(false)}
            onCreateContact={onContactCreate}
          />
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 items-center bg-white/[0.02] border border-white/5 p-4 rounded-3xl backdrop-blur-sm">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/20" />
          <Input
            placeholder="Search contacts..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="pl-11 h-12 bg-white/5 border-white/5 rounded-2xl focus:border-primary/20 transition-all font-medium text-white placeholder:text-white/20"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <Select value={selectedCompany} onValueChange={setSelectedCompany}>
            <SelectTrigger className="w-[180px] h-12 bg-white/5 border-white/5 rounded-2xl text-white/60">
              <SelectValue placeholder="All Companies" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Companies</SelectItem>
              {companies.map(company => (
                <SelectItem key={company.id} value={company.id}>
                  {company.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {allTags.length > 0 && (
            <div className="flex flex-wrap gap-2 items-center px-2">
              <span className="text-[10px] font-black uppercase tracking-widest text-white/10 mr-2">Tags:</span>
              {allTags.map(tag => (
                <Badge
                  key={tag}
                  variant="outline"
                  className={cn(
                    "cursor-pointer transition-all rounded-lg py-1.5 px-3 border-white/5",
                    selectedTags.includes(tag)
                      ? "bg-primary/20 border-primary/20 text-primary"
                      : "bg-white/5 text-white/40 hover:bg-white/10"
                  )}
                  onClick={() => toggleTag(tag)}
                >
                  <Tag className="mr-1.5 h-3 w-3" />
                  {tag}
                </Badge>
              ))}
            </div>
          )}
          {(selectedCompany !== 'all' || selectedTags.length > 0) && (
            <Button
              variant="ghost"
              size="sm"
              className="h-12 px-4 rounded-2xl text-white/40 hover:text-white hover:bg-white/5"
              onClick={() => {
                setSelectedCompany('all');
                setSelectedTags([]);
              }}
            >
              <X className="mr-2 h-3 w-3" />
              Clear
            </Button>
          )}
        </div>
      </div>

      {/* Contacts View */}
      <div className="flex-1 min-h-[500px]">
        {filteredContacts.length === 0 ? (
          /* Empty State */
          <div className="flex flex-col items-center justify-center py-24 rounded-[3rem] border border-dashed border-white/10 bg-white/[0.01]">
            <div className="w-20 h-20 rounded-full bg-white/[0.02] border border-white/5 flex items-center justify-center mb-6">
              <User className="w-8 h-8 text-white/10" />
            </div>
            <h3 className="text-xl font-bold text-white/40 uppercase tracking-tight font-display mb-2">No Contacts Found</h3>
            <p className="text-[11px] font-black uppercase tracking-widest text-white/10 mb-8">Try adjusting your filters</p>
          </div>
        ) : viewMode === 'grid' ? (
          /* Grid View */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredContacts.map(contact => (
              <div
                key={contact.id}
                onClick={() => onContactSelect(contact.id)}
                className="group relative rounded-[2rem] border border-white/5 bg-white/[0.02] p-6 shadow-sm backdrop-blur-xl transition-all duration-300 hover:bg-white/[0.04] hover:border-primary/20 hover:shadow-glow-seafoam-sm cursor-pointer"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/5 text-primary border border-white/5 font-bold text-lg">
                    {contact.avatar_url ? (
                      <img
                        src={contact.avatar_url}
                        alt={`${contact.first_name || ''} ${contact.last_name || ''}`}
                        className="h-full w-full rounded-2xl object-cover"
                      />
                    ) : (
                      <span>
                        {contact.first_name ? contact.first_name[0] : ''}
                        {contact.last_name ? contact.last_name[0] : ''}
                      </span>
                    )}
                  </div>
                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    {/* Quick Actions */}
                    {onCreateDeal && (
                      <button
                        onClick={(e) => { e.stopPropagation(); onCreateDeal(contact); }}
                        className="p-2 rounded-xl hover:bg-primary/20 text-white/20 hover:text-primary transition-colors"
                        title="Create Deal"
                      >
                        <TrendingUp className="w-4 h-4" />
                      </button>
                    )}
                    <button
                      onClick={(e) => { e.stopPropagation(); setEditingContact(contact); setIsEditDialogOpen(true); }}
                      className="p-2 rounded-xl hover:bg-white/10 text-white/20 hover:text-white transition-colors"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="space-y-1 mb-4">
                  <h3 className="font-bold text-xl text-white tracking-tight leading-tight line-clamp-1">
                    {contact.first_name} {contact.last_name}
                  </h3>
                  <div className="text-sm font-medium text-white/40 truncate">
                    {contact.job_title || 'No Job Title'}
                  </div>
                </div>

                <div className="space-y-3 pt-4 border-t border-white/5">
                  {(contact.emails?.[0]?.value) && (
                    <div className="flex items-center gap-2 text-xs text-white/60">
                      <Mail className="w-3 h-3 text-white/20" />
                      <span className="truncate">{contact.emails[0].value}</span>
                    </div>
                  )}
                  {(contact.phones?.[0]?.value) && (
                    <div className="flex items-center gap-2 text-xs text-white/60">
                      <Phone className="w-3 h-3 text-white/20" />
                      <span className="truncate">{contact.phones[0].value}</span>
                    </div>
                  )}
                  {(contact.organization_id) && (
                    <div className="flex items-center gap-2 text-xs text-white/60">
                      <Building2 className="w-3 h-3 text-white/20" />
                      <span className="truncate">{getCompanyName(contact.organization_id)}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* List View */
          <div className="w-full overflow-x-auto scrollbar-none">
            <div className="min-w-[1000px] space-y-2">
              {/* Table Header */}
              <div className="flex items-center px-8 py-4 bg-white/[0.03] rounded-3xl border border-white/5 text-[10px] font-black uppercase tracking-widest text-white/30">
                <div className="flex-[2]">Contact</div>
                <div className="flex-[1.5]">Job Title</div>
                <div className="flex-[1.5]">Company</div>
                <div className="flex-[2]">Email & Phone</div>
                <div className="flex-1 text-center">Tags</div>
                <div className="w-[140px] text-right">Actions</div>
              </div>

              {/* Rows */}
              {filteredContacts.map(contact => (
                <div
                  key={contact.id}
                  onClick={() => onContactSelect(contact.id)}
                  className="group flex items-center px-8 py-4 bg-white/[0.01] hover:bg-white/[0.04] rounded-3xl border border-white/5 hover:border-primary/20 transition-all duration-300 backdrop-blur-sm cursor-pointer"
                >
                  {/* Contact Name & Avatar */}
                  <div className="flex-[2] flex items-center gap-4 pr-4">
                    <div className="h-10 w-10 shrink-0 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center font-bold text-white/60">
                      {contact.avatar_url ? (
                        <img src={contact.avatar_url} alt="" className="h-full w-full rounded-xl object-cover" />
                      ) : (
                        <span>{contact.first_name?.[0]}{contact.last_name?.[0]}</span>
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="font-bold text-white group-hover:text-primary transition-colors truncate">
                        {contact.first_name} {contact.last_name}
                      </div>
                    </div>
                  </div>

                  {/* Job Title */}
                  <div className="flex-[1.5] text-sm font-medium text-white/60 truncate pr-4">
                    {contact.job_title || <span className="text-white/10 italic">N/A</span>}
                  </div>

                  {/* Company */}
                  <div className="flex-[1.5] flex items-center gap-2 text-sm font-medium text-white/60 truncate pr-4">
                    {contact.organization_id ? (
                      <>
                        <Building2 className="w-3 h-3 text-white/20" />
                        {getCompanyName(contact.organization_id)}
                      </>
                    ) : (
                      <span className="text-white/10 italic">No Company</span>
                    )}
                  </div>

                  {/* Contact Info */}
                  <div className="flex-[2] space-y-1 pr-4">
                    {contact.emails?.[0]?.value && (
                      <div className="flex items-center gap-2 text-xs text-white/50 truncate">
                        <Mail className="w-3 h-3 text-white/20" />
                        {contact.emails[0].value}
                      </div>
                    )}
                    {contact.phones?.[0]?.value && (
                      <div className="flex items-center gap-2 text-xs text-white/50 truncate">
                        <Phone className="w-3 h-3 text-white/20" />
                        {contact.phones[0].value}
                      </div>
                    )}
                  </div>

                  {/* Tags */}
                  <div className="flex-1 flex justify-center gap-1 flex-wrap">
                    {contact.label_ids?.slice(0, 2).map(tag => (
                      <span key={tag} className="px-2 py-0.5 rounded-lg bg-white/5 border border-white/5 text-[9px] font-bold uppercase text-white/40">
                        {tag}
                      </span>
                    ))}
                    {(contact.label_ids?.length || 0) > 2 && (
                      <span className="px-2 py-0.5 rounded-lg bg-white/5 border border-white/5 text-[9px] font-bold text-white/40">
                        +{contact.label_ids!.length - 2}
                      </span>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="w-[140px] flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    {onCreateDeal && (
                      <button
                        onClick={(e) => { e.stopPropagation(); onCreateDeal(contact); }}
                        className="p-2 rounded-xl hover:bg-primary/20 text-white/20 hover:text-primary transition-colors"
                        title="Create Deal"
                      >
                        <TrendingUp className="w-4 h-4" />
                      </button>
                    )}
                    <button
                      onClick={(e) => { e.stopPropagation(); setEditingContact(contact); setIsEditDialogOpen(true); }}
                      className="p-2 rounded-xl hover:bg-white/10 text-white/20 hover:text-white transition-colors"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleDeleteContact(contact.id); }}
                      className="p-2 rounded-xl hover:bg-red-500/10 text-white/20 hover:text-red-400 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Edit Dialog - Styled */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-xl p-0 gap-0 overflow-hidden bg-black/60 backdrop-blur-3xl border-white/5 shadow-[0_0_100px_rgba(0,0,0,0.8)] text-foreground rounded-[2rem]">
          {editingContact && (
            <form onSubmit={handleEditContact}>
              <DialogHeader className="p-8 border-b border-white/5 bg-gradient-to-b from-white/[0.03] to-transparent">
                <DialogTitle className="text-2xl font-bold tracking-tight text-white font-display uppercase">Edit Contact</DialogTitle>
                <DialogDescription className="text-white/40">
                  Update details for {editingContact.first_name} {editingContact.last_name}.
                </DialogDescription>
              </DialogHeader>
              <div className="p-8 space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-white/20">First Name *</Label>
                    <Input
                      name="first_name"
                      defaultValue={editingContact?.first_name}
                      required
                      className="h-12 bg-white/5 border-white/10 rounded-xl"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-white/20">Last Name</Label>
                    <Input
                      name="last_name"
                      defaultValue={editingContact?.last_name || ''}
                      className="h-12 bg-white/5 border-white/10 rounded-xl"
                    />
                  </div>
                </div>
                {/* Email/Phone */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-white/20">Email</Label>
                    <Input
                      name="email"
                      type="email"
                      defaultValue={editingContact?.emails?.[0]?.value || ''}
                      className="h-12 bg-white/5 border-white/10 rounded-xl"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-white/20">Phone</Label>
                    <Input
                      name="phone"
                      type="tel"
                      defaultValue={editingContact?.phones?.[0]?.value || ''}
                      className="h-12 bg-white/5 border-white/10 rounded-xl"
                    />
                  </div>
                </div>
                {/* Company/Title */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-white/20">Company</Label>
                    <Select
                      name="company_id"
                      defaultValue={editingContact?.organization_id || ''}
                    >
                      <SelectTrigger className="h-12 bg-white/5 border-white/10 rounded-xl">
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
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-white/20">Job Title</Label>
                    <Input
                      name="job_title"
                      defaultValue={editingContact?.job_title || ''}
                      className="h-12 bg-white/5 border-white/10 rounded-xl"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-white/20">Tags</Label>
                  <Input
                    name="tags"
                    defaultValue={editingContact?.label_ids?.join(', ') || ''}
                    className="h-12 bg-white/5 border-white/10 rounded-xl"
                  />
                </div>
              </div>
              <DialogFooter className="p-8 border-t border-white/5 bg-white/[0.01]">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setIsEditDialogOpen(false)}
                  className="rounded-xl hover:bg-white/5 text-white/40"
                >
                  Cancel
                </Button>
                <Button type="submit" className="rounded-xl bg-primary text-white hover:bg-primary/90 shadow-glow-seafoam font-bold px-8">Save Changes</Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div >
  );
}

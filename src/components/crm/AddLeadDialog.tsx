'use client';

import { useState, useEffect } from 'react';
import {
    Plus,
    User,
    Building2,
    Mail,
    Phone,
    TrendingUp,
    Globe,
    Tag,
    Sparkles,
    CheckCircle2
} from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import type { Lead } from '@/domain/crm/types';
import { useEntityResolver } from '@/hooks/use-entity-resolver';
import { useQuery } from '@tanstack/react-query';
import { fieldDefinitionsService } from '@/domain/crm/services/field-definitions-service';
import { CustomFieldRenderer } from '@/components/crm/CustomFieldRenderer';

interface AddLeadDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onCreateLead: (data: Partial<Lead>) => Promise<void>;
}
export function AddLeadDialog({
    isOpen,
    onClose,
    onCreateLead,
}: AddLeadDialogProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { resolve, isResolving, resolvedData } = useEntityResolver();

    // Field states
    const [personName, setPersonName] = useState('');
    const [orgName, setOrgName] = useState('');
    const [phone, setPhone] = useState('');
    const [customOrgs, setCustomOrgs] = useState<Record<string, any>>({});

    // Fetch custom fields
    const { data: customFields = [] } = useQuery({
        queryKey: ['custom-fields', 'lead'],
        queryFn: () => fieldDefinitionsService.getByEntity('lead'),
        enabled: isOpen,
    });

    const handleEmailBlur = async (e: React.FocusEvent<HTMLInputElement>) => {
        const email = e.target.value;
        if (email) {
            await resolve(email);
        }
    };

    // React to resolution
    useEffect(() => {
        if (resolvedData) {
            if (resolvedData.person) {
                setPersonName(`${resolvedData.person.first_name || ''} ${resolvedData.person.last_name || ''}`.trim());
                if (resolvedData.person.phones && resolvedData.person.phones.length > 0) {
                    setPhone(resolvedData.person.phones[0].value);
                }
            }
            if (resolvedData.organization) {
                setOrgName(resolvedData.organization.name);
            }
        }
    }, [resolvedData]);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const formData = new FormData(e.currentTarget);
            const payload = {
                title: formData.get('title') as string,
                source_name: formData.get('source_name')?.toString() || undefined,
                person_name: personName || formData.get('person_name')?.toString() || undefined,
                organization_name: orgName || formData.get('organization_name')?.toString() || undefined,
                email: (formData.get('email')?.toString() || '').trim() || undefined,
                phone: phone || formData.get('phone')?.toString() || undefined,
                expected_value: formData.get('expected_value')
                    ? Number(formData.get('expected_value'))
                    : undefined,
                currency: (formData.get('currency') as string) || 'EUR',
                status: 'new' as const,
                // Pass IDs if we resolved them (or let generic creation handle it)
                custom_fields: {
                    ...customOrgs,
                    linked_person_id: resolvedData?.person?.id,
                    linked_organization_id: resolvedData?.organization?.id,
                }
            };

            await onCreateLead(payload);
            setCustomOrgs({});
            onClose();
        } catch (error) {
            console.error('Failed to create lead:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => {
            if (!open) setCustomOrgs({});
            onClose();
        }}>
            <DialogContent className="max-w-xl p-0 gap-0 overflow-hidden bg-black/40 backdrop-blur-3xl border-white/5 shadow-[0_0_100px_rgba(0,0,0,0.5)] text-foreground rounded-[3rem]" aria-describedby="add-lead-description">
                <DialogHeader className="p-8 border-b border-white/5 flex flex-row items-center justify-between bg-white/[0.01]">
                    <div className="space-y-1">
                        <div className="inline-flex items-center gap-2 px-2 py-0.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-black uppercase tracking-widest">
                            <Sparkles className="w-3 h-3" />
                            New Opportunity
                        </div>
                        <DialogTitle className="text-3xl font-bold tracking-tight text-white font-display uppercase">Add New Lead</DialogTitle>
                    </div>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="p-8 space-y-8 max-h-[70vh] overflow-y-auto scrollbar-none">

                    {/* Basic Info */}
                    <div className="space-y-6">
                        <div className="space-y-3">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-white/30 ml-1">Engagement Title</Label>
                            <Input
                                name="title"
                                required
                                placeholder="e.g. Enterprise Cloud Migration"
                                className="h-14 rounded-2xl bg-white/[0.02] border-white/5 focus:border-primary/40 focus:bg-white/[0.04] transition-all text-lg font-medium"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-6">
                            <div className="space-y-3">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-white/30 ml-1">Lead Source</Label>
                                <div className="relative group">
                                    <Globe className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-white/20 group-hover:text-primary transition-colors" />
                                    <Input
                                        name="source_name"
                                        placeholder="e.g. Referral"
                                        className="h-14 pl-12 rounded-2xl bg-white/[0.02] border-white/5 focus:border-primary/40 focus:bg-white/[0.04] transition-all"
                                    />
                                </div>
                            </div>
                            <div className="space-y-3">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-white/30 ml-1">Expected Revenue</Label>
                                <div className="flex gap-3">
                                    <Input
                                        type="number"
                                        name="expected_value"
                                        placeholder="0.00"
                                        className="h-14 flex-1 rounded-2xl bg-white/[0.02] border-white/5 focus:border-primary/40 text-lg font-bold font-display"
                                    />
                                    <Select name="currency" defaultValue="EUR">
                                        <SelectTrigger className="h-14 w-[100px] rounded-2xl bg-white/[0.02] border-white/5 focus:border-primary/40 font-bold">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent className="bg-zinc-900/90 backdrop-blur-xl border-white/10 rounded-2xl">
                                            <SelectItem value="EUR">EUR</SelectItem>
                                            <SelectItem value="USD">USD</SelectItem>
                                            <SelectItem value="GBP">GBP</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="h-px bg-white/5 w-full" />

                    {/* Contact Details */}
                    <div className="space-y-6">
                        <div className="grid grid-cols-2 gap-6">
                            <div className="space-y-3">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-white/30 ml-1">Person Name</Label>
                                <div className="relative group">
                                    <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-white/20 group-hover:text-primary transition-colors" />
                                    <Input
                                        name="person_name"
                                        placeholder="Full Name"
                                        value={personName}
                                        onChange={(e) => setPersonName(e.target.value)}
                                        className="h-14 pl-12 rounded-2xl bg-white/[0.02] border-white/5 focus:border-primary/40 focus:bg-white/[0.04] transition-all"
                                    />
                                </div>
                            </div>
                            <div className="space-y-3">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-white/30 ml-1">Organization</Label>
                                <div className="relative group">
                                    <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-white/20 group-hover:text-primary transition-colors" />
                                    <Input
                                        name="organization_name"
                                        placeholder="Company Name"
                                        value={orgName}
                                        onChange={(e) => setOrgName(e.target.value)}
                                        className="h-14 pl-12 rounded-2xl bg-white/[0.02] border-white/5 focus:border-primary/40 focus:bg-white/[0.04] transition-all"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-6">
                            <div className="space-y-3">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-white/30 ml-1">Email Address</Label>
                                <div className="relative group">
                                    <Mail className={cn("absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 transition-colors", isResolving ? "text-primary animate-pulse" : "text-white/20 group-hover:text-primary")} />
                                    <Input
                                        name="email"
                                        type="email"
                                        placeholder="name@company.com"
                                        onBlur={handleEmailBlur}
                                        className="h-14 pl-12 rounded-2xl bg-white/[0.02] border-white/5 focus:border-primary/40 focus:bg-white/[0.04] transition-all"
                                    />
                                    {isResolving && (
                                        <div className="absolute right-4 top-1/2 -translate-y-1/2">
                                            <span className="relative flex h-2 w-2">
                                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                                                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className="space-y-3">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-white/30 ml-1">Phone Number</Label>
                                <div className="relative group">
                                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-white/20 group-hover:text-primary transition-colors" />
                                    <Input
                                        name="phone"
                                        type="tel"
                                        placeholder="+1 (555) 000-0000"
                                        value={phone}
                                        onChange={(e) => setPhone(e.target.value)}
                                        className="h-14 pl-12 rounded-2xl bg-white/[0.02] border-white/5 focus:border-primary/40 focus:bg-white/[0.04] transition-all"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Custom Fields */}
                    {customFields.length > 0 && (
                        <>
                            <div className="h-px bg-white/5 w-full" />
                            <div className="space-y-4">
                                <h4 className="text-[10px] font-black uppercase tracking-widest text-white/30 ml-1">Additional Information</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {customFields.map((field) => (
                                        <CustomFieldRenderer
                                            key={field.id}
                                            field={field}
                                            value={customOrgs[field.field_key] || ''}
                                            onChange={(val) => setCustomOrgs(prev => ({ ...prev, [field.field_key]: val }))}
                                        />
                                    ))}
                                </div>
                            </div>
                        </>
                    )}

                    {/* Footer Actions */}
                    <div className="pt-8 flex justify-between items-center border-t border-white/5 mt-8">
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={onClose}
                            className="text-[10px] font-black uppercase tracking-widest text-white/20 hover:text-white hover:bg-white/5 rounded-xl transition-all h-12 px-6"
                        >
                            Cancel
                        </Button>

                        <Button
                            type="submit"
                            disabled={isSubmitting}
                            className="bg-primary hover:bg-primary/90 text-white font-bold h-12 px-8 rounded-2xl shadow-glow-seafoam transition-all active:scale-95 gap-2"
                        >
                            {isSubmitting ? 'Creating...' : (
                                <>
                                    <Plus className="w-4 h-4" />
                                    <span>Create Lead</span>
                                </>
                            )}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}

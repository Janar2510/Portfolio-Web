'use client';

import { useState, useEffect } from 'react';
import {
    Plus,
    User,
    Building2,
    Mail,
    Phone,
    Sparkles,
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
import { Person } from '@/domain/crm/types';
import { useEntityResolver } from '@/hooks/use-entity-resolver';
import { cn } from '@/lib/utils';
import { orgsService } from '@/domain/crm/services/orgs-service';
import { useQuery } from '@tanstack/react-query';
import { fieldDefinitionsService } from '@/domain/crm/services/field-definitions-service';
import { CustomFieldRenderer } from '@/components/crm/CustomFieldRenderer';

interface AddContactDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onCreateContact: (data: Partial<Person>) => Promise<void>;
}

export function AddContactDialog({
    isOpen,
    onClose,
    onCreateContact,
}: AddContactDialogProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { resolve, isResolving, resolvedData } = useEntityResolver();

    // Form Stats
    const [email, setEmail] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [phone, setPhone] = useState('');
    const [orgName, setOrgName] = useState('');
    const [linkedOrgId, setLinkedOrgId] = useState<string | null>(null);
    const [customOrgs, setCustomOrgs] = useState<Record<string, any>>({}); // Reuse name for generic custom fields

    // Fetch custom fields
    const { data: customFields = [] } = useQuery({
        queryKey: ['custom-fields', 'person'],
        queryFn: () => fieldDefinitionsService.getByEntity('person'),
        enabled: isOpen,
    });

    const handleEmailBlur = async () => {
        if (email && email.includes('@')) {
            await resolve(email);
        }
    };

    useEffect(() => {
        if (resolvedData) {
            // ... (existing logic)
            if (resolvedData.person) {
                setFirstName(resolvedData.person.first_name || '');
                setLastName(resolvedData.person.last_name || '');
                if (resolvedData.person.phones?.[0]) setPhone(resolvedData.person.phones[0].value);
            }

            if (resolvedData.organization) {
                setOrgName(resolvedData.organization.name);
                setLinkedOrgId(resolvedData.organization.id);
            }
        }
    }, [resolvedData]);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            // 1. Resolve Organization if name provided but no ID
            let finalOrgId = linkedOrgId;

            if (!finalOrgId && orgName) {
                // Try to find existing org by name
                const existing = await orgsService.findDuplicate({ name: orgName });
                if (existing) {
                    finalOrgId = existing.id;
                } else {
                    // Create new Org
                    // We need a simple way to create org. 
                    // Assuming basic org creation is okay without details.
                    const newOrg = await orgsService.createNew({
                        name: orgName,
                        label_ids: [],
                        custom_fields: {},
                        visible_to: 'everyone'
                    });
                    finalOrgId = newOrg.id;
                }
            }

            const payload: Partial<Person> = {
                first_name: firstName,
                last_name: lastName,
                // Combine to full name as fallback/primary
                name: `${firstName} ${lastName}`.trim(),
                emails: email ? [{ value: email, label: 'work', primary: true }] : [],
                phones: phone ? [{ value: phone, label: 'work', primary: true }] : [],
                organization_id: finalOrgId || undefined,
                custom_fields: customOrgs
            };

            await onCreateContact(payload);
            setCustomOrgs({});
            onClose();

            // Reset form
            setEmail('');
            setFirstName('');
            setLastName('');
            setPhone('');
            setOrgName('');
            setLinkedOrgId(null);
        } catch (error) {
            console.error('Failed to create contact:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => {
            if (!open) setCustomOrgs({});
            onClose();
        }}>
            <DialogContent className="max-w-xl p-0 gap-0 overflow-hidden bg-black/40 backdrop-blur-3xl border-white/5 shadow-[0_0_100px_rgba(0,0,0,0.5)] text-foreground rounded-[3rem]" aria-describedby="add-contact-description">
                <DialogHeader className="p-8 border-b border-white/5 flex flex-row items-center justify-between bg-white/[0.01]">
                    <div className="space-y-1">
                        <div className="inline-flex items-center gap-2 px-2 py-0.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-black uppercase tracking-widest">
                            <Sparkles className="w-3 h-3" />
                            CRM
                        </div>
                        <DialogTitle className="text-3xl font-bold tracking-tight text-white font-display uppercase">Add Contact</DialogTitle>
                    </div>
                    <DialogDescription id="add-contact-description" className="sr-only">
                        Create a new contact.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="p-8 space-y-8 max-h-[70vh] overflow-y-auto scrollbar-none">

                    {/* Identification */}
                    <div className="space-y-6">
                        <div className="space-y-3">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-white/30 ml-1">Email (Identification)</Label>
                            <div className="relative group">
                                <Mail className={cn("absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 transition-colors", isResolving ? "text-primary animate-pulse" : "text-white/20 group-hover:text-primary")} />
                                <Input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    onBlur={handleEmailBlur}
                                    placeholder="name@company.com"
                                    className="h-14 pl-12 rounded-2xl bg-white/[0.02] border-white/5 focus:border-primary/40 focus:bg-white/[0.04] transition-all text-lg font-medium"
                                />
                                {isResolving && <div className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full h-2 w-2 bg-primary animate-ping" />}
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-6">
                            <div className="space-y-3">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-white/30 ml-1">First Name</Label>
                                <div className="relative group">
                                    <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-white/20 group-hover:text-primary transition-colors" />
                                    <Input
                                        value={firstName}
                                        onChange={(e) => setFirstName(e.target.value)}
                                        placeholder="John"
                                        className="h-14 pl-12 rounded-2xl bg-white/[0.02] border-white/5 focus:border-primary/40 focus:bg-white/[0.04] transition-all"
                                    />
                                </div>
                            </div>
                            <div className="space-y-3">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-white/30 ml-1">Last Name</Label>
                                <Input
                                    value={lastName}
                                    onChange={(e) => setLastName(e.target.value)}
                                    placeholder="Doe"
                                    className="h-14 rounded-2xl bg-white/[0.02] border-white/5 focus:border-primary/40 focus:bg-white/[0.04] transition-all"
                                />
                            </div>
                        </div>

                        <div className="space-y-3">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-white/30 ml-1">Phone</Label>
                            <div className="relative group">
                                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-white/20 group-hover:text-primary transition-colors" />
                                <Input
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    placeholder="+1..."
                                    className="h-14 pl-12 rounded-2xl bg-white/[0.02] border-white/5 focus:border-primary/40 focus:bg-white/[0.04] transition-all"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="h-px bg-white/5 w-full" />

                    {/* Organization Context */}
                    <div className="space-y-3">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-white/30 ml-1">Organization</Label>
                        <div className="relative group">
                            <Building2 className={cn("absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 transition-colors", linkedOrgId ? "text-emerald-500" : "text-white/20 group-hover:text-primary")} />
                            <Input
                                value={orgName}
                                onChange={(e) => {
                                    setOrgName(e.target.value);
                                    if (linkedOrgId) setLinkedOrgId(null); // Clear link if editing
                                }}
                                placeholder="Company Name"
                                className="h-14 pl-12 rounded-2xl bg-white/[0.02] border-white/5 focus:border-primary/40 focus:bg-white/[0.04] transition-all"
                            />
                        </div>
                        {linkedOrgId && <p className="text-[10px] text-emerald-400 font-bold pl-1 flex items-center gap-1"><Sparkles className="h-2 w-2" /> Will link to existing organization</p>}
                        {!linkedOrgId && orgName && <p className="text-[10px] text-white/40 pl-1">A new organization will be created if not found.</p>}
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
                                    <span>Create Contact</span>
                                </>
                            )}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}

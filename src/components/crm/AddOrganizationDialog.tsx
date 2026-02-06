'use client';

import { useState, useEffect } from 'react';
import {
    Plus,
    Building2,
    MapPin,
    Globe,
    Briefcase,
    Sparkles,
    User,
    Mail,
    Phone
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Organization, Person } from '@/domain/crm/types';
import { useEntityResolver } from '@/hooks/use-entity-resolver';
import { cn } from '@/lib/utils';
import { peopleService } from '@/domain/crm/services/people-service'; // Direct import or prop? Direct is easier for now, but prop is cleaner. Let's use direct service for the "Unified" logic if prop not provided. 
// Actually, let's keep it pure-ish. If I can't change the parent easily, I'll use the service.
// But wait, the parent `OrganizationsPage` defined `onCreateOrganization`. I should update it to handle contact too?
// Or I can just do it here.

interface AddOrganizationDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onCreateOrganization: (data: Partial<Organization>) => Promise<Organization>; // return the org
    // Optional: handler for linking/creating contact
    onLinkContact?: (orgId: string, contactData: Partial<Person>) => Promise<void>;
}

import { useQuery } from '@tanstack/react-query';
import { fieldDefinitionsService } from '@/domain/crm/services/field-definitions-service';
import { CustomFieldRenderer } from '@/components/crm/CustomFieldRenderer';

export function AddOrganizationDialog({
    isOpen,
    onClose,
    onCreateOrganization,
    onLinkContact
}: AddOrganizationDialogProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { resolve, isResolving, resolvedData } = useEntityResolver();

    // Contact State
    const [contactEmail, setContactEmail] = useState('');
    const [contactName, setContactName] = useState('');
    const [contactPhone, setContactPhone] = useState('');
    const [linkedPersonId, setLinkedPersonId] = useState<string | null>(null);
    const [customOrgs, setCustomOrgs] = useState<Record<string, any>>({});

    // Fetch custom fields
    const { data: customFields = [] } = useQuery({
        queryKey: ['custom-fields', 'organization'],
        queryFn: () => fieldDefinitionsService.getByEntity('organization'),
        enabled: isOpen,
    });

    const handleEmailBlur = async () => {
        if (contactEmail && contactEmail.includes('@')) {
            await resolve(contactEmail);
        }
    };

    useEffect(() => {
        if (resolvedData?.person) {
            setLinkedPersonId(resolvedData.person.id);
            setContactName(`${resolvedData.person.first_name} ${resolvedData.person.last_name || ''}`.trim());
            if (resolvedData.person.phones?.[0]) setContactPhone(resolvedData.person.phones[0].value);
        } else {
            setLinkedPersonId(null);
        }
    }, [resolvedData]);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const formData = new FormData(e.currentTarget);

            // 1. Create Organization
            const address = {
                street: formData.get('street')?.toString(),
                city: formData.get('city')?.toString(),
                country: formData.get('country')?.toString(),
                postal: formData.get('postal')?.toString(),
            };

            const orgPayload: Partial<Organization> = {
                name: formData.get('name') as string,
                address,
                visible_to: (formData.get('visible_to') as Organization['visible_to']) || 'everyone',
                custom_fields: {
                    ...customOrgs,
                    website: formData.get('website')?.toString(),
                    industry: formData.get('industry')?.toString(),
                },
            };

            const createdOrg = await onCreateOrganization(orgPayload);

            // 2. Handle Contact (Link or Create)
            if (createdOrg && createdOrg.id && contactEmail) {
                if (linkedPersonId) {
                    if (confirm(`Link existing contact ${contactName} to ${createdOrg.name}?`)) {
                        await peopleService.update(linkedPersonId, { organization_id: createdOrg.id });
                    }
                } else {
                    const nameParts = contactName.split(' ');
                    const firstName = nameParts[0];
                    const lastName = nameParts.slice(1).join(' ');

                    await peopleService.createNew({
                        first_name: firstName,
                        last_name: lastName,
                        organization_id: createdOrg.id,
                        emails: [{ value: contactEmail, label: 'work', primary: true }],
                        phones: contactPhone ? [{ value: contactPhone, label: 'work', primary: true }] : []
                    });
                }
            }

            setCustomOrgs({});
            onClose();
        } catch (error) {
            console.error('Failed to create organization/contact:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => {
            if (!open) setCustomOrgs({});
            onClose();
        }}>
            <DialogContent className="max-w-4xl p-0 gap-0 overflow-hidden bg-black/40 backdrop-blur-3xl border-white/5 shadow-[0_0_100px_rgba(0,0,0,0.5)] text-foreground rounded-[3rem]" aria-describedby="add-org-description">
                <DialogHeader className="p-8 border-b border-white/5 flex flex-row items-center justify-between bg-white/[0.01]">
                    <div className="space-y-1">
                        <div className="inline-flex items-center gap-2 px-2 py-0.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-black uppercase tracking-widest">
                            <Sparkles className="w-3 h-3" />
                            CRM
                        </div>
                        <DialogTitle className="text-3xl font-bold tracking-tight text-white font-display uppercase">Add Organization</DialogTitle>
                    </div>
                    <DialogDescription id="add-org-description" className="sr-only">
                        Create a new organization and identification details.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="flex flex-col md:flex-row h-full max-h-[80vh]">
                    {/* Left Col: Organization Details */}
                    <div className="flex-1 p-8 space-y-8 overflow-y-auto scrollbar-none border-r border-white/5">
                        <h3 className="text-sm font-black uppercase tracking-widest text-white/40 mb-4">Organization Details</h3>
                        <div className="space-y-6">
                            <div className="space-y-3">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-white/30 ml-1">Organization Name</Label>
                                <div className="relative group">
                                    <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-white/20 group-hover:text-primary transition-colors" />
                                    <Input
                                        name="name"
                                        required
                                        placeholder="e.g. Acme Corp"
                                        className="h-14 pl-12 rounded-2xl bg-white/[0.02] border-white/5 focus:border-primary/40 focus:bg-white/[0.04] transition-all text-lg font-medium"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-3">
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-white/30 ml-1">Website</Label>
                                    <div className="relative group">
                                        <Globe className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-white/20 group-hover:text-primary transition-colors" />
                                        <Input
                                            name="website"
                                            type="url"
                                            placeholder="https://"
                                            className="h-14 pl-12 rounded-2xl bg-white/[0.02] border-white/5 focus:border-primary/40 focus:bg-white/[0.04] transition-all"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-white/30 ml-1">Industry</Label>
                                    <div className="relative group">
                                        <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-white/20 group-hover:text-primary transition-colors" />
                                        <Input
                                            name="industry"
                                            placeholder="Technology"
                                            className="h-14 pl-12 rounded-2xl bg-white/[0.02] border-white/5 focus:border-primary/40 focus:bg-white/[0.04] transition-all"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="h-px bg-white/5 w-full" />

                        <div className="space-y-6">
                            <div className="flex items-center gap-2 text-white/50">
                                <MapPin className="w-4 h-4" />
                                <span className="text-xs font-medium uppercase tracking-wider">Address</span>
                            </div>
                            <div className="space-y-3">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-white/30 ml-1">Street Address</Label>
                                <Input name="street" placeholder="123 Business Blvd" className="h-14 rounded-2xl bg-white/[0.02] border-white/5 focus:border-primary/40" />
                            </div>
                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-3"><Label className="text-[10px] font-black uppercase tracking-widest text-white/30 ml-1">City</Label><Input name="city" placeholder="New York" className="h-14 rounded-2xl bg-white/[0.02] border-white/5 focus:border-primary/40" /></div>
                                <div className="space-y-3"><Label className="text-[10px] font-black uppercase tracking-widest text-white/30 ml-1">Postal Code</Label><Input name="postal" placeholder="10001" className="h-14 rounded-2xl bg-white/[0.02] border-white/5 focus:border-primary/40" /></div>
                            </div>
                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-3"><Label className="text-[10px] font-black uppercase tracking-widest text-white/30 ml-1">Country</Label><Input name="country" placeholder="USA" className="h-14 rounded-2xl bg-white/[0.02] border-white/5 focus:border-primary/40" /></div>
                                <div className="space-y-3"><Label className="text-[10px] font-black uppercase tracking-widest text-white/30 ml-1">Visibility</Label>
                                    <Select name="visible_to" defaultValue="everyone">
                                        <SelectTrigger className="h-14 rounded-2xl bg-white/[0.02] border-white/5 focus:border-primary/40"><SelectValue /></SelectTrigger>
                                        <SelectContent className="bg-zinc-900/90 backdrop-blur-xl border-white/10 rounded-2xl">
                                            <SelectItem value="everyone">Everyone</SelectItem>
                                            <SelectItem value="owner">Owner Only</SelectItem>
                                            <SelectItem value="team">Team Only</SelectItem>
                                        </SelectContent>
                                    </Select>
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
                    </div>

                    {/* Right Col: Primary Contact */}
                    <div className="w-[400px] bg-white/[0.02] p-8 space-y-8 flex flex-col">
                        <h3 className="text-sm font-black uppercase tracking-widest text-white/40 mb-4 flex items-center gap-2">
                            <User className="h-4 w-4" />
                            Primary Contact
                        </h3>

                        <div className="space-y-6 flex-1">
                            <div className="space-y-3">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-white/30 ml-1">Email (Identification)</Label>
                                <div className="relative group">
                                    <Mail className={cn("absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 transition-colors", isResolving ? "text-primary animate-pulse" : "text-white/20 group-hover:text-primary")} />
                                    <Input
                                        value={contactEmail}
                                        onChange={(e) => setContactEmail(e.target.value)}
                                        onBlur={handleEmailBlur}
                                        placeholder="contact@company.com"
                                        className="h-14 pl-12 rounded-2xl bg-white/[0.02] border-white/5 focus:border-primary/40 focus:bg-white/[0.04] transition-all"
                                    />
                                    {isResolving && <div className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full h-2 w-2 bg-primary animate-ping" />}
                                </div>
                                <p className="text-[10px] text-white/20 pl-1">Enter email to auto-detect existing person.</p>
                            </div>

                            <div className="space-y-3">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-white/30 ml-1">Full Name</Label>
                                <Input
                                    value={contactName}
                                    onChange={(e) => setContactName(e.target.value)}
                                    placeholder="John Doe"
                                    className="h-14 rounded-2xl bg-white/[0.02] border-white/5 focus:border-primary/40 focus:bg-white/[0.04] transition-all"
                                    disabled={!!linkedPersonId} // Disable if linked? Or allow edit? Better to disable for clarity if linked.
                                />
                                {linkedPersonId && <p className="text-[10px] text-emerald-400 font-bold pl-1 flex items-center gap-1"><Sparkles className="h-2 w-2" /> Linked to existing contact</p>}
                            </div>

                            <div className="space-y-3">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-white/30 ml-1">Phone</Label>
                                <div className="relative group">
                                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-white/20 group-hover:text-primary transition-colors" />
                                    <Input
                                        value={contactPhone}
                                        onChange={(e) => setContactPhone(e.target.value)}
                                        placeholder="+1 234 567 890"
                                        className="h-14 pl-12 rounded-2xl bg-white/[0.02] border-white/5 focus:border-primary/40 focus:bg-white/[0.04] transition-all"
                                        disabled={!!linkedPersonId}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="pt-8 flex justify-between items-center border-t border-white/5">
                            <Button type="button" variant="ghost" onClick={onClose} className="rounded-xl text-white/20 hover:text-white">Cancel</Button>
                            <Button type="submit" disabled={isSubmitting} className="rounded-2xl bg-primary text-white font-bold h-12 px-8 shadow-glow-seafoam hover:bg-primary/90">
                                {isSubmitting ? 'Saving...' : 'Create All'}
                            </Button>
                        </div>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}

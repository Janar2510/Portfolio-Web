'use client';

import { useState, useEffect } from 'react';
import {
    X,
    User,
    Building2,
    Calendar,
    Check,
    ChevronsUpDown,
    DollarSign,
    Settings,
    Plus
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
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from '@/components/ui/command';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import type { PipelineStage, Person as Contact, Organization as Company } from '@/domain/crm/types';

interface AddDealDialogProps {
    isOpen: boolean;
    onClose: () => void;
    stages: PipelineStage[];
    contacts: Contact[];
    companies: Company[];
    onCreateDeal: (data: any) => Promise<void>;
    initialContactId?: string | null;
    initialCompanyId?: string | null;
}

export function AddDealDialog({
    isOpen,
    onClose,
    stages,
    contacts,
    companies,
    onCreateDeal,
    initialContactId,
    initialCompanyId,
}: AddDealDialogProps) {
    // Form State
    const [title, setTitle] = useState('');
    const [isTitleManuallyEdited, setIsTitleManuallyEdited] = useState(false);
    const [value, setValue] = useState<string>('');
    const [currency, setCurrency] = useState('USD');
    const [pipelineStageId, setPipelineStageId] = useState<string>('');
    const [expectedCloseDate, setExpectedCloseDate] = useState<string>('');

    // Contact Autocomplete State
    const [contactOpen, setContactOpen] = useState(false);
    const [selectedContactId, setSelectedContactId] = useState<string | null>(null);
    const [contactSearch, setContactSearch] = useState('');

    // Organization Autocomplete State
    const [companyOpen, setCompanyOpen] = useState(false);
    const [selectedCompanyId, setSelectedCompanyId] = useState<string | null>(null);
    const [companySearch, setCompanySearch] = useState('');

    // Set default stage
    useEffect(() => {
        if (isOpen && stages.length > 0 && !pipelineStageId) {
            const firstStage = stages[0];
            setPipelineStageId(firstStage.id);
        }
    }, [isOpen, stages, pipelineStageId]);

    // Handle initial props when dialog opens
    useEffect(() => {
        if (isOpen) {
            if (initialContactId) {
                setSelectedContactId(initialContactId);
            }
            if (initialCompanyId) {
                setSelectedCompanyId(initialCompanyId);
            }
        }
    }, [isOpen, initialContactId, initialCompanyId]);

    // Reset form on close
    useEffect(() => {
        if (!isOpen) {
            setTitle('');
            setIsTitleManuallyEdited(false);
            setValue('');
            if (!initialContactId) {
                setSelectedContactId(null);
                setContactSearch('');
            }
            if (!initialCompanyId) {
                setSelectedCompanyId(null);
                setCompanySearch('');
            }
            setExpectedCloseDate('');
        }
    }, [isOpen, initialContactId, initialCompanyId]);

    // Auto-fill title if not manually edited when contact/company changes
    useEffect(() => {
        if (!isTitleManuallyEdited && (selectedContactId || selectedCompanyId)) {
            const contact = contacts.find(c => c.id === selectedContactId);
            const company = companies.find(c => c.id === selectedCompanyId);

            let newTitle = 'Deal';
            if (company) {
                newTitle = `${company.name} Deal`;
            } else if (contact) {
                newTitle = `${contact.first_name || ''} ${contact.last_name || ''} Deal`.trim();
            }
            setTitle(newTitle);
        }
    }, [selectedContactId, selectedCompanyId, isTitleManuallyEdited, contacts, companies]);

    // When contact is selected, auto-select their organization if linked
    useEffect(() => {
        if (selectedContactId && !selectedCompanyId) {
            const contact = contacts.find(c => c.id === selectedContactId);
            if (contact?.organization_id) {
                setSelectedCompanyId(contact.organization_id);
            }
        }
    }, [selectedContactId, contacts, selectedCompanyId]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        await onCreateDeal({
            title: title || 'New Deal',
            value: value ? parseFloat(value) : undefined,
            currency,
            stage_id: pipelineStageId,
            contact_id: selectedContactId,
            company_id: selectedCompanyId,
            expected_close_date: expectedCloseDate || undefined,
        });
        onClose();
    };

    const selectedStageIndex = stages.findIndex(s => s.id === pipelineStageId);

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-xl p-0 gap-0 overflow-hidden bg-black/40 backdrop-blur-3xl border-white/5 shadow-[0_0_100px_rgba(0,0,0,0.5)] text-foreground rounded-[3rem]" aria-describedby="add-deal-description">
                <DialogHeader className="p-8 border-b border-white/5 flex flex-row items-center justify-between bg-white/[0.01]">
                    <DialogTitle className="text-3xl font-bold tracking-tight text-white font-display uppercase">Add New Deal</DialogTitle>
                    <DialogDescription id="add-deal-description" className="sr-only">
                        Create a new deal by filling out the details below.
                    </DialogDescription>
                </DialogHeader>

                {/* Info Banner */}
                <div className="bg-primary/10 px-8 py-3 text-[10px] font-black uppercase tracking-widest flex items-center justify-between text-primary border-b border-white/5">
                    <span>Pro Tip: Customize form fields in Settings to track more data.</span>
                    <X className="h-3 w-3 cursor-pointer opacity-50 hover:opacity-100 transition-opacity" onClick={onClose} />
                </div>

                <form onSubmit={handleSubmit} className="p-8 space-y-8 max-h-[70vh] overflow-y-auto scrollbar-none">

                    {/* Contact Person */}
                    <div className="space-y-3">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-white/30 ml-1">Primary Contact</Label>
                        <Popover open={contactOpen} onOpenChange={setContactOpen}>
                            <PopoverTrigger asChild>
                                <div className="relative group/contact">
                                    <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-white/20 group-hover/contact:text-primary transition-colors" />
                                    <Button
                                        variant="outline"
                                        role="combobox"
                                        aria-expanded={contactOpen}
                                        className="w-full h-14 justify-between pl-12 pr-4 rounded-2xl bg-white/[0.02] border-white/5 hover:bg-white/[0.05] hover:border-white/10 text-left font-medium transition-all"
                                    >
                                        <span className={cn(
                                            "truncate",
                                            !selectedContactId && !contactSearch && "text-white/20"
                                        )}>
                                            {selectedContactId
                                                ? (() => {
                                                    const c = contacts.find((c) => c.id === selectedContactId)
                                                    return c?.emails?.[0]?.value ? `${c.first_name} ${c.last_name || ''} (${c.emails[0].value})` : `${c?.first_name || ''} ${c?.last_name || ''}`
                                                })()
                                                : contactSearch || "Search email or name..."}
                                        </span>
                                    </Button>
                                </div>
                            </PopoverTrigger>
                            <PopoverContent className="w-[450px] p-0 bg-zinc-900/90 backdrop-blur-xl border-white/10 rounded-3xl overflow-hidden shadow-2xl" align="start">
                                <Command shouldFilter={false}>
                                    <CommandInput
                                        placeholder="Find contact..."
                                        value={contactSearch}
                                        onValueChange={setContactSearch}
                                    />
                                    <CommandList>
                                        <CommandEmpty>
                                            <div className="p-2 text-sm text-center">
                                                <p>No existing contacts found.</p>
                                            </div>
                                        </CommandEmpty>
                                        <CommandGroup heading="Recent Contacts">
                                            {contacts
                                                .filter(c => {
                                                    const searchTerm = contactSearch.toLowerCase();
                                                    const fullName = `${c.first_name || ''} ${c.last_name || ''}`.toLowerCase();
                                                    const email = (c.emails?.[0]?.value || '').toLowerCase();
                                                    return fullName.includes(searchTerm) || email.includes(searchTerm);
                                                })
                                                .slice(0, 5)
                                                .map((contact) => (
                                                    <CommandItem
                                                        key={contact.id}
                                                        value={contact.emails?.[0]?.value || `${contact.first_name} ${contact.last_name || ''}`}
                                                        onSelect={() => {
                                                            setSelectedContactId(contact.id);
                                                            setContactSearch('');
                                                            setContactOpen(false);
                                                        }}
                                                    >
                                                        <Check
                                                            className={cn(
                                                                "mr-2 h-4 w-4",
                                                                selectedContactId === contact.id ? "opacity-100" : "opacity-0"
                                                            )}
                                                        />
                                                        <div className="flex flex-col">
                                                            <span>{contact.first_name} {contact.last_name}</span>
                                                            <span className="text-xs text-muted-foreground">{contact.emails?.[0]?.value}</span>
                                                        </div>
                                                    </CommandItem>
                                                ))}
                                        </CommandGroup>
                                    </CommandList>
                                </Command>
                            </PopoverContent>
                        </Popover>
                    </div>

                    {/* Organization */}
                    <div className="space-y-3">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-white/30 ml-1">Organization</Label>
                        <Popover open={companyOpen} onOpenChange={setCompanyOpen}>
                            <PopoverTrigger asChild>
                                <div className="relative group/org">
                                    <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-white/20 group-hover/org:text-primary transition-colors" />
                                    <Button
                                        variant="outline"
                                        role="combobox"
                                        aria-expanded={companyOpen}
                                        className="w-full h-14 justify-between pl-12 pr-4 rounded-2xl bg-white/[0.02] border-white/5 hover:bg-white/[0.05] hover:border-white/10 text-left font-medium transition-all"
                                    >
                                        <span className={cn(
                                            "truncate",
                                            !selectedCompanyId && !companySearch && "text-white/20"
                                        )}>
                                            {selectedCompanyId
                                                ? companies.find((c) => c.id === selectedCompanyId)?.name
                                                : companySearch || "Search organization..."}
                                        </span>
                                    </Button>
                                </div>
                            </PopoverTrigger>
                            <PopoverContent className="w-[450px] p-0 bg-zinc-900/90 backdrop-blur-xl border-white/10 rounded-3xl overflow-hidden shadow-2xl" align="start">
                                <Command shouldFilter={false}>
                                    <CommandInput
                                        placeholder="Find organization..."
                                        value={companySearch}
                                        onValueChange={setCompanySearch}
                                    />
                                    <CommandList>
                                        <CommandEmpty>
                                            <div className="p-2 text-sm text-center">
                                                <p>No existing organizations found.</p>
                                            </div>
                                        </CommandEmpty>
                                        <CommandGroup heading="Organizations">
                                            {companies
                                                .filter(c => c.name.toLowerCase().includes(companySearch.toLowerCase()))
                                                .slice(0, 5)
                                                .map((company) => (
                                                    <CommandItem
                                                        key={company.id}
                                                        value={company.name}
                                                        onSelect={() => {
                                                            setSelectedCompanyId(company.id);
                                                            setCompanySearch('');
                                                            setCompanyOpen(false);
                                                        }}
                                                    >
                                                        <Check
                                                            className={cn(
                                                                "mr-2 h-4 w-4",
                                                                selectedCompanyId === company.id ? "opacity-100" : "opacity-0"
                                                            )}
                                                        />
                                                        {company.name}
                                                    </CommandItem>
                                                ))}
                                        </CommandGroup>
                                    </CommandList>
                                </Command>
                            </PopoverContent>
                        </Popover>
                    </div>

                    {/* Deal Title */}
                    <div className="space-y-1.5">
                        <Label className="text-xs text-muted-foreground">Deal title</Label>
                        <Input
                            value={title}
                            onChange={(e) => {
                                setTitle(e.target.value);
                                setIsTitleManuallyEdited(true);
                            }}
                            placeholder="e.g. Website Redesign"
                            className="bg-white/[0.02] border-white/5 hover:bg-white/[0.05] rounded-xl"
                        />
                    </div>

                    {/* Deal Value */}
                    <div className="space-y-3">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-white/30 ml-1">Financial Value</Label>
                        <div className="flex gap-4">
                            <Input
                                type="number"
                                value={value}
                                onChange={(e) => setValue(e.target.value)}
                                placeholder="0.00"
                                className="h-14 flex-1 rounded-2xl bg-white/[0.02] border-white/5 focus:border-primary/40 focus:bg-white/[0.04] transition-all text-xl font-bold font-display"
                            />
                            <Select value={currency} onValueChange={setCurrency}>
                                <SelectTrigger className="h-14 w-[160px] rounded-2xl bg-white/[0.02] border-white/5 focus:border-primary/40 transition-all font-bold">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="bg-zinc-900/90 backdrop-blur-xl border-white/10 rounded-2xl">
                                    <SelectItem value="USD">US Dollar (USD)</SelectItem>
                                    <SelectItem value="EUR">Euro (EUR)</SelectItem>
                                    <SelectItem value="GBP">Pound (GBP)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* Pipeline Stage - Visual Selector */}
                    <div className="space-y-4 pt-2">
                        <div className="flex justify-between items-center px-1">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-white/30">Pipeline Stage</Label>
                            <div className="text-[10px] font-black uppercase tracking-widest text-primary shadow-glow-seafoam-sm">
                                {stages.find(s => s.id === pipelineStageId)?.name}
                            </div>
                        </div>
                        <div className="flex h-12 gap-1 w-full bg-white/[0.03] rounded-2xl overflow-hidden p-1.5 border border-white/5">
                            {stages.map((stage, index) => {
                                const isActive = stage.id === pipelineStageId;
                                const isPassed = selectedStageIndex > index;

                                let bgClass = "bg-white/5";
                                if (isActive) bgClass = "bg-primary shadow-glow-seafoam-sm";
                                else if (isPassed) bgClass = "bg-primary/20";

                                return (
                                    <div
                                        key={stage.id}
                                        className={cn(
                                            "flex-1 h-full rounded-lg cursor-pointer transition-all duration-300",
                                            bgClass,
                                            isActive && "scale-y-110 shadow-lg z-10"
                                        )}
                                        onClick={() => setPipelineStageId(stage.id)}
                                        title={stage.name}
                                    />
                                )
                            })}
                        </div>
                    </div>

                    {/* Expected Close Date */}
                    <div className="space-y-1.5">
                        <Label className="text-xs text-muted-foreground">Expected close date</Label>
                        <div className="relative">
                            <Calendar className="absolute left-2.5 top-3.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                type="date"
                                className="pl-9 h-12 bg-white/[0.02] border-white/5 hover:bg-white/[0.05] rounded-xl"
                                value={expectedCloseDate}
                                onChange={(e) => setExpectedCloseDate(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="pt-8 flex justify-between items-center border-t border-white/5 mt-8">
                        <Button variant="ghost" size="sm" type="button" className="text-[10px] font-black uppercase tracking-widest text-white/20 hover:text-white hover:bg-white/5 rounded-xl transition-all">
                            <span className="mr-2">Entire company</span>
                            <ChevronsUpDown className="h-3 w-3" />
                        </Button>

                        <div className="flex gap-4">
                            <Button type="button" variant="ghost" onClick={onClose} className="rounded-2xl text-white/40 hover:text-white hover:bg-white/5 h-12 px-6">Cancel</Button>
                            <Button type="submit" className="bg-primary hover:bg-primary/90 text-white font-bold h-12 px-8 rounded-2xl shadow-glow-seafoam-sm transition-all active:scale-95">
                                Create Deal
                            </Button>
                        </div>
                    </div>

                </form>
            </DialogContent>
        </Dialog>
    );
}

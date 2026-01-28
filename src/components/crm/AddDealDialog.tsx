'use client';

import { useState, useEffect, useMemo } from 'react';
import {
    X,
    User,
    Building2,
    Calendar,
    Check,
    ChevronsUpDown,
    Plus,
    Settings
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
import type { Contact, Company, PipelineStage } from '@/domain/crm/crm';

interface AddDealDialogProps {
    isOpen: boolean;
    onClose: () => void;
    stages: PipelineStage[];
    contacts: Contact[];
    companies: Company[];
    onCreateDeal: (data: any) => Promise<void>;
}

export function AddDealDialog({
    isOpen,
    onClose,
    stages,
    contacts,
    companies,
    onCreateDeal,
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

    // Derived state for "New" items
    const isNewContact = contactSearch && !contacts.find(c => {
        const searchLower = contactSearch.toLowerCase();
        const emailMatch = c.email?.toLowerCase() === searchLower;
        const nameMatch = (c.first_name.toLowerCase() + ' ' + (c.last_name || '').toLowerCase()) === searchLower;
        return emailMatch || nameMatch;
    });

    const isNewCompany = companySearch && !companies.find(c =>
        c.name.toLowerCase() === companySearch.toLowerCase()
    );

    // Set default stage
    useEffect(() => {
        if (isOpen && stages.length > 0 && !pipelineStageId) {
            const firstStage = stages[0];
            setPipelineStageId(firstStage.id);
        }
    }, [isOpen, stages, pipelineStageId]);

    // Reset form on close
    useEffect(() => {
        if (!isOpen) {
            setTitle('');
            setIsTitleManuallyEdited(false);
            setValue('');
            // Don't reset stage to keep sticky preference if desired, or reset to default
            // setPipelineStageId(''); 
            setSelectedContactId(null);
            setContactSearch('');
            setSelectedCompanyId(null);
            setCompanySearch('');
            setExpectedCloseDate('');
        }
    }, [isOpen]);

    // Auto-fill title if not manually edited when contact/company changes
    useEffect(() => {
        if (!isTitleManuallyEdited) {
            const contactName = selectedContactId
                ? contacts.find(c => c.id === selectedContactId)?.first_name
                : (contactSearch.includes('@') ? contactSearch.split('@')[0] : contactSearch);

            const companyName = selectedCompanyId
                ? companies.find(c => c.id === selectedCompanyId)?.name
                : companySearch;

            if (companyName) {
                setTitle(`${companyName} Deal`);
            } else if (contactName) {
                setTitle(`${contactName} Deal`);
            }
        }
    }, [selectedContactId, selectedCompanyId, contactSearch, companySearch, contacts, companies, isTitleManuallyEdited]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Prepare payload
        const payload = {
            title: title || 'New Deal',
            value: value ? parseFloat(value) : undefined,
            currency,
            stage_id: pipelineStageId,
            expected_close_date: expectedCloseDate || undefined,
            // Logic for new/existing relations to be handled by parent or here?
            // For now, passing IDs or new names to be handled by the specialized mutation wrapper
            contact_id: selectedContactId,
            new_contact_input: !selectedContactId && contactSearch ? contactSearch : undefined,
            company_id: selectedCompanyId,
            new_company_name: !selectedCompanyId && companySearch ? companySearch : undefined,
        };

        await onCreateDeal(payload);
        onClose();
    };

    const selectedStageIndex = stages.findIndex(s => s.id === pipelineStageId);

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-md p-0 gap-0 overflow-hidden" aria-describedby="add-deal-description">
                <DialogHeader className="p-4 border-b flex flex-row items-center justify-between">
                    <DialogTitle>Add deal</DialogTitle>
                    <DialogDescription id="add-deal-description" className="sr-only">
                        Create a new deal by filling out the details below.
                    </DialogDescription>
                    {/* Close button handled by Dialog primitive, but we can add custom header actions */}
                </DialogHeader>

                {/* Info Banner */}
                <div className="bg-blue-50/50 dark:bg-blue-950/20 px-4 py-2 text-xs flex items-center justify-between text-blue-600 dark:text-blue-400 border-b">
                    <span>Customize form fields in <span className="underline cursor-pointer">Settings</span>. Track additional data.</span>
                    <X className="h-3 w-3 cursor-pointer opacity-70 hover:opacity-100" />
                </div>

                <form onSubmit={handleSubmit} className="p-4 space-y-4">

                    {/* Contact Person */}
                    <div className="space-y-1.5">
                        <Label className="text-xs text-muted-foreground">Contact person (Email or Name)</Label>
                        <Popover open={contactOpen} onOpenChange={setContactOpen}>
                            <PopoverTrigger asChild>
                                <div className="relative">
                                    <User className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                    <Button
                                        variant="outline"
                                        role="combobox"
                                        aria-expanded={contactOpen}
                                        className="w-full justify-between pl-9 text-left font-normal"
                                    >
                                        {selectedContactId
                                            ? (() => {
                                                const c = contacts.find((c) => c.id === selectedContactId)
                                                return c?.email ? `${c.first_name} ${c.last_name || ''} (${c.email})` : `${c?.first_name} ${c?.last_name || ''}`
                                            })()
                                            : contactSearch || "Search email or name..."}

                                        {/* NEW Badge if typing new name */}
                                        {!selectedContactId && contactSearch && (
                                            <span className="bg-blue-600 text-white text-[10px] px-1.5 py-0.5 rounded font-bold ml-auto">NEW</span>
                                        )}
                                    </Button>
                                </div>
                            </PopoverTrigger>
                            <PopoverContent className="w-[400px] p-0" align="start">
                                <Command shouldFilter={false}>
                                    <CommandInput
                                        placeholder="Find or create contact..."
                                        value={contactSearch}
                                        onValueChange={setContactSearch}
                                    />
                                    <CommandList>
                                        <CommandEmpty>
                                            <div className="p-2 text-sm text-center">
                                                <p>No existing contacts found.</p>
                                                {contactSearch && (
                                                    <div className="mt-2 text-blue-600 font-medium">
                                                        Will create "{contactSearch}"
                                                    </div>
                                                )}
                                            </div>
                                        </CommandEmpty>
                                        <CommandGroup heading="Recent Contacts">
                                            {contacts
                                                .filter(c => {
                                                    const searchTerm = contactSearch.toLowerCase();
                                                    const fullName = `${c.first_name} ${c.last_name || ''}`.toLowerCase();
                                                    const email = (c.email || '').toLowerCase();
                                                    return fullName.includes(searchTerm) || email.includes(searchTerm);
                                                })
                                                .slice(0, 5)
                                                .map((contact) => (
                                                    <CommandItem
                                                        key={contact.id}
                                                        value={contact.email || `${contact.first_name} ${contact.last_name || ''}`}
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
                                                            <span className="text-xs text-muted-foreground">{contact.email}</span>
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
                    <div className="space-y-1.5">
                        <Label className="text-xs text-muted-foreground">Organization name</Label>
                        <Popover open={companyOpen} onOpenChange={setCompanyOpen}>
                            <PopoverTrigger asChild>
                                <div className="relative">
                                    <Building2 className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                    <Button
                                        variant="outline"
                                        role="combobox"
                                        aria-expanded={companyOpen}
                                        className="w-full justify-between pl-9 text-left font-normal"
                                    >
                                        {selectedCompanyId
                                            ? companies.find((c) => c.id === selectedCompanyId)?.name
                                            : companySearch || "Search or create organization..."}

                                        {!selectedCompanyId && companySearch && (
                                            <span className="bg-blue-600 text-white text-[10px] px-1.5 py-0.5 rounded font-bold ml-auto">NEW</span>
                                        )}
                                    </Button>
                                </div>
                            </PopoverTrigger>
                            <PopoverContent className="w-[400px] p-0" align="start">
                                <Command shouldFilter={false}>
                                    <CommandInput
                                        placeholder="Find or create organization..."
                                        value={companySearch}
                                        onValueChange={setCompanySearch}
                                    />
                                    <CommandList>
                                        <CommandEmpty>
                                            <div className="p-2 text-sm text-center">
                                                <p>No existing organizations found.</p>
                                                {companySearch && (
                                                    <div className="mt-2 text-blue-600 font-medium">
                                                        Will create "{companySearch}"
                                                    </div>
                                                )}
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
                        />
                    </div>

                    {/* Deal Value */}
                    <div className="space-y-1.5">
                        <Label className="text-xs text-muted-foreground">Deal value</Label>
                        <div className="flex gap-2">
                            <Input
                                type="number"
                                value={value}
                                onChange={(e) => setValue(e.target.value)}
                                placeholder="0.00"
                                className="flex-1"
                            />
                            <Select value={currency} onValueChange={setCurrency}>
                                <SelectTrigger className="w-[140px]">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="USD">US Dollar (USD)</SelectItem>
                                    <SelectItem value="EUR">Euro (EUR)</SelectItem>
                                    <SelectItem value="GBP">Pound (GBP)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* Pipeline Stage - Visual Selector */}
                    <div className="space-y-1.5">
                        <Label className="text-xs text-muted-foreground">Pipeline stage</Label>
                        <div className="flex h-8 gap-0.5 w-full bg-muted/30 rounded-md overflow-hidden p-0.5">
                            {stages.map((stage, index) => {
                                const isActive = stage.id === pipelineStageId;
                                const isPassed = selectedStageIndex > index;

                                // Pipedrive logic: Active is green (or colored), Passed is also colored? 
                                // Or typically just the active one is highlighted strongly.
                                // Let's make active strong color, passed light color, future gray.

                                let bgClass = "bg-muted";
                                if (isActive) bgClass = "bg-green-500"; // Active
                                else if (isPassed) bgClass = "bg-green-200 dark:bg-green-900"; // Passed

                                return (
                                    <div
                                        key={stage.id}
                                        className={cn(
                                            "flex-1 h-full skew-x-[-15deg] first:skew-x-0 cursor-pointer transition-colors border-r-2 border-background last:border-0",
                                            bgClass
                                        )}
                                        onClick={() => setPipelineStageId(stage.id)}
                                        title={stage.name}
                                    />
                                )
                            })}
                        </div>
                        <div className="text-xs font-medium text-right text-muted-foreground">
                            {stages.find(s => s.id === pipelineStageId)?.name}
                        </div>
                    </div>

                    {/* Expected Close Date */}
                    <div className="space-y-1.5">
                        <Label className="text-xs text-muted-foreground">Expected close date</Label>
                        <div className="relative">
                            <Calendar className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                type="date"
                                className="pl-9"
                                value={expectedCloseDate}
                                onChange={(e) => setExpectedCloseDate(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="pt-2 flex justify-between items-center border-t mt-4">
                        <Button variant="ghost" size="sm" type="button" className="text-muted-foreground">
                            <span className="mr-2">Entire company</span>
                            <ChevronsUpDown className="h-3 w-3" />
                        </Button>

                        <Button type="submit" className="bg-green-600 hover:bg-green-700 text-white min-w-[80px]">
                            Save
                        </Button>
                    </div>

                </form>
            </DialogContent>
        </Dialog>
    );
}

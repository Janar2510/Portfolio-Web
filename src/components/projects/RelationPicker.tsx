'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';
import { Check, ChevronsUpDown, User, Building2, UserPlus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
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
import { taskRelationsService } from '@/domain/projects/services/task-relations-service';

interface RelationPickerProps {
    taskId: string;
    type: 'contact' | 'organization';
}

export function RelationPicker({ taskId, type }: RelationPickerProps) {
    const [open, setOpen] = useState(false);
    const queryClient = useQueryClient();
    const supabase = createClient();

    // Fetch existing relations
    const { data: relations = [] } = useQuery({
        queryKey: ['task-relations', taskId],
        queryFn: () => taskRelationsService.getRelations(taskId),
    });

    const activeRelation = relations.find(r => r.related_type === type);

    // Fetch available entities (contacts or organizations)
    const { data: entities = [] } = useQuery({
        queryKey: ['crm-entities', type],
        queryFn: async () => {
            const table = type === 'contact' ? 'crm_people' : 'crm_organizations';
            const { data } = await supabase.from(table).select('*').limit(50);
            return data || [];
        },
    });

    const addMutation = useMutation({
        mutationFn: (id: string) => taskRelationsService.addRelation(taskId, type, id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['task-relations', taskId] });
            setOpen(false);
        },
    });

    const removeMutation = useMutation({
        mutationFn: (id: string) => taskRelationsService.removeRelation(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['task-relations', taskId] });
        },
    });

    const handleSelect = (entityId: string) => {
        if (activeRelation?.related_id === entityId) {
            removeMutation.mutate(activeRelation.id);
        } else {
            if (activeRelation) {
                // Remove existing first (enforce single relation per type for simplicity UI)
                // Or allow multiple? Let's stick to single per type for this UI component for now
                // Actually, let's just add it. The database allows multiple.
                // But the UI implies a "Picker". Let's toggle.
                if (activeRelation.related_id === entityId) {
                    removeMutation.mutate(activeRelation.id);
                } else {
                    // Remove old one to swap
                    removeMutation.mutate(activeRelation.id);
                    addMutation.mutate(entityId);
                }
            } else {
                addMutation.mutate(entityId);
            }
        }
    };

    const getEntityLabel = (entity: any) => {
        if (type === 'contact') return `${entity.first_name} ${entity.last_name}`;
        return entity.name;
    };

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className="w-full justify-between bg-white/5 border-white/10 hover:bg-white/10 text-xs"
                >
                    <div className="flex items-center gap-2 truncate">
                        {type === 'contact' ? <User className="h-3 w-3" /> : <Building2 className="h-3 w-3" />}
                        {activeRelation ? (
                            // We need to look up the name from entities list or fetch it properly
                            // For now simpler to filter entities list if loaded
                            entities.find(e => e.id === activeRelation.related_id)
                                ? getEntityLabel(entities.find(e => e.id === activeRelation.related_id))
                                : 'Loading...'
                        ) : (
                            `Select ${type === 'contact' ? 'Contact' : 'Organization'}...`
                        )}
                    </div>
                    <ChevronsUpDown className="ml-2 h-3 w-3 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[200px] p-0 bg-zinc-900 border-white/10 text-white">
                <Command>
                    <CommandInput placeholder={`Search ${type}...`} />
                    <CommandList>
                        <CommandEmpty>No {type} found.</CommandEmpty>
                        <CommandGroup>
                            {entities.map((entity: any) => (
                                <CommandItem
                                    key={entity.id}
                                    value={entity.id}
                                    onSelect={() => handleSelect(entity.id)}
                                    className="aria-selected:bg-white/10"
                                >
                                    <Check
                                        className={cn(
                                            "mr-2 h-4 w-4",
                                            activeRelation?.related_id === entity.id ? "opacity-100" : "opacity-0"
                                        )}
                                    />
                                    {getEntityLabel(entity)}
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    );
}

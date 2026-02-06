'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    Plus,
    Trash2,
    Edit2,
    GripVertical,
    Type,
    List,
    Calendar,
    Hash,
    CheckSquare,
    AlignLeft
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import type { CustomFieldDefinition, EntityType, FieldType } from '@/domain/crm/types';
import { fieldDefinitionsService } from '@/domain/crm/services/field-definitions-service';
import { toast } from 'sonner';

const ENTITY_TYPES: { value: EntityType; label: string }[] = [
    { value: 'person', label: 'People' },
    { value: 'organization', label: 'Organizations' },
    { value: 'deal', label: 'Deals' },
    { value: 'lead', label: 'Leads' },
    { value: 'product', label: 'Products' },
];

const FIELD_TYPES: { value: FieldType; label: string; icon: any }[] = [
    { value: 'text', label: 'To confirm Text', icon: Type },
    { value: 'textarea', label: 'Long Text', icon: AlignLeft },
    { value: 'number', label: 'Number', icon: Hash },
    { value: 'monetary', label: 'Monetary', icon: Hash },
    { value: 'single_select', label: 'Single Option', icon: List },
    { value: 'multi_select', label: 'Multiple Options', icon: List },
    { value: 'date', label: 'Date', icon: Calendar },
    { value: 'boolean', label: 'Yes/No', icon: CheckSquare },
    { value: 'phone', label: 'Phone', icon: Hash },
    { value: 'email', label: 'Email', icon: Type },
    { value: 'url', label: 'URL', icon: Type },
];

export function CustomFieldsSettings() {
    const queryClient = useQueryClient();
    const [selectedEntity, setSelectedEntity] = useState<EntityType>('person');
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [editingField, setEditingField] = useState<CustomFieldDefinition | null>(null);
    const [boilerplateType, setBoilerplateType] = useState<string>('text'); // For controlling UI visibility during create

    // Queries
    const { data: fields = [], isLoading } = useQuery({
        queryKey: ['custom-fields', selectedEntity],
        queryFn: () => fieldDefinitionsService.getByEntity(selectedEntity),
    });

    // Mutations
    const createFieldMutation = useMutation({
        mutationFn: (data: Partial<CustomFieldDefinition>) => fieldDefinitionsService.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['custom-fields', selectedEntity] });
            toast.success('Field created successfully');
            setIsAddOpen(false);
        }
    });

    const updateFieldMutation = useMutation({
        mutationFn: ({ id, data }: { id: string; data: Partial<CustomFieldDefinition> }) =>
            fieldDefinitionsService.update(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['custom-fields', selectedEntity] });
            toast.success('Field updated successfully');
            setEditingField(null);
        }
    });

    const deleteFieldMutation = useMutation({
        mutationFn: (id: string) => fieldDefinitionsService.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['custom-fields', selectedEntity] });
            toast.success('Field deleted successfully');
        }
    });

    const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);

        // Handle options for select types
        const optionsStr = formData.get('options')?.toString() || '';
        const options = optionsStr.split(',').map(o => o.trim()).filter(Boolean).map(o => ({ value: o, label: o }));

        const payload: Partial<CustomFieldDefinition> = {
            entity_type: selectedEntity,
            field_name: formData.get('field_name') as string,
            field_key: formData.get('field_key') as string || (formData.get('field_name') as string).toLowerCase().replace(/\s+/g, '_'),
            field_type: formData.get('field_type') as FieldType,
            is_required: formData.get('is_required') === 'on',
            options: options.length > 0 ? options : undefined,
            formula_expression: formData.get('formula_expression') as string,
        };

        try {
            if (editingField) {
                await updateFieldMutation.mutateAsync({ id: editingField.id, data: payload });
            } else {
                await createFieldMutation.mutateAsync(payload);
            }
        } catch (error) {
            console.error(error);
            toast.error('Failed to save field');
        }
    };

    return (
        <div className="space-y-6">
            {/* Entity Selector */}
            <div className="flex items-center gap-4 border-b border-white/5 pb-6">
                {ENTITY_TYPES.map(type => (
                    <button
                        key={type.value}
                        onClick={() => setSelectedEntity(type.value)}
                        className={`px-4 py-2 rounded-xl text-sm font-bold uppercase tracking-wider transition-all ${selectedEntity === type.value
                            ? 'bg-primary/20 text-primary shadow-glow-seafoam-sm'
                            : 'text-white/40 hover:text-white hover:bg-white/5'
                            }`}
                    >
                        {type.label}
                    </button>
                ))}
            </div>

            {/* Fields List */}
            <div className="space-y-4">
                <div className="flex justify-between items-center">
                    <h3 className="text-xl font-bold text-white font-display uppercase tracking-tight">
                        {ENTITY_TYPES.find(e => e.value === selectedEntity)?.label} Fields
                    </h3>
                    <Button
                        onClick={() => setIsAddOpen(true)}
                        className="rounded-xl bg-primary text-white hover:bg-primary/90 font-bold"
                    >
                        <Plus className="w-4 h-4 mr-2" />
                        Add Field
                    </Button>
                </div>

                {isLoading ? (
                    <div className="text-white/20">Loading fields...</div>
                ) : fields.length === 0 ? (
                    <div className="p-12 border border-dashed border-white/10 rounded-3xl text-center">
                        <p className="text-white/40 font-medium">No custom fields defined for this entity.</p>
                        <p className="text-white/20 text-sm mt-2">Add fields to track specific data points.</p>
                    </div>
                ) : (
                    <div className="grid gap-3">
                        {fields.map((field) => (
                            <div
                                key={field.id}
                                className="group flex items-center justify-between p-4 bg-white/[0.02] border border-white/5 rounded-2xl hover:border-primary/20 transition-all"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="p-2 rounded-lg bg-white/5 text-white/40 group-hover:text-primary transition-colors">
                                        <GripVertical className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <div className="font-bold text-white">{field.field_name}</div>
                                        <div className="text-xs text-white/40 font-mono mt-1">{field.field_key}</div>
                                    </div>
                                    <Badge variant="outline" className="bg-white/5 border-white/5 text-white/40 uppercase text-[10px] tracking-widest ml-2">
                                        {FIELD_TYPES.find(t => t.value === field.field_type)?.label || field.field_type}
                                    </Badge>
                                    {field.is_required && (
                                        <Badge variant="outline" className="border-red-500/20 text-red-400 text-[10px] uppercase tracking-widest">Required</Badge>
                                    )}
                                </div>
                                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => setEditingField(field)}
                                        className="hover:bg-white/10 text-white/40 hover:text-white rounded-xl"
                                    >
                                        <Edit2 className="w-4 h-4" />
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => {
                                            if (confirm('Delete this field? Data stored in this field will remain but wont be visible.')) {
                                                deleteFieldMutation.mutate(field.id);
                                            }
                                        }}
                                        className="hover:bg-red-500/10 text-white/40 hover:text-red-400 rounded-xl"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Add/Edit Dialog */}
            <Dialog open={isAddOpen || !!editingField} onOpenChange={(open) => {
                if (!open) {
                    setIsAddOpen(false);
                    setEditingField(null);
                }
            }}>
                <DialogContent className="max-w-xl bg-black/80 backdrop-blur-xl border-white/10 text-white rounded-[2rem]">
                    <DialogHeader>
                        <DialogTitle>{editingField ? 'Edit Field' : 'Add Custom Field'}</DialogTitle>
                        <DialogDescription>
                            Configure a new data field for {ENTITY_TYPES.find(e => e.value === selectedEntity)?.label}.
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleSave} className="space-y-6 py-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Field Label</Label>
                                <Input
                                    name="field_name"
                                    defaultValue={editingField?.field_name}
                                    required
                                    placeholder="e.g. Budget"
                                    className="bg-white/5 border-white/10"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Field Key (Internal)</Label>
                                <Input
                                    name="field_key"
                                    defaultValue={editingField?.field_key}
                                    placeholder="Auto-generated if empty"
                                    className="bg-white/5 border-white/10 font-mono text-xs"
                                    disabled={!!editingField} // Don't verify editing keys easily to avoid data loss
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label>Field Type</Label>
                            <Select
                                name="field_type"
                                defaultValue={editingField?.field_type || 'text'}
                                disabled={!!editingField}
                                onValueChange={(val) => {
                                    // Force re-render if needed or just use form data
                                    // We might need state to show/hide options
                                    const form = document.getElementById('field-form') as HTMLFormElement;
                                    if (form) form.dataset.type = val;
                                    // Trigger a re-render for UI conditional
                                    setBoilerplateType(val as FieldType);
                                }}
                            >
                                <SelectTrigger className="bg-white/5 border-white/10">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="bg-zinc-900 border-white/10">
                                    {FIELD_TYPES.map(type => (
                                        <SelectItem key={type.value} value={type.value}>
                                            <div className="flex items-center gap-2">
                                                <type.icon className="w-4 h-4 opacity-50" />
                                                {type.label}
                                            </div>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Options Input - visible only for select types. Simple implementation for now */}
                        <div className="space-y-2">
                            <Label>Options (comma separated)</Label>
                            <Input
                                name="options"
                                placeholder="Option 1, Option 2, Option 3"
                                defaultValue={editingField?.options?.map(o => o.value).join(', ')}
                                className="bg-white/5 border-white/10"
                            />
                            <p className="text-xs text-white/40">Only applicable for Select/Multi-Select fields.</p>
                        </div>

                        <div className="flex items-center gap-4 bg-white/5 p-4 rounded-xl border border-white/5">
                            <div className="flex items-center gap-2">
                                <Checkbox name="is_required" id="is_required" defaultChecked={editingField?.is_required} />
                                <Label htmlFor="is_required" className="cursor-pointer">Mandatory Field</Label>
                            </div>
                        </div>

                        <DialogFooter>
                            <Button type="button" variant="ghost" onClick={() => { setIsAddOpen(false); setEditingField(null); }}>Cancel</Button>
                            <Button type="submit" className="bg-primary text-white">Save Field</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
}

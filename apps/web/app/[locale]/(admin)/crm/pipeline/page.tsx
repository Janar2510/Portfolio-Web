'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { PipelineBoard } from '@/components/crm/PipelineBoard';
import { DealDetailModal } from '@/components/crm/DealDetailModal';
import { StageCustomization } from '@/components/crm/StageCustomization';
import {
  Dialog as CreateDealDialog,
  DialogContent as CreateDealDialogContent,
  DialogDescription as CreateDealDialogDescription,
  DialogFooter,
  DialogHeader as CreateDealDialogHeader,
  DialogTitle as CreateDealDialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { createClient } from '@/lib/supabase/client';
import type { PipelineStage, Deal, Contact, Company } from '@/lib/services/crm';

export default function PipelinePage() {
  const [selectedDeal, setSelectedDeal] = useState<Deal | null>(null);
  const [isDealModalOpen, setIsDealModalOpen] = useState(false);
  const [isStageSettingsOpen, setIsStageSettingsOpen] = useState(false);
  const [isCreateDealOpen, setIsCreateDealOpen] = useState(false);
  const [createDealStageId, setCreateDealStageId] = useState<string | null>(null);
  const queryClient = useQueryClient();

  // Fetch pipeline stages
  const { data: stages = [] } = useQuery({
    queryKey: ['crm-pipeline-stages'],
    queryFn: async () => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('pipeline_stages')
        .select('*')
        .order('sort_order', { ascending: true });
      if (error) throw error;
      return (data || []) as PipelineStage[];
    },
  });

  // Fetch all deals
  const { data: deals = [] } = useQuery({
    queryKey: ['crm-deals'],
    queryFn: async () => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('deals')
        .select('*')
        .order('sort_order', { ascending: true });
      if (error) throw error;
      return (data || []) as Deal[];
    },
  });

  // Fetch contacts
  const { data: contacts = [] } = useQuery({
    queryKey: ['crm-contacts'],
    queryFn: async () => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('contacts')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return (data || []) as Contact[];
    },
  });

  // Fetch companies
  const { data: companies = [] } = useQuery({
    queryKey: ['crm-companies'],
    queryFn: async () => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('companies')
        .select('*')
        .order('name', { ascending: true });
      if (error) throw error;
      return (data || []) as Company[];
    },
  });

  // Reorder stages mutation
  const reorderStagesMutation = useMutation({
    mutationFn: async (stages: PipelineStage[]) => {
      const supabase = createClient();
      const updates = stages.map((stage, index) =>
        supabase
          .from('pipeline_stages')
          .update({ sort_order: index })
          .eq('id', stage.id)
      );
      await Promise.all(updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['crm-pipeline-stages'] });
    },
  });

  // Move deal mutation
  const moveDealMutation = useMutation({
    mutationFn: async ({ dealId, stageId, sortOrder }: { dealId: string; stageId: string; sortOrder: number }) => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('deals')
        .update({ stage_id: stageId, sort_order: sortOrder })
        .eq('id', dealId)
        .select()
        .single();
      if (error) throw error;
      return data as Deal;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['crm-deals'] });
    },
  });

  // Create deal mutation
  const createDealMutation = useMutation({
    mutationFn: async (deal: {
      stage_id: string;
      title: string;
      contact_id?: string;
      company_id?: string;
      value?: number;
      currency?: string;
      expected_close_date?: string;
      probability?: number;
      notes?: string;
    }) => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('deals')
        .insert({
          ...deal,
          currency: deal.currency || 'EUR',
          sort_order: deals.filter((d) => d.stage_id === deal.stage_id).length,
        })
        .select()
        .single();
      if (error) throw error;
      return data as Deal;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['crm-deals'] });
      setIsCreateDealOpen(false);
      setCreateDealStageId(null);
    },
  });

  // Update deal mutation
  const updateDealMutation = useMutation({
    mutationFn: async ({ dealId, updates }: { dealId: string; updates: Partial<Deal> }) => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('deals')
        .update(updates)
        .eq('id', dealId)
        .select()
        .single();
      if (error) throw error;
      return data as Deal;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['crm-deals'] });
    },
  });

  // Delete deal mutation
  const deleteDealMutation = useMutation({
    mutationFn: async (dealId: string) => {
      const supabase = createClient();
      const { error } = await supabase.from('deals').delete().eq('id', dealId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['crm-deals'] });
      setIsDealModalOpen(false);
      setSelectedDeal(null);
    },
  });

  // Create stage mutation
  const createStageMutation = useMutation({
    mutationFn: async (stage: Partial<PipelineStage>) => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('pipeline_stages')
        .insert(stage)
        .select()
        .single();
      if (error) throw error;
      return data as PipelineStage;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['crm-pipeline-stages'] });
    },
  });

  // Update stage mutation
  const updateStageMutation = useMutation({
    mutationFn: async ({ stageId, updates }: { stageId: string; updates: Partial<PipelineStage> }) => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('pipeline_stages')
        .update(updates)
        .eq('id', stageId)
        .select()
        .single();
      if (error) throw error;
      return data as PipelineStage;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['crm-pipeline-stages'] });
    },
  });

  // Delete stage mutation
  const deleteStageMutation = useMutation({
    mutationFn: async (stageId: string) => {
      const supabase = createClient();
      const { error } = await supabase.from('pipeline_stages').delete().eq('id', stageId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['crm-pipeline-stages'] });
    },
  });

  const handleDealClick = (deal: Deal) => {
    setSelectedDeal(deal);
    setIsDealModalOpen(true);
  };

  const handleAddDeal = (stageId: string) => {
    setCreateDealStageId(stageId);
    setIsCreateDealOpen(true);
  };

  const handleCreateDeal = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!createDealStageId) return;

    const formData = new FormData(e.currentTarget);

    await createDealMutation.mutateAsync({
      stage_id: createDealStageId,
      title: formData.get('title') as string,
      contact_id: formData.get('contact_id')?.toString() === '__none__' ? undefined : formData.get('contact_id')?.toString() || undefined,
      company_id: formData.get('company_id')?.toString() === '__none__' ? undefined : formData.get('company_id')?.toString() || undefined,
      value: formData.get('value') ? parseFloat(formData.get('value') as string) : undefined,
      currency: formData.get('currency')?.toString() || 'EUR',
      expected_close_date: formData.get('expected_close_date')?.toString() || undefined,
      probability: formData.get('probability')
        ? parseInt(formData.get('probability') as string)
        : undefined,
      notes: formData.get('notes')?.toString() || undefined,
    });
  };

  // Get default stage for new deals
  const defaultStage = stages.find((s) => !s.is_won && !s.is_lost) || stages[0];

  return (
    <div className="flex h-[calc(100vh-4rem)] flex-col bg-gradient-to-br from-[hsl(var(--background))] via-[hsl(142_60%_6%)] to-[hsl(var(--background))] animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border bg-card/50 backdrop-blur-sm p-4 animate-slide-down">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Sales Pipeline</h1>
          <p className="text-sm text-muted-foreground">
            Manage your deals and pipeline stages
          </p>
        </div>
        <Button
          variant="outline"
          className="border-green-600 text-green-400 hover:bg-green-600 hover:text-white"
          onClick={() => setIsStageSettingsOpen(true)}
        >
          <Settings className="mr-2 h-4 w-4" />
          Customize Stages
        </Button>
      </div>

      {/* Pipeline Board */}
      <div className="flex-1 overflow-hidden">
        {stages.length === 0 ? (
          <div className="flex h-full items-center justify-center animate-fade-in">
            <div className="text-center animate-scale-in">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center shadow-lg">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <p className="text-lg font-semibold text-foreground">No pipeline stages</p>
              <p className="mt-2 text-sm text-muted-foreground">
                Create your first pipeline stage to get started
              </p>
              <Button
                className="mt-4 bg-green-600 hover:bg-green-700"
                onClick={() => setIsStageSettingsOpen(true)}
              >
                Create Stage
              </Button>
            </div>
          </div>
        ) : (
          <PipelineBoard
            stages={stages}
            deals={deals}
            onStagesReorder={async (newStages) => {
              await reorderStagesMutation.mutateAsync(newStages);
            }}
            onDealMove={async (dealId, stageId, sortOrder) => {
              await moveDealMutation.mutateAsync({ dealId, stageId, sortOrder });
            }}
            onDealClick={handleDealClick}
            onAddDeal={handleAddDeal}
            onStageSettings={(stage) => {
              // Could open a focused edit dialog for this stage
              setIsStageSettingsOpen(true);
            }}
          />
        )}
      </div>

      {/* Deal Detail Modal */}
      {selectedDeal && (
        <DealDetailModal
          deal={selectedDeal}
          stages={stages}
          contacts={contacts}
          companies={companies}
          isOpen={isDealModalOpen}
          onClose={() => {
            setIsDealModalOpen(false);
            setSelectedDeal(null);
          }}
          onUpdate={async (dealId, updates) => {
            await updateDealMutation.mutateAsync({ dealId, updates });
            const updatedDeal = await queryClient.fetchQuery({
              queryKey: ['crm-deal', dealId],
              queryFn: async () => {
                const supabase = createClient();
                const { data, error } = await supabase
                  .from('deals')
                  .select('*')
                  .eq('id', dealId)
                  .single();
                if (error) throw error;
                return data as Deal;
              },
            });
            if (updatedDeal) {
              setSelectedDeal(updatedDeal);
            }
          }}
          onDelete={async (dealId) => {
            await deleteDealMutation.mutateAsync(dealId);
          }}
        />
      )}

      {/* Stage Customization Dialog */}
      <Dialog open={isStageSettingsOpen} onOpenChange={setIsStageSettingsOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Customize Pipeline Stages</DialogTitle>
            <DialogDescription>
              Manage your sales pipeline stages. Drag to reorder or edit to customize.
            </DialogDescription>
          </DialogHeader>
          <StageCustomization
            stages={stages}
            onStageCreate={async (data) => {
              await createStageMutation.mutateAsync(data);
            }}
            onStageUpdate={async (stageId, data) => {
              await updateStageMutation.mutateAsync({ stageId, data });
            }}
            onStageDelete={async (stageId) => {
              await deleteStageMutation.mutateAsync(stageId);
            }}
            onStagesReorder={async (newStages) => {
              await reorderStagesMutation.mutateAsync(newStages);
            }}
          />
        </DialogContent>
      </Dialog>

      {/* Create Deal Dialog */}
      <CreateDealDialog open={isCreateDealOpen} onOpenChange={setIsCreateDealOpen}>
        <CreateDealDialogContent>
          <form onSubmit={handleCreateDeal}>
            <CreateDealDialogHeader>
              <CreateDealDialogTitle>Create New Deal</CreateDealDialogTitle>
              <CreateDealDialogDescription>
                Add a new deal to your pipeline.
              </CreateDealDialogDescription>
            </CreateDealDialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="title">Deal Title *</Label>
                <Input id="title" name="title" required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="value">Value</Label>
                  <div className="flex gap-2">
                    <Input
                      id="value"
                      name="value"
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                    />
                    <Select name="currency" defaultValue="EUR">
                      <SelectTrigger className="w-24">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="EUR">EUR</SelectItem>
                        <SelectItem value="USD">USD</SelectItem>
                        <SelectItem value="GBP">GBP</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="probability">Probability (%)</Label>
                  <Input
                    id="probability"
                    name="probability"
                    type="number"
                    min="0"
                    max="100"
                    placeholder="0"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="contact_id">Contact</Label>
                  <Select name="contact_id">
                    <SelectTrigger>
                      <SelectValue placeholder="Select contact" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__none__">None</SelectItem>
                      {contacts.map((contact) => (
                        <SelectItem key={contact.id} value={contact.id}>
                          {contact.first_name} {contact.last_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="company_id">Company</Label>
                  <Select name="company_id">
                    <SelectTrigger>
                      <SelectValue placeholder="Select company" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__none__">None</SelectItem>
                      {companies.map((company) => (
                        <SelectItem key={company.id} value={company.id}>
                          {company.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="expected_close_date">Expected Close Date</Label>
                <Input id="expected_close_date" name="expected_close_date" type="date" />
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
                onClick={() => setIsCreateDealOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit">Create</Button>
            </DialogFooter>
          </form>
        </CreateDealDialogContent>
      </CreateDealDialog>
    </div>
  );
}

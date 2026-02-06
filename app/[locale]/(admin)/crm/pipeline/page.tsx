'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Settings, Sparkles, PlusCircle, BarChart3 } from 'lucide-react';
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
import { AddDealDialog } from '@/components/crm/AddDealDialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { createClient } from '@/lib/supabase/client';
import type { PipelineStage, Deal, Contact, Company } from '@/domain/crm/crm';

export default function PipelinePage() {
  const [selectedDeal, setSelectedDeal] = useState<Deal | null>(null);
  const [isDealModalOpen, setIsDealModalOpen] = useState(false);
  const [isStageSettingsOpen, setIsStageSettingsOpen] = useState(false);
  const [isCreateDealOpen, setIsCreateDealOpen] = useState(false);
  const [createDealStageId, setCreateDealStageId] = useState<string | null>(
    null
  );
  const [editingStage, setEditingStage] = useState<PipelineStage | null>(null);
  const queryClient = useQueryClient();

  // Real-time subscriptions
  useEffect(() => {
    const supabase = createClient();

    const dealsChannel = supabase
      .channel('crm-deals-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'deals',
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['crm-deals'] });
        }
      )
      .subscribe();

    const stagesChannel = supabase
      .channel('crm-stages-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'pipeline_stages',
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['crm-pipeline-stages'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(dealsChannel);
      supabase.removeChannel(stagesChannel);
    };
  }, [queryClient]);

  // Fetch pipeline stages
  const { data: stages = [], isLoading: isLoadingStages } = useQuery({
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
  const { data: deals = [], isLoading: isLoadingDeals } = useQuery({
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
      const updates = stages.map(stage => ({
        id: stage.id,
        sort_order: stage.sort_order,
      }));

      const { error } = await supabase.rpc('reorder_pipeline_stages', {
        p_updates: updates,
      });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['crm-pipeline-stages'] });
    },
  });

  // Move deal mutation (Atomic)
  const moveDealMutation = useMutation({
    mutationFn: async ({
      dealId,
      stageId,
      sortOrder,
    }: {
      dealId: string;
      stageId: string;
      sortOrder: number;
    }) => {
      const supabase = createClient();

      // Use atomic RPC function
      const { data, error } = await supabase.rpc('move_deal_stage', {
        p_deal_id: dealId,
        p_new_stage_id: stageId,
        p_new_sort_order: sortOrder,
        p_metadata: { source: 'drag_drop_ui' }
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      // Invalidate both deals (list) and activities (history might have updated)
      queryClient.invalidateQueries({ queryKey: ['crm-deals'] });
      // Also potentially invalidate deal detail if open, but list is key
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

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('deals')
        .insert({
          ...deal,
          user_id: user.id,
          currency: deal.currency || 'EUR',
          sort_order: deals.filter(d => d.stage_id === deal.stage_id).length,
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
    mutationFn: async ({
      dealId,
      updates,
    }: {
      dealId: string;
      updates: Partial<Deal>;
    }) => {
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

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('pipeline_stages')
        .insert({ ...stage, user_id: user.id })
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
    mutationFn: async ({
      stageId,
      updates,
    }: {
      stageId: string;
      updates: Partial<PipelineStage>;
    }) => {
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
      const { error } = await supabase
        .from('pipeline_stages')
        .delete()
        .eq('id', stageId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['crm-pipeline-stages'] });
    },
  });

  // Create contact mutation
  const createContactMutation = useMutation({
    mutationFn: async (data: Partial<Contact>) => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data: contact, error } = await supabase
        .from('contacts')
        .insert({ ...data, user_id: user.id })
        .select()
        .single();
      if (error) throw error;
      return contact as Contact;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['crm-contacts'] });
    },
  });

  // Create company mutation
  const createCompanyMutation = useMutation({
    mutationFn: async (data: Partial<Company>) => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data: company, error } = await supabase
        .from('companies')
        .insert({ ...data, user_id: user.id })
        .select()
        .single();
      if (error) throw error;
      return company as Company;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['crm-companies'] });
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

  const handleCreateDealSubmit = async (data: any) => {
    let contactId = data.contact_id;
    let companyId = data.company_id;

    // Create new organization if name provided but no ID
    if (!companyId && data.new_company_name) {
      const newCompany = await createCompanyMutation.mutateAsync({
        name: data.new_company_name,
      });
      companyId = newCompany.id;
    }

    // Create new contact if name/email provided but no ID
    if (!contactId && data.new_contact_input) {
      const input = data.new_contact_input.trim();
      let firstName = input;
      let lastName = '';
      let email = undefined;

      if (input.includes('@')) {
        // It's an email
        email = input;
        // Try to derive name from email local part
        const localPart = input.split('@')[0];
        // Split by dot or underscore if present
        const parts = localPart.split(/[._]/);
        firstName = parts[0];
        if (parts.length > 1) {
          lastName = parts.slice(1).join(' ');
        }
        // Capitalize
        firstName = firstName.charAt(0).toUpperCase() + firstName.slice(1);
        if (lastName) lastName = lastName.charAt(0).toUpperCase() + lastName.slice(1);
      } else {
        // It's a name
        const parts = input.split(' ');
        firstName = parts[0];
        lastName = parts.slice(1).join(' ');
      }

      const newContact = await createContactMutation.mutateAsync({
        first_name: firstName,
        last_name: lastName || undefined,
        email: email,
        company_id: companyId // Link to company if valid
      });
      contactId = newContact.id;
    }

    await createDealMutation.mutateAsync({
      stage_id: data.stage_id,
      title: data.title,
      value: data.value,
      currency: data.currency,
      expected_close_date: data.expected_close_date,
      contact_id: contactId,
      company_id: companyId,
      probability: 0 // Default probability or allow user to set?
    });
  };

  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  // Skeleton component for loading/hydration
  const PipelineSkeleton = () => (
    <div className="flex gap-6 p-8 h-full overflow-hidden">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="flex h-full min-w-[340px] max-w-[340px] flex-col rounded-[2.5rem] border border-white/5 bg-white/[0.02] backdrop-blur-md p-4 space-y-4">
          <div className="flex justify-between items-center">
            <div className="h-5 w-32 bg-white/5 rounded-full animate-pulse" />
            <div className="h-5 w-8 bg-white/5 rounded-full animate-pulse" />
          </div>
          <div className="h-1.5 w-full bg-white/5 rounded-full animate-pulse" />
          <div className="space-y-3 pt-4">
            {[1, 2, 3].map(j => (
              <div key={j} className="h-32 w-full bg-white/5 rounded-[1.5rem] animate-pulse" />
            ))}
          </div>
        </div>
      ))}
    </div>
  );

  // Get default stage for new deals
  const defaultStage = stages.find(s => !s.is_won && !s.is_lost) || stages[0];

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] animate-fade-in overflow-hidden">
      {/* Pulse-style Header Wrapper */}
      <div className="max-w-[1600px] w-full mx-auto pt-10 px-8 shrink-0">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-bold uppercase tracking-widest">
              <Sparkles className="w-3 h-3" />
              CRM Active
            </div>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-white m-0 font-display">
              Sales Pipeline
            </h1>
            <p className="text-lg text-white/40 max-w-xl">
              Everything is running smoothly. Manage your deals and pipeline stages.
            </p>
          </div>
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              className="rounded-2xl border-white/10 hover:bg-white/5 text-white/70 h-12 px-6"
              onClick={() => setIsStageSettingsOpen(true)}
            >
              <Settings className="mr-2 h-4 w-4" />
              Customize Stages
            </Button>
            <Button
              size="lg"
              className="gap-2 rounded-2xl bg-primary text-white hover:bg-primary/90 shadow-glow-seafoam px-8 h-12"
              onClick={() => {
                setCreateDealStageId(defaultStage?.id || '');
                setIsCreateDealOpen(true);
              }}
            >
              <PlusCircle className="w-4 h-4" />
              <span>Add Deal</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Pipeline Board Wrapper */}
      <div className="flex-1 min-h-0 relative">
        {!mounted || isLoadingStages || isLoadingDeals ? (
          <PipelineSkeleton />
        ) : stages.length === 0 ? (
          <div className="flex h-full items-center justify-center animate-fade-in">
            <div className="text-center animate-scale-in">
              <div className="w-16 h-16 mx-auto mb-6 rounded-[2rem] bg-primary/10 flex items-center justify-center text-primary border border-primary/20 shadow-glow-soft">
                <BarChart3 className="w-8 h-8" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2 font-display">No pipeline stages</h2>
              <p className="text-white/40 mb-8 max-w-sm mx-auto leading-relaxed">
                Create your first pipeline stage to get started managing your deals.
              </p>
              <Button
                onClick={() => setIsStageSettingsOpen(true)}
                className="bg-primary hover:bg-primary/90 text-white rounded-2xl px-8 h-12 shadow-glow-seafoam"
              >
                Create Stage
              </Button>
            </div>
          </div>
        ) : (
          <PipelineBoard
            stages={stages}
            deals={deals}
            contacts={contacts}
            companies={companies}
            onStagesReorder={async newStages => {
              await reorderStagesMutation.mutateAsync(newStages);
            }}
            onDealMove={async (dealId, stageId, sortOrder) => {
              await moveDealMutation.mutateAsync({ dealId, stageId, sortOrder });
            }}
            onDealClick={handleDealClick}
            onAddDeal={handleAddDeal}
            onStageSettings={stage => {
              setEditingStage(stage);
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
          onDelete={async dealId => {
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
              Manage your sales pipeline stages. Drag to reorder or edit to
              customize.
            </DialogDescription>
          </DialogHeader>
          <StageCustomization
            stages={stages}
            onStageCreate={async data => {
              await createStageMutation.mutateAsync(data);
            }}
            onStageUpdate={async (stageId, data) => {
              await updateStageMutation.mutateAsync({ stageId, updates: data });
            }}
            onStageDelete={async stageId => {
              await deleteStageMutation.mutateAsync(stageId);
            }}
            onStagesReorder={async newStages => {
              await reorderStagesMutation.mutateAsync(newStages);
            }}
          />
        </DialogContent>
      </Dialog>

      {/* Create Deal Dialog */}
      <AddDealDialog
        isOpen={isCreateDealOpen}
        onClose={() => setIsCreateDealOpen(false)}
        stages={stages}
        contacts={contacts}
        companies={companies}
        onCreateDeal={handleCreateDealSubmit}
      />
    </div>
  );
}

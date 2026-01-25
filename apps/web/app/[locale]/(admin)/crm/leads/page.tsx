'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';
import { CRMEnhancedService } from '@/lib/services/crm-enhanced';
import { LeadsList } from '@/components/crm/LeadsList';
import { useRouter } from '@/i18n/routing';
import type { Lead, Label } from '@/lib/crm/types';

export default function LeadsPage() {
  const queryClient = useQueryClient();
  const router = useRouter();
  const supabase = createClient();
  const crmService = new CRMEnhancedService(supabase);

  const { data: leads = [], isLoading: leadsLoading } = useQuery({
    queryKey: ['crm-leads'],
    queryFn: () => crmService.getLeads(),
  });

  const { data: labels = [], isLoading: labelsLoading } = useQuery({
    queryKey: ['crm-labels-leads'],
    queryFn: () => crmService.getLabels('lead'),
  });

  const createMutation = useMutation({
    mutationFn: (lead: Partial<Lead>) => crmService.createLead(lead),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['crm-leads'] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<Lead> }) =>
      crmService.updateLead(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['crm-leads'] });
    },
  });

  const convertMutation = useMutation({
    mutationFn: async (leadId: string) => {
      // Get default pipeline and first stage
      const pipelines = await crmService.getPipelines();
      const defaultPipeline = pipelines.find(p => p.is_default) || pipelines[0];
      if (!defaultPipeline) throw new Error('No pipeline found');

      const stages = await crmService.getPipelineStages(defaultPipeline.id);
      const firstStage = stages[0];
      if (!firstStage) throw new Error('No stages found');

      const lead = await crmService.getLeadById(leadId);
      if (!lead) throw new Error('Lead not found');

      await crmService.convertLeadToDeal(leadId, {
        pipeline_id: defaultPipeline.id,
        stage_id: firstStage.id,
        title: lead.title,
        value: lead.expected_value,
      });

      // Redirect to deals page
      router.push('/crm/pipeline');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['crm-leads'] });
      queryClient.invalidateQueries({ queryKey: ['crm-deals'] });
    },
  });

  const createLabelMutation = useMutation({
    mutationFn: ({ name, color }: { name: string; color: string }) =>
      crmService.createLabel({ entity_type: 'lead', name, color }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['crm-labels-leads'] });
    },
  });

  if (leadsLoading || labelsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500 mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading leads...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Leads</h1>
        <p className="text-muted-foreground">Manage and convert your leads</p>
      </div>

      <LeadsList
        leads={leads}
        labels={labels}
        onCreateLead={async lead => {
          await createMutation.mutateAsync(lead);
        }}
        onUpdateLead={async (id, updates) => {
          await updateMutation.mutateAsync({ id, updates });
        }}
        onConvertLead={async id => {
          await convertMutation.mutateAsync(id);
        }}
        onCreateLabel={async (name, color) => {
          return await createLabelMutation.mutateAsync({ name, color });
        }}
      />
    </div>
  );
}

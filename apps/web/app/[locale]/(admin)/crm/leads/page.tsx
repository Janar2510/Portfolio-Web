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

  // Leads tables do not exist yet in this version
  const { data: leads = [], isLoading: leadsLoading } = useQuery({
    queryKey: ['crm-leads'],
    queryFn: () => Promise.resolve([] as Lead[]), // Stubbed
  });

  const { data: labels = [], isLoading: labelsLoading } = useQuery({
    queryKey: ['crm-labels-leads'],
    queryFn: () => Promise.resolve([] as Label[]), // Stubbed
  });

  const createMutation = useMutation({
    mutationFn: async (lead: Partial<Lead>) => { alert('Leads feature coming soon'); return {} as any; },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['crm-leads'] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Lead> }) => { return {} as any; },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['crm-leads'] });
    },
  });

  const convertMutation = useMutation({
    mutationFn: async (leadId: string) => {
      alert('Leads feature coming soon');
    },
    onSuccess: () => {
    },
  });

  const createLabelMutation = useMutation({
    mutationFn: async ({ name, color }: { name: string; color: string }) => { return {} as any; },
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

'use client';

import { useState } from 'react';
import { Sparkles, PlusCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { leadsService } from '@/domain/crm/services/leads-service';
import { LeadsList } from '@/components/crm/LeadsList';
import { toast } from 'sonner';
import { createClient } from '@/lib/supabase/client';

export default function LeadsPage() {
  const queryClient = useQueryClient();
  const supabase = createClient();

  // Fetch initial data
  const { data: leads = [], isLoading: isLoadingLeads } = useQuery({
    queryKey: ['crm', 'leads'],
    queryFn: () => leadsService.getAll(),
  });



  // Mutations
  const createLeadMutation = useMutation({
    mutationFn: (data: any) => leadsService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['crm', 'leads'] });
      toast.success('Lead created successfully');
    },
    onError: (error: any) => {
      console.error('Create Lead Error:', error);
      toast.error('Failed to create lead: ' + (error.message || 'Unknown error'));
    }
  });

  const convertLeadMutation = useMutation({
    mutationFn: ({ leadId, data }: { leadId: string; data: any }) => leadsService.convertToDeal(leadId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['crm', 'leads'] });
      queryClient.invalidateQueries({ queryKey: ['crm', 'deals'] });
      toast.success('Lead converted to deal');
    },
    onError: (error: any) => {
      console.error('Convert Lead Error:', error);
      toast.error('Failed to convert lead: ' + (error.message || 'Unknown error'));
    }
  });

  const qualifyLeadMutation = useMutation({
    mutationFn: ({ leadId, data }: { leadId: string; data: any }) => leadsService.qualifyLead(leadId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['crm', 'leads'] });
      queryClient.invalidateQueries({ queryKey: ['crm', 'contacts'] });
      queryClient.invalidateQueries({ queryKey: ['crm', 'organizations'] });
      toast.success('Lead qualified and contact created');
    },
    onError: (error: any) => {
      console.error('Qualify Lead Error:', error);
      toast.error('Failed to qualify lead: ' + (error.message || 'Unknown error'));
    }
  });

  const archiveLeadMutation = useMutation({
    mutationFn: (leadId: string) => leadsService.updateStatus(leadId, 'archived'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['crm', 'leads'] });
      toast.success('The lead has been moved to archive.');
    },
    onError: (error: any) => {
      toast.error('Failed to archive lead');
    }
  });

  const updateLeadStatusMutation = useMutation({
    mutationFn: ({ leadId, status }: { leadId: string; status: string }) =>
      leadsService.updateStatus(leadId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['crm', 'leads'] });
    },
    onError: (error: any) => {
      toast.error('Failed to update status');
    }
  });

  return (
    <div className="animate-fade-up max-w-[1440px] mx-auto py-12 px-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-bold uppercase tracking-widest">
            <Sparkles className="w-3 h-3" />
            Leads Online
          </div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-white m-0 font-display uppercase">
            Prospects
          </h1>
          <p className="text-lg text-white/40 max-w-xl">
            Manage your incoming opportunities and transition them to victory.
          </p>
        </div>
      </div>

      {isLoadingLeads ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-[300px] rounded-[2.5rem] bg-white/[0.02] border border-white/5 animate-pulse" />
          ))}
        </div>
      ) : (
        <LeadsList
          leads={leads}
          onCreateLead={async (data) => {
            await createLeadMutation.mutateAsync(data);
          }}
          onUpdateLead={async (id, updates) => {
            if (updates.status) {
              await updateLeadStatusMutation.mutateAsync({ leadId: id, status: updates.status });
            }
          }}
          onConvertLead={async (id, data) => {
            await convertLeadMutation.mutateAsync({ leadId: id, data });
          }}
          onQualifyLead={async (id, data) => {
            await qualifyLeadMutation.mutateAsync({ leadId: id, data });
          }}
          onArchiveLead={async (id) => {
            await archiveLeadMutation.mutateAsync(id);
          }}
        />
      )}
    </div>
  );
}

'use client';

import { useState } from 'react';
import {
  Mail,
  Phone,
  Building2,
  TrendingUp,
  CheckCircle2,
  User,
  Plus,
  Globe,
  LayoutGrid,
  List,
  MoreHorizontal,
  ArrowRight
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
import { AddLeadDialog } from './AddLeadDialog';
import { LeadConversionDialog } from './LeadConversionDialog';
import type { Lead, Label as LabelType, Pipeline, PipelineStage } from '@/domain/crm/types';

interface LeadsListProps {
  leads: Lead[];
  onCreateLead: (lead: Partial<Lead>) => Promise<void>;
  onUpdateLead: (leadId: string, updates: Partial<Lead>) => Promise<void>;
  onConvertLead: (leadId: string, data: any) => Promise<void>;
  onQualifyLead: (leadId: string, data: any) => Promise<void>;
  onArchiveLead: (leadId: string) => Promise<void>;
}

const statusColors: Record<Lead['status'], string> = {
  new: 'text-blue-400 bg-blue-400/10 border-blue-400/20',
  contacted: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20',
  qualified: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20',
  converted: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20',
  archived: 'text-white/20 bg-white/5 border-white/10',
};

export function LeadsList({
  leads,
  onCreateLead,
  onUpdateLead,
  onConvertLead,
  onQualifyLead,
  onArchiveLead,
}: LeadsListProps) {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [conversionLead, setConversionLead] = useState<Lead | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  return (
    <div className="space-y-8 pb-12">
      {/* ... (Header remains same) ... */}
      <div className="flex items-center justify-between px-4 md:px-0">
        <div className="space-y-1">
          <h2 className="text-xl font-bold tracking-tight text-white uppercase font-display">Active Prospects</h2>
          <p className="text-[11px] font-black uppercase tracking-widest text-white/20">
            {leads.length} leads in your radar
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center bg-white/5 p-1 rounded-xl border border-white/5 mr-2">
            <button
              onClick={() => setViewMode('grid')}
              className={cn(
                "p-2 rounded-lg transition-all",
                viewMode === 'grid'
                  ? "bg-primary/20 text-primary shadow-glow-seafoam-sm"
                  : "text-white/40 hover:text-white/60"
              )}
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={cn(
                "p-2 rounded-lg transition-all",
                viewMode === 'list'
                  ? "bg-primary/20 text-primary shadow-glow-seafoam-sm"
                  : "text-white/40 hover:text-white/60"
              )}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
          <Button
            onClick={() => setIsCreateOpen(true)}
            className="rounded-2xl bg-primary text-white hover:bg-primary/90 shadow-glow-seafoam px-6 h-11 transition-all active:scale-95"
          >
            <Plus className="mr-2 h-4 w-4" />
            <span className="font-bold">Add Lead</span>
          </Button>
        </div>
      </div>

      {/* Leads Grid */}
      {leads.length === 0 ? (
        <div className="col-span-full py-24 flex flex-col items-center justify-center rounded-[3rem] border border-dashed border-white/10 bg-white/[0.01] backdrop-blur-sm animate-fade-in">
          <div className="w-20 h-20 rounded-full bg-white/[0.02] border border-white/5 flex items-center justify-center mb-6">
            <TrendingUp className="w-8 h-8 text-white/10" />
          </div>
          <h3 className="text-xl font-bold text-white/40 uppercase tracking-tight font-display mb-2">No leads discovered yet</h3>
          <p className="text-[11px] font-black uppercase tracking-widest text-white/10 mb-8 max-w-[240px] text-center leading-relaxed">
            Your pipeline is waiting for its first opportunity. Start by adding a new lead.
          </p>
          <Button
            onClick={() => setIsCreateOpen(true)}
            variant="outline"
            className="rounded-xl border-white/10 text-white/40 hover:text-white hover:border-primary/40 transition-all font-bold"
          >
            Create Your First Lead
          </Button>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {leads.map(lead => (
            <div
              key={lead.id}
              onClick={() => lead.status !== 'converted' && lead.status !== 'qualified' && setConversionLead(lead)}
              className={cn(
                "group relative rounded-[2.5rem] border border-white/5 bg-white/[0.02] p-8 shadow-sm backdrop-blur-xl transition-all duration-500 hover:bg-white/[0.04] hover:border-primary/30 hover:shadow-glow-seafoam-sm hover:scale-[1.02]",
                lead.status !== 'converted' && lead.status !== 'qualified' && "cursor-pointer"
              )}
            >
              <div className="flex items-start justify-between mb-6">
                <h3 className="font-bold text-xl text-white tracking-tight leading-tight line-clamp-2 pr-4">{lead.title}</h3>
                <div className={cn(
                  "shrink-0 py-1 px-3 rounded-full text-[9px] font-black uppercase tracking-widest border",
                  statusColors[lead.status] || statusColors.new
                )}>
                  {lead.status}
                </div>
              </div>

              <div className="space-y-4 mb-8">
                <div className="grid grid-cols-2 gap-4">
                  {(lead.person_name || lead.email) && (
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-white/20">
                        <User className="h-3 w-3" />
                        <span>Contact</span>
                      </div>
                      <div className="text-sm font-medium text-white/70 truncate">
                        {lead.person_name || lead.email}
                      </div>
                    </div>
                  )}
                  {lead.organization_name && (
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-white/20">
                        <Building2 className="h-3 w-3" />
                        <span>Company</span>
                      </div>
                      <div className="text-sm font-medium text-white/70 truncate">
                        {lead.organization_name}
                      </div>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {lead.expected_value && (
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-white/20">
                        <TrendingUp className="h-3 w-3" />
                        <span>Est. Value</span>
                      </div>
                      <div className="text-lg font-bold font-display text-primary">
                        {new Intl.NumberFormat('en-US', {
                          style: 'currency',
                          currency: lead.currency || 'EUR',
                          maximumFractionDigits: 0
                        }).format(lead.expected_value)}
                      </div>
                    </div>
                  )}
                  {lead.source_name && (
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-white/20">
                        <Globe className="h-3 w-3" />
                        <span>Source</span>
                      </div>
                      <div className="text-sm font-medium text-white/40 truncate">
                        {lead.source_name}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-3 pt-6 border-t border-white/5 opacity-40 group-hover:opacity-100 transition-opacity">
                {lead.status !== 'converted' && lead.status !== 'qualified' ? (
                  <>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={(e) => {
                        e.stopPropagation();
                        setConversionLead(lead);
                      }}
                      className="flex-1 rounded-xl bg-white/5 border-white/10 hover:bg-primary/20 hover:border-primary/40 text-white font-bold h-10 transition-all"
                    >
                      <CheckCircle2 className="h-4 w-4 mr-2 text-primary" />
                      Qualify
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={(e) => {
                        e.stopPropagation();
                        onArchiveLead(lead.id);
                      }}
                      className="rounded-xl hover:bg-red-500/10 text-white/20 hover:text-red-400 h-10 px-3"
                    >
                      Archive
                    </Button>
                  </>
                ) : (
                  <div className="flex-1 flex items-center justify-center gap-2 py-2 text-[10px] font-black uppercase tracking-widest text-emerald-400/50 bg-emerald-400/5 rounded-xl border border-emerald-400/10">
                    <CheckCircle2 className="h-3 w-3" />
                    {lead.status === 'qualified' ? 'Qualified & Converted' : 'Successfully Converted'}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* List View */
        <div className="w-full overflow-x-auto scrollbar-none">
          <div className="min-w-[1000px] space-y-2">
            {/* Table Header */}
            <div className="flex items-center px-8 py-4 bg-white/[0.03] rounded-3xl border border-white/5 text-[10px] font-black uppercase tracking-widest text-white/30">
              <div className="flex-[2]">Opportunity</div>
              <div className="flex-1">Contact</div>
              <div className="flex-1 text-right">Est. Value</div>
              <div className="flex-1 text-center">Status</div>
              <div className="flex-1">Source</div>
              <div className="w-[180px] text-right">Actions</div>
            </div>

            {/* Table Rows */}
            {leads.map((lead) => (
              <div
                key={lead.id}
                className="group flex items-center px-8 py-6 bg-white/[0.01] hover:bg-white/[0.04] rounded-3xl border border-white/5 hover:border-primary/20 transition-all duration-300 backdrop-blur-sm"
              >
                <div
                  className={cn(
                    "flex-[2] pr-6",
                    lead.status !== 'converted' && lead.status !== 'qualified' && "cursor-pointer"
                  )}
                  onClick={() => lead.status !== 'converted' && lead.status !== 'qualified' && setConversionLead(lead)}
                >
                  <div className="font-bold text-white group-hover:text-primary transition-colors truncate">
                    {lead.title}
                  </div>
                  <div className="text-[10px] text-white/30 uppercase tracking-tighter mt-0.5">
                    {new Date(lead.created_at).toLocaleDateString()}
                  </div>
                </div>

                {/* ... (Middle columns remain mostly same, just checking click handlers if any) ... */}
                <div className="flex-1 pr-4">
                  <div className="text-sm font-medium text-white/70 truncate">
                    {lead.person_name || lead.email || (
                      <span className="text-white/10 italic">N/A</span>
                    )}
                  </div>
                  {lead.organization_name && (
                    <div className="text-[10px] text-white/30 uppercase truncate">
                      {lead.organization_name}
                    </div>
                  )}
                </div>

                <div className="flex-1 text-right pr-6">
                  {lead.expected_value ? (
                    <div className="font-bold text-primary font-display tracking-tight text-lg">
                      {new Intl.NumberFormat('en-US', {
                        style: 'currency',
                        currency: lead.currency || 'EUR',
                        maximumFractionDigits: 0
                      }).format(lead.expected_value)}
                    </div>
                  ) : (
                    <div className="text-white/10">—</div>
                  )}
                </div>

                <div className="flex-1 flex justify-center px-4">
                  <div className={cn(
                    "py-1 px-3 rounded-full text-[9px] font-black uppercase tracking-widest border shrink-0",
                    statusColors[lead.status] || statusColors.new
                  )}>
                    {lead.status}
                  </div>
                </div>

                <div className="flex-1 pr-4">
                  <div className="text-xs text-white/40 truncate">
                    {lead.source_name || (
                      <span className="text-white/10 italic">Direct</span>
                    )}
                  </div>
                </div>

                <div className="w-[180px] flex items-center justify-end gap-2">
                  {lead.status !== 'converted' && lead.status !== 'qualified' ? (
                    <>
                      <button
                        onClick={() => setConversionLead(lead)}
                        className="p-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-primary/20 hover:border-primary/40 text-primary transition-all active:scale-95"
                        title="Qualify Lead"
                      >
                        <CheckCircle2 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => onArchiveLead(lead.id)}
                        className="p-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-red-500/10 hover:border-red-500/40 text-white/20 hover:text-red-400 transition-all active:scale-95"
                        title="Archive Lead"
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </button>
                    </>
                  ) : (
                    <div className="text-[8px] font-black uppercase tracking-widest text-emerald-400/30">
                      {lead.status === 'qualified' ? 'Qualified' : 'Converted'}
                    </div>
                  )}
                  <button className="p-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-white/20 hover:text-white transition-all">
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}


      <AddLeadDialog
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onCreateLead={onCreateLead}
      />

      <LeadConversionDialog
        lead={conversionLead}
        isOpen={!!conversionLead}
        onClose={() => setConversionLead(null)}
        onConvert={async (data) => {
          if (conversionLead) {
            await onQualifyLead(conversionLead.id, data);
          }
        }}
      />
    </div>
  );
}

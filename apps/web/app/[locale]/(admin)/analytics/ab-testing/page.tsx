'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Play, Pause, CheckCircle2, Trash2, Eye, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { createClient } from '@/lib/supabase/client';
import { ExperimentForm } from '@/components/ab-testing/ExperimentForm';
import { VariantManager } from '@/components/ab-testing/VariantManager';
import { ExperimentResults } from '@/components/ab-testing/ExperimentResults';
import type { ABExperiment, PortfolioSite } from '@/lib/services/analytics';
import { format } from 'date-fns';

export default function ABTestingPage() {
  const queryClient = useQueryClient();
  const [selectedSiteId, setSelectedSiteId] = useState<string | null>(null);
  const [selectedExperimentId, setSelectedExperimentId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'variants' | 'results'>('list');

  // Fetch sites
  const { data: sites = [] } = useQuery({
    queryKey: ['portfolio-sites'],
    queryFn: async () => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('portfolio_sites')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return (data || []) as PortfolioSite[];
    },
  });

  // Set default site
  useEffect(() => {
    if (sites.length > 0 && !selectedSiteId) {
      setSelectedSiteId(sites[0].id);
    }
  }, [sites, selectedSiteId]);

  // Fetch experiments
  const { data: experiments = [] } = useQuery({
    queryKey: ['ab-experiments', selectedSiteId],
    queryFn: async () => {
      if (!selectedSiteId) return [];
      const supabase = createClient();
      const { data, error } = await supabase
        .from('ab_experiments')
        .select('*')
        .eq('site_id', selectedSiteId)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return (data || []) as ABExperiment[];
    },
    enabled: !!selectedSiteId,
  });

  // Fetch pages for experiment form
  const { data: pages = [] } = useQuery({
    queryKey: ['portfolio-pages', selectedSiteId],
    queryFn: async () => {
      if (!selectedSiteId) return [];
      const supabase = createClient();
      const { data, error } = await supabase
        .from('portfolio_pages')
        .select('id, title, slug')
        .eq('site_id', selectedSiteId)
        .order('sort_order', { ascending: true });
      if (error) throw error;
      return data || [];
    },
    enabled: !!selectedSiteId,
  });

  // Fetch blocks for experiment form
  const { data: blocks = [] } = useQuery({
    queryKey: ['portfolio-blocks', selectedSiteId],
    queryFn: async () => {
      if (!selectedSiteId) return [];
      const supabase = createClient();
      const { data: pages } = await supabase
        .from('portfolio_pages')
        .select('id')
        .eq('site_id', selectedSiteId);
      
      if (!pages || pages.length === 0) return [];
      
      const { data, error } = await supabase
        .from('portfolio_blocks')
        .select('id, block_type, page_id')
        .in('page_id', pages.map((p) => p.id));
      if (error) throw error;
      return data || [];
    },
    enabled: !!selectedSiteId,
  });

  // Create experiment mutation
  const createExperimentMutation = useMutation({
    mutationFn: async (data: {
      name: string;
      description?: string;
      target_type: 'page' | 'block' | 'style';
      target_id?: string;
      traffic_split: number;
      goal_type: 'pageview' | 'click' | 'form_submit';
      goal_target?: string;
    }) => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data: experiment, error } = await supabase
        .from('ab_experiments')
        .insert({
          user_id: user.id,
          site_id: selectedSiteId!,
          ...data,
          status: 'draft',
        })
        .select()
        .single();
      if (error) throw error;
      return experiment as ABExperiment;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ab-experiments', selectedSiteId] });
    },
  });

  // Update experiment status mutations
  const startExperimentMutation = useMutation({
    mutationFn: async (id: string) => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('ab_experiments')
        .update({
          status: 'running',
          started_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data as ABExperiment;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ab-experiments', selectedSiteId] });
    },
  });

  const pauseExperimentMutation = useMutation({
    mutationFn: async (id: string) => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('ab_experiments')
        .update({ status: 'paused' })
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data as ABExperiment;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ab-experiments', selectedSiteId] });
    },
  });

  const completeExperimentMutation = useMutation({
    mutationFn: async (id: string) => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('ab_experiments')
        .update({
          status: 'completed',
          ended_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data as ABExperiment;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ab-experiments', selectedSiteId] });
    },
  });

  const deleteExperimentMutation = useMutation({
    mutationFn: async (id: string) => {
      const supabase = createClient();
      const { error } = await supabase.from('ab_experiments').delete().eq('id', id);
      if (error) throw error;
      return id;
    },
    onSuccess: (deletedId) => {
      queryClient.invalidateQueries({ queryKey: ['ab-experiments', selectedSiteId] });
      if (selectedExperimentId === deletedId) {
        setSelectedExperimentId(null);
        setViewMode('list');
      }
    },
  });

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { label: string; className: string }> = {
      draft: { label: 'Draft', className: 'bg-gray-100 text-gray-800' },
      running: { label: 'Running', className: 'bg-green-100 text-green-800' },
      paused: { label: 'Paused', className: 'bg-yellow-100 text-yellow-800' },
      completed: { label: 'Completed', className: 'bg-blue-100 text-blue-800' },
    };
    const variant = variants[status] || variants.draft;
    return (
      <Badge className={variant.className}>{variant.label}</Badge>
    );
  };

  const selectedExperiment = experiments.find((e) => e.id === selectedExperimentId);

  return (
    <div className="flex h-[calc(100vh-4rem)] flex-col">
      {/* Header */}
      <div className="flex items-center justify-between border-b p-4">
        <div>
          <h1 className="text-2xl font-bold">A/B Testing</h1>
          <p className="text-sm text-muted-foreground">
            Create and manage A/B test experiments
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Select
            value={selectedSiteId || ''}
            onValueChange={setSelectedSiteId}
          >
            <SelectTrigger className="w-64">
              <SelectValue placeholder="Select site" />
            </SelectTrigger>
            <SelectContent>
              {sites.map((site) => (
                <SelectItem key={site.id} value={site.id}>
                  {site.name} ({site.subdomain})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {selectedSiteId && (
            <ExperimentForm
              siteId={selectedSiteId}
              pages={pages}
              blocks={blocks}
              onCreate={async (data) => {
                await createExperimentMutation.mutateAsync(data);
              }}
            />
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {viewMode === 'list' && (
          <div className="space-y-4">
            {experiments.length === 0 ? (
              <div className="flex h-64 items-center justify-center animate-fade-in">
                <div className="text-center animate-scale-in">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center shadow-lg">
                    <Play className="w-8 h-8 text-white" />
                  </div>
                  <p className="text-lg font-semibold text-foreground">No experiments yet</p>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Create your first A/B test experiment to get started
                  </p>
                </div>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {experiments.map((experiment) => (
                  <Card key={experiment.id}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-lg">{experiment.name}</CardTitle>
                          {experiment.description && (
                            <p className="mt-1 text-sm text-muted-foreground">
                              {experiment.description}
                            </p>
                          )}
                        </div>
                        {getStatusBadge(experiment.status)}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="text-sm">
                          <span className="text-muted-foreground">Target:</span>{' '}
                          <span className="font-medium capitalize">
                            {experiment.target_type}
                          </span>
                        </div>
                        <div className="text-sm">
                          <span className="text-muted-foreground">Goal:</span>{' '}
                          <span className="font-medium capitalize">
                            {experiment.goal_type?.replace('_', ' ')}
                          </span>
                        </div>
                        {experiment.started_at && (
                          <div className="text-sm">
                            <span className="text-muted-foreground">Started:</span>{' '}
                            <span className="font-medium">
                              {format(new Date(experiment.started_at), 'MMM d, yyyy')}
                            </span>
                          </div>
                        )}
                        <div className="flex gap-2 pt-2">
                          {experiment.status === 'draft' && (
                            <Button
                              size="sm"
                              onClick={() => {
                                setSelectedExperimentId(experiment.id);
                                setViewMode('variants');
                              }}
                            >
                              <Plus className="mr-2 h-4 w-4" />
                              Add Variants
                            </Button>
                          )}
                          {experiment.status === 'draft' && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => startExperimentMutation.mutate(experiment.id)}
                            >
                              <Play className="mr-2 h-4 w-4" />
                              Start
                            </Button>
                          )}
                          {experiment.status === 'running' && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => pauseExperimentMutation.mutate(experiment.id)}
                            >
                              <Pause className="mr-2 h-4 w-4" />
                              Pause
                            </Button>
                          )}
                          {experiment.status === 'running' && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setSelectedExperimentId(experiment.id);
                                setViewMode('results');
                              }}
                            >
                              <Eye className="mr-2 h-4 w-4" />
                              Results
                            </Button>
                          )}
                          {experiment.status === 'running' && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => completeExperimentMutation.mutate(experiment.id)}
                            >
                              <CheckCircle2 className="mr-2 h-4 w-4" />
                              Complete
                            </Button>
                          )}
                          {experiment.status === 'paused' && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => startExperimentMutation.mutate(experiment.id)}
                            >
                              <Play className="mr-2 h-4 w-4" />
                              Resume
                            </Button>
                          )}
                          {(experiment.status === 'draft' ||
                            experiment.status === 'completed') && (
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => deleteExperimentMutation.mutate(experiment.id)}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {viewMode === 'variants' && selectedExperimentId && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold">{selectedExperiment?.name}</h2>
                <p className="text-sm text-muted-foreground">
                  Manage variants for this experiment
                </p>
              </div>
              <Button variant="outline" onClick={() => setViewMode('list')}>
                Back to List
              </Button>
            </div>
            <VariantManager experimentId={selectedExperimentId} />
          </div>
        )}

        {viewMode === 'results' && selectedExperimentId && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold">{selectedExperiment?.name}</h2>
                <p className="text-sm text-muted-foreground">Experiment results and analytics</p>
              </div>
              <Button variant="outline" onClick={() => setViewMode('list')}>
                Back to List
              </Button>
            </div>
            <ExperimentResults experimentId={selectedExperimentId} />
          </div>
        )}
      </div>
    </div>
  );
}

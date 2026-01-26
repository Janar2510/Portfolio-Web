'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Building2,
  Globe,
  MapPin,
  Users,
  Briefcase,
  Plus,
  ChevronRight,
  TrendingUp,
  Clock,
  History,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ActivityTimeline } from './ActivityTimeline';
import { createClient } from '@/lib/supabase/client';
import type { Company, Contact, Deal, CRMActivity } from '@/lib/services/crm';
import { formatCurrency } from '@/lib/utils';

interface OrganizationDetailViewProps {
  company: Company;
}

export function OrganizationDetailView({
  company,
}: OrganizationDetailViewProps) {
  const queryClient = useQueryClient();
  const supabase = createClient();

  // Fetch contacts for this company
  const { data: contacts = [] } = useQuery({
    queryKey: ['crm-contacts', { company_id: company.id }],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('contacts')
        .select('*')
        .eq('company_id', company.id);
      if (error) throw error;
      return data as Contact[];
    },
  });

  // Fetch deals for this company
  const { data: deals = [] } = useQuery({
    queryKey: ['crm-deals', { company_id: company.id }],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('deals')
        .select('*')
        .eq('company_id', company.id);
      if (error) throw error;
      return data as Deal[];
    },
  });

  // Fetch activities for contacts in this company
  const { data: activities = [] } = useQuery({
    queryKey: ['crm-activities', { company_id: company.id }],
    queryFn: async () => {
      const contactIds = contacts.map(c => c.id);
      if (contactIds.length === 0) return [];

      const { data, error } = await supabase
        .from('crm_activities')
        .select('*')
        .in('contact_id', contactIds)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as CRMActivity[];
    },
    enabled: contacts.length > 0,
  });

  const totalDealValue = deals.reduce(
    (acc, deal) => acc + (deal.value || 0),
    0
  );

  return (
    <div className="flex flex-col h-full bg-background animate-fade-in overflow-hidden">
      {/* Header / Hero Section */}
      <div className="bg-muted/30 border-b p-8">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-6">
            <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shadow-sm border border-primary/20">
              <Building2 className="h-8 w-8" />
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-bold tracking-tight">
                  {company.name}
                </h1>
                {company.size && (
                  <Badge
                    variant="secondary"
                    className="bg-primary/5 text-primary border-primary/10"
                  >
                    {company.size}
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-4 mt-2 text-muted-foreground text-sm">
                {company.website && (
                  <a
                    href={company.website}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1.5 hover:text-primary transition-colors"
                  >
                    <Globe className="h-4 w-4" />
                    {company.website.replace(/^https?:\/\//, '')}
                  </a>
                )}
                {company.industry && (
                  <span className="flex items-center gap-1.5">
                    <Briefcase className="h-4 w-4" />
                    {company.industry}
                  </span>
                )}
                {company.address && (
                  <span className="flex items-center gap-1.5">
                    <MapPin className="h-4 w-4" />
                    {company.address.city}, {company.address.country}
                  </span>
                )}
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              Edit Details
            </Button>
            <Button size="sm">Create Deal</Button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-4 mt-8">
          <Card className="bg-background/50 backdrop-blur-sm border-primary/10">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="p-2 rounded-lg bg-blue-500/10 text-blue-600">
                <Users className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Contacts
                </p>
                <p className="text-xl font-bold">{contacts.length}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-background/50 backdrop-blur-sm border-primary/10">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="p-2 rounded-lg bg-green-500/10 text-green-600">
                <TrendingUp className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Open Deals
                </p>
                <p className="text-xl font-bold">
                  {deals.filter(d => !d.actual_close_date).length}
                </p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-background/50 backdrop-blur-sm border-primary/10">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="p-2 rounded-lg bg-purple-500/10 text-purple-600">
                <History className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Pipeline Value
                </p>
                <p className="text-xl font-bold">
                  {formatCurrency(totalDealValue, 'EUR')}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Main Content Sections */}
      <div className="flex-1 overflow-auto p-8">
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="bg-muted/50 p-1">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="contacts">
              Contacts ({contacts.length})
            </TabsTrigger>
            <TabsTrigger value="deals">Deals ({deals.length})</TabsTrigger>
            <TabsTrigger value="activities">Activities</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-3 gap-6">
              <div className="col-span-2 space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
                      About
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">
                      {company.notes || 'No description provided.'}
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
                      Recent Activity
                    </CardTitle>
                    <Button variant="ghost" size="sm" className="text-xs h-8">
                      View All
                    </Button>
                  </CardHeader>
                  <CardContent>
                    <ActivityTimeline
                      activities={activities.slice(0, 5)}
                      onActivityCreate={async () => {}}
                      onActivityUpdate={async () => {}}
                      onActivityDelete={async () => {}}
                    />
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
                      Company Details
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">Website</p>
                      <p className="text-sm font-medium">
                        {company.website || 'N/A'}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">Industry</p>
                      <p className="text-sm font-medium">
                        {company.industry || 'N/A'}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">Size</p>
                      <p className="text-sm font-medium capitalize">
                        {company.size || 'N/A'}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">Address</p>
                      <p className="text-sm font-medium leading-tight">
                        {company.address?.street}
                        <br />
                        {company.address?.city}, {company.address?.country}{' '}
                        {company.address?.postal}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">Created</p>
                      <p className="text-sm font-medium">
                        {new Date(company.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="contacts">
            <Card>
              <CardContent className="p-0">
                <div className="divide-y">
                  {contacts.map(contact => (
                    <div
                      key={contact.id}
                      className="p-4 flex items-center justify-between hover:bg-muted/30 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center font-bold text-muted-foreground border">
                          {contact.first_name[0]}
                          {contact.last_name?.[0]}
                        </div>
                        <div>
                          <p className="font-medium">
                            {contact.first_name} {contact.last_name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {contact.job_title || 'No Title'}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {contact.email && (
                          <Badge
                            variant="outline"
                            className="font-normal text-xs"
                          >
                            {contact.email}
                          </Badge>
                        )}
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="deals">
            <Card>
              <CardContent className="p-0">
                <div className="divide-y">
                  {deals.map(deal => (
                    <div
                      key={deal.id}
                      className="p-4 flex items-center justify-between hover:bg-muted/30 transition-colors"
                    >
                      <div>
                        <p className="font-medium">{deal.title}</p>
                        <p className="text-xs text-muted-foreground">
                          Expected Close:{' '}
                          {deal.expected_close_date
                            ? new Date(
                                deal.expected_close_date
                              ).toLocaleDateString()
                            : 'N/A'}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-green-600">
                          {formatCurrency(deal.value || 0, deal.currency)}
                        </p>
                        <Badge className="text-[10px] px-1 h-4">
                          {deal.probability}% Prob.
                        </Badge>
                      </div>
                    </div>
                  ))}
                  {deals.length === 0 && (
                    <div className="p-12 text-center text-muted-foreground text-sm">
                      No deals associated with this organization.
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="activities">
            <Card>
              <CardContent className="pt-6">
                <ActivityTimeline
                  activities={activities}
                  onActivityCreate={async () => {}}
                  onActivityUpdate={async () => {}}
                  onActivityDelete={async () => {}}
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

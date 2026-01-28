'use client';

import { useQuery } from '@tanstack/react-query';
import {
  Users,
  Building2,
  Briefcase,
  TrendingUp,
  DollarSign,
  Calendar,
  Mail,
  Phone,
  CheckCircle2,
} from 'lucide-react';
import { MetricCard } from '@/components/analytics/MetricCard';
import { SimpleChart } from '@/components/analytics/SimpleChart';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { createClient } from '@/lib/supabase/client';
import { format } from 'date-fns';
import type { Contact, Company, Deal, CRMActivity } from '@/domain/crm/crm';

export default function CRMAnalyticsPage() {
  // Fetch all CRM data
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

  const { data: companies = [] } = useQuery({
    queryKey: ['crm-companies'],
    queryFn: async () => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('companies')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return (data || []) as Company[];
    },
  });

  const { data: deals = [] } = useQuery({
    queryKey: ['crm-deals'],
    queryFn: async () => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('deals')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return (data || []) as Deal[];
    },
  });

  const { data: activities = [] } = useQuery({
    queryKey: ['crm-activities'],
    queryFn: async () => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('crm_activities')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return (data || []) as CRMActivity[];
    },
  });

  // Calculate metrics
  const totalContacts = contacts.length;
  const totalCompanies = companies.length;
  const totalDeals = deals.length;
  const activeDeals = deals.filter(d => !d.actual_close_date).length;
  const wonDeals = deals.filter(d => d.actual_close_date).length;
  const totalDealValue = deals.reduce((sum, d) => sum + (d.value || 0), 0);
  const activeDealValue = deals
    .filter(d => !d.actual_close_date)
    .reduce((sum, d) => sum + (d.value || 0), 0);
  const wonDealValue = deals
    .filter(d => d.actual_close_date)
    .reduce((sum, d) => sum + (d.value || 0), 0);

  // Activity breakdown
  const activityBreakdown = activities.reduce(
    (acc, activity) => {
      acc[activity.activity_type] = (acc[activity.activity_type] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  // Deals by stage
  const { data: stages = [] } = useQuery({
    queryKey: ['crm-pipeline-stages'],
    queryFn: async () => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('pipeline_stages')
        .select('*')
        .order('sort_order', { ascending: true });
      if (error) throw error;
      return data || [];
    },
  });

  const dealsByStage = stages.map(stage => ({
    stage_id: stage.id,
    stage_name: stage.name,
    count: deals.filter(d => d.stage_id === stage.id).length,
    value: deals
      .filter(d => d.stage_id === stage.id)
      .reduce((sum, d) => sum + (d.value || 0), 0),
  }));

  // Recent activity timeline (last 30 days)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const recentActivities = activities.filter(
    a => new Date(a.created_at) >= thirtyDaysAgo
  );

  // Activity chart data (last 30 days by day)
  const activityChartData: Array<{
    date: string;
    value: number;
    label: string;
  }> = [];
  for (let i = 29; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    const count = recentActivities.filter(a =>
      a.created_at.startsWith(dateStr)
    ).length;
    activityChartData.push({
      date: dateStr,
      value: count,
      label: format(date, 'MMM d'),
    });
  }

  // Deal value chart data (last 30 days)
  const dealValueChartData: Array<{
    date: string;
    value: number;
    label: string;
  }> = [];
  for (let i = 29; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    const dealsOnDate = deals.filter(d => d.created_at.startsWith(dateStr));
    const value = dealsOnDate.reduce((sum, d) => sum + (d.value || 0), 0);
    dealValueChartData.push({
      date: dateStr,
      value,
      label: format(date, 'MMM d'),
    });
  }

  // Top companies by contact count
  const companiesByContactCount = companies
    .map(company => {
      const contactCount = contacts.filter(
        c => c.company_id === company.id
      ).length;
      return {
        company_id: company.id,
        company_name: company.name,
        contact_count: contactCount,
      };
    })
    .filter(c => c.contact_count > 0)
    .sort((a, b) => b.contact_count - a.contact_count)
    .slice(0, 10);

  return (
    <div className="flex h-[calc(100vh-4rem)] flex-col bg-gradient-to-br from-[hsl(var(--background))] via-[hsl(142_60%_6%)] to-[hsl(var(--background))] animate-fade-in">
      {/* Header */}
      <div className="border-b border-border bg-card/50 backdrop-blur-sm p-4 animate-slide-down">
        <h1 className="text-2xl font-bold text-foreground">CRM Analytics</h1>
        <p className="text-sm text-muted-foreground">
          Overview of your CRM performance and metrics
        </p>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="space-y-6 animate-fade-in">
          {/* Summary Metrics */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
            <MetricCard
              title="Total Contacts"
              value={totalContacts}
              icon={Users}
              description="All contacts in your CRM"
            />
            <MetricCard
              title="Total Companies"
              value={totalCompanies}
              icon={Building2}
              description="All companies in your CRM"
            />
            <MetricCard
              title="Active Deals"
              value={activeDeals}
              icon={Briefcase}
              description={`${wonDeals} won, ${totalDeals} total`}
            />
            <MetricCard
              title="Pipeline Value"
              value={new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: 'EUR',
                notation: 'compact',
              }).format(activeDealValue)}
              icon={DollarSign}
              description={`${wonDealValue > 0 ? new Intl.NumberFormat('en-US', { style: 'currency', currency: 'EUR', notation: 'compact' }).format(wonDealValue) + ' won' : 'No won deals'}`}
            />
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <SimpleChart
              title="Activities Over Time (Last 30 Days)"
              data={activityChartData}
            />
            <SimpleChart
              title="Deal Value Created (Last 30 Days)"
              data={dealValueChartData}
            />
          </div>

          {/* Breakdowns */}
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            {/* Deals by Stage */}
            <Card>
              <CardHeader>
                <CardTitle>Deals by Stage</CardTitle>
              </CardHeader>
              <CardContent>
                {dealsByStage.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    No deals data available
                  </p>
                ) : (
                  <div className="space-y-3">
                    {dealsByStage.map(stage => {
                      const totalDeals = dealsByStage.reduce(
                        (sum, s) => sum + s.count,
                        0
                      );
                      const percentage =
                        totalDeals > 0
                          ? ((stage.count / totalDeals) * 100).toFixed(1)
                          : '0';

                      return (
                        <div key={stage.stage_id} className="space-y-1">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium">
                                {stage.stage_name}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              {stage.value > 0 && (
                                <span className="text-xs text-muted-foreground">
                                  {new Intl.NumberFormat('en-US', {
                                    style: 'currency',
                                    currency: 'EUR',
                                    notation: 'compact',
                                  }).format(stage.value)}
                                </span>
                              )}
                              <Badge variant="outline">
                                {stage.count} deals ({percentage}%)
                              </Badge>
                            </div>
                          </div>
                          <div className="h-2 w-full rounded-full bg-muted">
                            <div
                              className="h-2 rounded-full bg-primary"
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Activity Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle>Activity Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                {Object.keys(activityBreakdown).length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    No activity data available
                  </p>
                ) : (
                  <div className="space-y-3">
                    {Object.entries(activityBreakdown)
                      .sort(([, a], [, b]) => b - a)
                      .map(([type, count]) => {
                        const total = Object.values(activityBreakdown).reduce(
                          (a, b) => a + b,
                          0
                        );
                        const percentage = ((count / total) * 100).toFixed(1);
                        const Icon =
                          type === 'email'
                            ? Mail
                            : type === 'call'
                              ? Phone
                              : type === 'meeting'
                                ? Calendar
                                : type === 'task'
                                  ? CheckCircle2
                                  : TrendingUp;

                        return (
                          <div key={type} className="space-y-1">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <Icon className="h-4 w-4 text-muted-foreground" />
                                <span className="text-sm font-medium capitalize">
                                  {type}
                                </span>
                              </div>
                              <span className="text-sm text-muted-foreground">
                                {count} ({percentage}%)
                              </span>
                            </div>
                            <div className="h-2 w-full rounded-full bg-muted">
                              <div
                                className="h-2 rounded-full bg-primary"
                                style={{ width: `${percentage}%` }}
                              />
                            </div>
                          </div>
                        );
                      })}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Top Companies */}
          {companiesByContactCount.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Top Companies by Contacts</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {companiesByContactCount.map(company => (
                    <div
                      key={company.company_id}
                      className="flex items-center justify-between rounded-lg border p-3"
                    >
                      <div className="flex items-center gap-2">
                        <Building2 className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium">
                          {company.company_name}
                        </span>
                      </div>
                      <Badge variant="outline">
                        {company.contact_count} contacts
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

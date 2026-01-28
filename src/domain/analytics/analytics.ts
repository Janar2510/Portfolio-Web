import { createClient } from '@/lib/supabase/server';

export type EventType = 'pageview' | 'click' | 'form_submit';
export type ExperimentStatus = 'draft' | 'running' | 'paused' | 'completed';
export type ExperimentTargetType = 'page' | 'block' | 'style';
export type GoalType = 'pageview' | 'click' | 'form_submit';

export interface AnalyticsEvent {
  id: string;
  site_id: string;
  page_id: string | null;
  event_type: EventType;
  visitor_id: string | null;
  session_id: string | null;
  referrer: string | null;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  country: string | null;
  device_type: string | null;
  browser: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
}

export interface ABExperiment {
  id: string;
  user_id: string;
  site_id: string;
  name: string;
  description: string | null;
  target_type: ExperimentTargetType;
  target_id: string | null;
  status: ExperimentStatus;
  traffic_split: number;
  goal_type: GoalType | null;
  goal_target: string | null;
  started_at: string | null;
  ended_at: string | null;
  created_at: string;
}

export interface ABVariant {
  id: string;
  experiment_id: string;
  name: string;
  is_control: boolean;
  content_diff: Record<string, unknown>;
  visitors: number;
  conversions: number;
  created_at: string;
}

export interface AnalyticsDaily {
  id: string;
  site_id: string;
  date: string;
  pageviews: number;
  unique_visitors: number;
  form_submissions: number;
  avg_session_duration: number | null;
  bounce_rate: number | null;
  top_pages: Record<string, unknown> | null;
  top_referrers: Record<string, unknown> | null;
  devices: Record<string, unknown> | null;
  countries: Record<string, unknown> | null;
  created_at: string;
}

export class AnalyticsService {
  private async getSupabase() {
    return await createClient();
  }

  // Event methods
  async trackEvent(event: {
    site_id: string;
    page_id?: string;
    event_type: EventType;
    visitor_id?: string;
    session_id?: string;
    referrer?: string;
    utm_source?: string;
    utm_medium?: string;
    utm_campaign?: string;
    country?: string;
    device_type?: string;
    browser?: string;
    metadata?: Record<string, unknown>;
  }): Promise<AnalyticsEvent> {
    const supabase = await this.getSupabase();
    const { data, error } = await supabase
      .from('analytics_events')
      .insert(event)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async getEvents(
    siteId: string,
    filters?: {
      page_id?: string;
      event_type?: EventType;
      start_date?: string;
      end_date?: string;
      limit?: number;
      offset?: number;
    }
  ): Promise<{ events: AnalyticsEvent[]; total: number }> {
    const supabase = await this.getSupabase();
    let query = supabase
      .from('analytics_events')
      .select('*', { count: 'exact' })
      .eq('site_id', siteId);

    if (filters?.page_id) {
      query = query.eq('page_id', filters.page_id);
    }

    if (filters?.event_type) {
      query = query.eq('event_type', filters.event_type);
    }

    if (filters?.start_date) {
      query = query.gte('created_at', filters.start_date);
    }

    if (filters?.end_date) {
      query = query.lte('created_at', filters.end_date);
    }

    query = query.order('created_at', { ascending: false });

    if (filters?.limit) {
      query = query.limit(filters.limit);
    }

    if (filters?.offset) {
      query = query.range(
        filters.offset,
        filters.offset + (filters.limit || 10) - 1
      );
    }

    const { data, error, count } = await query;

    if (error) throw error;
    return { events: data || [], total: count || 0 };
  }

  // A/B Experiment methods
  async getExperiments(siteId: string): Promise<ABExperiment[]> {
    const supabase = await this.getSupabase();
    const { data, error } = await supabase
      .from('ab_experiments')
      .select('*')
      .eq('site_id', siteId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  async getExperimentById(id: string): Promise<ABExperiment | null> {
    const supabase = await this.getSupabase();
    const { data, error } = await supabase
      .from('ab_experiments')
      .select('*')
      .eq('id', id)
      .single();

    if (error && error.code === 'PGRST116') return null;
    if (error) throw error;
    return data;
  }

  async createExperiment(experiment: {
    site_id: string;
    name: string;
    description?: string;
    target_type: ExperimentTargetType;
    target_id?: string;
    traffic_split?: number;
    goal_type?: GoalType;
    goal_target?: string;
  }): Promise<ABExperiment> {
    const supabase = await this.getSupabase();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('ab_experiments')
      .insert({
        user_id: user.id,
        ...experiment,
        status: 'draft',
        traffic_split: experiment.traffic_split || 50,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async updateExperiment(
    id: string,
    updates: {
      name?: string;
      description?: string;
      status?: ExperimentStatus;
      traffic_split?: number;
      goal_type?: GoalType;
      goal_target?: string;
      started_at?: string;
      ended_at?: string;
    }
  ): Promise<ABExperiment> {
    const supabase = await this.getSupabase();
    const { data, error } = await supabase
      .from('ab_experiments')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async startExperiment(id: string): Promise<ABExperiment> {
    return this.updateExperiment(id, {
      status: 'running',
      started_at: new Date().toISOString(),
    });
  }

  async pauseExperiment(id: string): Promise<ABExperiment> {
    return this.updateExperiment(id, { status: 'paused' });
  }

  async completeExperiment(id: string): Promise<ABExperiment> {
    return this.updateExperiment(id, {
      status: 'completed',
      ended_at: new Date().toISOString(),
    });
  }

  async deleteExperiment(id: string): Promise<void> {
    const supabase = await this.getSupabase();
    const { error } = await supabase
      .from('ab_experiments')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  // Variant methods
  async getVariants(experimentId: string): Promise<ABVariant[]> {
    const supabase = await this.getSupabase();
    const { data, error } = await supabase
      .from('ab_variants')
      .select('*')
      .eq('experiment_id', experimentId)
      .order('is_control', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  async createVariant(
    experimentId: string,
    variant: {
      name: string;
      is_control?: boolean;
      content_diff: Record<string, unknown>;
    }
  ): Promise<ABVariant> {
    const supabase = await this.getSupabase();
    const { data, error } = await supabase
      .from('ab_variants')
      .insert({
        experiment_id: experimentId,
        ...variant,
        is_control: variant.is_control || false,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async updateVariant(
    id: string,
    updates: {
      name?: string;
      content_diff?: Record<string, unknown>;
    }
  ): Promise<ABVariant> {
    const supabase = await this.getSupabase();
    const { data, error } = await supabase
      .from('ab_variants')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async deleteVariant(id: string): Promise<void> {
    const supabase = await this.getSupabase();
    const { error } = await supabase.from('ab_variants').delete().eq('id', id);

    if (error) throw error;
  }

  async getExperimentStats(experimentId: string): Promise<{
    variants: ABVariant[];
    totalVisitors: number;
    totalConversions: number;
  }> {
    const variants = await this.getVariants(experimentId);
    const totalVisitors = variants.reduce((sum, v) => sum + v.visitors, 0);
    const totalConversions = variants.reduce(
      (sum, v) => sum + v.conversions,
      0
    );

    return {
      variants,
      totalVisitors,
      totalConversions,
    };
  }

  // Daily analytics methods
  async getDailyAnalytics(
    siteId: string,
    filters?: {
      start_date?: string;
      end_date?: string;
    }
  ): Promise<AnalyticsDaily[]> {
    const supabase = await this.getSupabase();
    let query = supabase
      .from('analytics_daily')
      .select('*')
      .eq('site_id', siteId)
      .order('date', { ascending: false });

    if (filters?.start_date) {
      query = query.gte('date', filters.start_date);
    }

    if (filters?.end_date) {
      query = query.lte('date', filters.end_date);
    }

    const { data, error } = await query;

    if (error) throw error;
    return data || [];
  }

  async getDailyAnalyticsByDate(
    siteId: string,
    date: string
  ): Promise<AnalyticsDaily | null> {
    const supabase = await this.getSupabase();
    const { data, error } = await supabase
      .from('analytics_daily')
      .select('*')
      .eq('site_id', siteId)
      .eq('date', date)
      .single();

    if (error && error.code === 'PGRST116') return null;
    if (error) throw error;
    return data;
  }

  // Analytics summary methods
  async getSiteSummary(
    siteId: string,
    days: number = 30
  ): Promise<{
    totalPageviews: number;
    totalUniqueVisitors: number;
    totalFormSubmissions: number;
    avgSessionDuration: number | null;
    bounceRate: number | null;
  }> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    const startDateStr = startDate.toISOString().split('T')[0];

    const daily = await this.getDailyAnalytics(siteId, {
      start_date: startDateStr,
    });

    const totalPageviews = daily.reduce((sum, d) => sum + d.pageviews, 0);
    const totalUniqueVisitors = daily.reduce(
      (sum, d) => sum + d.unique_visitors,
      0
    );
    const totalFormSubmissions = daily.reduce(
      (sum, d) => sum + d.form_submissions,
      0
    );

    const durations = daily
      .map(d => d.avg_session_duration)
      .filter((d): d is number => d !== null);
    const avgSessionDuration =
      durations.length > 0
        ? durations.reduce((sum, d) => sum + d, 0) / durations.length
        : null;

    const bounceRates = daily
      .map(d => d.bounce_rate)
      .filter((r): r is number => r !== null);
    const bounceRate =
      bounceRates.length > 0
        ? bounceRates.reduce((sum, r) => sum + r, 0) / bounceRates.length
        : null;

    return {
      totalPageviews,
      totalUniqueVisitors,
      totalFormSubmissions,
      avgSessionDuration,
      bounceRate,
    };
  }
}

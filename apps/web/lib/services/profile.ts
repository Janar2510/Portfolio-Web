import { createClient } from '@/lib/supabase/server';

export interface Profile {
  id: string;
  display_name: string | null;
  avatar_url: string | null;
  locale: 'et' | 'en';
  timezone: string;
  onboarding_completed: boolean;
  created_at: string;
  updated_at: string;
}

export interface UserSettings {
  user_id: string;
  email_notifications: boolean;
  portfolio_subdomain: string | null;
  custom_domain: string | null;
  custom_domain_verified: boolean;
  plan_tier: 'free' | 'pro' | 'business';
  settings_json: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export class ProfileService {
  private async getSupabase() {
    return await createClient();
  }

  async getProfile(): Promise<Profile | null> {
    const supabase = await this.getSupabase();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return null;

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (error) throw error;
    return data;
  }

  async updateProfile(updates: {
    display_name?: string;
    avatar_url?: string;
    locale?: 'et' | 'en';
    timezone?: string;
    onboarding_completed?: boolean;
  }): Promise<Profile> {
    const supabase = await this.getSupabase();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', user.id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async getSettings(): Promise<UserSettings | null> {
    const supabase = await this.getSupabase();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return null;

    const { data, error } = await supabase
      .from('user_settings')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (error) throw error;
    return data;
  }

  async updateSettings(updates: {
    email_notifications?: boolean;
    portfolio_subdomain?: string;
    custom_domain?: string;
    custom_domain_verified?: boolean;
    plan_tier?: 'free' | 'pro' | 'business';
    settings_json?: Record<string, unknown>;
  }): Promise<UserSettings> {
    const supabase = await this.getSupabase();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('user_settings')
      .update(updates)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async checkSubdomainAvailability(subdomain: string): Promise<boolean> {
    const supabase = await this.getSupabase();
    const { data, error } = await supabase
      .from('user_settings')
      .select('user_id')
      .eq('portfolio_subdomain', subdomain)
      .single();

    // If no row found, subdomain is available
    if (error && error.code === 'PGRST116') {
      return true;
    }

    if (error) throw error;
    return false;
  }
}

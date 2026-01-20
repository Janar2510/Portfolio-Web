import { createClient } from '@/lib/supabase/server';

export interface PortfolioSite {
  id: string;
  user_id: string;
  name: string;
  subdomain: string;
  content?: BlockSchema;
  settings?: SiteSettings;
  created_at: string;
  updated_at: string;
}

export interface BlockSchema {
  type: string;
  props: Record<string, unknown>;
  children?: BlockSchema[];
}

export interface SiteSettings {
  theme?: string;
  seo?: {
    title?: string;
    description?: string;
  };
}

export class PortfolioService {
  private async getSupabase() {
    return await createClient();
  }

  async getSites(): Promise<PortfolioSite[]> {
    const supabase = await this.getSupabase();
    const { data, error } = await supabase
      .from('portfolio_sites')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  async getSiteById(id: string): Promise<PortfolioSite | null> {
    const supabase = await this.getSupabase();
    const { data, error } = await supabase
      .from('portfolio_sites')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  }

  async createSite(site: {
    name: string;
    subdomain: string;
    templateId?: string;
  }): Promise<PortfolioSite> {
    const supabase = await this.getSupabase();
    const { data, error } = await supabase
      .from('portfolio_sites')
      .insert({
        name: site.name,
        subdomain: site.subdomain,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async updateSite(
    id: string,
    updates: {
      name?: string;
      content?: BlockSchema;
      settings?: SiteSettings;
    }
  ): Promise<PortfolioSite> {
    const supabase = await this.getSupabase();
    const { data, error } = await supabase
      .from('portfolio_sites')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async deleteSite(id: string): Promise<void> {
    const supabase = await this.getSupabase();
    const { error } = await supabase
      .from('portfolio_sites')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }
}

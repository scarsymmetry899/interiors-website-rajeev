import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database.types';
import { PortfolioEntry } from '../types/portfolio';

const getPublicClient = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    return null;
  }

  return createClient<Database>(url, key, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
};

export const getPublishedPortfolioEntries = async (): Promise<PortfolioEntry[]> => {
  const supabase = getPublicClient();
  
  if (!supabase) {
    console.warn('⚠️ No database connection. Cannot load portfolio.');
    return []; // No mock fallback in production!
  }

  // Real query logic against the DB
  const { data, error } = await supabase
    .from('portfolio_entries')
    .select(`
      id, slug, title, location_display, property_type, style, area_display, completion_year, featured, status, seo_title, seo_description
    `)
    .eq('status', 'published')
    .order('completion_year', { ascending: false });

  if (error || !data) {
    console.error('Error fetching portfolio entries:', error);
    return [];
  }

  // Map to the internal type (omitting asset joins for brevity in this query, can be expanded later)
  const rows = data as any[];
  return rows.map(entry => ({
    ...entry,
    hero_asset: undefined // We'd join portfolio_entry_assets in a real complete query
  }));
};

export const getPortfolioEntryBySlug = async (slug: string): Promise<PortfolioEntry | null> => {
  const supabase = getPublicClient();
  
  if (!supabase) {
    console.warn('⚠️ No database connection. Cannot load portfolio entry.');
    return null; // No mock fallback!
  }

  const { data, error } = await supabase
    .from('portfolio_entries')
    .select(`
      *,
      portfolio_sections (*)
    `)
    .eq('slug', slug)
    .eq('status', 'published')
    .single();

  if (error || !data) {
    console.error('Error fetching portfolio entry:', error);
    return null;
  }

  const row = data as any;
  return {
    ...row,
    sections: (row.portfolio_sections || []).sort((a: any, b: any) => a.display_order - b.display_order) as any,
  };
};

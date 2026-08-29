import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database.types';

// This is a client for fetching public site settings server-side
const getPublicClient = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    // Graceful fallback for development when no DB is connected
    return null; 
  }

  return createClient<Database>(url, key, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
};

export type SiteSettings = {
  studio_name: string;
  public_email?: string;
  public_phone?: string;
  whatsapp_number?: string;
  address_line_1?: string;
  address_line_2?: string;
  city?: string;
  country?: string;
  instagram_url?: string;
  pinterest_url?: string;
  default_seo_title?: string;
  default_seo_description?: string;
  default_og_image_id?: string;
};

// Fallback settings if DB is disconnected
const FALLBACK_SETTINGS: SiteSettings = {
  studio_name: 'STUDIO NAME',
  public_email: 'hello@studio.com',
  city: 'Mumbai',
  instagram_url: 'https://instagram.com'
};

export const getSiteSettings = async (): Promise<SiteSettings> => {
  const supabase = getPublicClient();

  if (!supabase) {
    return FALLBACK_SETTINGS;
  }

  try {
    const { data, error } = await supabase
      .from('site_settings')
      .select('*')
      .limit(1)
      .single();

    if (error || !data) {
      console.warn('⚠️ Could not fetch site_settings, using fallback.');
      return FALLBACK_SETTINGS;
    }

    return (data as unknown) as SiteSettings;
  } catch (err) {
    console.error('Error fetching site_settings:', err);
    return FALLBACK_SETTINGS;
  }
};

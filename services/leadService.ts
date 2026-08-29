import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database.types';

/**
 * Server-side client using the public anon key.
 * Because submit_consultation_lead is a SECURITY DEFINER function granted to 'anon',
 * we do not need the service role key for lead submission.
 */
const getPublicClient = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    throw new Error('Missing Supabase public credentials.');
  }

  return createClient<Database>(url, key, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
};

export type LeadPayload = {
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  project_location?: string;
  property_type?: string;
  property_area?: string;
  budget_range?: string;
  project_stage?: string;
  expected_start_date?: string;
  service_interest?: string;
  message?: string;
};

export type Touchpoint = {
  anonymous_session_id: string;
  source?: string;
  medium?: string;
  campaign?: string;
  content?: string;
  term?: string;
  landing_page?: string;
  referrer?: string;
  gclid?: string;
  gbraid?: string;
  wbraid?: string;
  fbclid?: string;
};

export const submitLead = async (
  lead: LeadPayload,
  touchpoints: Touchpoint[]
) => {
  const supabase = getPublicClient();

  // We use the RPC defined in our migrations to bypass RLS safely and insert atomically
  const { data, error } = await supabase.rpc('submit_consultation_lead', {
    p_first_name: lead.first_name,
    p_last_name: lead.last_name,
    p_email: lead.email,
    p_phone: lead.phone || null,
    p_project_location: lead.project_location || null,
    p_property_type: lead.property_type || null,
    p_property_area: lead.property_area || null,
    p_budget_range: lead.budget_range || null,
    p_project_stage: lead.project_stage || null,
    p_expected_start_date: lead.expected_start_date || null,
    p_service_interest: lead.service_interest || null,
    p_message: lead.message || null,
    p_touchpoints: touchpoints as any,
  });

  if (error) {
    console.error('Error submitting lead:', error);
    throw new Error('Failed to submit consultation request');
  }

  return data;
};

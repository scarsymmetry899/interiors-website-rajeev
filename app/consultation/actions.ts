'use server';

import { submitLead } from '@/services/leadService';
import { sendLeadNotification } from '@/services/notificationService';
import { z } from 'zod';
import { headers } from 'next/headers';

const formSchema = z.object({
  first_name: z.string().min(2, "First name is required"),
  last_name: z.string().min(2, "Last name is required"),
  email: z.string().email("Valid email is required"),
  phone: z.string().optional(),
  project_location: z.string().optional(),
  property_type: z.string().optional(),
  property_area: z.string().optional(),
  budget_range: z.string().optional(),
  project_stage: z.string().optional(),
  expected_start_date: z.string().optional(),
  service_interest: z.string().optional(),
  message: z.string().optional(),
});

import { createHmac } from 'crypto';
import { getPublicClient } from '@/services/supabase';

// Helper to hash IP for privacy using HMAC
function hashIp(ip: string) {
  const secret = process.env.RATE_LIMIT_HASH_SECRET || 'fallback-secret-for-development';
  if (process.env.NODE_ENV === 'production' && !process.env.RATE_LIMIT_HASH_SECRET) {
    console.warn('WARNING: RATE_LIMIT_HASH_SECRET is missing in production.');
  }
  return createHmac('sha256', secret).update(ip).digest('hex');
}

export async function submitConsultationAction(prevState: any, formData: FormData) {
  try {
    // 1. Honeypot check
    const botField = formData.get('_confirm_email');
    if (botField) {
      console.warn('Bot detected via honeypot');
      return { success: false, error: 'Invalid submission.' };
    }

    // 2. Rate Limiting check
    const headerList = await headers();
    const ip = headerList.get('x-forwarded-for') || '127.0.0.1';
    const ipHash = hashIp(ip);
    
    const maxRequests = parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '3', 10);
    const windowInterval = process.env.RATE_LIMIT_WINDOW || '1 hour';

    const supabase = getPublicClient();
    const { data: allowed, error: rateLimitErr } = await supabase.rpc('check_rate_limit', {
      p_ip_hash: ipHash,
      p_action: 'consultation_submission',
      p_max_requests: maxRequests,
      p_window_interval: windowInterval
    });

    if (rateLimitErr) {
      console.error('Rate Limit RPC Error:', rateLimitErr);
      // Fail open if the RPC itself errors (or closed, depending on strictness - we'll fail open so valid users aren't blocked by DB errors)
    } else if (!allowed) {
      console.warn(`Rate limit exceeded for IP Hash: ${ipHash}`);
      return { success: false, error: 'Too many submissions. Please try again later.' };
    }

    // 3. Validation
    const rawData = Object.fromEntries(formData.entries());
    const validatedData = formSchema.parse(rawData);

    // 4. Persistence
    // Simulated Session ID for Phase 1 (would come from cookies)
    const touchpoints = [{
      anonymous_session_id: '00000000-0000-0000-0000-000000000000',
      source: 'direct',
      medium: 'none',
      timestamp: new Date().toISOString()
    }];

    await submitLead(validatedData, touchpoints);
    
    // 5. POST-COMMIT Notification - Does not invalidate DB transaction
    const notificationSuccess = await sendLeadNotification(validatedData);
    if (!notificationSuccess) {
      console.warn('Lead was stored, but email notification failed. Not blocking.');
    }

    return { success: true };
  } catch (error) {
    console.error('Lead Submission Error:', error);
    if (error instanceof z.ZodError) {
      return { success: false, error: 'Please check your inputs and try again.' };
    }
    return { success: false, error: 'Failed to submit the consultation request. Please try again or contact us directly.' };
  }
}

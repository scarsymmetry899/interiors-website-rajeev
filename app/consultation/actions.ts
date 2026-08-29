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

// Simple in-memory rate limiter (per IP)
const rateLimitMap = new Map<string, number[]>();

export async function submitConsultationAction(prevState: any, formData: FormData) {
  try {
    // 1. Honeypot check
    const botField = formData.get('_confirm_email');
    if (botField) {
      console.warn('Bot detected via honeypot');
      return { success: false, error: 'Invalid submission.' };
    }

    // 2. Rate Limiting check (Max 3 submissions per IP per hour)
    const headerList = await headers();
    const ip = headerList.get('x-forwarded-for') || '127.0.0.1';
    const now = Date.now();
    const requests = (rateLimitMap.get(ip) || []).filter(time => now - time < 3600000); // 1 hour window
    if (requests.length >= 3) {
      console.warn(`Rate limit exceeded for IP: ${ip}`);
      return { success: false, error: 'Too many submissions. Please try again later.' };
    }
    requests.push(now);
    rateLimitMap.set(ip, requests);

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

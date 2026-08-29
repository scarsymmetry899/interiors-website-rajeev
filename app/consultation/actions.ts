'use server';

import { submitLead } from '@/services/leadService';
import { sendLeadNotification } from '@/services/notificationService';
import { z } from 'zod';

const formSchema = z.object({
  first_name: z.string().min(2),
  last_name: z.string().min(2),
  email: z.string().email(),
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

export async function submitConsultationAction(prevState: any, formData: FormData) {
  try {
    const rawData = Object.fromEntries(formData.entries());
    const validatedData = formSchema.parse(rawData);

    // Hardcode touchpoints for Phase 1 as instructed previously (first party cookie tracking logic can be added later)
    const touchpoints = [{
      anonymous_session_id: '00000000-0000-0000-0000-000000000000',
      source: 'direct',
      medium: 'none',
      timestamp: new Date().toISOString()
    }];

    await submitLead(validatedData, touchpoints);
    
    // POST-COMMIT Notification - Does not invalidate DB transaction if it fails
    // We execute this synchronously for Phase 1 as requested.
    const notificationSuccess = await sendLeadNotification(validatedData);
    if (!notificationSuccess) {
      console.warn('Lead was stored, but email notification failed.');
    }

    return { success: true };
  } catch (error) {
    console.error('Lead Submission Error:', error);
    return { success: false, error: 'Failed to submit the consultation request. Please try again or contact us directly.' };
  }
}

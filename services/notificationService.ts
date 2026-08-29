import { Resend } from 'resend';
import { LeadPayload } from './leadService';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendLeadNotification(lead: LeadPayload) {
  if (!process.env.RESEND_API_KEY) {
    console.warn('⚠️ Missing RESEND_API_KEY. Skipping notification.');
    return false;
  }
  
  if (!process.env.STUDIO_NOTIFICATION_EMAIL) {
    console.warn('⚠️ Missing STUDIO_NOTIFICATION_EMAIL. Skipping notification.');
    return false;
  }

  try {
    const { data, error } = await resend.emails.send({
      from: 'Studio Notifications <onboarding@resend.dev>', // In production, use verified studio domain
      to: [process.env.STUDIO_NOTIFICATION_EMAIL],
      subject: `New Project Inquiry: ${lead.first_name} ${lead.last_name}`,
      html: `
        <h2>New Project Inquiry</h2>
        <p><strong>Name:</strong> ${lead.first_name} ${lead.last_name}</p>
        <p><strong>Email:</strong> ${lead.email}</p>
        <p><strong>Phone:</strong> ${lead.phone || 'N/A'}</p>
        <p><strong>Location:</strong> ${lead.project_location || 'N/A'}</p>
        <p><strong>Property Type:</strong> ${lead.property_type || 'N/A'}</p>
        <p><strong>Budget Range:</strong> ${lead.budget_range || 'N/A'}</p>
        <p><strong>Project Stage:</strong> ${lead.project_stage || 'N/A'}</p>
        <hr />
        <p><strong>Message:</strong><br />${lead.message || 'N/A'}</p>
      `,
    });

    if (error) {
      console.error('❌ Resend API Error:', error);
      return false;
    }
    
    return true;
  } catch (err) {
    console.error('❌ Failed to send notification email:', err);
    return false;
  }
}

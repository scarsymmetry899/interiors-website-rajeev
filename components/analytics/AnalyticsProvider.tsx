'use client';

import { useEffect, useState } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

// A type-safe event contract for Phase 1
export type AnalyticsEvent = 
  | 'project_viewed'
  | 'project_gallery_interacted'
  | 'before_after_interacted'
  | 'consultation_started'
  | 'consultation_step_completed'
  | 'consultation_submitted'
  | 'phone_clicked'
  | 'whatsapp_clicked'
  | 'contact_clicked';

export function trackEvent(eventName: AnalyticsEvent, payload?: Record<string, any>) {
  // 1. First-Party Tracking (CRM Attribution) 
  // This always runs regardless of GA4/Meta consent.
  console.log(`[Analytics Internal] Event: ${eventName}`, payload);
  
  // 2. Third-Party Marketing Tracking (GA4/Meta)
  // This should check window.__TRACKING_CONSENT_GRANTED before firing
  if (typeof window !== 'undefined' && (window as any).__TRACKING_CONSENT_GRANTED) {
    // e.g. window.gtag('event', eventName, payload)
    console.log(`[Analytics External] Sent to Providers: ${eventName}`);
  }
}

export function AnalyticsProvider() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [consentGranted, setConsentGranted] = useState(false);

  useEffect(() => {
    // In a real implementation, read from a cookie or Consent Management Platform (CMP)
    const hasConsent = localStorage.getItem('tracking_consent') === 'true';
    setConsentGranted(hasConsent);
    (window as any).__TRACKING_CONSENT_GRANTED = hasConsent;
  }, []);

  useEffect(() => {
    // Route change tracking
    if (pathname && consentGranted) {
      // e.g. window.gtag('config', 'G-XXXX', { page_path: pathname })
    }
  }, [pathname, searchParams, consentGranted]);

  if (consentGranted) {
    return null; // Providers initialized
  }

  // Very minimal consent banner matching the editorial aesthetic
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-brand-charcoal text-brand-bone px-6 py-4 flex flex-col md:flex-row items-center justify-between z-50 text-xs tracking-widest uppercase">
      <p className="mb-4 md:mb-0">We use cookies to improve your experience and measure site performance.</p>
      <div className="flex gap-4">
        <button 
          onClick={() => {
            localStorage.setItem('tracking_consent', 'true');
            setConsentGranted(true);
            (window as any).__TRACKING_CONSENT_GRANTED = true;
          }}
          className="bg-brand-bone text-brand-ink px-6 py-2 hover:bg-brand-taupe transition-colors"
        >
          Accept
        </button>
        <button 
          onClick={() => {
            localStorage.setItem('tracking_consent', 'false');
            setConsentGranted(false);
          }}
          className="border border-brand-bone px-6 py-2 hover:bg-brand-bone hover:text-brand-ink transition-colors"
        >
          Decline
        </button>
      </div>
    </div>
  );
}

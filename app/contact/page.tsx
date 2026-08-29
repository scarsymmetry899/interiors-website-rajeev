import { Navigation } from '@/components/layout/Navigation';
import { Footer } from '@/components/layout/Footer';
import Link from 'next/link';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Contact | Studio Name',
  description: 'Get in touch with our studio.',
};

export default function ContactPage() {
  return (
    <main className="flex flex-col min-h-screen bg-brand-bone">
      <Navigation />

      <section className="pt-48 pb-24 px-6 md:px-12 max-w-screen-xl mx-auto w-full text-center">
        <h1 className="text-5xl md:text-7xl font-serif text-brand-ink mb-12 leading-[1.1]">
          Contact
        </h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-24 max-w-screen-lg mx-auto text-left mt-24">
          <div>
            <h2 className="uppercase tracking-widest text-xs text-brand-charcoal mb-8">New Commissions</h2>
            <p className="text-xl font-serif text-brand-ink mb-4">Are you planning a project?</p>
            <p className="text-brand-muted mb-8">Please use our consultation form to provide details about your upcoming project.</p>
            <Link href="/consultation" className="text-sm tracking-widest uppercase border-b border-brand-charcoal pb-1 hover:text-brand-taupe transition-colors">
              Start a Conversation →
            </Link>
          </div>
          <div>
            <h2 className="uppercase tracking-widest text-xs text-brand-charcoal mb-8">General Inquiries</h2>
            <div className="space-y-6">
              <div>
                <p className="text-brand-muted text-sm mb-1">Email</p>
                <a href="mailto:hello@studio.com" className="text-lg font-serif text-brand-ink hover:text-brand-taupe transition-colors">hello@studio.com</a>
              </div>
              <div>
                <p className="text-brand-muted text-sm mb-1">Studio</p>
                <p className="text-lg font-serif text-brand-ink">Colaba, Mumbai<br/>By Appointment Only</p>
              </div>
              <div>
                <p className="text-brand-muted text-sm mb-1">Press</p>
                <a href="mailto:press@studio.com" className="text-lg font-serif text-brand-ink hover:text-brand-taupe transition-colors">press@studio.com</a>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}

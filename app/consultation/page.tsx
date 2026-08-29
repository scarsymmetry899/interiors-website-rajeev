import { Navigation } from '@/components/layout/Navigation';
import { Footer } from '@/components/layout/Footer';
import { ConsultationForm } from './ConsultationForm';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Consultation | Studio Name',
  description: 'Begin a conversation about your upcoming interior architecture or design project.',
};

export default function ConsultationPage() {
  return (
    <main className="flex flex-col min-h-screen bg-brand-bone">
      <Navigation />

      <section className="pt-48 pb-24 px-6 md:px-12 max-w-screen-md mx-auto w-full">
        <h1 className="text-4xl md:text-6xl font-serif text-brand-ink mb-8 leading-[1.1]">
          Start a conversation.
        </h1>
        <p className="text-brand-muted leading-relaxed font-light mb-16">
          We accept a limited number of commissions each year to ensure uncompromising dedication to every detail. Please share the vision for your upcoming project below.
        </p>

        <ConsultationForm />
      </section>

      <Footer />
    </main>
  );
}

import { Navigation } from '@/components/layout/Navigation';
import { Footer } from '@/components/layout/Footer';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Journal | Studio Name',
  description: 'Notes on architecture, design, and our process.',
};

export default function JournalPage() {
  return (
    <main className="flex flex-col min-h-screen bg-brand-bone">
      <Navigation />

      <section className="pt-48 pb-24 px-6 md:px-12 max-w-screen-xl mx-auto w-full">
        <h1 className="uppercase tracking-widest text-xs text-brand-charcoal mb-8">Journal</h1>
        <p className="text-4xl md:text-6xl font-serif text-brand-ink max-w-4xl leading-[1.1] mb-24">
          Notes on architecture, design, and life.
        </p>

        <div className="py-24 text-center border-t border-brand-stone">
           <p className="text-xl font-serif text-brand-taupe">Coming Soon.</p>
        </div>
      </section>

      <Footer />
    </main>
  );
}

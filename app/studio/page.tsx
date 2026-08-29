import { Navigation } from '@/components/layout/Navigation';
import { Footer } from '@/components/layout/Footer';
import Image from 'next/image';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Studio | Studio Name',
  description: 'About our interior design practice.',
};

export default function StudioPage() {
  return (
    <main className="flex flex-col min-h-screen bg-brand-bone">
      <Navigation />

      <section className="pt-48 pb-24 px-6 md:px-12 max-w-screen-xl mx-auto w-full">
        <h1 className="uppercase tracking-widest text-xs text-brand-charcoal mb-8">The Studio</h1>
        <p className="text-4xl md:text-6xl font-serif text-brand-ink max-w-4xl leading-[1.1] mb-24">
          Designing spaces that demand quiet presence.
        </p>

        <div className="w-full aspect-[21/9] relative mb-24">
           <Image src="/images/project2.jpg" alt="Studio" fill className="object-cover" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-24 max-w-screen-lg mx-auto">
          <div>
            <h2 className="text-2xl font-serif text-brand-ink mb-6">Our Philosophy</h2>
            <p className="text-brand-muted leading-relaxed mb-6">
              We believe that interiors should be an honest reflection of the people who inhabit them. By stripping away the unnecessary, we focus on proportion, light, and materiality.
            </p>
          </div>
          <div>
            <h2 className="text-2xl font-serif text-brand-ink mb-6">The Team</h2>
            <p className="text-brand-muted leading-relaxed">
              Based in Mumbai, our studio comprises architects, interior designers, and stylists working collaboratively to deliver highly resolved spaces across residential and commercial sectors.
            </p>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}

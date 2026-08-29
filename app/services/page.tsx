import { Navigation } from '@/components/layout/Navigation';
import { Footer } from '@/components/layout/Footer';
import Image from 'next/image';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Services | Studio Name',
  description: 'Our interior architecture and design services.',
};

export default function ServicesPage() {
  const services = [
    { title: 'Interior Architecture', desc: 'Space planning, structural modifications, and foundational design.' },
    { title: 'Turnkey Execution', desc: 'End-to-end project management from concept to final handover.' },
    { title: 'Furniture & Styling', desc: 'Curated sourcing, bespoke furniture design, and final layer styling.' }
  ];

  return (
    <main className="flex flex-col min-h-screen bg-brand-bone">
      <Navigation />

      <section className="pt-48 pb-24 px-6 md:px-12 max-w-screen-xl mx-auto w-full">
        <h1 className="uppercase tracking-widest text-xs text-brand-charcoal mb-8">Expertise</h1>
        <p className="text-4xl md:text-6xl font-serif text-brand-ink max-w-4xl leading-[1.1] mb-24">
          A holistic approach to interior architecture.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-24">
          <div>
            <div className="aspect-[4/5] relative w-full mb-12">
               <Image src="/images/hero.jpg" alt="Materials" fill className="object-cover" />
            </div>
          </div>
          <div className="flex flex-col justify-center">
            <ul className="space-y-16">
              {services.map((s, i) => (
                <li key={i} className="border-b border-brand-stone pb-8">
                  <h3 className="text-3xl font-serif text-brand-ink mb-4">{s.title}</h3>
                  <p className="text-brand-muted leading-relaxed">{s.desc}</p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}

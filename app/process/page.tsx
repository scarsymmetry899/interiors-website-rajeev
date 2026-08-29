import { Navigation } from '@/components/layout/Navigation';
import { Footer } from '@/components/layout/Footer';
import Image from 'next/image';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Process | Studio Name',
  description: 'Our design methodology.',
};

export default function ProcessPage() {
  const phases = [
    { num: '01', title: 'Discovery', desc: 'Understanding the brief, context, and vision.' },
    { num: '02', title: 'Concept', desc: 'Spatial planning, moodboards, and initial sketches.' },
    { num: '03', title: 'Detail', desc: 'Material selection, lighting design, and technical drawings.' },
    { num: '04', title: 'Execution', desc: 'Site supervision, procurement, and final styling.' }
  ];

  return (
    <main className="flex flex-col min-h-screen bg-brand-bone">
      <Navigation />

      <section className="pt-48 pb-24 px-6 md:px-12 max-w-screen-xl mx-auto w-full">
        <h1 className="uppercase tracking-widest text-xs text-brand-charcoal mb-8">Methodology</h1>
        <p className="text-4xl md:text-6xl font-serif text-brand-ink max-w-4xl leading-[1.1] mb-24">
          A rigorous approach to spatial transformation.
        </p>

        <div className="grid grid-cols-1 gap-12">
          {phases.map((phase) => (
            <div key={phase.num} className="flex flex-col md:flex-row gap-8 md:gap-24 border-t border-brand-stone pt-12 items-start">
              <span className="text-sm font-serif text-brand-charcoal w-12">{phase.num}</span>
              <div className="flex-1 max-w-lg">
                <h3 className="text-3xl font-serif text-brand-ink mb-4">{phase.title}</h3>
                <p className="text-brand-muted leading-relaxed">{phase.desc}</p>
              </div>
              <div className="w-full md:w-1/3 aspect-video relative bg-brand-stone">
                 {/* Placeholder for process imagery */}
              </div>
            </div>
          ))}
        </div>
      </section>

      <Footer />
    </main>
  );
}

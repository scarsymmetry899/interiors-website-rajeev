import { Navigation } from '@/components/layout/Navigation';
import { Footer } from '@/components/layout/Footer';
import { getPublishedPortfolioEntries } from '@/services/portfolioService';
import Image from 'next/image';
import Link from 'next/link';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Selected Works | Studio Name',
  description: 'Explore our portfolio of refined residential and commercial interior architecture.',
  openGraph: {
    title: 'Selected Works | Studio Name',
    description: 'Explore our portfolio of refined residential and commercial interior architecture.',
    type: 'website',
  }
};

export default async function ProjectsIndex() {
  const projects = await getPublishedPortfolioEntries();

  return (
    <main className="flex flex-col min-h-screen bg-brand-bone">
      <Navigation />

      <section className="pt-48 pb-24 px-6 md:px-12 max-w-screen-2xl mx-auto w-full">
        <h1 className="uppercase tracking-widest text-xs text-brand-charcoal mb-8">Selected Works</h1>
        <p className="text-4xl md:text-6xl font-serif text-brand-ink max-w-3xl leading-[1.1]">
          Spaces shaped around people, light and material.
        </p>
      </section>

      <section className="pb-32 px-6 md:px-12 max-w-screen-2xl mx-auto w-full">
        {projects.length === 0 ? (
          <div className="py-24 text-brand-taupe font-serif text-2xl">
            Our portfolio is currently being updated. Please check back soon.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-y-32 md:gap-x-12 items-start">
            {projects.map((project) => {
              const variant = project.index_layout_variant || 'editorial_standard';
              
              const isLarge = variant === 'feature_landscape' || variant === 'full_bleed';
              const isOffsetLeft = variant === 'portrait_left';
              const isOffsetRight = variant === 'portrait_right';
              const isStandard = variant === 'editorial_standard' || variant === 'paired';

              if (isLarge) {
                return (
                  <div key={project.id} className="md:col-span-12 group">
                    <Link href={`/projects/${project.slug}`}>
                      <div className="w-full aspect-[16/9] relative mb-6 overflow-hidden">
                        {project.hero_asset && (
                           <Image src={project.hero_asset.url} alt={project.title} fill sizes="(max-width: 1440px) 100vw, 1440px" className="object-cover group-hover:scale-105 transition-transform duration-1000" priority={true} />
                        )}
                      </div>
                      <div className="flex justify-between items-start">
                        <div>
                          <h2 className="text-2xl font-serif text-brand-ink mb-2">{project.title}</h2>
                          <p className="text-brand-muted text-sm tracking-wide">{project.property_type} {project.location_display ? `· ${project.location_display}` : ''}</p>
                        </div>
                        <span className="text-brand-muted text-sm tracking-wide">{project.completion_year}</span>
                      </div>
                    </Link>
                  </div>
                );
              }

              return (
                <div key={project.id} className={`md:col-span-6 group ${isOffsetRight ? 'md:mt-40' : ''} ${isStandard ? 'md:col-span-6' : ''}`}>
                  <Link href={`/projects/${project.slug}`}>
                    <div className="w-full aspect-[4/5] relative mb-6 overflow-hidden">
                      {project.hero_asset && (
                         <Image src={project.hero_asset.url} alt={project.title} fill sizes="(max-width: 768px) 100vw, 50vw" className="object-cover group-hover:scale-105 transition-transform duration-1000" />
                      )}
                    </div>
                    <div className="flex justify-between items-start">
                      <div>
                        <h2 className="text-2xl font-serif text-brand-ink mb-2">{project.title}</h2>
                        <p className="text-brand-muted text-sm tracking-wide">{project.property_type} {project.location_display ? `· ${project.location_display}` : ''}</p>
                      </div>
                    </div>
                  </Link>
                </div>
              );
            })}
          </div>
        )}
      </section>

      <Footer />
    </main>
  );
}

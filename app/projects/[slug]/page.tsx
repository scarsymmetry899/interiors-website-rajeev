import { Navigation } from '@/components/layout/Navigation';
import { Footer } from '@/components/layout/Footer';
import { PortfolioSectionRenderer } from '@/components/portfolio/PortfolioSectionRenderer';
import { getPortfolioEntryBySlug } from '@/services/portfolioService';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Metadata } from 'next';

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const { slug } = await params;
  const project = await getPortfolioEntryBySlug(slug);

  if (!project || project.status !== 'published') {
    return { title: 'Not Found' };
  }

  return {
    title: project.seo_title || `${project.title} | Studio Name`,
    description: project.seo_description || project.short_description || project.subtitle,
    openGraph: {
      title: project.seo_title || project.title,
      description: project.seo_description || project.subtitle,
      images: project.hero_asset ? [{ url: project.hero_asset.url }] : [],
      type: 'article',
    },
    alternates: {
      canonical: `/projects/${slug}`
    }
  };
}

export default async function ProjectDetail({ params }: { params: { slug: string } }) {
  const { slug } = await params;
  const project = await getPortfolioEntryBySlug(slug);

  if (!project || project.status !== 'published') {
    notFound();
  }

  return (
    <main className="flex flex-col min-h-screen bg-brand-bone">
      <Navigation />

      {/* Project Header */}
      <section className="pt-48 pb-12 px-6 md:px-12 max-w-screen-2xl mx-auto w-full text-center">
        <h1 className="text-5xl md:text-7xl font-serif text-brand-ink mb-6">{project.title}</h1>
        <div className="flex items-center justify-center space-x-2 text-brand-charcoal text-sm uppercase tracking-widest">
          {project.location_display && <span>{project.location_display}</span>}
          {project.location_display && project.property_type && <span>·</span>}
          {project.property_type && <span>{project.property_type}</span>}
          {project.property_type && project.area_display && <span>·</span>}
          {project.area_display && <span>{project.area_display}</span>}
          {project.area_display && project.completion_year && <span>·</span>}
          {project.completion_year && <span>{project.completion_year}</span>}
        </div>
      </section>

      {/* Hero Asset */}
      {project.hero_asset && (
        <section className="w-full aspect-video relative max-w-[1920px] mx-auto overflow-hidden">
          <Image 
            src={project.hero_asset.url} 
            alt={project.title} 
            fill 
            className="object-cover" 
            priority 
          />
        </section>
      )}

      {/* Project Metadata / Credits */}
      {project.credits && (
        <section className="py-24 px-6 md:px-12 max-w-screen-2xl mx-auto w-full">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 border-t border-b border-brand-stone py-12">
            {Object.entries(project.credits).map(([role, name]) => (
              <div key={role}>
                <h4 className="uppercase tracking-widest text-[10px] text-brand-charcoal mb-2">{role}</h4>
                <p className="font-serif text-brand-ink text-lg">{name}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Dynamic Sections */}
      <article className="w-full">
        {project.sections?.map(section => (
          <PortfolioSectionRenderer key={section.id} section={section} />
        ))}
      </article>

      {/* Consultation CTA */}
      <section className="py-32 px-6 text-center border-t border-brand-stone max-w-screen-md mx-auto">
        <h2 className="text-3xl font-serif text-brand-ink mb-8">Planning a space of your own?</h2>
        <Link href="/consultation" className="text-sm tracking-widest uppercase border-b border-brand-charcoal pb-1 hover:text-brand-taupe transition-colors">
          Start a conversation →
        </Link>
      </section>

      {/* Next Project */}
      {project.next_project && (
        <section className="w-full h-[70vh] relative group cursor-pointer overflow-hidden block">
          <Link href={`/projects/${project.next_project.slug}`} className="block w-full h-full relative">
            {project.next_project.hero_asset && (
              <Image 
                src={project.next_project.hero_asset.url} 
                alt={project.next_project.title} 
                fill 
                className="object-cover transition-transform duration-1000 group-hover:scale-105"
              />
            )}
            <div className="absolute inset-0 bg-brand-ink/40 group-hover:bg-brand-ink/20 transition-colors duration-700" />
            <div className="absolute inset-0 flex flex-col items-center justify-center text-brand-bone text-center px-6">
              <span className="uppercase tracking-widest text-xs mb-6 opacity-80">Next Project</span>
              <h2 className="text-5xl md:text-7xl font-serif mb-4">{project.next_project.title}</h2>
              <span className="tracking-wide text-sm">{project.next_project.location}</span>
            </div>
          </Link>
        </section>
      )}

      <Footer />
    </main>
  );
}

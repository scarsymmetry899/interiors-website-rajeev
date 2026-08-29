import Image from 'next/image';
import { PortfolioSection } from '@/types/portfolio';
import { BeforeAfterSlider } from './BeforeAfterSlider';

// Section Types
const IntroSection = ({ section }: { section: PortfolioSection }) => {
  if (!section.body) return null; // Safe fallback server-side
  return (
    <section className="py-24 md:py-32 max-w-screen-md mx-auto px-6 text-center">
      <h2 className="uppercase tracking-widest text-xs text-brand-charcoal mb-8">{section.title}</h2>
      <p className="text-2xl md:text-3xl font-serif text-brand-ink leading-relaxed">
        {section.body}
      </p>
    </section>
  );
};

const FullBleedImageSection = ({ section }: { section: PortfolioSection }) => {
  const asset = section.assets?.[0];
  if (!asset || !asset.url) return null;
  return (
    <section className="w-full h-screen relative my-24">
      <Image src={asset.url} alt={asset.alt_text || 'Project Image'} fill sizes="100vw" className="object-cover" />
    </section>
  );
};

const RoomSection = ({ section }: { section: PortfolioSection }) => {
  const primaryAsset = section.assets?.[0];
  const secondaryAsset = section.assets?.[1];

  if (!primaryAsset || !primaryAsset.url) return null;

  return (
    <section className="py-24 px-6 md:px-12 max-w-screen-2xl mx-auto w-full">
      <div className="flex flex-col md:flex-row gap-12 lg:gap-24">
        <div className="md:w-1/3">
          <h2 className="text-4xl md:text-5xl font-serif text-brand-ink mb-8">{section.title}</h2>
          <p className="text-brand-muted font-light leading-relaxed mb-12">
            {section.body}
          </p>
          {secondaryAsset && secondaryAsset.url && (
            <div className="aspect-[3/4] relative hidden md:block overflow-hidden">
              <Image src={secondaryAsset.url} alt={secondaryAsset.alt_text || 'Detail'} fill sizes="33vw" className="object-cover" />
            </div>
          )}
        </div>
        <div className="md:w-2/3 aspect-[4/5] md:aspect-[3/4] relative overflow-hidden">
          <Image src={primaryAsset.url} alt={primaryAsset.alt_text || 'Room'} fill sizes="(max-width: 768px) 100vw, 66vw" className="object-cover" />
        </div>
      </div>
    </section>
  );
};

const BeforeAfterSection = ({ section }: { section: PortfolioSection }) => {
  const before = section.assets?.[0];
  const after = section.assets?.[1];
  
  if (!before || !before.url || !after || !after.url) return null;

  const isSlider = section.configuration?.mode === 'slider';

  return (
    <section className="py-24 px-6 md:px-12 max-w-screen-2xl mx-auto w-full">
      {section.title && <h2 className="text-center text-3xl font-serif mb-12">{section.title}</h2>}
      
      {isSlider ? (
        <BeforeAfterSlider 
          beforeUrl={before.url} 
          beforeAlt={before.alt_text || 'Before'} 
          afterUrl={after.url} 
          afterAlt={after.alt_text || 'After'} 
          title={section.title} 
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h3 className="uppercase tracking-widest text-xs mb-4">Existing</h3>
            <div className="aspect-[4/3] relative grayscale"><Image src={before.url} alt={before.alt_text || 'Before'} fill sizes="(max-width: 768px) 100vw, 50vw" className="object-cover" /></div>
          </div>
          <div>
            <h3 className="uppercase tracking-widest text-xs mb-4">Built</h3>
            <div className="aspect-[4/3] relative"><Image src={after.url} alt={after.alt_text || 'After'} fill sizes="(max-width: 768px) 100vw, 50vw" className="object-cover" /></div>
          </div>
        </div>
      )}
    </section>
  );
};

const MaterialsSection = ({ section }: { section: PortfolioSection }) => {
  const assets = section.assets || [];
  return (
    <section className="py-24 md:py-32 px-6 md:px-12 bg-brand-stone/20">
      <div className="max-w-screen-2xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-serif mb-12 md:mb-16">{section.title}</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
          {assets.map((asset, i) => (
            <div key={asset.id} className={`group ${i === 0 ? 'col-span-2 row-span-2' : 'col-span-1'}`}>
              <div className={`w-full relative overflow-hidden ${i === 0 ? 'aspect-square' : 'aspect-square'}`}>
                 <Image src={asset.url} alt={asset.alt_text || 'Material'} fill sizes={i === 0 ? "(max-width: 768px) 100vw, 50vw" : "(max-width: 768px) 50vw, 25vw"} className="object-cover group-hover:scale-105 transition-transform duration-700" />
              </div>
              <p className="mt-4 text-xs md:text-sm tracking-wide text-brand-ink">{asset.alt_text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

const RenderVsBuiltSection = ({ section }: { section: PortfolioSection }) => {
  const render = section.assets?.[0];
  const built = section.assets?.[1];
  if (!render || !built) return null;

  return (
    <section className="py-24 px-6 md:px-12 max-w-screen-2xl mx-auto w-full">
      <h2 className="text-2xl md:text-3xl font-serif text-center mb-12 md:mb-16">{section.title}</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        <div>
          <div className="aspect-[4/5] relative mb-6"><Image src={render.url} alt="Render" fill sizes="(max-width: 768px) 100vw, 50vw" className="object-cover" /></div>
          <h3 className="uppercase tracking-widest text-xs text-brand-charcoal text-center">Visualization</h3>
        </div>
        <div className="md:mt-24">
          <div className="aspect-[4/5] relative mb-6"><Image src={built.url} alt="Built" fill sizes="(max-width: 768px) 100vw, 50vw" className="object-cover" /></div>
          <h3 className="uppercase tracking-widest text-xs text-brand-charcoal text-center">Completed Space</h3>
        </div>
      </div>
    </section>
  );
};

const FloorPlanSection = ({ section }: { section: PortfolioSection }) => {
  const plan = section.assets?.[0];
  if (!plan) return null;
  return (
    <section className="py-24 md:py-32 px-6 md:px-12 bg-brand-bone max-w-screen-2xl mx-auto">
      <h2 className="text-2xl md:text-3xl font-serif text-center mb-12 md:mb-16">{section.title}</h2>
      <div className="w-full aspect-square md:aspect-[16/9] relative mix-blend-multiply opacity-80">
        <Image src={plan.url} alt="Floor Plan" fill sizes="100vw" className="object-contain" />
      </div>
    </section>
  );
};

const QuoteSection = ({ section }: { section: PortfolioSection }) => (
  <section className="py-24 md:py-40 bg-brand-ink text-brand-bone text-center px-6 md:px-12">
    <div className="max-w-screen-md mx-auto">
      <p className="text-2xl md:text-4xl lg:text-5xl font-serif leading-relaxed mb-8 md:mb-12">"{section.body}"</p>
      <p className="uppercase tracking-widest text-xs md:text-sm text-brand-bone/70">{section.configuration?.author}</p>
    </div>
  </section>
);


// Master Renderer
export function PortfolioSectionRenderer({ section }: { section: PortfolioSection }) {
  try {
    switch (section.section_type) {
      case 'intro': return <IntroSection section={section} />;
      case 'full_bleed_image': return <FullBleedImageSection section={section} />;
      case 'room': return <RoomSection section={section} />;
      case 'before_after': return <BeforeAfterSection section={section} />;
      case 'materials': return <MaterialsSection section={section} />;
      case 'render_vs_built': return <RenderVsBuiltSection section={section} />;
      case 'floor_plan': return <FloorPlanSection section={section} />;
      case 'quote': return <QuoteSection section={section} />;
      default:
        // Production fallback: fail gracefully without crashing
        return null;
    }
  } catch (error) {
    console.error(`Error rendering portfolio section ${section.id}:`, error);
    return null;
  }
}

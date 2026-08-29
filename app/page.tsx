'use client';

import { Navigation } from '@/components/layout/Navigation';
import { Footer } from '@/components/layout/Footer';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';

export default function Home() {
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"]
  });
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);
  const opacity = useTransform(scrollYProgress, [0, 1], [1, 0]);

  return (
    <main className="flex flex-col min-h-screen bg-brand-bone">
      <Navigation />

      {/* 01 - Hero */}
      <section ref={heroRef} className="relative h-[100svh] w-full overflow-hidden bg-brand-ink">
        <motion.div 
          style={{ y, opacity }}
          className="absolute inset-0 z-0"
        >
          <Image 
            src="/images/hero.jpg" 
            alt="Interior Studio Hero" 
            fill 
            className="object-cover opacity-80"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-brand-ink/80 via-transparent to-brand-ink/20" />
        </motion.div>

        <div className="relative z-10 h-full flex flex-col justify-end pb-24 px-6 md:px-12 max-w-screen-2xl mx-auto">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.2 }}
            className="text-brand-bone text-5xl md:text-7xl lg:text-8xl font-serif leading-[1.1] max-w-4xl drop-shadow-sm"
          >
            Refined environments for intentional living.
          </motion.h1>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.6 }}
            className="mt-12"
          >
            <Link href="#selected-works" className="text-brand-bone/90 uppercase tracking-widest text-xs border-b border-brand-bone/30 pb-2 hover:border-brand-bone transition-colors">
              Explore Portfolio
            </Link>
          </motion.div>
        </div>
      </section>

      {/* 02 - Selected Works */}
      <section id="selected-works" className="py-32 px-6 md:px-12 max-w-screen-2xl mx-auto w-full">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-20">
          <h2 className="text-4xl md:text-5xl font-serif text-brand-ink">Selected Works</h2>
          <Link href="/projects" className="hidden md:block uppercase tracking-widest text-xs text-brand-charcoal hover:text-brand-ink border-b border-brand-charcoal/30 pb-1">
            View All Projects
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-y-24 md:gap-x-8 lg:gap-x-12">
          
          {/* Project Feature Large */}
          <div className="md:col-span-12 group cursor-pointer">
            <div className="w-full aspect-[16/9] bg-brand-stone mb-6 overflow-hidden relative">
              <Image 
                src="/images/project1.jpg" 
                alt="The Glass Pavilion" 
                fill 
                className="object-cover group-hover:scale-105 transition-transform duration-1000 ease-out"
              />
            </div>
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-2xl font-serif text-brand-ink mb-2">The Glass Pavilion</h3>
                <p className="text-brand-muted text-sm tracking-wide">Residential · Mumbai</p>
              </div>
              <span className="text-brand-muted text-sm tracking-wide">2025</span>
            </div>
          </div>

          {/* Paired Portrait Images */}
          <div className="md:col-span-6 group cursor-pointer mt-12 md:mt-0">
            <div className="w-full aspect-[3/4] bg-brand-stone mb-6 overflow-hidden relative">
               <Image 
                src="/images/project2.jpg" 
                alt="Heritage Restoration" 
                fill 
                className="object-cover group-hover:scale-105 transition-transform duration-1000 ease-out"
              />
            </div>
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-2xl font-serif text-brand-ink mb-2">Heritage Restoration</h3>
                <p className="text-brand-muted text-sm tracking-wide">Renovation · Goa</p>
              </div>
            </div>
          </div>

          <div className="md:col-span-6 group cursor-pointer md:mt-32">
            <div className="w-full aspect-[4/5] bg-brand-stone mb-6 overflow-hidden relative">
              <Image 
                src="/images/project3.jpg" 
                alt="Modernist Villa" 
                fill 
                className="object-cover group-hover:scale-105 transition-transform duration-1000 ease-out"
              />
            </div>
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-2xl font-serif text-brand-ink mb-2">Modernist Villa</h3>
                <p className="text-brand-muted text-sm tracking-wide">Residential · Alibaug</p>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* 03 - Studio Point of View */}
      <section className="py-40 bg-brand-stone/30">
        <div className="max-w-screen-lg mx-auto px-6 md:px-12 text-center">
          <h2 className="text-3xl md:text-5xl font-serif text-brand-ink leading-relaxed md:leading-[1.4]">
            "We believe space is not merely filled, but curated. Every material, shadow, and texture must justify its existence to create an atmosphere of quiet luxury."
          </h2>
          <p className="mt-12 uppercase tracking-widest text-xs text-brand-charcoal font-semibold">Our Philosophy</p>
        </div>
      </section>

      {/* 04 - Project Transformation (Before/After Stub) */}
      <section className="py-32 px-6 md:px-12 max-w-screen-2xl mx-auto w-full">
         <h2 className="text-4xl md:text-5xl font-serif text-brand-ink mb-16 text-center">The Transformation</h2>
         <div className="w-full aspect-video bg-brand-stone relative overflow-hidden group cursor-ew-resize">
            {/* Visual mock of a slider component */}
            <Image 
              src="/images/project1.jpg" 
              alt="After" 
              fill 
              className="object-cover"
            />
            <div className="absolute inset-y-0 left-0 w-1/2 overflow-hidden border-r-2 border-brand-bone">
              <Image 
                src="/images/project2.jpg" 
                alt="Before" 
                fill 
                className="object-cover max-w-none w-[200vw] md:w-[100vw]"
              />
            </div>
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-brand-bone shadow-xl flex items-center justify-center pointer-events-none">
              <span className="text-brand-ink text-xs font-bold tracking-widest">⟨ ⟩</span>
            </div>
         </div>
      </section>

      {/* 05 - Inside the Design Process */}
      <section className="py-32 px-6 md:px-12 max-w-screen-2xl mx-auto w-full border-t border-brand-stone">
        <div className="flex flex-col lg:flex-row gap-16 lg:gap-24">
          <div className="lg:w-1/3">
            <h2 className="text-4xl md:text-5xl font-serif text-brand-ink mb-8">Methodology</h2>
            <p className="text-brand-muted font-light leading-relaxed">
              A disciplined, iterative process that transforms conceptual thinking into highly resolved built environments.
            </p>
          </div>
          <div className="lg:w-2/3 grid grid-cols-1 md:grid-cols-2 gap-y-16 gap-x-12">
            {[
              { title: 'Concept', img: '/images/hero.jpg' }, 
              { title: 'Material', img: '/images/project3.jpg' }, 
              { title: 'Visualization', img: '/images/project1.jpg' }, 
              { title: 'Built Space', img: '/images/project2.jpg' }
            ].map((step, i) => (
              <div key={step.title} className="group border-t border-brand-stone pt-6">
                <div className="text-brand-taupe font-serif text-2xl mb-6">0{i+1}</div>
                <div className="w-full aspect-[4/3] bg-brand-stone mb-6 relative overflow-hidden">
                   <Image 
                    src={step.img} 
                    alt={step.title} 
                    fill 
                    className="object-cover grayscale-0 md:grayscale md:group-hover:grayscale-0 transition-all duration-700"
                  />
                </div>
                <h3 className="text-xl font-serif text-brand-ink">{step.title}</h3>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 06 - Selected Services */}
      <section className="py-40 bg-brand-ink text-brand-bone px-6 md:px-12">
        <div className="max-w-screen-2xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-20">
          <div>
            <h2 className="text-4xl md:text-5xl font-serif mb-12 text-brand-bone/90">Expertise</h2>
            <p className="text-brand-bone/60 max-w-md font-light leading-relaxed text-lg">
              We offer comprehensive interior architecture and styling services tailored to bespoke residential and boutique commercial projects.
            </p>
          </div>
          <div className="flex flex-col justify-center">
            <ul className="space-y-12 text-2xl md:text-3xl lg:text-4xl font-serif text-brand-bone/80">
              <li className="border-b border-brand-bone/10 pb-6 hover:pl-6 hover:text-brand-bone transition-all cursor-pointer group flex justify-between items-center">
                <span>Residential Interiors</span>
                <span className="opacity-0 group-hover:opacity-100 transition-opacity font-sans text-sm tracking-widest uppercase">Explore ↗</span>
              </li>
              <li className="border-b border-brand-bone/10 pb-6 hover:pl-6 hover:text-brand-bone transition-all cursor-pointer group flex justify-between items-center">
                <span>Turnkey Execution</span>
                <span className="opacity-0 group-hover:opacity-100 transition-opacity font-sans text-sm tracking-widest uppercase">Explore ↗</span>
              </li>
              <li className="border-b border-brand-bone/10 pb-6 hover:pl-6 hover:text-brand-bone transition-all cursor-pointer group flex justify-between items-center">
                <span>Space Planning</span>
                <span className="opacity-0 group-hover:opacity-100 transition-opacity font-sans text-sm tracking-widest uppercase">Explore ↗</span>
              </li>
              <li className="border-b border-brand-bone/10 pb-6 hover:pl-6 hover:text-brand-bone transition-all cursor-pointer group flex justify-between items-center">
                <span>Interior Styling</span>
                <span className="opacity-0 group-hover:opacity-100 transition-opacity font-sans text-sm tracking-widest uppercase">Explore ↗</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* 10 - Consultation CTA */}
      <section className="py-48 px-6 md:px-12 text-center flex flex-col items-center">
        <h2 className="text-5xl md:text-7xl font-serif text-brand-ink mb-12 max-w-3xl leading-[1.1]">
          Bring your vision to life.
        </h2>
        <Link 
          href="/consultation" 
          className="bg-brand-ink text-brand-bone px-12 py-5 uppercase tracking-widest text-xs font-semibold hover:bg-brand-charcoal transition-colors hover:scale-105 transform duration-300"
        >
          Book a Consultation
        </Link>
      </section>

      <Footer />
    </main>
  );
}

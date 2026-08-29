'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, useScroll, useMotionValueEvent } from 'framer-motion';

export function Navigation() {
  const { scrollY } = useScroll();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useMotionValueEvent(scrollY, "change", (latest) => {
    setIsScrolled(latest > 50);
  });

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        isMobileMenuOpen 
          ? 'h-screen bg-brand-bone text-brand-ink' 
          : isScrolled 
            ? 'bg-brand-bone/90 backdrop-blur-md border-b border-brand-stone/50' 
            : 'bg-transparent text-brand-bone'
      }`}
    >
      <div className="max-w-screen-2xl mx-auto px-6 md:px-12 h-24 flex items-center justify-between">
        <Link href="/" className="z-50" onClick={() => setIsMobileMenuOpen(false)}>
          <span className={`text-2xl font-serif tracking-wide transition-colors duration-500 ${isScrolled || isMobileMenuOpen ? 'text-brand-ink' : 'text-brand-bone'}`}>
            STUDIO NAME
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className={`hidden lg:flex items-center space-x-10 text-sm tracking-widest uppercase transition-colors duration-500 ${isScrolled ? 'text-brand-charcoal' : 'text-brand-bone/90'}`}>
          <Link href="/projects" className="hover:text-brand-ink transition-colors">Projects</Link>
          <Link href="/services" className="hover:text-brand-ink transition-colors">Services</Link>
          <Link href="/studio" className="hover:text-brand-ink transition-colors">Studio</Link>
          <Link href="/process" className="hover:text-brand-ink transition-colors">Process</Link>
          <Link href="/journal" className="hover:text-brand-ink transition-colors">Journal</Link>
          <Link href="/contact" className="hover:text-brand-ink transition-colors">Contact</Link>
          
          <Link 
            href="/consultation" 
            className={`px-5 py-2.5 border transition-all duration-300 ${
              isScrolled 
                ? 'border-brand-charcoal text-brand-ink hover:bg-brand-charcoal hover:text-brand-bone' 
                : 'border-brand-bone/50 text-brand-bone hover:bg-brand-bone hover:text-brand-ink'
            }`}
          >
            Consultation
          </Link>
        </nav>

        {/* Mobile Toggle */}
        <button 
          className={`lg:hidden z-50 text-sm tracking-widest uppercase transition-colors duration-500 ${isScrolled || isMobileMenuOpen ? 'text-brand-ink' : 'text-brand-bone'}`}
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? 'Close' : 'Menu'}
        </button>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute top-24 bottom-0 left-0 right-0 bg-brand-bone z-40 flex flex-col justify-center px-6 pb-24"
        >
          <nav className="flex flex-col space-y-8 text-4xl font-serif text-brand-ink">
            <Link href="/projects" onClick={() => setIsMobileMenuOpen(false)}>Projects</Link>
            <Link href="/services" onClick={() => setIsMobileMenuOpen(false)}>Services</Link>
            <Link href="/studio" onClick={() => setIsMobileMenuOpen(false)}>Studio</Link>
            <Link href="/process" onClick={() => setIsMobileMenuOpen(false)}>Process</Link>
            <Link href="/journal" onClick={() => setIsMobileMenuOpen(false)}>Journal</Link>
            <Link href="/contact" onClick={() => setIsMobileMenuOpen(false)}>Contact</Link>
            <Link href="/consultation" onClick={() => setIsMobileMenuOpen(false)} className="text-xl tracking-widest uppercase font-sans mt-8 border-b border-brand-ink w-fit pb-2">
              Book Consultation
            </Link>
          </nav>
        </motion.div>
      )}
    </motion.header>
  );
}

import Link from 'next/link';

export function Footer() {
  return (
    <footer className="bg-brand-ink text-brand-bone/70 pt-24 pb-12 px-6 md:px-12">
      <div className="max-w-screen-2xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12 md:gap-8 mb-24">
        
        <div className="md:col-span-2">
          <h2 className="text-4xl md:text-5xl font-serif text-brand-bone mb-6">Ready to transform your space?</h2>
          <Link 
            href="/consultation" 
            className="inline-block border-b border-brand-bone/30 pb-2 text-brand-bone uppercase tracking-widest text-sm hover:border-brand-bone transition-colors"
          >
            Start a Conversation
          </Link>
        </div>

        <div>
          <h3 className="uppercase tracking-widest text-xs font-bold text-brand-bone mb-6">Explore</h3>
          <ul className="space-y-4 text-sm">
            <li><Link href="/projects" className="hover:text-brand-bone transition-colors">Projects</Link></li>
            <li><Link href="/services" className="hover:text-brand-bone transition-colors">Services</Link></li>
            <li><Link href="/studio" className="hover:text-brand-bone transition-colors">Studio</Link></li>
            <li><Link href="/process" className="hover:text-brand-bone transition-colors">Process</Link></li>
            <li><Link href="/journal" className="hover:text-brand-bone transition-colors">Journal</Link></li>
          </ul>
        </div>

        <div>
          <h3 className="uppercase tracking-widest text-xs font-bold text-brand-bone mb-6">Connect</h3>
          <ul className="space-y-4 text-sm">
            <li><a href="mailto:hello@studio.com" className="hover:text-brand-bone transition-colors">hello@studio.com</a></li>
            <li><a href="tel:+919876543210" className="hover:text-brand-bone transition-colors">+91 98765 43210</a></li>
            <li className="pt-4"><a href="#" className="hover:text-brand-bone transition-colors">Instagram</a></li>
            <li><a href="#" className="hover:text-brand-bone transition-colors">Pinterest</a></li>
            <li><a href="#" className="hover:text-brand-bone transition-colors">LinkedIn</a></li>
          </ul>
        </div>

      </div>

      <div className="max-w-screen-2xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center text-xs tracking-wider border-t border-brand-bone/10 pt-8">
        <p>&copy; {new Date().getFullYear()} Studio Name. All rights reserved.</p>
        <div className="flex space-x-6 mt-4 md:mt-0">
          <Link href="/privacy" className="hover:text-brand-bone transition-colors">Privacy Policy</Link>
          <Link href="/terms" className="hover:text-brand-bone transition-colors">Terms of Service</Link>
        </div>
      </div>
    </footer>
  );
}

export default function Home() {
  return (
    <main className="flex flex-col min-h-screen">
      <header className="py-6 px-8 flex justify-between items-center border-b border-gray-200">
        <div className="text-xl font-serif">Studio Operating System</div>
        <nav className="space-x-6 text-sm tracking-wide">
          <a href="#" className="hover:text-brand-muted transition-colors">Projects</a>
          <a href="#" className="hover:text-brand-muted transition-colors">Services</a>
          <a href="#" className="hover:text-brand-muted transition-colors">Studio</a>
          <a href="#" className="hover:text-brand-muted transition-colors">Contact</a>
        </nav>
      </header>
      
      <section className="flex-1 flex flex-col justify-center items-center text-center px-4 py-24">
        <h1 className="text-6xl md:text-8xl mb-6">Phase 1 Foundation</h1>
        <p className="text-lg md:text-xl text-brand-muted max-w-2xl font-light">
          Premium interior design portfolio website successfully initialized with Instrument Serif and Geist typography.
        </p>
      </section>
    </main>
  );
}

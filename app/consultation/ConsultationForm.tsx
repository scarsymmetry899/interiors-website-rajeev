'use client';

import { useState } from 'react';
import { submitConsultationAction } from './actions';
import { motion, AnimatePresence } from 'framer-motion';

export function ConsultationForm() {
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const nextStep = () => setStep((s) => Math.min(s + 1, 4));
  const prevStep = () => setStep((s) => Math.max(s - 1, 1));

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    
    const formData = new FormData(e.currentTarget);
    const result = await submitConsultationAction(null, formData);
    
    if (result.success) {
      setIsSuccess(true);
    } else {
      setError(result.error || 'An unexpected error occurred.');
    }
    setIsSubmitting(false);
  }

  if (isSuccess) {
    return (
      <div className="py-24 text-center border-t border-brand-stone max-w-2xl mx-auto">
        <h2 className="text-4xl md:text-5xl font-serif text-brand-ink mb-8">Thank you.</h2>
        <p className="text-lg text-brand-muted leading-relaxed mb-16">
          We've received your project details. Our studio will review your brief and contact you using the details provided.
        </p>
        <div className="flex flex-col md:flex-row items-center justify-center gap-8">
          <a href="/projects" className="bg-brand-ink text-brand-bone px-8 py-3 uppercase tracking-widest text-xs font-semibold hover:bg-brand-charcoal transition-colors">
            Explore Projects
          </a>
          <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="uppercase tracking-widest text-xs text-brand-charcoal hover:text-brand-ink transition-colors border-b border-brand-charcoal pb-1">
            Instagram
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      <div className="flex space-x-2 mb-12">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className={`h-0.5 flex-1 transition-colors duration-500 ${step >= i ? 'bg-brand-ink' : 'bg-brand-stone'}`} />
        ))}
      </div>

      <form onSubmit={handleSubmit} className="min-h-[400px]">
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8">
              <h3 className="text-2xl font-serif text-brand-ink">01. Contact Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <Input label="First Name" name="first_name" required />
                <Input label="Last Name" name="last_name" required />
                <Input label="Email Address" name="email" type="email" required />
                <Input label="Phone Number" name="phone" type="tel" />
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8">
              <h3 className="text-2xl font-serif text-brand-ink">02. Property Information</h3>
              <div className="grid grid-cols-1 gap-8">
                <Input label="Project Location (City, Country)" name="project_location" />
                <Select label="Property Type" name="property_type" options={['Apartment', 'Villa / Independent House', 'Commercial / Office', 'Hospitality', 'Other']} />
                <Input label="Approximate Area (sq ft / sq m)" name="property_area" />
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8">
              <h3 className="text-2xl font-serif text-brand-ink">03. Project Scope</h3>
              <div className="grid grid-cols-1 gap-8">
                <Select label="Service Interest" name="service_interest" options={['Comprehensive Interior Architecture', 'Turnkey Execution', 'Interior Styling', 'Renovation', 'Not Sure']} />
                <Select label="Project Stage" name="project_stage" options={['Just Exploring', 'Site Acquired', 'Under Construction', 'Ready for Interiors']} />
                <Select label="Estimated Budget Range" name="budget_range" options={['Under $100k', '$100k - $250k', '$250k - $500k', '$500k+']} />
              </div>
            </motion.div>
          )}

          {step === 4 && (
            <motion.div key="step4" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8">
              <h3 className="text-2xl font-serif text-brand-ink">04. The Vision</h3>
              <div className="grid grid-cols-1 gap-8">
                <div className="flex flex-col">
                  <label className="text-xs tracking-widest uppercase text-brand-charcoal mb-4">Tell us about your project</label>
                  <textarea 
                    name="message" 
                    rows={6}
                    className="bg-transparent border-b border-brand-stone py-2 text-brand-ink focus:outline-none focus:border-brand-ink transition-colors resize-none placeholder:text-brand-stone"
                    placeholder="Briefly describe what you're looking to achieve..."
                  />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {error && <p className="text-red-500 text-sm mt-8">{error}</p>}

        <div className="flex justify-between items-center mt-16 pt-8 border-t border-brand-stone">
          {step > 1 ? (
            <button type="button" onClick={prevStep} className="uppercase tracking-widest text-xs text-brand-charcoal hover:text-brand-ink transition-colors">
              ← Back
            </button>
          ) : <div />}
          
          {step < 4 ? (
            <button type="button" onClick={nextStep} className="bg-brand-ink text-brand-bone px-8 py-3 uppercase tracking-widest text-xs font-semibold hover:bg-brand-charcoal transition-colors">
              Next Step
            </button>
          ) : (
            <button type="submit" disabled={isSubmitting} className="bg-brand-ink text-brand-bone px-8 py-3 uppercase tracking-widest text-xs font-semibold hover:bg-brand-charcoal transition-colors disabled:opacity-50">
              {isSubmitting ? 'Submitting...' : 'Submit Inquiry'}
            </button>
          )}
        </div>
      </form>
    </div>
  );
}

// Form Field Components
const Input = ({ label, name, type = 'text', required = false }: any) => (
  <div className="flex flex-col">
    <label className="text-xs tracking-widest uppercase text-brand-charcoal mb-4">{label} {required && '*'}</label>
    <input 
      type={type} 
      name={name} 
      required={required}
      className="bg-transparent border-b border-brand-stone py-2 text-brand-ink focus:outline-none focus:border-brand-ink transition-colors rounded-none"
    />
  </div>
);

const Select = ({ label, name, options }: any) => (
  <div className="flex flex-col">
    <label className="text-xs tracking-widest uppercase text-brand-charcoal mb-4">{label}</label>
    <select 
      name={name}
      className="bg-transparent border-b border-brand-stone py-2 text-brand-ink focus:outline-none focus:border-brand-ink transition-colors rounded-none appearance-none"
    >
      <option value="">Select an option...</option>
      {options.map((opt: string) => <option key={opt} value={opt}>{opt}</option>)}
    </select>
  </div>
);

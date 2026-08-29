'use client';

import { useState } from 'react';
import Image from 'next/image';

export function BeforeAfterSlider({ beforeUrl, beforeAlt, afterUrl, afterAlt, title }: any) {
  const [sliderPosition, setSliderPosition] = useState(50);
  
  return (
    <div 
      className="w-full aspect-[4/3] md:aspect-video bg-brand-stone relative overflow-hidden group"
      style={{ '--position': `${sliderPosition}%` } as React.CSSProperties}
    >
      {/* After Image (Background) */}
      <Image src={afterUrl} alt={afterAlt} fill sizes="100vw" className="object-cover" />
      
      {/* Before Image (Clipped overlay) */}
      <div 
        className="absolute inset-y-0 left-0 overflow-hidden"
        style={{ width: 'var(--position)' }}
      >
        <Image src={beforeUrl} alt={beforeAlt} fill sizes="100vw" className="object-cover max-w-none w-[100vw]" style={{ objectPosition: 'left center' }} />
        <div className="absolute inset-y-0 right-0 w-0.5 bg-brand-bone shadow-[0_0_10px_rgba(0,0,0,0.3)]"></div>
      </div>
      
      {/* Thumb */}
      <div 
        className="absolute top-1/2 -translate-y-1/2 w-10 h-10 md:w-12 md:h-12 rounded-full bg-brand-bone shadow-xl flex items-center justify-center pointer-events-none transform -translate-x-1/2 z-10"
        style={{ left: 'var(--position)' }}
      >
        <span className="text-brand-ink text-[10px] md:text-xs font-bold tracking-widest">⟨ ⟩</span>
      </div>

      {/* Accessible Range Input */}
      <input 
        type="range"
        min="0"
        max="100"
        value={sliderPosition}
        onChange={(e) => setSliderPosition(Number(e.target.value))}
        className="absolute inset-0 w-full h-full opacity-0 cursor-ew-resize z-20 focus:outline-none focus:ring-4 focus:ring-brand-taupe focus:ring-inset"
        aria-label={`Compare before and after: ${title || 'Project transformation'}`}
      />
    </div>
  );
}

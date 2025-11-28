import React, { useEffect, useRef, useState } from 'react';
import { LyricLine } from '../types';

interface LyricsViewProps {
  lyrics: LyricLine[];
  isPlaying: boolean;
  isLoading: boolean;
  currentTime: number; // Controlled by parent
}

export const LyricsView: React.FC<LyricsViewProps> = ({ lyrics, isPlaying, isLoading, currentTime }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  // Sync active index with real time
  useEffect(() => {
    if (lyrics.length === 0) return;
    
    // Improved estimation for FULL lyrics: 
    // Average pop song line is ~3-4 seconds. 
    // This is a rough heuristic since we don't have time-synced LRC data from Gemini.
    // For a better experience, we could allow users to tap to advance, but time-based estimation is automatic.
    const averageLineDuration = 4.5; 
    const estimatedLineIndex = Math.floor(currentTime / averageLineDuration);
    
    // Don't scroll past the end
    const safeIndex = Math.min(estimatedLineIndex, lyrics.length - 1);
    
    if (safeIndex !== activeIndex) {
        setActiveIndex(safeIndex);
    }
  }, [currentTime, lyrics.length]);

  // Scroll active line into view smoothly
  useEffect(() => {
    if (containerRef.current && lyrics.length > 0) {
        const activeEl = containerRef.current.children[activeIndex] as HTMLElement;
        if (activeEl) {
            activeEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }
  }, [activeIndex, lyrics]);

  if (isLoading) {
    return (
        <div className="h-full flex flex-col items-center justify-center p-8 text-neutral-500 animate-pulse bg-black">
            <p className="font-serif-ttpd text-2xl italic mb-4 text-neutral-400">"Consulting the manuscript..."</p>
            <div className="w-12 h-12 border-2 border-neutral-800 border-t-white rounded-full animate-spin"></div>
        </div>
    );
  }

  if (lyrics.length === 0) {
    return (
        <div className="h-full flex flex-col items-center justify-center p-8 text-neutral-600 bg-black">
             <div className="w-16 h-16 mb-4 text-neutral-800">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                    <path d="M9 9l6 6m0-6l-6 6" />
                    <circle cx="12" cy="12" r="10" />
                </svg>
             </div>
            <p className="font-serif-ttpd text-xl italic">Select a track to decipher.</p>
        </div>
    );
  }

  return (
    <div className="relative h-full overflow-hidden bg-black group">
      {/* Background Gradient Effect - Static for TTPD vibes but could be animated */}
      <div className="absolute inset-0 bg-gradient-to-br from-neutral-900 via-black to-neutral-900 opacity-50 pointer-events-none"></div>
      
      {/* Lyrics Container */}
      <div 
        ref={containerRef}
        className="relative z-10 h-full overflow-y-auto px-8 md:px-12 py-[50vh] space-y-12 no-scrollbar scroll-smooth"
      >
        {lyrics.map((line, index) => {
          const isActive = index === activeIndex;
          const distance = Math.abs(index - activeIndex);
          // Apple Music style blur logic
          const blurAmount = isActive ? 0 : Math.min(distance * 1, 4); 
          const opacity = isActive ? 1 : Math.max(0.3, 1 - distance * 0.2);
          const scale = isActive ? 1.05 : 1;

          return (
            <div 
              key={index}
              onClick={() => setActiveIndex(index)} // Allow manual jumping
              style={{ 
                  filter: `blur(${blurAmount}px)`,
                  opacity: opacity,
                  transform: `scale(${scale})`
              }}
              className="transition-all duration-700 ease-out cursor-pointer origin-left will-change-transform"
            >
              <p className="text-3xl md:text-5xl font-bold leading-snug mb-4 font-sans-ttpd tracking-tight text-white drop-shadow-xl">
                {line.original}
              </p>
              
              {/* Translation appears fully when active */}
              <div className={`
                overflow-hidden transition-all duration-700 ease-in-out
                ${isActive ? 'max-h-60 opacity-100 translate-y-0' : 'max-h-0 opacity-0 translate-y-4'}
              `}>
                <p className="text-xl md:text-3xl text-[#d4c5a3] font-serif-ttpd italic leading-relaxed">
                  {line.translation}
                </p>
                {line.annotation && (
                  <div className="mt-4 flex items-start gap-3">
                     <span className="shrink-0 bg-neutral-800 text-neutral-400 text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider">Note</span>
                     <p className="text-sm text-neutral-400 font-sans-ttpd leading-relaxed">
                        {line.annotation}
                     </p>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
      
      {/* Gradient masks for smooth fade in/out at top/bottom */}
      <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-black to-transparent z-20 pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-black to-transparent z-20 pointer-events-none"></div>
    </div>
  );
};
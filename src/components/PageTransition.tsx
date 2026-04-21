import React from 'react';
import Loader from './Loader';

interface PageTransitionProps {
  children: React.ReactNode;
  isTransitioning: boolean;
  isLoading: boolean;
}

export default function PageTransition({ children, isTransitioning, isLoading }: PageTransitionProps) {
  return (
    <div
      className={`relative w-full transition-all duration-300 ease-premium ${
        isTransitioning 
          ? 'opacity-0 translate-y-3 scale-[0.99] pointer-events-none' 
          : 'opacity-100 translate-y-0 scale-100'
      }`}
    >
      <div 
        className={`transition-opacity duration-200 ease-out ${
          isLoading ? 'opacity-0' : 'opacity-100'
        }`}
      >
        {children}
      </div>
      {isLoading && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-background/80 backdrop-blur-[2px]">
          <div className="flex flex-col items-center gap-4">
            <Loader size="md" />
            <p className="text-xs uppercase tracking-widest text-textLight animate-pulse-subtle">
              Loading
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

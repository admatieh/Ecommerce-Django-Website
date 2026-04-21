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
      className={`relative w-full transition-all duration-300 ease-out ${
        isTransitioning ? 'opacity-0 translate-y-2 pointer-events-none' : 'opacity-100 translate-y-0'
      }`}
    >
      <div className={`transition-opacity duration-200 ${isLoading ? 'opacity-0' : 'opacity-100'}`}>
        {children}
      </div>
      {isLoading && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-background/70 backdrop-blur-[2px]">
          <Loader size="md" />
        </div>
      )}
    </div>
  );
}
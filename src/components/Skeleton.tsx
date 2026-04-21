import { HTMLAttributes } from 'react';

interface SkeletonProps extends HTMLAttributes<HTMLDivElement> {
  className?: string;
}

export function Skeleton({ className = '', ...props }: SkeletonProps) {
  return (
    <div
      className={`animate-pulse bg-black/[0.04] rounded-lg ${className}`}
      {...props}
    />
  );
}

export function ProductCardSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="bg-black/[0.04] rounded-2xl aspect-[3/4] mb-4" />
      <div className="flex justify-between items-baseline px-1 gap-2">
        <div className="h-4 bg-black/[0.04] rounded-full w-2/3" />
        <div className="h-4 bg-black/[0.04] rounded-full w-16" />
      </div>
    </div>
  );
}

export function ProductGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
      {Array.from({ length: count }).map((_, idx) => (
        <ProductCardSkeleton key={idx} />
      ))}
    </div>
  );
}

export function CategoryCardSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="bg-black/[0.04] rounded-2xl sm:rounded-3xl aspect-[4/5]" />
    </div>
  );
}

export function HeroSkeleton() {
  return (
    <section className="relative min-h-screen pt-24 pb-12 lg:pt-32 px-6 overflow-hidden flex flex-col justify-center animate-pulse">
      <div className="max-w-7xl mx-auto w-full relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        <div className="order-2 lg:order-1 flex justify-center mt-12 lg:mt-0">
          <div className="relative w-full max-w-md">
            <div className="bg-black/[0.04] rounded-3xl aspect-[4/5]" />
          </div>
        </div>
        <div className="order-1 lg:order-2 flex flex-col items-center lg:items-start text-center lg:text-left pt-12 lg:pt-0">
          <div className="h-16 lg:h-24 bg-black/[0.04] rounded-lg w-full max-w-md mb-6" />
          <div className="space-y-2 w-full max-w-md mb-8">
            <div className="h-4 bg-black/[0.04] rounded-full w-full" />
            <div className="h-4 bg-black/[0.04] rounded-full w-3/4" />
          </div>
          <div className="h-14 bg-black/[0.04] rounded-full w-48" />
        </div>
      </div>
    </section>
  );
}

export function BannerSkeleton() {
  return (
    <section className="bg-background py-24 px-6 animate-pulse">
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center bg-white rounded-3xl lg:rounded-[3rem] overflow-hidden">
        <div className="w-full lg:w-1/2 h-[400px] sm:h-[500px] lg:h-[700px] bg-black/[0.04]" />
        <div className="w-full lg:w-1/2 p-8 sm:p-12 lg:p-16 xl:p-24">
          <div className="h-12 bg-black/[0.04] rounded-lg w-3/4 mb-6" />
          <div className="space-y-2 mb-8">
            <div className="h-4 bg-black/[0.04] rounded-full w-full" />
            <div className="h-4 bg-black/[0.04] rounded-full w-5/6" />
          </div>
          <div className="h-14 bg-black/[0.04] rounded-full w-48" />
        </div>
      </div>
    </section>
  );
}

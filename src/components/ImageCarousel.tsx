import { useState, useEffect, useRef, useCallback } from 'react';
import type { TouchEvent } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

type Props = {
  images: string[];
};

export default function ImageCarousel({ images }: Props) {
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isHovered, setIsHovered] = useState<boolean>(false);
  const [loadedIndexes, setLoadedIndexes] = useState<Set<number>>(new Set([0]));
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isMountedRef = useRef(true);

  const minSwipeDistance = 50;

  const resetTimeout = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  const nextSlide = useCallback(() => {
    setCurrentIndex(prev => (prev === images.length - 1 ? 0 : prev + 1));
  }, [images.length]);

  const prevSlide = useCallback(() => {
    setCurrentIndex(prev => (prev === 0 ? images.length - 1 : prev - 1));
  }, [images.length]);

  const handleImageLoad = useCallback((index: number) => {
    setLoadedIndexes(prev => {
      const next = new Set(prev);
      next.add(index);
      return next;
    });
  }, []);

  // Track mount state
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // Auto-play with proper cleanup
  useEffect(() => {
    resetTimeout();
    if (!isHovered && images.length > 1 && isMountedRef.current) {
      timeoutRef.current = setTimeout(() => {
        if (isMountedRef.current) {
          nextSlide();
        }
      }, 4000);
    }
    return resetTimeout;
  }, [currentIndex, isHovered, images.length, nextSlide, resetTimeout]);

  // Reset index when images change
  useEffect(() => {
    setCurrentIndex(0);
  }, [images]);

  const onTouchStart = (e: TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    if (distance > minSwipeDistance) nextSlide();
    if (distance < -minSwipeDistance) prevSlide();
  };

  if (!images || images.length === 0) return null;

  return (
    <div
      className="relative w-full h-full overflow-hidden bg-gray-100 group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
      role="region"
      aria-label="Image gallery"
      aria-roledescription="carousel"
    >
      <div
        className="flex transition-transform duration-500 ease-out h-full w-full"
        style={{ transform: `translateX(-${currentIndex * 100}%)` }}
      >
        {images.map((img, idx) => (
          <div key={img} className="relative w-full h-full shrink-0 bg-gray-100" aria-hidden={currentIndex !== idx}>
            <img
              src={img}
              alt={`Product image ${idx + 1} of ${images.length}`}
              onLoad={() => handleImageLoad(idx)}
              loading={idx === 0 ? 'eager' : 'lazy'}
              className={`w-full h-full object-cover transition-all duration-700 ease-out group-hover:scale-[1.03] ${
                loadedIndexes.has(idx) ? 'opacity-100' : 'opacity-0'
              }`}
            />
            {!loadedIndexes.has(idx) && (
              <div className="absolute inset-0 animate-pulse bg-black/[0.03]" />
            )}
          </div>
        ))}
      </div>

      {/* Hover Overlay */}
      <div className="absolute inset-0 bg-black/[0.03] opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

      {images.length > 1 && (
        <>
          {/* Controls - Desktop */}
          <button
            onClick={(e) => { e.stopPropagation(); prevSlide(); }}
            className="absolute left-3 top-1/2 -translate-y-1/2 p-2 bg-white/80 backdrop-blur-md rounded-full text-textMain hover:bg-white transition-all duration-300 opacity-0 group-hover:opacity-100 active:scale-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40 shadow-sm"
            aria-label="Previous image"
          >
            <ChevronLeft size={20} strokeWidth={1.5} />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); nextSlide(); }}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-white/80 backdrop-blur-md rounded-full text-textMain hover:bg-white transition-all duration-300 opacity-0 group-hover:opacity-100 active:scale-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40 shadow-sm"
            aria-label="Next image"
          >
            <ChevronRight size={20} strokeWidth={1.5} />
          </button>

          {/* Dots Indicator */}
          <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5" role="tablist">
            {images.map((_, idx) => (
              <button
                key={idx}
                onClick={(e) => { e.stopPropagation(); setCurrentIndex(idx); }}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  currentIndex === idx ? 'bg-white w-5 shadow-sm' : 'bg-white/50 w-1.5 hover:bg-white/70'
                }`}
                role="tab"
                aria-selected={currentIndex === idx}
                aria-label={`Go to image ${idx + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
'use client';

import * as React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface ImageSliderProps extends React.HTMLAttributes<HTMLDivElement> {
  images: string[];
  interval?: number;
}

const ImageSlider = React.forwardRef<HTMLDivElement, ImageSliderProps>(
  ({ images, interval = 5000, className, ...props }, ref) => {
    const [currentIndex, setCurrentIndex] = React.useState(0);

    // Effect to handle the interval-based image transition
    React.useEffect(() => {
      if (images.length <= 1) return;

      const timer = setInterval(() => {
        setCurrentIndex(prevIndex =>
          prevIndex === images.length - 1 ? 0 : prevIndex + 1
        );
      }, interval);

      // Cleanup the interval on component unmount
      return () => clearInterval(timer);
    }, [images, interval]);

    if (!images || images.length === 0) {
      return (
        <div
          ref={ref}
          className={cn(
            'relative w-full h-full bg-muted flex items-center justify-center',
            className
          )}
          {...props}
        >
          <span className="text-muted-foreground text-sm">
            No images providing
          </span>
        </div>
      );
    }

    return (
      <div
        ref={ref}
        className={cn(
          'relative w-full h-full overflow-hidden bg-background',
          className
        )}
        {...props}
      >
        <AnimatePresence initial={false} mode="wait">
          <motion.img
            key={currentIndex}
            src={images[currentIndex]}
            alt={`Slide ${currentIndex + 1}`}
            initial={{ opacity: 0, scale: 1.1 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 1.2, ease: 'easeInOut' }}
            className="absolute top-0 left-0 w-full h-full object-cover"
          />
        </AnimatePresence>

        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/60 pointer-events-none" />

        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-3 z-10">
          {images.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={cn(
                'w-2.5 h-2.5 rounded-full transition-all duration-300',
                currentIndex === index
                  ? 'bg-white w-8'
                  : 'bg-white/40 hover:bg-white/60'
              )}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </div>
    );
  }
);

ImageSlider.displayName = 'ImageSlider';

export { ImageSlider };

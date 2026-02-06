'use client';

import { IconArrowLeft, IconArrowRight } from '@tabler/icons-react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { useTranslations } from 'next-intl';

type Testimonial = {
  quote: string;
  name: string;
  designation: string;
  src: string;
};

const testimonialImages = [
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=500&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=500&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=500&auto=format&fit=crop',
];

export function TestimonialsSection({
  autoplay = true,
  className,
}: {
  autoplay?: boolean;
  className?: string;
}) {
  const [active, setActive] = useState(0);
  const t = useTranslations('landing.testimonials');

  const testimonialsCount = 3;

  const handleNext = () => {
    setActive(prev => (prev + 1) % testimonialsCount);
  };

  const handlePrev = () => {
    setActive(
      prev => (prev - 1 + testimonialsCount) % testimonialsCount
    );
  };

  const isActive = (index: number) => {
    return index === active;
  };

  useEffect(() => {
    if (autoplay) {
      const interval = setInterval(handleNext, 8000);
      return () => clearInterval(interval);
    }
  }, [autoplay, active]);

  const [rotations, setRotations] = useState<number[]>([]);

  useEffect(() => {
    setRotations(Array(testimonialsCount).fill(0).map(() => Math.floor(Math.random() * 21) - 10));
  }, []);

  return (
    <section className="py-32 bg-background overflow-hidden relative">
      <div className="container mx-auto px-4 md:px-6 relative z-10">
        <div className="text-center mb-20 md:mb-32">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-5xl md:text-7xl font-bold font-display text-white mb-6 tracking-tighter">
              {t('title')} <span className="text-primary">{t('titleHighlight')}</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed italic">
              {t('subtitle')}
            </p>
          </motion.div>
        </div>

        <div
          className={cn('max-w-7xl mx-auto px-4 md:px-8 lg:px-12', className)}
        >
          <div className="relative grid grid-cols-1 md:grid-cols-2 gap-16 lg:gap-24 items-center">
            {/* Image Stack */}
            <div className="flex items-center justify-center">
              <div className="relative h-[300px] w-[300px] md:h-[450px] md:w-[450px]">
                <AnimatePresence mode="popLayout">
                  {testimonialImages.map((src, index) => (
                    <motion.div
                      key={src}
                      initial={{
                        opacity: 0,
                        scale: 0.9,
                        z: -100,
                        rotate: rotations[index] || 0,
                      }}
                      animate={{
                        opacity: isActive(index) ? 1 : 0,
                        scale: isActive(index) ? 1 : 0.95,
                        z: isActive(index) ? 0 : -100,
                        rotate: isActive(index) ? 0 : rotations[index] || 0,
                        zIndex: isActive(index)
                          ? 999
                          : testimonialsCount + 2 - index,
                        y: isActive(index) ? [0, -40, 0] : 0,
                      }}
                      exit={{
                        opacity: 0,
                        scale: 0.9,
                        z: 100,
                        rotate: rotations[index] || 0,
                      }}
                      transition={{
                        duration: 0.4,
                        ease: 'easeInOut',
                      }}
                      className="absolute inset-0 origin-bottom"
                    >
                      <Image
                        src={src}
                        alt={`Testimonial ${index + 1}`}
                        width={600}
                        height={600}
                        draggable={false}
                        className="h-full w-full rounded-[2.5rem] object-cover object-center shadow-2xl border border-white/10"
                      />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>

            {/* Testimonial Content */}
            <div className="flex flex-col justify-center h-full text-left">
              <div className="relative overflow-hidden min-h-[300px]">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={active}
                    initial={{
                      y: 20,
                      opacity: 0,
                    }}
                    animate={{
                      y: 0,
                      opacity: 1,
                    }}
                    exit={{
                      y: -20,
                      opacity: 0,
                    }}
                    transition={{
                      duration: 0.4,
                      ease: 'easeInOut',
                    }}
                    className="flex flex-col"
                  >
                    <h3 className="text-3xl md:text-5xl font-bold text-white mb-2 font-display">
                      {t(`items.item${active + 1}.name`)}
                    </h3>
                    <p className="text-xl text-muted-foreground font-medium mb-12">
                      {t(`items.item${active + 1}.designation`)}
                    </p>

                    <motion.p className="text-xl md:text-2xl text-white/80 leading-relaxed font-sans font-medium">
                      {t(`items.item${active + 1}.quote`)
                        .split(' ')
                        .map((word, index) => (
                          <motion.span
                            key={index}
                            initial={{
                              filter: 'blur(10px)',
                              opacity: 0,
                              y: 5,
                            }}
                            animate={{
                              filter: 'blur(0px)',
                              opacity: 1,
                              y: 0,
                            }}
                            transition={{
                              duration: 0.3,
                              ease: 'easeInOut',
                              delay: 0.01 * index,
                            }}
                            className="inline-block"
                          >
                            {word}&nbsp;
                          </motion.span>
                        ))}
                    </motion.p>
                  </motion.div>
                </AnimatePresence>
              </div>

              <div className="flex gap-4 pt-12">
                <button
                  onClick={handlePrev}
                  className="h-14 w-14 rounded-full bg-white/5 border border-white/10 flex items-center justify-center group/button hover:bg-white/10 transition-all duration-300 backdrop-blur-md"
                >
                  <IconArrowLeft className="h-7 w-7 text-white group-hover/button:-translate-x-1 transition-transform" />
                </button>
                <button
                  onClick={handleNext}
                  className="h-14 w-14 rounded-full bg-white/5 border border-white/10 flex items-center justify-center group/button hover:bg-white/10 transition-all duration-300 backdrop-blur-md"
                >
                  <IconArrowRight className="h-7 w-7 text-white group-hover/button:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Decorative Shaders */}
      <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-primary/10 rounded-full blur-[120px] pointer-events-none -z-0" />
      <div className="absolute -top-24 -right-24 w-96 h-96 bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none -z-0" />
    </section>
  );
}

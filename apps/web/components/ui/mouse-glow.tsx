'use client';

import { useEffect, useState } from 'react';
import { motion, useSpring, useMotionValue } from 'framer-motion';

export function MouseGlow() {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springConfig = { damping: 25, stiffness: 150 };
  const springX = useSpring(mouseX, springConfig);
  const springY = useSpring(mouseY, springConfig);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [mouseX, mouseY]);

  return (
    <div className="fixed inset-0 z-[1] pointer-events-none overflow-hidden">
      <motion.div
        className="absolute w-[800px] h-[800px] rounded-full opacity-20"
        style={{
          x: springX,
          y: springY,
          translateX: '-50%',
          translateY: '-50%',
          background:
            'radial-gradient(circle, hsl(var(--zen-teal)) 0%, transparent 70%)',
          filter: 'blur(100px)',
        }}
      />
      <motion.div
        className="absolute w-[600px] h-[600px] rounded-full opacity-10"
        style={{
          x: springX,
          y: springY,
          translateX: '-50%',
          translateY: '-50%',
          background:
            'radial-gradient(circle, hsl(var(--zen-violet)) 0%, transparent 70%)',
          filter: 'blur(80px)',
          transitionDelay: '0.1s',
        }}
      />
    </div>
  );
}

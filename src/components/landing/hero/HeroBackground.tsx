'use client';

import { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Sphere, MeshDistortMaterial, Float } from '@react-three/drei';

function AnimatedSphere({ position, color, speed = 1, scale = 1 }: any) {
  const meshRef = useRef<any>(null);

  useFrame(state => {
    if (meshRef.current) {
      meshRef.current.rotation.x = state.clock.getElapsedTime() * 0.2 * speed;
      meshRef.current.rotation.y = state.clock.getElapsedTime() * 0.3 * speed;
    }
  });

  return (
    <Float speed={2 * speed} rotationIntensity={0.5} floatIntensity={0.5}>
      <Sphere
        ref={meshRef}
        args={[1, 64, 64]}
        position={position}
        scale={scale}
      >
        <MeshDistortMaterial
          color={color}
          attach="material"
          distort={0.4}
          speed={1.5 * speed}
          roughness={0.2}
          metalness={0.1}
        />
      </Sphere>
    </Float>
  );
}

export function HeroBackground() {
  return (
    <div className="absolute inset-0 -z-10 bg-gradient-to-b from-teal-50/50 to-white dark:from-navy-900 dark:to-background overflow-hidden">
      <div className="absolute top-0 right-0 w-1/2 h-full opacity-60 dark:opacity-20 pointer-events-none">
        <Canvas camera={{ position: [0, 0, 5] }}>
          <ambientLight intensity={0.5} />
          <directionalLight position={[10, 10, 5]} intensity={1} />

          <AnimatedSphere
            position={[2, 1, 0]}
            color="#2A9D8F"
            scale={1.5}
            speed={0.8}
          />

          <AnimatedSphere
            position={[1, -2, -1]}
            color="#5BA3A0"
            scale={1}
            speed={1.2}
          />

          <AnimatedSphere
            position={[3, -1, -2]}
            color="#1B4965"
            scale={0.8}
            speed={1}
          />
        </Canvas>
      </div>

      {/* Decorative gradient blobs */}
      <div className="absolute -top-20 -left-20 w-96 h-96 bg-teal-400/20 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-0 w-[30rem] h-[30rem] bg-teal-600/10 rounded-full blur-3xl" />
    </div>
  );
}

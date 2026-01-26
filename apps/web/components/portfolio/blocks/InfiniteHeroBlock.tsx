'use client';

import React, { useMemo, useRef, useEffect, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';
import * as THREE from 'three';
import { BaseBlock } from './BaseBlock';
import { cn } from '@/lib/utils';
import type { PortfolioBlock } from '@/lib/services/portfolio';

// ===========================================
// SHADER COMPONENTS
// ===========================================

interface ShaderPlaneProps {
  vertexShader: string;
  fragmentShader: string;
  uniforms: { [key: string]: { value: unknown } };
}

function ShaderPlane({
  vertexShader,
  fragmentShader,
  uniforms,
}: ShaderPlaneProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const { size } = useThree();

  useFrame(state => {
    if (meshRef.current) {
      const material = meshRef.current.material as THREE.ShaderMaterial;
      material.uniforms.u_time.value = state.clock.elapsedTime * 0.5;
      material.uniforms.u_resolution.value.set(size.width, size.height, 1.0);
    }
  });

  return (
    <mesh ref={meshRef}>
      <planeGeometry args={[2, 2]} />
      <shaderMaterial
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        side={THREE.DoubleSide}
        depthTest={false}
        depthWrite={false}
      />
    </mesh>
  );
}

const DEFAULT_VERTEX_SHADER = `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = vec4(position, 1.0);
    }
`;

const DEFAULT_FRAGMENT_SHADER = `
    precision highp float;

    varying vec2 vUv;
    uniform float u_time;
    uniform vec3 u_resolution;

    #define STEP 256
    #define EPS .001

    float smin( float a, float b, float k ) {
        float h = clamp( 0.5+0.5*(b-a)/k, 0.0, 1.0 );
        return mix( b, a, h ) - k*h*(1.0-h);
    }

    const mat2 m = mat2(.8,.6,-.6,.8);

    float noise( in vec2 x ) {
      return sin(1.5*x.x)*sin(1.5*x.y);
    }

    float fbm6( vec2 p ) {
        float f = 0.0;
        f += 0.500000*(0.5+0.5*noise( p )); p = m*p*2.02;
        f += 0.250000*(0.5+0.5*noise( p )); p = m*p*2.03;
        f += 0.125000*(0.5+0.5*noise( p )); p = m*p*2.01;
        f += 0.062500*(0.5+0.5*noise( p )); p = m*p*2.04;
        f += 0.015625*(0.5+0.5*noise( p ));
        return f/0.96875;
    }

    mat2 getRot(float a) {
        float sa = sin(a), ca = cos(a);
        return mat2(ca,-sa,sa,ca);
    }

    vec3 _position;

    float sphere(vec3 center, float radius) {
        return distance(_position,center) - radius;
    }

    float swingPlane(float height) {
        vec3 pos = _position + vec3(0.,0.,u_time * 5.5);
        float def =  fbm6(pos.xz * .25) * 0.5;
        float way = pow(abs(pos.x) * 34. ,2.5) *.0000125;
        def *= way;
        float ch = height + def;
        return max(pos.y - ch,0.);
    }

    float map(vec3 pos) {
        _position = pos;
        float dist;
        dist = swingPlane(0.);
        float sminFactor = 5.25;
        dist = smin(dist,sphere(vec3(0.,-15.,80.),60.),sminFactor);
        return dist;
    }

    void mainImage( out vec4 fragColor, in vec2 fragCoord ) {
      vec2 uv = (fragCoord.xy-.5*u_resolution.xy)/u_resolution.y;
      vec3 rayOrigin = vec3(uv + vec2(0.,6.), -1. );
      vec3 rayDir = normalize(vec3(uv , 1.));
      rayDir.zy = getRot(.15) * rayDir.zy;
      vec3 position = rayOrigin;
      
      float curDist;
      int nbStep = 0;
      for(; nbStep < STEP;++nbStep) {
          curDist = map(position);
          if(curDist < EPS) break;
          position += rayDir * curDist * .5;
      }
      
      float f = float(nbStep) / float(STEP);
      f *= .9;
      fragColor = vec4(vec3(f), 1.0);
    }

    void main() {
      vec4 fragColor;
      vec2 fragCoord = vUv * u_resolution.xy;
      mainImage(fragColor, fragCoord);
      gl_FragColor = fragColor;
    }
`;

function ShaderBackground({ className }: { className?: string }) {
  const shaderUniforms = useMemo(
    () => ({
      u_time: { value: 0 },
      u_resolution: { value: new THREE.Vector3(1, 1, 1) },
    }),
    []
  );

  return (
    <div className={className}>
      <Canvas className={className}>
        <ShaderPlane
          vertexShader={DEFAULT_VERTEX_SHADER}
          fragmentShader={DEFAULT_FRAGMENT_SHADER}
          uniforms={shaderUniforms}
        />
      </Canvas>
    </div>
  );
}

// ===========================================
// MAIN COMPONENT
// ===========================================

export default function InfiniteHeroBlock({
  block,
  isEditing = false,
  onUpdate,
  onDelete,
  onAddAfter,
  onEdit,
}: {
  block: PortfolioBlock;
  isEditing?: boolean;
  onUpdate: (content: any, settings?: any) => void;
  onDelete: () => void;
  onAddAfter?: (type: string) => void;
  onEdit?: (block: any) => void;
}) {
  const content = (block.content || {}) as any;
  const settings = (block.settings || {}) as any;

  const rootRef = useRef<HTMLDivElement>(null);
  const bgRef = useRef<HTMLDivElement>(null);
  const h1Ref = useRef<HTMLHeadingElement>(null);
  const pRef = useRef<HTMLParagraphElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);

  // Manual line splitting for GSAP animation
  const splitIntoLines = (text: string) => {
    if (!text) return [];
    return text.split('\n').filter(line => line.trim() !== '');
  };

  const headlineLines = splitIntoLines(
    content.headline ||
      'The road dissolves in light, the horizon remains unseen.'
  );
  const descriptionLines = splitIntoLines(
    content.subheadline ||
      'Minimal structures fade into a vast horizon where presence and absence merge.'
  );

  useGSAP(
    () => {
      const ctas = ctaRef.current ? Array.from(ctaRef.current.children) : [];
      const h1Lines = h1Ref.current ? Array.from(h1Ref.current.children) : [];
      const pLines = pRef.current ? Array.from(pRef.current.children) : [];

      gsap.set(bgRef.current, { filter: 'blur(28px)' });
      gsap.set(h1Lines, {
        opacity: 0,
        y: 24,
        filter: 'blur(8px)',
      });
      gsap.set(pLines, {
        opacity: 0,
        y: 16,
        filter: 'blur(6px)',
      });
      if (ctas.length) gsap.set(ctas, { opacity: 0, y: 16 });

      const tl = gsap.timeline({ defaults: { ease: 'power2.out' } });
      tl.to(bgRef.current, { filter: 'blur(0px)', duration: 1.2 }, 0)
        .to(
          h1Lines,
          {
            opacity: 1,
            y: 0,
            filter: 'blur(0px)',
            duration: 0.8,
            stagger: 0.1,
          },
          0.3
        )
        .to(
          pLines,
          {
            opacity: 1,
            y: 0,
            filter: 'blur(0px)',
            duration: 0.6,
            stagger: 0.08,
          },
          '-=0.3'
        )
        .to(ctas, { opacity: 1, y: 0, duration: 0.6, stagger: 0.08 }, '-=0.2');
    },
    { scope: rootRef }
  );

  return (
    <BaseBlock
      block={block}
      isEditing={isEditing}
      onUpdate={onUpdate}
      onDelete={onDelete}
      onAddAfter={onAddAfter}
      onEdit={onEdit}
    >
      <div
        ref={rootRef}
        className="relative h-screen w-full overflow-hidden bg-black text-white"
      >
        <div className="absolute inset-0" ref={bgRef}>
          <ShaderBackground className="h-full w-full" />
        </div>

        <div className="pointer-events-none absolute inset-0 [background:radial-gradient(120%_80%_at_50%_50%,_transparent_40%,_black_100%)]" />

        <div className="relative z-10 flex h-full w-full items-center justify-center px-6">
          <div className="text-center">
            <h1
              ref={h1Ref}
              className="mx-auto max-w-2xl lg:max-w-4xl text-[clamp(2.25rem,6vw,4rem)] font-extralight leading-[1.1] tracking-tight"
            >
              {headlineLines.map((line, i) => (
                <span key={i} className="block mb-2">
                  {line}
                </span>
              ))}
            </h1>
            <p
              ref={pRef}
              className="mx-auto mt-6 max-w-2xl text-sm/6 md:text-base/7 font-light tracking-tight text-white/70"
            >
              {descriptionLines.map((line, i) => (
                <span key={i} className="block">
                  {line}
                </span>
              ))}
            </p>

            <div
              ref={ctaRef}
              className="mt-10 flex flex-row items-center justify-center gap-4"
            >
              {content.cta_text && (
                <button
                  type="button"
                  className="group relative overflow-hidden border border-white/30 bg-gradient-to-r from-white/20 to-white/10 px-6 py-3 text-sm rounded-lg font-medium tracking-wide text-white backdrop-blur-sm transition-all duration-500 hover:border-white/50 hover:bg-white/20 hover:shadow-lg hover:shadow-white/10"
                >
                  {content.cta_text}
                </button>
              )}

              {content.cta_secondary_text && (
                <button
                  type="button"
                  className="group relative px-6 py-3 text-sm font-medium tracking-wide text-white/90 transition-all duration-500 hover:drop-shadow-[0_0_6px_rgba(255,255,255,0.6)] hover:text-white"
                >
                  {content.cta_secondary_text}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </BaseBlock>
  );
}

'use client';

import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { BaseBlock } from './BaseBlock';
import { cn } from '@/lib/utils';
import type { PortfolioBlock } from '@/domain/builder/portfolio';

const ChatIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-6 w-6"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
    />
  </svg>
);

export function BrandHeroBlock({
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
  const containerRef = useRef<HTMLDivElement>(null);
  const content = (block.content || {}) as any;
  const navLinks = content.navLinks || [];
  const versionText = content.versionText || '';
  const title = content.title || '';
  const subtitle = content.subtitle || '';
  const ctaText = content.ctaText || 'Click';

  useEffect(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;

    // Cleanup any existing renderer
    while (container.firstChild) {
      container.removeChild(container.firstChild);
    }

    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });

    const updateSize = () => {
      const width = container.clientWidth;
      const height = container.clientHeight;
      renderer.setSize(width, height);
      if (material.uniforms.iResolution) {
        material.uniforms.iResolution.value.set(width, height);
      }
    };

    const material = new THREE.ShaderMaterial({
      uniforms: {
        iTime: { value: 0 },
        iResolution: { value: new THREE.Vector2(0, 0) },
      },
      vertexShader: `
        void main() {
          gl_Position = vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform float iTime;
        uniform vec2 iResolution;

        #define NUM_OCTAVES 3

        float rand(vec2 n) {
          return fract(sin(dot(n, vec2(12.9898, 4.1414))) * 43758.5453);
        }

        float noise(vec2 p) {
          vec2 ip = floor(p);
          vec2 u = fract(p);
          u = u*u*(3.0-2.0*u);

          float res = mix(
            mix(rand(ip), rand(ip + vec2(1.0, 0.0)), u.x),
            mix(rand(ip + vec2(0.0, 1.0)), rand(ip + vec2(1.0, 1.0)), u.x), u.y);
          return res * res;
        }

        float fbm(vec2 x) {
          float v = 0.0;
          float a = 0.3;
          vec2 shift = vec2(100);
          mat2 rot = mat2(cos(0.5), sin(0.5), -sin(0.5), cos(0.5));
          for (int i = 0; i < NUM_OCTAVES; ++i) {
            v += a * noise(x);
            x = rot * x * 2.0 + shift;
            a *= 0.4;
          }
          return v;
        }

        void main() {
          vec2 shake = vec2(sin(iTime * 1.2) * 0.005, cos(iTime * 2.1) * 0.005);
          vec2 p = ((gl_FragCoord.xy + shake * iResolution.xy) - iResolution.xy * 0.5) / iResolution.y * mat2(6.0, -4.0, 4.0, 6.0);
          vec2 v;
          vec4 o = vec4(0.0);

          float f = 2.0 + fbm(p + vec2(iTime * 5.0, 0.0)) * 0.5;

          for (float i = 0.0; i < 35.0; i++) {
            v = p + cos(i * i + (iTime + p.x * 0.08) * 0.025 + i * vec2(13.0, 11.0)) * 3.5 + vec2(sin(iTime * 3.0 + i) * 0.003, cos(iTime * 3.5 - i) * 0.003);
            float tailNoise = fbm(v + vec2(iTime * 0.5, i)) * 0.3 * (1.0 - (i / 35.0));
            vec4 auroraColors = vec4(
              0.1 + 0.3 * sin(i * 0.2 + iTime * 0.4),
              0.3 + 0.5 * cos(i * 0.3 + iTime * 0.5),
              0.7 + 0.3 * sin(i * 0.4 + iTime * 0.3),
              1.0
            );
            vec4 currentContribution = auroraColors * exp(sin(i * i + iTime * 0.8)) / length(max(v, vec2(v.x * f * 0.015, v.y * 1.5)));
            float thinnessFactor = smoothstep(0.0, 1.0, i / 35.0) * 0.6;
            o += currentContribution * (1.0 + tailNoise * 0.8) * thinnessFactor;
          }

          o = tanh(pow(o / 100.0, vec4(1.6)));
          gl_FragColor = o * 1.5;
        }
      `,
    });

    const geometry = new THREE.PlaneGeometry(2, 2);
    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    container.appendChild(renderer.domElement);
    updateSize();

    let frameId: number;
    const animate = () => {
      material.uniforms.iTime.value += 0.016;
      renderer.render(scene, camera);
      frameId = requestAnimationFrame(animate);
    };
    animate();

    const handleResize = () => {
      updateSize();
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener('resize', handleResize);
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      geometry.dispose();
      material.dispose();
      renderer.dispose();
    };
  }, []);

  return (
    <BaseBlock
      block={block}
      isEditing={isEditing}
      onUpdate={onUpdate}
      onDelete={onDelete}
      onAddAfter={onAddAfter}
      onEdit={onEdit}
      className="bg-black text-white"
    >
      <div className="relative h-screen w-full overflow-hidden">
        {/* Aurora Shader Background */}
        <div
          ref={containerRef}
          className="absolute inset-0 z-0 pointer-events-none"
        />

        <header className="absolute inset-x-0 top-0 p-6 md:p-8 z-10">
          <div className="container mx-auto flex justify-between items-center">
            {/* Logo Text Removed */}
            <div className="text-3xl font-bold opacity-0 pointer-events-none">
              BRAND
            </div>

            <nav className="hidden md:flex space-x-8 text-sm">
              {navLinks.map((link: any, idx: number) => (
                <a
                  key={idx}
                  href={link.href}
                  className="hover:text-gray-300 transition-colors uppercase tracking-widest font-medium"
                >
                  {link.label}
                </a>
              ))}
            </nav>

            {/* Search and Join buttons Removed */}
            <div className="w-10 h-10 invisible" />
          </div>
        </header>

        <main className="relative z-10 w-full h-full flex items-center px-6 md:px-8">
          <div className="container mx-auto">
            <div className="w-full md:w-1/2 lg:w-2/5">
              <h1 className="text-5xl md:text-7xl font-bold leading-tight mb-6 animate-slide-up">
                {title}
              </h1>
              <p className="text-lg text-gray-300 max-w-md mb-10 overflow-hidden leading-relaxed animate-slide-up opacity-80">
                {subtitle}
              </p>
              <button className="bg-white text-black font-bold px-10 py-4 rounded-md hover:bg-gray-200 transition-all hover:scale-105 active:scale-95 shadow-2xl">
                {ctaText}
              </button>
            </div>
          </div>
        </main>

        <footer className="absolute inset-x-0 bottom-0 p-6 md:p-8 z-10">
          <div className="container mx-auto flex justify-between items-center">
            <div className="text-sm opacity-40 font-mono italic">
              {versionText}
            </div>
            <button
              type="button"
              aria-label="Chat"
              className="bg-white/5 backdrop-blur-md border border-white/10 rounded-full h-14 w-14 flex items-center justify-center hover:bg-white/20 transition-all hover:scale-110 active:scale-90"
            >
              <ChatIcon />
            </button>
          </div>
        </footer>
      </div>
    </BaseBlock>
  );
}

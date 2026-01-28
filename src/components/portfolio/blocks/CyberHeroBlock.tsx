'use client';

import React, { useMemo, useRef, useState, useEffect } from 'react';
import { Canvas, extend, useFrame, useThree } from '@react-three/fiber';
import { useAspect, useTexture } from '@react-three/drei';
import * as THREE from 'three/webgpu';
import { bloom } from 'three/examples/jsm/tsl/display/BloomNode.js';
import { Mesh } from 'three';
import { BaseBlock } from './BaseBlock';
import { cn } from '@/lib/utils';
import type { PortfolioBlock } from '@/domain/builder/portfolio';

import {
  abs,
  blendScreen,
  float,
  mod,
  mx_cell_noise_float,
  oneMinus,
  smoothstep,
  texture,
  uniform,
  uv,
  vec2,
  vec3,
  pass,
  mix,
  add,
} from 'three/tsl';

extend(THREE as any);

// Post Processing component
const PostProcessing = ({
  strength = 1,
  threshold = 1,
  fullScreenEffect = true,
}: {
  strength?: number;
  threshold?: number;
  fullScreenEffect?: boolean;
}) => {
  const { gl, scene, camera } = useThree();
  const progressRef = useRef({ value: 0 });

  const render = useMemo(() => {
    const postProcessing = new THREE.PostProcessing(gl as any);
    const scenePass = pass(scene, camera);
    const scenePassColor = scenePass.getTextureNode('output');
    const bloomPass = bloom(scenePassColor, strength, 0.5, threshold);

    // Create the scanning effect uniform
    const uScanProgress = uniform(0);
    progressRef.current = uScanProgress;

    // Create a red overlay that follows the scan line
    const scanPos = float(uScanProgress.value);
    const uvY = uv().y;
    const scanWidth = float(0.05);
    const scanLine = smoothstep(0, scanWidth, abs(uvY.sub(scanPos)));
    const redOverlay = vec3(1, 0, 0).mul(oneMinus(scanLine)).mul(0.4);

    // Mix the original scene with the red overlay
    const withScanEffect = mix(
      scenePassColor,
      add(scenePassColor, redOverlay),
      fullScreenEffect ? smoothstep(0.9, 1.0, oneMinus(scanLine)) : 1.0
    );

    // Add bloom effect after scan effect
    const final = withScanEffect.add(bloomPass);

    postProcessing.outputNode = final;

    return postProcessing;
  }, [camera, gl, scene, strength, threshold, fullScreenEffect]);

  useFrame(({ clock }) => {
    // Animate the scan line from top to bottom
    progressRef.current.value =
      Math.sin(clock.getElapsedTime() * 0.5) * 0.5 + 0.5;
    render.renderAsync();
  }, 1);

  return null;
};

const WIDTH = 300;
const HEIGHT = 300;

const Scene = ({
  imageUrl,
  depthUrl,
}: {
  imageUrl: string;
  depthUrl: string;
}) => {
  const [rawMap, depthMap] = useTexture([imageUrl, depthUrl]);

  const meshRef = useRef<Mesh>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (rawMap && depthMap) {
      setVisible(true);
    }
  }, [rawMap, depthMap]);

  const { material, uniforms } = useMemo(() => {
    const uPointer = uniform(new THREE.Vector2(0));
    const uProgress = uniform(0);

    const strength = 0.01;

    const tDepthMap = texture(depthMap);

    const tMap = texture(
      rawMap,
      uv().add(tDepthMap.r.mul(uPointer).mul(strength))
    );

    const aspect = float(WIDTH).div(HEIGHT);
    const tUv = vec2(uv().x.mul(aspect), uv().y);

    const tiling = vec2(120.0);
    const tiledUv = mod(tUv.mul(tiling), 2.0).sub(1.0);

    const brightness = mx_cell_noise_float(tUv.mul(tiling).div(2));

    const dist = float(tiledUv.length());
    const dot = float(smoothstep(0.5, 0.49, dist)).mul(brightness);

    const depth = tDepthMap;

    const flow = oneMinus(smoothstep(0, 0.02, abs(depth.sub(uProgress))));

    const mask = dot.mul(flow).mul(vec3(10, 0, 0));

    const final = blendScreen(tMap, mask);

    const material = new THREE.MeshBasicNodeMaterial({
      colorNode: final,
      transparent: true,
      opacity: 0,
    });

    return {
      material,
      uniforms: {
        uPointer,
        uProgress,
      },
    };
  }, [rawMap, depthMap]);

  const [w, h] = useAspect(WIDTH, HEIGHT);

  useFrame(({ clock }) => {
    uniforms.uProgress.value =
      Math.sin(clock.getElapsedTime() * 0.5) * 0.5 + 0.5;
    if (
      meshRef.current &&
      'material' in meshRef.current &&
      meshRef.current.material
    ) {
      const mat = meshRef.current.material as any;
      if ('opacity' in mat) {
        mat.opacity = THREE.MathUtils.lerp(mat.opacity, visible ? 1 : 0, 0.07);
      }
    }
  });

  useFrame(({ pointer }) => {
    uniforms.uPointer.value = pointer;
  });

  const scaleFactor = 0.4;
  return (
    <mesh
      ref={meshRef}
      scale={[w * scaleFactor, h * scaleFactor, 1]}
      material={material}
    >
      <planeGeometry />
    </mesh>
  );
};

export function CyberHeroBlock({
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

  const titleWords = (content.headline || 'Build Your Dreams').split(' ');
  const subtitle =
    content.subheadline || 'AI-powered creativity for the next generation.';

  const [visibleWords, setVisibleWords] = useState(0);
  const [subtitleVisible, setSubtitleVisible] = useState(false);
  const [delays, setDelays] = useState<number[]>([]);
  const [subtitleDelay, setSubtitleDelay] = useState(0);

  useEffect(() => {
    setDelays(titleWords.map(() => Math.random() * 0.07));
    setSubtitleDelay(Math.random() * 0.1);
  }, [titleWords.length]);

  useEffect(() => {
    if (visibleWords < titleWords.length) {
      const timeout = setTimeout(() => setVisibleWords(visibleWords + 1), 600);
      return () => clearTimeout(timeout);
    } else {
      const timeout = setTimeout(() => setSubtitleVisible(true), 800);
      return () => clearTimeout(timeout);
    }
  }, [visibleWords, titleWords.length]);

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
        {/* CSS for animations */}
        <style jsx global>{`
          @keyframes fadeIn {
            from {
              opacity: 0;
              transform: translateY(10px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
          .fade-in {
            animation: fadeIn 0.8s ease-out forwards;
          }
          .fade-in-subtitle {
            animation: fadeIn 1s ease-out 0.2s forwards;
          }
          .explore-btn {
            background: rgba(255, 255, 255, 0.02);
            backdrop-filter: blur(12px);
            border: 1px solid rgba(255, 255, 255, 0.5);
            color: white;
            padding: 14px 32px;
            border-radius: 999px;
            font-size: 15px;
            font-weight: 700;
            display: flex;
            align-items: center;
            gap: 12px;
            opacity: 0;
            animation: fadeIn 1.2s ease-out 1.5s forwards;
            cursor: pointer;
            transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
          }
          .explore-btn:hover {
            background: rgba(255, 255, 255, 0.1);
            border-color: rgba(255, 255, 255, 0.8);
            transform: translateY(-2px);
          }
          .explore-arrow {
            display: flex;
            align-items: center;
            justify-content: center;
            transition: transform 0.3s ease;
          }
          .explore-btn:hover .explore-arrow {
            transform: translateY(3px);
          }
          .arrow-svg {
            width: 18px;
            height: 18px;
          }
        `}</style>

        <div className="absolute inset-0 z-10 pointer-events-none flex items-center justify-center px-10 flex-col text-center">
          <div className="text-6xl md:text-[8vw] lg:text-[12vw] font-[900] uppercase tracking-[-0.04em] leading-[0.9] mb-6">
            <div className="flex flex-wrap justify-center gap-x-4 md:gap-x-12 overflow-hidden text-white">
              {titleWords.map((word: string, index: number) => (
                <div
                  key={index}
                  className={index < visibleWords ? 'fade-in' : ''}
                  style={{
                    animationDelay: `${index * 0.13 + (delays[index] || 0)}s`,
                    opacity: index < visibleWords ? 1 : 0,
                    filter: index < visibleWords ? 'none' : 'blur(20px)',
                  }}
                >
                  {word}
                </div>
              ))}
            </div>
          </div>
          <div className="text-[11px] md:text-sm lg:text-lg tracking-[0.4em] uppercase overflow-hidden text-zinc-100 font-bold opacity-100 mt-2">
            <div
              className={subtitleVisible ? 'fade-in-subtitle' : ''}
              style={{
                animationDelay: `${titleWords.length * 0.13 + 0.2 + subtitleDelay}s`,
                opacity: subtitleVisible ? 1 : 0,
              }}
            >
              {subtitle}
            </div>
          </div>
        </div>

        <div className="absolute bottom-[60px] left-0 right-0 flex justify-center z-[70]">
          <button className="explore-btn">
            {content.cta_text || 'Scroll to explore'}
            <span className="explore-arrow ml-1">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="arrow-svg"
              >
                <path d="M7 13l5 5 5-5M12 6v12" />
              </svg>
            </span>
          </button>
        </div>

        <div className="absolute inset-0 z-0">
          <Canvas
            flat
            gl={canvas => {
              const renderer = new THREE.WebGPURenderer({
                canvas,
                antialias: true,
              });
              renderer.init();
              return renderer;
            }}
          >
            <PostProcessing fullScreenEffect={true} />
            <Scene
              imageUrl={
                content.image_url || 'https://i.postimg.cc/XYwvXN8D/img-4.png'
              }
              depthUrl={
                content.depth_url || 'https://i.postimg.cc/2SHKQh2q/raw-4.webp'
              }
            />
          </Canvas>
        </div>
      </div>
    </BaseBlock>
  );
}

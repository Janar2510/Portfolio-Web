'use client';

import React, { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

interface NeuralBackgroundProps {
    className?: string;
    /**
     * Color of the particles. 
     * Defaults to a cyan/indigo mix if not specified.
     */
    color?: string;
    /**
     * The opacity of the trails (0.0 to 1.0).
     * Lower = longer trails. Higher = shorter trails.
     * Default: 0.1
     */
    trailOpacity?: number;
    /**
     * Number of particles. Default: 800
     */
    particleCount?: number;
    /**
     * Speed multiplier. Default: 1
     */
    speed?: number;
}

export default function NeuralBackground({
    className,
    color = "#68A9A5", // Seafoam from creatives section
    trailOpacity = 0.08, // Longer trails
    particleCount = 1000, // More particles
    speed = 1.5, // Faster
}: NeuralBackgroundProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        const container = containerRef.current;
        if (!canvas || !container) return;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        // --- CONFIGURATION ---
        let width = 0;
        let height = 0;
        let particles: Particle[] = [];
        let animationFrameId: number;
        let mouse = { x: -1000, y: -1000 };

        // --- PARTICLE CLASS ---
        class Particle {
            x: number;
            y: number;
            vx: number;
            vy: number;
            age: number;
            life: number;

            constructor() {
                this.x = Math.random() * width;
                this.y = Math.random() * height;
                this.vx = 0;
                this.vy = 0;
                // Randomize age so they don't all start invisible (alpha=0)
                this.life = Math.random() * 200 + 100;
                this.age = Math.random() * this.life;
            }

            update() {
                // Flow field logic
                const angle = (Math.cos(this.x * 0.005) + Math.sin(this.y * 0.005)) * Math.PI;

                this.vx += Math.cos(angle) * 0.2 * speed;
                this.vy += Math.sin(angle) * 0.2 * speed;

                // Mouse interaction
                const dx = mouse.x - this.x;
                const dy = mouse.y - this.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                const interactionRadius = 150;

                if (distance < interactionRadius) {
                    const force = (interactionRadius - distance) / interactionRadius;
                    this.vx -= dx * force * 0.05;
                    this.vy -= dy * force * 0.05;
                }

                this.x += this.vx;
                this.y += this.vy;
                this.vx *= 0.95;
                this.vy *= 0.95;

                this.age++;
                if (this.age > this.life) {
                    this.reset();
                }

                // Screen wrap
                if (this.x < 0) this.x = width;
                if (this.x > width) this.x = 0;
                if (this.y < 0) this.y = height;
                if (this.y > height) this.y = 0;
            }

            reset() {
                this.x = Math.random() * width;
                this.y = Math.random() * height;
                this.vx = 0;
                this.vy = 0;
                this.age = 0;
                this.life = Math.random() * 200 + 100;
            }

            draw(context: CanvasRenderingContext2D) {
                const alpha = 1 - Math.abs((this.age / this.life) - 0.5) * 2;
                context.globalAlpha = alpha;
                context.fillStyle = color;
                context.fillRect(this.x, this.y, 2, 2); // Increased to 2px for visibility
            }
        }

        // --- INITIALIZATION ---
        const init = () => {
            const newWidth = container.clientWidth;
            const newHeight = container.clientHeight;

            if (newWidth === width && newHeight === height && particles.length === particleCount) {
                // No change in dimensions or particle count, no need to re-initialize
                return;
            }

            width = newWidth;
            height = newHeight;

            if (width === 0 || height === 0) {
                // If dimensions are 0, try to get them from parent or wait
                const rect = container.getBoundingClientRect();
                width = rect.width;
                height = rect.height;
            }

            const dpr = window.devicePixelRatio || 1;
            canvas.width = width * dpr;
            canvas.height = height * dpr;
            ctx.scale(dpr, dpr);

            particles = [];
            for (let i = 0; i < particleCount; i++) {
                particles.push(new Particle());
            }
        };

        // --- ANIMATION LOOP ---
        const animate = () => {
            ctx.globalAlpha = 1.0; // Reset alpha for the trail fill
            ctx.fillStyle = `rgba(0, 0, 0, ${trailOpacity})`;
            ctx.fillRect(0, 0, width, height);

            particles.forEach((p) => {
                p.update();
                p.draw(ctx);
            });

            animationFrameId = requestAnimationFrame(animate);
        };

        // --- RESIZE OBSERVER ---
        const resizeObserver = new ResizeObserver(() => {
            init();
        });
        resizeObserver.observe(container);

        const handleMouseMove = (e: MouseEvent) => {
            const rect = canvas.getBoundingClientRect();
            mouse.x = e.clientX - rect.left;
            mouse.y = e.clientY - rect.top;
        };

        const handleMouseLeave = () => {
            mouse.x = -1000;
            mouse.y = -1000;
        }

        init();
        animate();

        // Extra init after a short delay to ensure dimensions are settled
        const timer = setTimeout(init, 100);

        container.addEventListener("mousemove", handleMouseMove);
        container.addEventListener("mouseleave", handleMouseLeave);

        return () => {
            clearTimeout(timer);
            resizeObserver.disconnect();
            container.removeEventListener("mousemove", handleMouseMove);
            container.removeEventListener("mouseleave", handleMouseLeave);
            cancelAnimationFrame(animationFrameId);
        };
    }, [color, trailOpacity, particleCount, speed]);

    return (
        <div ref={containerRef} className={cn("relative w-full h-full overflow-hidden", className)}>
            <canvas ref={canvasRef} className="block w-full h-full" />
        </div>
    );
}

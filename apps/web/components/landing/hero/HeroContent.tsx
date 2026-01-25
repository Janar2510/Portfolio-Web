'use client';

import { useRef, useEffect } from 'react';
import { Link } from '@/i18n/routing';
import { Button } from '@/components/ui/button';
import { GradientButton } from '@/components/ui/gradient-button';
import { ArrowRight, CheckCircle2 } from 'lucide-react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';

export function HeroContent() {
    const containerRef = useRef<HTMLDivElement>(null);
    const headlineRef = useRef<HTMLHeadingElement>(null);
    const subheadRef = useRef<HTMLParagraphElement>(null);
    const ctaRef = useRef<HTMLDivElement>(null);
    const statsRef = useRef<HTMLDivElement>(null);

    useGSAP(() => {
        const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

        tl.from(headlineRef.current, {
            y: 50,
            opacity: 0,
            duration: 1,
            delay: 0.2,
        })
            .from(subheadRef.current, {
                y: 30,
                opacity: 0,
                duration: 0.8,
            }, '-=0.6')
            .from(ctaRef.current, {
                y: 20,
                opacity: 0,
                duration: 0.6,
            }, '-=0.4')
            .from(statsRef.current?.children || [], {
                y: 20,
                opacity: 0,
                duration: 0.5,
                stagger: 0.1,
            }, '-=0.2');
    }, { scope: containerRef });

    return (
        <div ref={containerRef} className="container mx-auto px-4 md:px-6 pt-20 pb-32 relative z-10">
            <div className="max-w-3xl">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-100/50 dark:bg-teal-900/30 border border-teal-200 dark:border-teal-800 text-teal-800 dark:text-teal-200 text-sm font-medium mb-6 animate-fade-in">
                    <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-teal-500"></span>
                    </span>
                    New: AI-Powered Portfolio Builder
                </div>

                <h1 ref={headlineRef} className="text-5xl md:text-7xl font-bold font-display tracking-tight text-navy-900 mb-6 leading-[1.1]">
                    Build Your Portfolio. <br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-300 to-teal-100">
                        Grow Your Business.
                    </span>
                </h1>

                <p ref={subheadRef} className="text-xl md:text-2xl text-muted-foreground mb-10 max-w-2xl leading-relaxed">
                    The all-in-one platform for freelancers to showcase work, manage clients, and scale their creative business with professional tools.
                </p>

                <div ref={ctaRef} className="flex flex-col sm:flex-row gap-4 mb-16">
                    <GradientButton size="default" className="shadow-lg shadow-teal-500/25 group">
                        <Link href="/register">Start Free Trial</Link>
                        <ArrowRight className="ml-2 size-4 group-hover:translate-x-1 transition-transform" />
                    </GradientButton>
                    <GradientButton variant="variant" asChild>
                        <Link href="#examples">View Examples</Link>
                    </GradientButton>
                </div>

                <div ref={statsRef} className="grid grid-cols-2 md:grid-cols-4 gap-8 pt-8 border-t border-border/50">
                    <div>
                        <div className="text-3xl font-bold text-foreground mb-1">10k+</div>
                        <div className="text-sm text-muted-foreground">Active Freelancers</div>
                    </div>
                    <div>
                        <div className="text-3xl font-bold text-foreground mb-1">€2.5M</div>
                        <div className="text-sm text-muted-foreground">Revenue Generated</div>
                    </div>
                    <div>
                        <div className="text-3xl font-bold text-foreground mb-1">98%</div>
                        <div className="text-sm text-muted-foreground">Client Satisfaction</div>
                    </div>
                </div>
            </div>
        </div>
    );
}

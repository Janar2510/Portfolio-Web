'use client';

import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { useRef } from 'react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Button } from '@/components/ui/button';
import { GradientButton } from '@/components/ui/gradient-button';
import { ArrowRight, ExternalLink } from 'lucide-react';
import { Link } from '@/i18n/routing';
import Image from 'next/image';

gsap.registerPlugin(ScrollTrigger);

const examples = [
    {
        title: 'Sarah Jenkins',
        role: 'Product Designer',
        image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop',
        color: 'bg-orange-100 dark:bg-orange-900/20 text-orange-700 dark:text-orange-300',
    },
    {
        title: 'Davide Russo',
        role: 'Creative Developer',
        image: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=2670&auto=format&fit=crop',
        color: 'bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300',
    },
    {
        title: 'Elena Kova',
        role: 'Architect',
        image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=2670&auto=format&fit=crop',
        color: 'bg-emerald-100 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300',
    },
];

export function PortfolioShowcase() {
    const containerRef = useRef<HTMLDivElement>(null);
    const scrollContainerRef = useRef<HTMLDivElement>(null);

    useGSAP(() => {
        const scrollContainer = scrollContainerRef.current;
        if (!scrollContainer) return;

        // Horizontal scroll animation
        gsap.to(scrollContainer, {
            x: () => -(scrollContainer.scrollWidth - window.innerWidth),
            ease: 'none',
            scrollTrigger: {
                trigger: containerRef.current,
                pin: true,
                scrub: 1,
                end: () => '+=' + scrollContainer.scrollWidth,
                invalidateOnRefresh: true,
            },
        });
    }, { scope: containerRef });

    return (
        <section id="examples" ref={containerRef} className="h-screen bg-navy-950 text-white overflow-hidden flex flex-col">
            <div className="container mx-auto px-4 md:px-6 pt-24 md:pt-32 shrink-0">
                <div className="flex flex-col md:flex-row justify-between items-end gap-6">
                    <div className="max-w-xl">
                        <h2 className="text-5xl md:text-7xl font-bold font-display text-navy-900 mb-6">
                            Built with <span className="text-teal-400">Copifolio</span>
                        </h2>
                        <p className="text-lg text-gray-400">
                            Join thousands of creatives who trust us with their professional presence.
                        </p>
                    </div>
                    <GradientButton variant="variant" asChild>
                        <Link href="/examples">
                            View All Examples <ArrowRight className="ml-2 size-4" />
                        </Link>
                    </GradientButton>
                </div>
            </div>

            <div className="flex-1 flex items-center">
                <div ref={scrollContainerRef} className="flex gap-8 px-4 md:px-6 w-max">
                    {examples.map((example, index) => (
                        <div
                            key={index}
                            className="relative h-[50vh] md:h-[60vh] aspect-[16/10] rounded-2xl overflow-hidden group border border-white/10 shrink-0"
                        >
                            <Image
                                src={example.image}
                                alt={example.title}
                                fill
                                priority={true}
                                sizes="(max-width: 768px) 85vw, 600px"
                                className="object-cover transition-transform duration-700 group-hover:scale-105"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-100 transition-opacity duration-300" />

                            <div className="absolute bottom-0 left-0 p-8 w-full">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold mb-3 ${example.color} bg-white/10 backdrop-blur-md`}>
                                            {example.role}
                                        </span>
                                        <h3 className="text-2xl font-bold">{example.title}</h3>
                                    </div>
                                    <Button size="icon" className="rounded-full bg-white text-black hover:bg-teal-400 hover:text-white transition-colors">
                                        <ExternalLink size={20} />
                                    </Button>
                                </div>
                            </div>
                        </div>
                    ))}

                    {/* Call to action card */}
                    <div className="h-[50vh] md:h-[60vh] aspect-[16/10] rounded-2xl bg-gradient-to-br from-teal-900 to-navy-900 border border-teal-800 flex flex-col items-center justify-center text-center p-8 shrink-0">
                        <h3 className="text-2xl font-bold mb-4">You're Next</h3>
                        <p className="text-gray-400 mb-8 max-w-xs">
                            Start building your professional portfolio today. No credit card required.
                        </p>
                        <GradientButton asChild className="font-bold">
                            <Link href="/register">Start Building</Link>
                        </GradientButton>
                    </div>
                </div>
            </div>
        </section>
    );
}

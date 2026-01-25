'use client';

import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { useRef } from 'react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Layout, Users, BarChart3, Mail, Globe, Shield } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const features = [
    {
        icon: Layout,
        title: 'Portfolio Builder',
        description: 'Create stunning portfolios with our drag-and-drop editor. Choose from 20+ professional templates.',
    },
    {
        icon: Users,
        title: 'Client Management',
        description: 'Track leads, manage contacts, and organize client relationships in one simple CRM.',
    },
    {
        icon: BarChart3,
        title: 'Analytics & Insights',
        description: 'Thoughful analytics to track views, clicks, and client engagement on your portfolio.',
    },
    {
        icon: Mail,
        title: 'Email Integration',
        description: 'Connect with clients directly. Send proposals and updates without leaving the platform.',
    },
    {
        icon: Globe,
        title: 'Custom Domain',
        description: 'Connect your own domain name to give your portfolio a professional identity.',
    },
    {
        icon: Shield,
        title: 'Secure Hosting',
        description: 'Your portfolio is hosted on a secure, high-performance global CDN for maximum speed.',
    },
];

export function FeaturesSection() {
    const containerRef = useRef<HTMLDivElement>(null);
    const cardsRef = useRef<(HTMLDivElement | null)[]>([]);

    useGSAP(() => {
        cardsRef.current.forEach((card, index) => {
            if (!card) return;

            gsap.from(card, {
                scrollTrigger: {
                    trigger: card,
                    start: 'top bottom-=100',
                    toggleActions: 'play none none reverse',
                },
                y: 50,
                opacity: 0,
                duration: 0.6,
                delay: index * 0.1,
                ease: 'power3.out',
            });
        });
    }, { scope: containerRef });

    return (
        <section id="features" className="py-24 bg-background relative overflow-hidden">
            <div className="container mx-auto px-4 md:px-6 relative z-10">
                <div className="text-center max-w-3xl mx-auto mb-16">
                    <h2 className="text-5xl md:text-7xl font-bold font-display text-navy-900 mb-6">
                        Everything You Need to <span className="text-teal-600">Succeed</span>
                    </h2>
                    <p className="text-lg text-muted-foreground">
                        Powerful tools designed specifically for freelancers and creative professionals to manage and grow their business.
                    </p>
                </div>

                <div ref={containerRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {features.map((feature, index) => (
                        <div
                            key={index}
                            ref={(el) => { if (cardsRef.current) cardsRef.current[index] = el; }}
                            className="group p-8 rounded-2xl bg-teal-600/90 backdrop-blur-md gradient-border hover:shadow-xl hover:shadow-teal-900/20 transition-all duration-300 hover:-translate-y-1"
                        >
                            <div className="mb-6 inline-flex p-4 rounded-xl bg-white/10 text-white group-hover:bg-white/20 group-hover:scale-110 transition-all duration-300">
                                <feature.icon size={32} strokeWidth={1.5} />
                            </div>
                            <h3 className="text-xl font-bold text-white mb-3">
                                {feature.title}
                            </h3>
                            <p className="text-teal-50 leading-relaxed">
                                {feature.description}
                            </p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Background decoration */}
            <div className="absolute top-1/2 left-0 w-full h-px bg-gradient-to-r from-transparent via-teal-200/50 to-transparent -z-10" />
        </section>
    );
}

'use client';

import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, X, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Link } from '@/i18n/routing';
import { GradientButton } from '@/components/ui/gradient-button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

const plans = [
    {
        name: 'Free',
        description: 'Perfect for trying out the platform',
        price: { monthly: 0, yearly: 0 },
        features: [
            { name: '1 Portfolio site', included: true },
            { name: '3 pages', included: true },
            { name: '5 projects', included: true },
            { name: 'Copifolio branding', included: true },
            { name: 'Custom domain', included: false },
            { name: 'Analytics', included: false },
        ],
        cta: 'Start Free',
        href: '/sign-up',
        popular: false,
    },
    {
        name: 'Starter',
        description: 'For freelancers getting started',
        price: { monthly: 9, yearly: 90 },
        features: [
            { name: '1 Portfolio site', included: true },
            { name: '10 pages', included: true },
            { name: '20 projects', included: true },
            { name: '100 CRM contacts', included: true },
            { name: 'Custom domain', included: true },
            { name: 'Basic analytics', included: true },
        ],
        cta: 'Start Trial',
        href: '/sign-up?plan=starter',
        popular: false,
    },
    {
        name: 'Professional',
        description: 'For active freelancers and creatives',
        price: { monthly: 19, yearly: 190 },
        features: [
            { name: '1 Portfolio site', included: true },
            { name: 'Unlimited pages', included: true },
            { name: 'Unlimited projects', included: true },
            { name: '500 CRM contacts', included: true },
            { name: 'Custom domain', included: true },
            { name: 'Advanced analytics', included: true },
            { name: 'Priority support', included: true },
        ],
        cta: 'Start Trial',
        href: '/sign-up?plan=professional',
        popular: true,
    },
    {
        name: 'Business',
        description: 'For agencies and growing businesses',
        price: { monthly: 39, yearly: 390 },
        features: [
            { name: '3 Portfolio sites', included: true },
            { name: 'Unlimited pages', included: true },
            { name: 'Unlimited projects', included: true },
            { name: 'Unlimited CRM contacts', included: true },
            { name: 'Custom domains', included: true },
            { name: 'Advanced analytics', included: true },
            { name: 'Team members (5)', included: true },
            { name: 'API Access', included: true },
        ],
        cta: 'Contact Us',
        href: '/contact',
        popular: false,
    },
];

const PricingSwitch = ({ onSwitch }: { onSwitch: (isYearly: boolean) => void }) => {
    const [isYearly, setIsYearly] = useState(false);

    const handleSwitch = (yearly: boolean) => {
        setIsYearly(yearly);
        onSwitch(yearly);
    };

    return (
        <div className="flex justify-center mb-12">
            <div className="relative z-10 mx-auto flex w-fit rounded-full bg-[#141C33] border border-[#354F6F]/30 p-1">
                <button
                    onClick={() => handleSwitch(false)}
                    className={cn(
                        "relative z-10 w-fit h-10 rounded-full sm:px-6 px-3 sm:py-2 py-1 font-medium transition-colors",
                        !isYearly ? "text-white" : "text-gray-400 hover:text-gray-200",
                    )}
                >
                    {!isYearly && (
                        <motion.span
                            layoutId="pricing-switch"
                            className="absolute top-0 left-0 h-10 w-full rounded-full shadow-lg shadow-teal-500/20 bg-gradient-to-t from-[#3D726E] to-[#68A9A5]"
                            transition={{ type: "spring", stiffness: 500, damping: 30 }}
                        />
                    )}
                    <span className="relative">Monthly</span>
                </button>

                <button
                    onClick={() => handleSwitch(true)}
                    className={cn(
                        "relative z-10 w-fit h-10 rounded-full sm:px-6 px-3 sm:py-2 py-1 font-medium transition-colors",
                        isYearly ? "text-white" : "text-gray-400 hover:text-gray-200",
                    )}
                >
                    {isYearly && (
                        <motion.span
                            layoutId="pricing-switch"
                            className="absolute top-0 left-0 h-10 w-full rounded-full shadow-lg shadow-teal-500/20 bg-gradient-to-t from-[#3D726E] to-[#68A9A5]"
                            transition={{ type: "spring", stiffness: 500, damping: 30 }}
                        />
                    )}
                    <span className="relative flex items-center gap-2">
                        Yearly <span className="text-[10px] font-bold bg-white/20 px-1.5 py-0.5 rounded italic">Save 20%</span>
                    </span>
                </button>
            </div>
        </div>
    );
};

// Simplified inline animations for missing components
const TimelineReveal = ({ children, delay = 0 }: { children: React.ReactNode, delay?: number }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay }}
    >
        {children}
    </motion.div>
);

export function PricingSection() {
    const [isYearly, setIsYearly] = useState(false);
    const pricingRef = useRef<HTMLDivElement>(null);

    return (
        <section id="pricing" className="py-32 bg-[#141C33] relative overflow-hidden min-h-screen flex flex-col items-center justify-center" ref={pricingRef}>
            {/* Ambient Background Glows */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[600px] bg-[radial-gradient(circle_at_50%_0%,#3D726E_0%,transparent_70%)] opacity-30 pointer-events-none" />
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full h-[600px] bg-[radial-gradient(circle_at_50%_100%,#212D50_0%,transparent_70%)] opacity-20 pointer-events-none" />

            <div className="container mx-auto px-4 md:px-6 relative z-10">
                <div className="text-center max-w-3xl mx-auto mb-16 px-4">
                    <TimelineReveal>
                        <h2 className="text-5xl md:text-7xl font-bold font-display text-white mb-6 tracking-tight">
                            Simple, Transparent <span className="text-[#68A9A5]">Pricing</span>
                        </h2>
                    </TimelineReveal>

                    <TimelineReveal delay={0.2}>
                        <p className="text-lg text-gray-400 mb-8 max-w-2xl mx-auto">
                            Choose the perfect plan for your creative business. No hidden fees, cancel anytime.
                        </p>
                    </TimelineReveal>

                    <TimelineReveal delay={0.3}>
                        <PricingSwitch onSwitch={setIsYearly} />
                    </TimelineReveal>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
                    {plans.map((plan, index) => (
                        <TimelineReveal key={plan.name} delay={0.1 * index}>
                            <Card className={cn(
                                "relative h-full text-white border-transparent transition-all duration-300 group hover:translate-y-[-8px]",
                                "bg-gradient-to-b from-[#212D50]/80 to-[#141C33]/90 backdrop-blur-xl",
                                plan.popular
                                    ? "ring-2 ring-[#68A9A5] shadow-[0_0_40px_-10px_rgba(104,169,165,0.4)] z-10"
                                    : "border border-[#354F6F]/30"
                            )}>
                                {plan.popular && (
                                    <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-gradient-to-r from-[#68A9A5] to-[#3D726E] text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider z-20 shadow-lg">
                                        Most Popular
                                    </div>
                                )}

                                <CardHeader className="text-left pb-4">
                                    <h3 className="text-2xl font-bold mb-1 group-hover:text-[#68A9A5] transition-colors">{plan.name}</h3>
                                    <div className="flex items-baseline gap-1">
                                        <span className="text-4xl font-bold">
                                            €{isYearly ? plan.price.yearly : plan.price.monthly}
                                        </span>
                                        <span className="text-gray-400 text-sm">
                                            /{isYearly ? 'year' : 'month'}
                                        </span>
                                    </div>
                                    <p className="text-sm text-gray-400 mt-4 leading-relaxed line-clamp-2">{plan.description}</p>
                                </CardHeader>

                                <CardContent className="pt-0 flex flex-col h-full gap-8">
                                    <GradientButton
                                        asChild
                                        variant={plan.popular ? "default" : "variant"}
                                        className="w-full h-[50px] font-bold"
                                    >
                                        <Link href={plan.href}>{plan.cta}</Link>
                                    </GradientButton>

                                    <div className="flex-1 border-t border-[#354F6F]/20 pt-6">
                                        <h4 className="text-xs font-bold uppercase tracking-widest text-[#68A9A5] mb-4">What's included</h4>
                                        <ul className="space-y-3">
                                            {plan.features.map((feature) => (
                                                <li key={feature.name} className="flex items-start gap-3 text-sm">
                                                    {feature.included ? (
                                                        <Check className="size-4 text-[#68A9A5] shrink-0 mt-0.5" />
                                                    ) : (
                                                        <X className="size-4 text-gray-500/30 shrink-0 mt-0.5" />
                                                    )}
                                                    <span className={cn(
                                                        "transition-colors",
                                                        feature.included ? "text-gray-200" : "text-gray-500/60"
                                                    )}>
                                                        {feature.name}
                                                    </span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </CardContent>
                            </Card>
                        </TimelineReveal>
                    ))}
                </div>
            </div>

            {/* Decorative Sparkle elements simplified */}
            <div className="absolute inset-0 pointer-events-none opacity-20">
                <div className="absolute top-1/4 left-1/4 size-1 bg-white rounded-full blur-[1px] animate-pulse" />
                <div className="absolute top-1/3 right-1/3 size-1 bg-white rounded-full blur-[1px] animate-pulse delay-700" />
                <div className="absolute bottom-1/4 right-1/4 size-1 bg-white rounded-full blur-[1px] animate-pulse delay-1000" />
            </div>
        </section>
    );
}


'use client';

import { useRef, useState, useEffect } from 'react';
import { Star, ChevronLeft, ChevronRight, Quote } from 'lucide-react';
import { GradientButton } from '@/components/ui/gradient-button';
import { cn } from '@/lib/utils';
import Image from 'next/image';

const testimonials = [
    {
        id: 1,
        content: "Copifolio transformed how I present my work. Within a week of launching my new portfolio, I landed two new high-ticket clients who specifically mentioned the professional look of my site.",
        author: "Maria Tamm",
        role: "Graphic Designer",
        company: "Freelance",
        image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=200&auto=format&fit=crop",
    },
    {
        id: 2,
        content: "The CRM features are a game changer. I used to manage leads in spreadsheets, but now everything is connected directly to my portfolio. It secures my workflow completely.",
        author: "James Wilson",
        role: "Web Developer",
        company: "TechFlow",
        image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=200&auto=format&fit=crop",
    },
    {
        id: 3,
        content: "I've tried every portfolio builder out there. Nothing compares to the customization and speed of Copifolio. It feels like a custom-coded site but took me only an afternoon to build.",
        author: "Elena Kova",
        role: "Architect",
        company: "Studio Kova",
        image: "https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=200&auto=format&fit=crop",
    },
];

export function TestimonialsSection() {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isAnimating, setIsAnimating] = useState(false);

    // Auto-advance
    useEffect(() => {
        const timer = setInterval(() => {
            handleNext();
        }, 8000);
        return () => clearInterval(timer);
    }, [currentIndex]);

    const handleNext = () => {
        if (isAnimating) return;
        setIsAnimating(true);
        setCurrentIndex((prev) => (prev + 1) % testimonials.length);
        setTimeout(() => setIsAnimating(false), 500);
    };

    const handlePrev = () => {
        if (isAnimating) return;
        setIsAnimating(true);
        setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
        setTimeout(() => setIsAnimating(false), 500);
    };

    return (
        <section className="py-24 bg-teal-50/30 dark:bg-navy-900/30">
            <div className="container mx-auto px-4 md:px-6">
                <div className="text-center mb-16">
                    <h2 className="text-5xl md:text-7xl font-bold font-display text-navy-900 mb-6">
                        Loved by <span className="text-teal-600">Creatives</span>
                    </h2>
                    <p className="text-lg text-muted-foreground">
                        Don't just take our word for it. Hear from our community.
                    </p>
                </div>

                <div className="max-w-4xl mx-auto relative">
                    <div className="bg-teal-600/90 backdrop-blur-md rounded-3xl p-8 md:p-12 shadow-xl shadow-teal-900/20 relative overflow-hidden min-h-[400px] md:min-h-[300px] flex items-center gradient-border">
                        <Quote className="absolute top-8 left-8 text-teal-100 dark:text-teal-900/50 size-24 -z-0" />

                        <div
                            className={cn(
                                "relative z-10 w-full transition-opacity duration-500 flex flex-col md:flex-row gap-8 items-center",
                                isAnimating ? "opacity-0" : "opacity-100"
                            )}
                        >
                            <div className="shrink-0">
                                <div className="size-24 md:size-32 rounded-full border-4 border-teal-50 dark:border-teal-900 overflow-hidden relative">
                                    <Image
                                        src={testimonials[currentIndex].image}
                                        alt={testimonials[currentIndex].author}
                                        fill
                                        className="object-cover"
                                    />
                                </div>
                            </div>

                            <div className="flex-1 text-center md:text-left">
                                <div className="flex justify-center md:justify-start gap-1 mb-4">
                                    {[...Array(5)].map((_, i) => (
                                        <Star key={i} size={16} className="fill-amber-400 text-amber-400" />
                                    ))}
                                </div>
                                <p className="text-xl md:text-2xl font-medium text-navy-900 dark:text-white mb-6 leading-relaxed">
                                    "{testimonials[currentIndex].content}"
                                </p>
                                <div>
                                    <h4 className="font-bold text-lg">{testimonials[currentIndex].author}</h4>
                                    <p className="text-muted-foreground">{testimonials[currentIndex].role}, {testimonials[currentIndex].company}</p>
                                </div>
                            </div>
                        </div>

                        {/* Navigation buttons */}
                        <div className="absolute inset-x-0 bottom-4 flex justify-center gap-2 md:bottom-auto md:top-1/2 md:-translate-y-1/2 md:justify-between md:px-4 pointer-events-none">
                            <GradientButton
                                variant="variant"
                                size="icon"
                                onClick={handlePrev}
                                className="pointer-events-auto rounded-full bg-white/80 dark:bg-navy-800/80 shadow-sm backdrop-blur-sm"
                            >
                                <ChevronLeft size={24} />
                            </GradientButton>
                            <GradientButton
                                variant="variant"
                                size="icon"
                                onClick={handleNext}
                                className="pointer-events-auto rounded-full bg-white/80 dark:bg-navy-800/80 shadow-sm backdrop-blur-sm"
                            >
                                <ChevronRight size={24} />
                            </GradientButton>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

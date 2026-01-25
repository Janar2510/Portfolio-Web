'use client';

import { useState, useEffect } from 'react';
import { Link } from '@/i18n/routing';
import { useScroll, useMotionValueEvent } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { GradientButton } from '@/components/ui/gradient-button';
import { Menu, X } from 'lucide-react';
import { useTranslations } from 'next-intl';

export function Navbar() {
    const [isScrolled, setIsScrolled] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const { scrollY } = useScroll();
    const t = useTranslations('common');

    useMotionValueEvent(scrollY, "change", (latest: number) => {
        setIsScrolled(latest > 50);
    });

    const navLinks = [
        { href: '#features', label: 'Features' },
        { href: '#pricing', label: 'Pricing' },
        { href: '#examples', label: 'Examples' },
        { href: '#faq', label: 'FAQ' },
    ];

    return (
        <header
            className={cn(
                'fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b border-transparent',
                isScrolled ? 'bg-background/80 backdrop-blur-md border-border shadow-sm py-3' : 'bg-transparent py-5'
            )}
        >
            <div className="container mx-auto px-4 md:px-6 flex items-center justify-between">
                {/* Logo */}
                <Link href="/" className="flex items-center gap-2 font-bold text-xl group">
                    <div className="size-8 rounded-lg bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center text-white shadow-lg shadow-teal-500/20 group-hover:shadow-teal-500/30 transition-shadow">
                        <span className="text-lg">C</span>
                    </div>
                    <span className="text-foreground">Copifolio</span>
                </Link>

                {/* Desktop Nav */}
                <nav className="hidden md:flex items-center gap-8">
                    {navLinks.map((link) => (
                        <a
                            key={link.label}
                            href={link.href}
                            className="text-sm font-medium text-muted-foreground hover:text-teal-600 transition-colors"
                        >
                            {link.label}
                        </a>
                    ))}
                </nav>

                {/* CTA Buttons */}
                <div className="hidden md:flex items-center gap-4">
                    <Button variant="ghost" asChild className="text-muted-foreground hover:text-foreground">
                        <Link href="/sign-in">Log in</Link>
                    </Button>
                    <GradientButton asChild className="shadow-md shadow-teal-500/20">
                        <Link href="/sign-up">Start Free Trial</Link>
                    </GradientButton>
                </div>

                {/* Mobile Menu Toggle */}
                <button
                    className="md:hidden p-2 text-foreground"
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                >
                    {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
            </div>

            {/* Mobile Menu */}
            {mobileMenuOpen && (
                <div className="md:hidden absolute top-full left-0 right-0 bg-background border-b border-border shadow-lg p-6 flex flex-col gap-4 animate-in slide-in-from-top-2">
                    {navLinks.map((link) => (
                        <a
                            key={link.label}
                            href={link.href}
                            className="text-lg font-medium text-foreground py-2 border-b border-border/50"
                            onClick={() => setMobileMenuOpen(false)}
                        >
                            {link.label}
                        </a>
                    ))}
                    <div className="flex flex-col gap-3 mt-4">
                        <GradientButton variant="variant" asChild className="w-full justify-center">
                            <Link href="/sign-in">Log in</Link>
                        </GradientButton>
                        <GradientButton asChild className="w-full justify-center">
                            <Link href="/sign-up">Start Free Trial</Link>
                        </GradientButton>
                    </div>
                </div>
            )}
        </header>
    );
}

'use client';

import * as React from 'react';
import { useState, useEffect } from 'react';
import { AppSidebar } from './AppSidebar';
import { TopNav } from './TopNav';
import { cn } from '@/lib/utils';
import { usePathname } from 'next/navigation';

interface AppShellProps {
    children: React.ReactNode;
    locale: string;
}

export function AppShell({ children, locale }: AppShellProps) {
    const [collapsed, setCollapsed] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const pathname = usePathname();

    // Close mobile menu on route change
    useEffect(() => {
        setIsMobileMenuOpen(false);
    }, [pathname]);

    return (
        <div className="min-h-screen bg-background text-foreground font-sans selection:bg-primary/30 selection:text-white">
            {/* Sidebar - Desktop */}
            <div className="hidden lg:block">
                <AppSidebar
                    collapsed={collapsed}
                    onToggle={() => setCollapsed(!collapsed)}
                    locale={locale}
                />
            </div>

            {/* Main Content Area */}
            <div
                className={cn(
                    "transition-all duration-300 min-h-screen flex flex-col w-full",
                    collapsed ? "lg:pl-20" : "lg:pl-64"
                )}
            >
                <TopNav onMenuClick={() => setIsMobileMenuOpen(true)} />

                <main className="flex-1 w-full overflow-x-hidden">
                    <div className="p-6 md:p-8 lg:p-10 max-w-[1360px] mx-auto w-full">
                        {children}
                    </div>
                </main>

                <footer className="py-8 px-10 border-t border-border text-center text-xs text-muted-foreground/40 font-medium tracking-widest uppercase">
                    &copy; {new Date().getFullYear()} Supale &mdash; Built for Creators
                </footer>
            </div>

            {/* Mobile Sidebar Overlay (Simple implementation for now) */}
            {isMobileMenuOpen && (
                <div className="fixed inset-0 z-[100] lg:hidden">
                    <div
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in"
                        onClick={() => setIsMobileMenuOpen(false)}
                    />
                    <div className="absolute left-0 top-0 h-full w-72 animate-in slide-in-from-left duration-300">
                        <AppSidebar
                            collapsed={false}
                            onToggle={() => setIsMobileMenuOpen(false)}
                            locale={locale}
                        />
                    </div>
                </div>
            )}
        </div>
    );
}

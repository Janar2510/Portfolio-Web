'use client';

import * as React from 'react';
import { Breadcrumbs } from './Breadcrumbs';
import { Button } from '@/components/ui/button';
import {
    Bell,
    Search,
    User,
    Menu,
    Moon,
    Sun
} from 'lucide-react';
import { useTheme } from '@/components/providers/ThemeProvider';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useState, useEffect } from 'react';

interface TopNavProps {
    onMenuClick?: () => void;
}

export function TopNav({ onMenuClick }: TopNavProps) {
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    return (
        <header className="h-16 px-6 border-b premium-border bg-[hsl(var(--bg-elevated))]/80 backdrop-blur-md flex items-center justify-between sticky top-0 z-40">
            <div className="flex items-center gap-4">
                {onMenuClick && (
                    <Button variant="ghost" size="icon" onClick={onMenuClick} className="lg:hidden">
                        <Menu className="w-5 h-5" />
                    </Button>
                )}
                <Breadcrumbs />
            </div>

            <div className="flex items-center gap-2 md:gap-4">
                {/* Search Placeholder */}
                <div className="hidden md:flex items-center px-3 py-1.5 rounded-lg bg-[hsl(var(--bg-surface))] premium-border text-muted-foreground hover:bg-[hsl(var(--bg-surface))]/80 transition-colors cursor-pointer w-48 lg:w-64">
                    <Search className="w-4 h-4 mr-2" />
                    <span className="text-sm">Search...</span>
                    <span className="ml-auto text-[10px] font-bold opacity-50 px-1.5 py-0.5 rounded border border-[hsl(var(--border-subtle))]">⌘K</span>
                </div>

                {/* Notifications */}
                <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground relative rounded-full">
                    <Bell className="w-5 h-5" />
                    <div className="absolute top-2 right-2 w-2 h-2 bg-primary rounded-full border-2 border-background shadow-glow-soft" />
                </Button>

                {/* Theme Toggle */}
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                    className="text-muted-foreground hover:text-foreground rounded-full"
                >
                    {!mounted ? (
                        <div className="w-5 h-5" />
                    ) : theme === 'dark' ? (
                        <Sun className="w-5 h-5" />
                    ) : (
                        <Moon className="w-5 h-5" />
                    )}
                </Button>

                {/* Subscription Badge */}
                <div className="hidden md:flex items-center gap-2 mr-2">
                    <span className="text-xs font-semibold text-muted-foreground bg-muted px-2 py-1 rounded-full border border-border">
                        Free Plan
                    </span>
                    <Button variant="outline" size="sm" className="h-7 text-xs border-primary/20 text-primary hover:bg-primary/10">
                        Upgrade
                    </Button>
                </div>

                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="relative h-10 w-10 rounded-full premium-border p-0 overflow-hidden hover:bg-[hsl(var(--bg-surface))] transition-all">
                            <Avatar className="h-10 w-10">
                                <AvatarFallback className="bg-gradient-brand text-white text-xs font-bold">JD</AvatarFallback>
                            </Avatar>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56 surface-elevated" align="end" forceMount>
                        <DropdownMenuLabel className="font-normal">
                            <div className="flex flex-col space-y-1">
                                <p className="text-sm font-medium leading-none">User</p>
                                <p className="text-xs leading-none text-muted-foreground">user@example.com</p>
                            </div>
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator className="bg-[hsl(var(--border-subtle))]" />
                        <DropdownMenuItem className="focus:bg-[hsl(var(--bg-surface))] cursor-pointer">
                            Profile
                        </DropdownMenuItem>
                        <DropdownMenuItem className="focus:bg-[hsl(var(--bg-surface))] cursor-pointer">
                            Account Settings
                        </DropdownMenuItem>
                        <DropdownMenuSeparator className="bg-[hsl(var(--border-subtle))]" />
                        <DropdownMenuItem className="focus:bg-[hsl(var(--bg-surface))] cursor-pointer text-destructive focus:text-destructive">
                            Log out
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </header>
    );
}

'use client';

import * as React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

interface ModuleOverviewProps {
    title: string;
    subtitle: string;
    items: Array<{
        id: string;
        title: string;
        description: string;
        status?: string;
        time?: string;
    }>;
    viewAllHref: string;
}

export function ModuleOverview({ title, subtitle, items, viewAllHref }: ModuleOverviewProps) {
    return (
        <Card className="surface-elevated overflow-hidden border-white/5 bg-white/[0.02] backdrop-blur-sm">
            <div className="p-8 border-b border-white/5 flex items-center justify-between">
                <div>
                    <h3 className="text-xl font-bold font-display text-white mb-1">{title}</h3>
                    <p className="text-sm text-white/40">{subtitle}</p>
                </div>
                <Button variant="ghost" size="sm" className="text-primary hover:text-primary/80 hover:bg-primary/10 gap-2">
                    View All
                    <ArrowRight className="w-4 h-4" />
                </Button>
            </div>
            <div className="p-2">
                {items.length > 0 ? (
                    <div className="space-y-1">
                        {items.map((item) => (
                            <div
                                key={item.id}
                                className="p-4 rounded-xl hover:bg-white/5 transition-colors group cursor-pointer flex items-center justify-between"
                            >
                                <div className="space-y-1">
                                    <h4 className="font-medium text-white group-hover:text-primary transition-colors">
                                        {item.title}
                                    </h4>
                                    <p className="text-sm text-white/40">{item.description}</p>
                                </div>
                                <div className="text-right">
                                    {item.status && (
                                        <span className="text-[10px] uppercase tracking-widest font-bold text-primary/60 px-2 py-1 rounded-full bg-primary/5">
                                            {item.status}
                                        </span>
                                    )}
                                    {item.time && (
                                        <p className="text-xs text-white/20 mt-1">{item.time}</p>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="py-12 text-center text-white/20 text-sm italic">
                        No recent activity found.
                    </div>
                )}
            </div>
        </Card>
    );
}

'use client';

import * as React from 'react';
import { Card } from '@/components/ui/card';
import { CheckCircle2, AlertCircle, RefreshCcw } from 'lucide-react';

export function ActiveServices() {
    const services = [
        { name: 'Portfolio Engine', status: 'online', uptime: '99.9%' },
        { name: 'CRM Sync', status: 'online', uptime: '100%' },
        { name: 'Email Gateway', status: 'online', uptime: '99.8%' },
        { name: 'Project Tracker', status: 'online', uptime: '100%' },
    ];

    return (
        <Card className="surface-elevated p-8 border-white/5 bg-white/[0.02] backdrop-blur-sm">
            <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-white/30 mb-6 flex items-center gap-2">
                <RefreshCcw className="w-4 h-4" />
                System Health
            </h3>
            <div className="space-y-4">
                {services.map((service) => (
                    <div key={service.name} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-2 h-2 rounded-full bg-primary animate-pulse shadow-glow-seafoam" />
                            <span className="text-sm font-medium text-white/70">{service.name}</span>
                        </div>
                        <div className="flex items-center gap-4">
                            <span className="text-[10px] font-bold text-white/20">{service.uptime}</span>
                            <CheckCircle2 className="w-4 h-4 text-primary opacity-40" />
                        </div>
                    </div>
                ))}
            </div>
        </Card>
    );
}

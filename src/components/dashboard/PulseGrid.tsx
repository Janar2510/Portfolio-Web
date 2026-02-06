'use client';

import * as React from 'react';
import { Card } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { Globe, Users, Briefcase, Zap } from 'lucide-react';

interface PulseStatProps {
    label: string;
    value: string | number;
    icon: any;
    trend?: string;
    color: string;
}

function PulseStat({ label, value, icon: Icon, trend, color }: PulseStatProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="group"
        >
            <Card className="surface-elevated p-6 hover:scale-[1.02] transition-all duration-300 border-white/5 hover:border-primary/20 bg-white/[0.02] backdrop-blur-sm">
                <div className="flex items-start justify-between">
                    <div className="space-y-3">
                        <div className="flex items-center gap-2">
                            <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-white/30">{label}</span>
                        </div>
                        <div className="text-3xl font-bold tracking-tight text-white">{value}</div>
                    </div>
                    <div className={`p-3 rounded-xl bg-white/5 text-${color} group-hover:scale-110 transition-transform`}>
                        <Icon className="w-5 h-5" />
                    </div>
                </div>
                {trend && (
                    <div className="mt-4 flex items-center gap-2">
                        <Zap className="w-3 h-3 text-primary" />
                        <span className="text-xs font-medium text-primary">{trend}</span>
                    </div>
                )}
            </Card>
        </motion.div>
    );
}

export function PulseGrid() {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            <PulseStat
                label="Active Sites"
                value="1"
                icon={Globe}
                trend="+1 this month"
                color="primary"
            />
            <PulseStat
                label="Total Leads"
                value="12"
                icon={Users}
                trend="+4 new today"
                color="primary"
            />
            <PulseStat
                label="Active Projects"
                value="3"
                icon={Briefcase}
                trend="2 due soon"
                color="primary"
            />
            <PulseStat
                label="Site Visits"
                value="1.2k"
                icon={Zap}
                trend="+12% weekly"
                color="primary"
            />
        </div>
    );
}

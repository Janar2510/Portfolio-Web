import * as React from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { LucideIcon } from 'lucide-react';
import { Link } from '@/i18n/routing';

interface EmptyStateProps {
    title: string;
    description: string;
    icon: LucideIcon;
    action?: {
        label: string;
        onClick?: () => void;
        href?: string;
    };
    className?: string;
}

export function EmptyState({ title, description, icon: Icon, action, className }: EmptyStateProps) {
    const actionButton = action ? (
        <Button
            onClick={action.onClick}
            variant="default"
            className="rounded-xl h-12 px-8 font-bold uppercase tracking-wider text-xs"
        >
            {action.label}
        </Button>
    ) : null;

    return (
        <div className={cn(
            "flex flex-col items-center justify-center py-24 px-6 text-center rounded-[3rem] border border-dashed border-white/10 bg-white/[0.02] backdrop-blur-sm",
            className
        )}>
            <div className="w-24 h-24 rounded-[2rem] bg-white/5 flex items-center justify-center mb-8 shadow-2xl border border-white/5 group">
                <Icon className="w-12 h-12 text-primary opacity-40 group-hover:opacity-100 transition-opacity duration-500" />
            </div>

            <h2 className="text-3xl font-bold mb-3 text-foreground tracking-tight">{title}</h2>
            <p className="text-muted-foreground text-base max-w-sm mb-10 leading-relaxed font-medium">
                {description}
            </p>

            {action?.href ? (
                <Link href={action.href}>
                    {actionButton}
                </Link>
            ) : actionButton}
        </div>
    );
}

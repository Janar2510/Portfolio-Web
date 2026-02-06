'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
    LayoutDashboard,
    Globe,
    Palette,
    Settings,
    ChevronLeft,
    ChevronRight,
    PlusCircle,
    BarChart3,
    Mail,
    Users,
    Briefcase,
    Zap,
    FolderKanban,
    FileText,
    Network,
    Table,
    Hammer,
} from 'lucide-react';
import { Link, usePathname, useRouter } from '@/i18n/routing';
import { useTranslations } from 'next-intl';
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from '@/components/ui/collapsible';

interface SidebarProps {
    collapsed: boolean;
    onToggle: () => void;
    locale: string;
}

export function AppSidebar({ collapsed, onToggle, locale }: SidebarProps) {
    const t = useTranslations('nav');
    const pathname = usePathname();

    const menuGroups = [
        {
            label: 'Core',
            items: [
                { icon: LayoutDashboard, label: t('dashboard'), href: '/dashboard' },
                { icon: Globe, label: t('portfolio'), href: '/sites' },
                { icon: Hammer, label: 'Editor', href: '/editor' },
                {
                    icon: Briefcase,
                    label: t('projects'),
                    href: '/projects',
                    children: [
                        { icon: FolderKanban, label: t('overview'), href: '/projects' },
                        { icon: Zap, label: 'Automations', href: '/projects/automations' },
                        { icon: FileText, label: t('documents'), href: '/documents' },
                        { icon: Network, label: t('mindMaps'), href: '/mind-maps' },
                        { icon: Table, label: t('spreadsheets'), href: '/spreadsheets' },
                    ]
                },
                {
                    icon: Users,
                    label: t('crm'),
                    href: '/crm',
                    children: [
                        { icon: LayoutDashboard, label: t('pipeline'), href: '/crm/pipeline' },
                        { icon: Users, label: t('leads'), href: '/crm/leads' },
                        { icon: Users, label: t('contacts'), href: '/crm/contacts' },
                        { icon: Briefcase, label: t('organizations'), href: '/crm/organizations' },
                        { icon: BarChart3, label: t('calendar'), href: '/crm/tasks' },
                        { icon: Settings, label: t('settings'), href: '/crm/settings' }
                    ]
                },
            ]
        },
        {
            label: 'Creative',
            items: [
                { icon: Palette, label: t('templates'), href: '/templates' },
                { icon: Mail, label: t('email'), href: '/email' },
            ]
        },
        {
            label: 'Insights',
            items: [
                { icon: BarChart3, label: t('analytics'), href: '/analytics' },
                { icon: Settings, label: t('settings'), href: '/settings' },
            ]
        }
    ];

    return (
        <aside
            className={cn(
                "fixed left-0 top-0 h-full z-50 transition-all duration-200 ease-in-out border-r premium-border bg-[hsl(var(--bg-surface))]/95 backdrop-blur-xl shadow-elevated",
                collapsed ? "w-20" : "w-64"
            )}
        >
            {/* Sidebar Header */}
            <div className="flex items-center justify-between h-16 px-6 border-b premium-border">
                {!collapsed && (
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-gradient-brand flex items-center justify-center shadow-glow-soft">
                            <span className="text-white font-bold text-sm">S</span>
                        </div>
                        <span className="font-bold text-xl tracking-tight text-gradient-accent">Supale</span>
                    </div>
                )}
                {collapsed && (
                    <div className="w-8 h-8 rounded-lg bg-gradient-brand flex items-center justify-center mx-auto shadow-glow-soft">
                        <span className="text-white font-bold text-sm">S</span>
                    </div>
                )}
            </div>

            {/* Navigation Content */}
            <div className="flex flex-col h-[calc(100%-8rem)] py-6 overflow-y-auto overflow-x-hidden custom-scrollbar">
                {menuGroups.map((group, groupIdx) => (
                    <div key={groupIdx} className="mb-8 last:mb-0">
                        {!collapsed && (
                            <h3 className="px-6 mb-3 text-[10px] uppercase tracking-[0.2em] font-bold text-muted-foreground/40">
                                {group.label}
                            </h3>
                        )}
                        <div className="space-y-1.5 px-3">
                            {group.items.map((item, itemIdx) => (
                                <SidebarItem
                                    key={itemIdx}
                                    item={item}
                                    collapsed={collapsed}
                                    pathname={pathname}
                                />
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            {/* Collapse Toggle */}
            <div className="absolute bottom-6 left-0 w-full px-4 pt-4 border-t premium-border">
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={onToggle}
                    className="w-full justify-center text-muted-foreground/60 hover:text-foreground hover:bg-[hsl(var(--bg-elevated))]/40 h-10 rounded-xl transition-all"
                >
                    {collapsed ? <ChevronRight className="w-5 h-5" /> : (
                        <div className="flex items-center gap-2">
                            <ChevronLeft className="w-5 h-5" />
                            <span className="text-[10px] uppercase tracking-widest font-bold">Collapse</span>
                        </div>
                    )}
                </Button>
            </div>
        </aside>
    );
}

function SidebarItem({ item, collapsed, pathname }: { item: any, collapsed: boolean, pathname: string }) {
    const hasChildren = item.children && item.children.length > 0;
    const isActive = pathname.startsWith(item.href);
    const [isOpen, setIsOpen] = React.useState(isActive);
    const router = useRouter();

    React.useEffect(() => {
        if (isActive) setIsOpen(true);
    }, [isActive]);

    if (hasChildren) {
        return (
            <Collapsible open={isOpen} onOpenChange={setIsOpen} className="space-y-1">
                <CollapsibleTrigger asChild>
                    <div
                        className={cn(
                            "flex items-center gap-3 px-3 py-2.5 rounded-2xl transition-all duration-300 group relative cursor-pointer select-none",
                            isActive
                                ? "bg-primary/10 text-primary shadow-glow-soft"
                                : "text-muted-foreground hover:text-foreground hover:bg-[hsl(var(--bg-elevated))]/40 hover:scale-[1.02]"
                        )}
                    >
                        <item.icon className={cn(
                            "w-5 h-5 transition-colors shrink-0",
                            isActive ? "text-primary" : "group-hover:text-foreground text-muted-foreground/60"
                        )} />
                        {!collapsed && (
                            <>
                                <span className="font-medium text-sm tracking-tight flex-1 text-left">{item.label}</span>
                                <ChevronRight className={cn(
                                    "w-4 h-4 transition-transform duration-200 text-muted-foreground/50",
                                    isOpen && "rotate-90"
                                )} />
                            </>
                        )}
                    </div>
                </CollapsibleTrigger>

                <CollapsibleContent className="space-y-1 overflow-hidden data-[state=closed]:animate-collapsible-up data-[state=open]:animate-collapsible-down">
                    {!collapsed && (
                        <div className="pl-4 space-y-1 mt-1 border-l border-white/5 ml-5">
                            {item.children.map((child: any, idx: number) => {
                                const childActive = pathname === child.href || pathname.startsWith(child.href + '/');
                                return (
                                    <Link
                                        key={idx}
                                        href={child.href}
                                        className={cn(
                                            "flex items-center gap-3 px-3 py-2 rounded-xl transition-all duration-300 text-sm",
                                            childActive
                                                ? "bg-primary/5 text-primary font-medium"
                                                : "text-muted-foreground hover:text-foreground hover:bg-[hsl(var(--bg-elevated))]/30"
                                        )}
                                    >
                                        <child.icon className={cn("w-4 h-4 transition-opacity", childActive ? "opacity-100" : "opacity-50")} />
                                        <span>{child.label}</span>
                                    </Link>
                                );
                            })}
                        </div>
                    )}
                </CollapsibleContent>
            </Collapsible>
        );
    }

    // Leaf node
    return (
        <Link
            href={item.href}
            className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-2xl transition-all duration-300 group relative",
                isActive
                    ? "bg-primary/10 text-primary shadow-glow-soft"
                    : "text-muted-foreground hover:text-foreground hover:bg-[hsl(var(--bg-elevated))]/40 hover:scale-[1.02]"
            )}
        >
            <item.icon className={cn(
                "w-5 h-5 transition-colors shrink-0",
                isActive ? "text-primary" : "group-hover:text-foreground text-muted-foreground/60"
            )} />
            {!collapsed && (
                <span className="font-medium text-sm tracking-tight">{item.label}</span>
            )}
            {isActive && (
                <div className="absolute left-0 w-1 h-5 bg-primary rounded-full shadow-glow-seafoam" />
            )}
        </Link>
    );
}

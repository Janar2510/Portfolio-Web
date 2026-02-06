'use client';

import { useState } from 'react';
import { TopNav } from './TopNav';
import { AppSidebar as Sidebar } from '@/components/shell/AppSidebar';
import { cn } from '@/lib/utils';

interface DashboardLayoutProps {
    children: React.ReactNode;
    locale: string;
}

export function DashboardLayout({ children, locale }: DashboardLayoutProps) {
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

    return (
        <div className="min-h-screen bg-background">
            <TopNav locale={locale} />
            <div className="flex">
                <Sidebar
                    locale={locale}
                    collapsed={sidebarCollapsed}
                    onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
                />
                <main
                    className={cn(
                        "flex-1 transition-all duration-200 pt-14",
                        sidebarCollapsed ? "ml-16" : "ml-64"
                    )}
                >
                    <div className="p-4 md:p-6">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}

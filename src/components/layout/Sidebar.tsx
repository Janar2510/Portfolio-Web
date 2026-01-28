'use client';

import { useTranslations } from 'next-intl';
import { usePathname } from 'next/navigation';
import { Link } from '@/i18n/routing';
import {
  Home,
  LayoutDashboard,
  Briefcase,
  FolderKanban,
  Calendar,
  Users,
  Building2,
  Activity,
  TrendingUp,
  BarChart3,
  TestTube,
  Mail,
  Globe,
  Menu,
  X,
  ChevronRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import { Button } from '@/components/ui/button';

interface SidebarProps {
  locale: string;
  collapsed?: boolean;
  onToggle?: () => void;
}

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  children?: NavItem[];
}

export function Sidebar({ locale, collapsed = false, onToggle }: SidebarProps) {
  const t = useTranslations();
  const pathname = usePathname();
  const [expandedItems, setExpandedItems] = useState<string[]>([]);

  const navItems: NavItem[] = [
    {
      label: 'Home',
      href: '/',
      icon: Home,
    },
    {
      label: t('nav.dashboard'),
      href: '/dashboard',
      icon: LayoutDashboard,
    },
    {
      label: t('nav.portfolio'),
      href: '/sites',
      icon: Globe,
    },
  ];

  const isActive = (href: string) => {
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  const toggleExpanded = (label: string) => {
    setExpandedItems(prev =>
      prev.includes(label)
        ? prev.filter(item => item !== label)
        : [...prev, label]
    );
  };

  const renderNavItem = (item: NavItem, level = 0) => {
    const active = isActive(item.href);
    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = expandedItems.includes(item.label);

    if (hasChildren) {
      return (
        <div key={item.label}>
          <button
            onClick={() => toggleExpanded(item.label)}
            className={cn(
              'w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors',
              'hover:bg-neutral-100 dark:hover:bg-dark-bg-2',
              active &&
              'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400',
              !active && 'text-neutral-700 dark:text-dark-text-secondary',
              level > 0 && 'pl-8'
            )}
          >
            <item.icon className="h-5 w-5 flex-shrink-0" />
            {!collapsed && (
              <>
                <span className="flex-1 text-left">{item.label}</span>
                <ChevronRight
                  className={cn(
                    'h-4 w-4 transition-transform',
                    isExpanded && 'rotate-90'
                  )}
                />
              </>
            )}
          </button>
          {!collapsed && isExpanded && (
            <div className="ml-4 mt-1 space-y-1">
              {item.children?.map(child => renderNavItem(child, level + 1))}
            </div>
          )}
        </div>
      );
    }

    return (
      <Link
        key={item.label}
        href={item.href}
        className={cn(
          'flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors',
          'hover:bg-neutral-100 dark:hover:bg-dark-bg-2',
          active &&
          'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400',
          !active && 'text-neutral-700 dark:text-dark-text-secondary',
          level > 0 && 'pl-8',
          collapsed && 'justify-center'
        )}
      >
        <item.icon className="h-5 w-5 flex-shrink-0" />
        {!collapsed && <span>{item.label}</span>}
      </Link>
    );
  };

  return (
    <aside
      className={cn(
        'fixed left-0 top-14 bottom-0 bg-card border-r border-border transition-all duration-200 z-30 block',
        collapsed ? 'w-16' : 'w-64'
      )}
    >
      <div className="h-full flex flex-col">
        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-4 space-y-1">
          {navItems.map(item => renderNavItem(item))}
        </nav>

        {/* Status */}
        {!collapsed && (
          <div className="p-4 border-t border-border">
            <div className="text-xs text-neutral-500 dark:text-dark-text-secondary">
              <div className="font-medium mb-1">{t('nav.status')}</div>
              <div>3 {t('nav.tasksToday')}</div>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}

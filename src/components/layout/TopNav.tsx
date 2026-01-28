'use client';

import { useTranslations } from 'next-intl';
import { usePathname } from 'next/navigation';
import { Link, useRouter } from '@/i18n/routing';
import { createClient } from '@/lib/supabase/client';
import { useState, useEffect } from 'react';
import { Bell, Settings, LogOut, User, ChevronDown, Globe } from 'lucide-react';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface TopNavProps {
  locale: string;
}

export function TopNav({ locale }: TopNavProps) {
  const t = useTranslations();
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [notifications, setNotifications] = useState(0);

  useEffect(() => {
    let isMounted = true;

    async function loadUser() {
      try {
        const supabase = createClient();
        const {
          data: { user },
          error,
        } = await supabase.auth.getUser();

        // Only update state if component is still mounted
        if (!isMounted) return;

        if (error) {
          console.error('Error loading user:', error);
          return;
        }
        setUser(user);
      } catch (error) {
        // Ignore abort errors (they're expected on unmount or navigation)
        if (error instanceof Error && error.name === 'AbortError') {
          return;
        }
        // Only log errors if component is still mounted
        if (isMounted) {
          console.error('Error in loadUser:', error);
        }
      }
    }

    loadUser();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/sign-in');
  };

  const switchLocale = (newLocale: string) => {
    const pathWithoutLocale = pathname.replace(`/${locale}`, '') || '/';
    // Use window.location for locale switching to ensure full page reload
    window.location.href = `/${newLocale}${pathWithoutLocale}`;
  };

  return (
    <nav className="h-14 border-b border-border bg-card flex items-center justify-between px-6">
      <div className="flex items-center gap-6">
        {/* Logo */}
        <Link href={`/${locale}/dashboard`} className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center">
            <span className="text-white font-bold text-sm">P</span>
          </div>
          <span className="font-semibold text-lg hidden sm:inline">
            Portfolio
          </span>
        </Link>
      </div>

      <div className="flex items-center gap-4">
        {/* Theme Toggle */}
        <ThemeToggle />

        {/* Notifications */}
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {notifications > 0 && (
            <span className="absolute top-1 right-1 w-2 h-2 bg-error-main rounded-full" />
          )}
        </Button>

        {/* Locale Switcher */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="gap-2">
              <Globe className="h-4 w-4" />
              <span className="uppercase">{locale}</span>
              <ChevronDown className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => switchLocale('et')}>
              Eesti
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => switchLocale('en')}>
              English
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="gap-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-300 to-primary-500 flex items-center justify-center">
                <User className="h-4 w-4 text-white" />
              </div>
              <span className="hidden sm:inline">
                {user?.email?.split('@')[0] || 'User'}
              </span>
              <ChevronDown className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/dashboard" className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                Settings
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={handleLogout}
              className="text-error-main"
            >
              <LogOut className="h-4 w-4 mr-2" />
              {t('auth.logout')}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </nav>
  );
}

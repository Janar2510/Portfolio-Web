import { defineRouting } from 'next-intl/routing';
import { createNavigation } from 'next-intl/navigation';

export const routing = defineRouting({
  locales: ['et', 'en'], // Estonian first as primary language
  defaultLocale: 'et', // Estonian as default
  localePrefix: 'always', // Always include locale in URL
});

export const { Link, redirect, usePathname, useRouter } =
  createNavigation(routing);

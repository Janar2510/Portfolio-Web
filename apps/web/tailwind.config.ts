import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Use CSS custom properties - these are fallbacks
        background: 'var(--background)',
        foreground: 'var(--foreground)',
      },
      spacing: {
        // Spacing system using CSS custom properties
        'card-gap': 'var(--card-gap, 1rem)',
      },
    },
  },
  plugins: [],
};

export default config;

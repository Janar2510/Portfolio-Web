import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Portfolio Web',
  description: 'Portfolio, Project Management, and CRM Platform',
};

import { MouseGlow } from '@/components/ui/mouse-glow';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="et" suppressHydrationWarning>
      <body
        className={`${inter.className} min-h-screen relative`}
        suppressHydrationWarning
      >
        <div className="noise-overlay" />
        <MouseGlow />
        <div className="relative z-10 flex flex-col min-h-screen">
          {children}
        </div>
      </body>
    </html>
  );
}

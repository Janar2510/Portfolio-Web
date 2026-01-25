import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Copifolio - Build Your Professional Portfolio',
    description: 'The all-in-one platform for freelancers to showcase work, manage clients, and grow.',
};

import { Navbar } from '@/components/landing/Navbar';
import { Footer } from '@/components/landing/Footer';

export default function LandingLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex min-h-screen flex-col bg-background text-foreground overflow-x-hidden">
            <Navbar />
            <main className="flex-1 selection:bg-teal-100 selection:text-teal-900 pt-20 md:pt-24">
                {children}
            </main>
            <Footer />
        </div>
    );
}

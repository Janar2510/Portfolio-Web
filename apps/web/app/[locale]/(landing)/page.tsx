import { Hero } from '@/components/landing/hero/Hero';
import { FeaturesSection } from '@/components/landing/features/FeaturesSection';
import { HowItWorksSection } from '@/components/landing/how-it-works/HowItWorksSection';
import { PortfolioShowcase } from '@/components/landing/showcase/PortfolioShowcase';
import { PricingSection } from '@/components/landing/pricing/PricingSection';
import { TestimonialsSection } from '@/components/landing/testimonials/TestimonialsSection';
import { FAQSection } from '@/components/landing/faq/FAQSection';
import { CTASection } from '@/components/landing/cta/CTASection';

export default function LandingPage() {
    return (
        <>
            <Hero />
            <FeaturesSection />
            <HowItWorksSection />
            <PortfolioShowcase />
            <PricingSection />
            <TestimonialsSection />
            <FAQSection />
            <CTASection />
        </>
    );
}

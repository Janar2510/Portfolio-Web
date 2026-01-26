import { Hero } from '@/components/landing/hero/Hero';
import { FeaturesSection } from '@/components/landing/features/FeaturesSection';
import { HowItWorksSection } from '@/components/landing/how-it-works/HowItWorksSection';
import { PortfolioShowcase } from '@/components/landing/showcase/PortfolioShowcase';
import { PricingSection } from '@/components/landing/pricing/PricingSection';
import { TestimonialsSection } from '@/components/landing/testimonials/TestimonialsSection';
import { FAQSection } from '@/components/landing/faq/FAQSection';
import { CTASection } from '@/components/landing/cta/CTASection';
import { StructuredData } from '@/components/seo/StructuredData';
import {
  generateSoftwareApplicationJSONLD,
  generateOrganizationJSONLD,
} from '@/lib/seo/structured-data';

export default async function LandingPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  return (
    <>
      <StructuredData data={generateSoftwareApplicationJSONLD(locale)} />
      <StructuredData data={generateOrganizationJSONLD()} />
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

import { HeroBackground } from './HeroBackground';
import { HeroContent } from './HeroContent';

export function Hero() {
  return (
    <section className="relative min-h-[90vh] flex items-center overflow-hidden">
      <HeroBackground />
      <HeroContent />
    </section>
  );
}

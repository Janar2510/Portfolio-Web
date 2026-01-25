// import { HeroBackground } from './HeroBackground';
import Beams from './Beams';
import { HeroContent } from './HeroContent';

export function Hero() {
    return (
        <section className="relative min-h-[90vh] flex items-center overflow-hidden bg-black">
            <div className="absolute inset-0 w-full h-full">
                <Beams
                    beamWidth={0.8}
                    beamHeight={13}
                    beamNumber={40}
                    lightColor="#94e3fe"
                    speed={2}
                    noiseIntensity={1.75}
                    scale={0.2}
                    rotation={30}
                />
            </div>
            <HeroContent />
        </section>
    );
}

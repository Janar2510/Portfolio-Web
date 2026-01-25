
import React from 'react';
import { ArrowRight, MousePointer2 } from 'lucide-react';

const Hero: React.FC = () => {
  return (
    <div className="relative h-screen flex items-center justify-center overflow-hidden">
      {/* Abstract Background Decoration */}
      <div className="absolute top-0 left-0 w-full h-full z-0 opacity-20 pointer-events-none">
        <div className="absolute top-1/4 -left-20 w-96 h-96 bg-indigo-600 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-1/4 -right-20 w-[500px] h-[500px] bg-purple-600 rounded-full blur-[150px]"></div>
      </div>

      {/* Background Image Overlay */}
      <div className="absolute inset-0 z-[-1]">
        <img 
          src="https://images.unsplash.com/photo-1549490349-8643362247b5?auto=format&fit=crop&q=80&w=2000" 
          alt="Art background" 
          className="w-full h-full object-cover opacity-30 grayscale"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/20 to-black"></div>
      </div>

      <div className="container mx-auto px-6 relative z-10 text-center">
        <span className="inline-block px-4 py-1.5 mb-6 text-xs font-bold tracking-[0.3em] uppercase border border-indigo-500/30 bg-indigo-500/10 text-indigo-400 rounded-full animate-pulse">
          Digital Surrealism Artist
        </span>
        
        <h1 className="text-6xl md:text-8xl lg:text-9xl font-serif font-bold text-white mb-8 leading-none tracking-tighter">
          Capturing the <br /> 
          <span className="italic text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">Unseen Realm</span>
        </h1>

        <p className="max-w-2xl mx-auto text-lg md:text-xl text-slate-400 mb-12 font-light leading-relaxed">
          Exploring the intersection of human emotion and digital abstraction through immersive visual experiences that challenge perception.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
          <a 
            href="#work" 
            className="group relative px-8 py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-full overflow-hidden transition-all duration-300 shadow-xl shadow-indigo-600/20"
          >
            <span className="relative z-10 flex items-center gap-2">
              Explore Gallery <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </span>
          </a>
          <a 
            href="#contact" 
            className="px-8 py-4 border border-white/20 hover:border-indigo-400/50 hover:bg-white/5 text-white font-bold rounded-full transition-all duration-300"
          >
            Start a Project
          </a>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 text-white/40 flex flex-col items-center gap-2 animate-bounce">
        <span className="text-[10px] uppercase tracking-widest font-bold">Scroll</span>
        <MousePointer2 size={20} />
      </div>
    </div>
  );
};

export default Hero;

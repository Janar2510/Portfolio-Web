
import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import Services from './components/Services';
import WorkGallery from './components/WorkGallery';
import Contact from './components/Contact';
import Footer from './components/Footer';
import AIChatAssistant from './components/AIChatAssistant';

const App: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-[#050505] text-slate-200 selection:bg-indigo-500/30">
      <Header isScrolled={isScrolled} />
      
      <main>
        <section id="home">
          <Hero />
        </section>
        
        <section id="services">
          <Services />
        </section>
        
        <section id="work">
          <WorkGallery />
        </section>
        
        <section id="contact">
          <Contact />
        </section>
      </main>

      <Footer />
      <AIChatAssistant />
    </div>
  );
};

export default App;

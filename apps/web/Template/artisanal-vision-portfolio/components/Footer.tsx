import React from 'react';
import { Instagram, Twitter, Linkedin, Facebook, ArrowUp } from 'lucide-react';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-black border-t border-white/5 py-20">
      <div className="container mx-auto px-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-16">
          <div>
            <a
              href="#home"
              className="text-3xl font-serif font-bold text-white mb-4 block tracking-tighter"
            >
              ELENA<span className="text-indigo-500">.</span>VANCE
            </a>
            <p className="text-slate-500 max-w-xs text-sm">
              Exploring the boundaries of visual expression and digital
              surrealism through a lens of human emotion.
            </p>
          </div>

          <div className="flex space-x-6 mt-10 md:mt-0">
            <a
              href="#"
              className="w-12 h-12 bg-white/5 hover:bg-indigo-600 hover:text-white transition-all duration-300 rounded-full flex items-center justify-center text-slate-400"
            >
              <Instagram size={20} />
            </a>
            <a
              href="#"
              className="w-12 h-12 bg-white/5 hover:bg-indigo-600 hover:text-white transition-all duration-300 rounded-full flex items-center justify-center text-slate-400"
            >
              <Twitter size={20} />
            </a>
            <a
              href="#"
              className="w-12 h-12 bg-white/5 hover:bg-indigo-600 hover:text-white transition-all duration-300 rounded-full flex items-center justify-center text-slate-400"
            >
              <Linkedin size={20} />
            </a>
            <a
              href="#"
              className="w-12 h-12 bg-white/5 hover:bg-indigo-600 hover:text-white transition-all duration-300 rounded-full flex items-center justify-center text-slate-400"
            >
              <Facebook size={20} />
            </a>
          </div>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-center pt-8 border-t border-white/5 gap-8">
          <p className="text-slate-500 text-sm">
            © {currentYear} Elena Vance. All rights reserved. Crafted with
            passion and code.
          </p>

          <div className="flex space-x-8 text-xs font-bold uppercase tracking-widest text-slate-500">
            <a href="#" className="hover:text-indigo-400 transition-colors">
              Privacy Policy
            </a>
            <a href="#" className="hover:text-indigo-400 transition-colors">
              Terms of Service
            </a>
            <a href="#" className="hover:text-indigo-400 transition-colors">
              Cookie Policy
            </a>
          </div>

          <button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="flex items-center gap-2 text-indigo-400 font-bold text-xs uppercase tracking-widest hover:text-white transition-colors"
          >
            Back to top <ArrowUp size={16} />
          </button>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

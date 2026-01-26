import React, { useState } from 'react';
import { Menu, X, Instagram, Twitter, Linkedin } from 'lucide-react';

interface HeaderProps {
  isScrolled: boolean;
}

const Header: React.FC<HeaderProps> = ({ isScrolled }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navLinks = [
    { name: 'Home', href: '#home' },
    { name: 'Services', href: '#services' },
    { name: 'My Work', href: '#work' },
    { name: 'Contact', href: '#contact' },
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-black/80 backdrop-blur-md py-4 border-b border-white/10'
          : 'bg-transparent py-6'
      }`}
    >
      <div className="container mx-auto px-6 flex justify-between items-center">
        <a
          href="#home"
          className="text-2xl font-serif font-bold tracking-tighter text-white"
        >
          ELENA<span className="text-indigo-500">.</span>VANCE
        </a>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center space-x-8">
          {navLinks.map(link => (
            <a
              key={link.name}
              href={link.href}
              className="text-sm uppercase tracking-widest font-medium hover:text-indigo-400 transition-colors"
            >
              {link.name}
            </a>
          ))}
        </nav>

        {/* Socials Desktop */}
        <div className="hidden md:flex items-center space-x-4">
          <a href="#" className="hover:text-indigo-400 transition-colors">
            <Instagram size={20} />
          </a>
          <a href="#" className="hover:text-indigo-400 transition-colors">
            <Twitter size={20} />
          </a>
          <a href="#" className="hover:text-indigo-400 transition-colors">
            <Linkedin size={20} />
          </a>
        </div>

        {/* Mobile Toggle */}
        <button
          className="md:hidden text-white"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {/* Mobile Menu */}
      <div
        className={`md:hidden absolute top-full left-0 right-0 bg-black border-b border-white/10 transition-all duration-300 overflow-hidden ${
          isMenuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <nav className="flex flex-col p-6 space-y-4">
          {navLinks.map(link => (
            <a
              key={link.name}
              href={link.href}
              className="text-lg uppercase tracking-widest font-medium"
              onClick={() => setIsMenuOpen(false)}
            >
              {link.name}
            </a>
          ))}
          <div className="flex space-x-6 pt-4 border-t border-white/10">
            <Instagram size={24} />
            <Twitter size={24} />
            <Linkedin size={24} />
          </div>
        </nav>
      </div>
    </header>
  );
};

export default Header;

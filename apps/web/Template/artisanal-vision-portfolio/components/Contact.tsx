
import React, { useState } from 'react';
import { Send, MapPin, Mail, Phone } from 'lucide-react';

const Contact: React.FC = () => {
  const [formState, setFormState] = useState({ name: '', email: '', message: '' });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert("Thank you! I'll get back to you soon.");
    setFormState({ name: '', email: '', message: '' });
  };

  return (
    <div className="py-32 bg-[#080808]">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-start">
          <div>
            <h2 className="text-sm font-bold tracking-[0.4em] uppercase text-indigo-500 mb-4">Get In Touch</h2>
            <h3 className="text-5xl md:text-6xl font-serif font-bold text-white mb-8">Let's Create <br /> Something Epic</h3>
            <p className="text-slate-400 text-lg mb-12 leading-relaxed">
              Available for collaborations, commissions, and speaking engagements worldwide. Whether you have a specific project in mind or just want to say hello, my inbox is always open.
            </p>

            <div className="space-y-6">
              <div className="flex items-center gap-6">
                <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center text-indigo-400">
                  <Mail size={20} />
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-slate-500">Email Me</p>
                  <p className="text-white font-medium">hello@elenavance.art</p>
                </div>
              </div>
              <div className="flex items-center gap-6">
                <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center text-indigo-400">
                  <MapPin size={20} />
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-slate-500">Location</p>
                  <p className="text-white font-medium">Oslo, Norway (Remote Worldwide)</p>
                </div>
              </div>
              <div className="flex items-center gap-6">
                <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center text-indigo-400">
                  <Phone size={20} />
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-slate-500">Let's Talk</p>
                  <p className="text-white font-medium">+47 123 45 678</p>
                </div>
              </div>
            </div>
          </div>

          <form 
            onSubmit={handleSubmit}
            className="p-10 bg-white/5 border border-white/10 rounded-[2.5rem] backdrop-blur-sm"
          >
            <div className="space-y-6">
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">Your Name</label>
                <input 
                  type="text" 
                  value={formState.name}
                  onChange={(e) => setFormState({...formState, name: e.target.value})}
                  required
                  placeholder="John Doe"
                  className="w-full bg-black/40 border border-white/10 rounded-2xl px-6 py-4 focus:outline-none focus:border-indigo-500/50 transition-colors text-white"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">Email Address</label>
                <input 
                  type="email" 
                  value={formState.email}
                  onChange={(e) => setFormState({...formState, email: e.target.value})}
                  required
                  placeholder="john@example.com"
                  className="w-full bg-black/40 border border-white/10 rounded-2xl px-6 py-4 focus:outline-none focus:border-indigo-500/50 transition-colors text-white"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">Message</label>
                <textarea 
                  rows={5}
                  value={formState.message}
                  onChange={(e) => setFormState({...formState, message: e.target.value})}
                  required
                  placeholder="Tell me about your project..."
                  className="w-full bg-black/40 border border-white/10 rounded-2xl px-6 py-4 focus:outline-none focus:border-indigo-500/50 transition-colors text-white resize-none"
                ></textarea>
              </div>
              <button 
                type="submit"
                className="w-full py-5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-2xl transition-all duration-300 flex items-center justify-center gap-2 group shadow-xl shadow-indigo-600/20"
              >
                Send Message <Send size={18} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Contact;

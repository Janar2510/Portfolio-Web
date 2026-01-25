
import React from 'react';
import { Palette, Layers, Monitor, Sparkles } from 'lucide-react';
import { Service } from '../types';

const Services: React.FC = () => {
  const services: Service[] = [
    {
      title: "Digital Art Commissions",
      description: "Custom character designs, environmental concept art, and unique digital masterpieces tailored to your vision.",
      icon: <Palette className="text-indigo-400" size={32} />
    },
    {
      title: "UI/UX Visual Design",
      description: "Infusing creative artistic flair into digital products to create memorable and intuitive user experiences.",
      icon: <Monitor className="text-purple-400" size={32} />
    },
    {
      title: "Brand Art Direction",
      description: "Developing cohesive visual languages for brands that want to stand out with an artistic edge.",
      icon: <Layers className="text-pink-400" size={32} />
    },
    {
      title: "NFT Collections",
      description: "End-to-end creation and curation of unique digital asset collections for the modern collector.",
      icon: <Sparkles className="text-indigo-300" size={32} />
    }
  ];

  return (
    <div className="py-32 bg-[#080808]">
      <div className="container mx-auto px-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-20">
          <div>
            <h2 className="text-sm font-bold tracking-[0.4em] uppercase text-indigo-500 mb-4">What I Do</h2>
            <h3 className="text-4xl md:text-5xl font-serif font-bold text-white">Creative Services</h3>
          </div>
          <p className="max-w-md text-slate-400 mt-6 md:mt-0 leading-relaxed">
            Blending traditional techniques with cutting-edge technology to deliver visual excellence across multiple mediums.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {services.map((service, idx) => (
            <div 
              key={idx}
              className="group p-10 bg-white/5 border border-white/10 rounded-3xl hover:bg-white/10 transition-all duration-500 hover:-translate-y-2"
            >
              <div className="mb-6 p-4 bg-black/40 rounded-2xl w-fit group-hover:scale-110 transition-transform">
                {service.icon}
              </div>
              <h4 className="text-xl font-bold text-white mb-4">{service.title}</h4>
              <p className="text-slate-400 leading-relaxed text-sm">
                {service.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Services;

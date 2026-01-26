import React, { useState } from 'react';
import { Project } from '../types';

const WorkGallery: React.FC = () => {
  const categories = ['All', 'Surrealism', 'Abstract', 'Portrait'];
  const [activeCategory, setActiveCategory] = useState('All');

  const projects: Project[] = [
    {
      id: '1',
      title: 'Neon Dreams',
      category: 'Surrealism',
      image: 'https://picsum.photos/id/1015/800/1000',
      description: 'A dive into futuristic cityscapes.',
    },
    {
      id: '2',
      title: 'Ocean Whisper',
      category: 'Abstract',
      image: 'https://picsum.photos/id/1041/800/1000',
      description: 'Capturing the movement of water.',
    },
    {
      id: '3',
      title: 'Soul Mirror',
      category: 'Portrait',
      image: 'https://picsum.photos/id/1027/800/1000',
      description: 'Emotions frozen in time.',
    },
    {
      id: '4',
      title: 'Lunar Path',
      category: 'Surrealism',
      image: 'https://picsum.photos/id/1039/800/1000',
      description: 'Where moonlight meets the forest.',
    },
    {
      id: '5',
      title: 'Ethereal Flow',
      category: 'Abstract',
      image: 'https://picsum.photos/id/1042/800/1000',
      description: 'Organic shapes and vibrant colors.',
    },
    {
      id: '6',
      title: 'Urban Echo',
      category: 'Abstract',
      image: 'https://picsum.photos/id/1054/800/1000',
      description: 'The rhythm of the city.',
    },
  ];

  const filteredProjects =
    activeCategory === 'All'
      ? projects
      : projects.filter(p => p.category === activeCategory);

  return (
    <div className="py-32 bg-black">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-sm font-bold tracking-[0.4em] uppercase text-indigo-500 mb-4">
            Portfolio
          </h2>
          <h3 className="text-4xl md:text-5xl font-serif font-bold text-white mb-10">
            Selected Works
          </h3>

          <div className="flex flex-wrap justify-center gap-4 mb-16">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-6 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                  activeCategory === cat
                    ? 'bg-indigo-600 text-white'
                    : 'bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredProjects.map(project => (
            <div
              key={project.id}
              className="group relative overflow-hidden rounded-3xl bg-slate-900 aspect-[4/5]"
            >
              <img
                src={project.image}
                alt={project.title}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 p-8 flex flex-col justify-end">
                <span className="text-indigo-400 text-xs font-bold uppercase tracking-widest mb-2">
                  {project.category}
                </span>
                <h4 className="text-2xl font-bold text-white mb-2">
                  {project.title}
                </h4>
                <p className="text-slate-300 text-sm mb-4 line-clamp-2">
                  {project.description}
                </p>
                <button className="w-fit text-sm font-bold border-b-2 border-indigo-500 pb-1 hover:border-white transition-colors">
                  View Case Study
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-20 text-center">
          <button className="px-10 py-4 bg-transparent border-2 border-indigo-600 hover:bg-indigo-600 text-white font-bold rounded-full transition-all duration-300">
            View All Projects
          </button>
        </div>
      </div>
    </div>
  );
};

export default WorkGallery;

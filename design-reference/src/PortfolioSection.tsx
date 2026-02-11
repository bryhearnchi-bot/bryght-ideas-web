import React from 'react';
import { motion } from 'framer-motion';

const projects = [
  {
    title: "Lumina AI",
    category: "Mobile App",
    image: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=800"
  },
  {
    title: "Vault Crypto",
    category: "Fintech Platform",
    image: "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?auto=format&fit=crop&q=80&w=800"
  },
  {
    title: "Zenith OS",
    category: "System Interface",
    image: "https://images.unsplash.com/photo-1614850523296-e8c041de4398?auto=format&fit=crop&q=80&w=800"
  }
];

export function PortfolioSection() {
  return (
    <section id="portfolio" className="py-24 px-6">
      <div className="max-w-[1152px] mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
          <div>
            <h2 className="text-4xl md:text-5xl font-serif font-bold mb-4">Selected Work</h2>
            <p className="text-muted-foreground text-lg max-w-xl">
              A curated collection of digital products we've helped bring to life.
            </p>
          </div>
          <button className="text-primary font-bold hover:underline flex items-center gap-2">
            See all projects
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {projects.map((project, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className="group cursor-pointer"
            >
              <div className="relative aspect-[4/5] rounded-3xl overflow-hidden mb-6">
                <img
                  src={project.image}
                  alt={project.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-8">
                  <span className="text-white font-bold text-lg">View Details</span>
                </div>
              </div>
              <h3 className="text-2xl font-bold mb-1">{project.title}</h3>
              <p className="text-muted-foreground text-sm uppercase tracking-widest">{project.category}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

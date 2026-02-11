import React from 'react';
import { motion } from 'framer-motion';
import { Smartphone, Code, Palette, Zap } from 'lucide-react';

const services = [
  {
    icon: <Smartphone className="text-primary" />,
    title: "Mobile Development",
    description: "Native iOS and Android apps with a focus on fluid animations and performance."
  },
  {
    icon: <Code className="text-accent" />,
    title: "Web Platforms",
    description: "High-scale React applications with cinematic design and rock-solid architecture."
  },
  {
    icon: <Palette className="text-primary" />,
    title: "Product Design",
    description: "UI/UX design that tells a story and guides users towards meaningful actions."
  },
  {
    icon: <Zap className="text-accent" />,
    title: "Optimization",
    description: "Turning slow, clunky interfaces into lightning-fast, delightful experiences."
  }
];

export function ServicesSection() {
  return (
    <section id="services" className="py-24 px-6 bg-muted/30">
      <div className="max-w-[1152px] mx-auto">
        <div className="mb-16">
          <h2 className="text-4xl md:text-5xl font-serif font-bold mb-4">Our Services</h2>
          <p className="text-muted-foreground text-lg max-w-xl">
            We specialize in bridging the gap between bold design and industrial-grade engineering.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {services.map((service, idx) => (
            <motion.div
              key={idx}
              whileHover={{ y: -5 }}
              className="p-8 rounded-2xl border border-border bg-background hover:shadow-2xl hover:shadow-primary/5 transition-all"
            >
              <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center mb-6">
                {service.icon}
              </div>
              <h3 className="text-xl font-bold mb-3">{service.title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                {service.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

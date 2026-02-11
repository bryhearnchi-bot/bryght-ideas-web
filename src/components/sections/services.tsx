"use client";

import { motion } from "framer-motion";
import { Smartphone, Globe, Brain, Lightbulb } from "lucide-react";
import { SectionWrapper } from "@/components/section-wrapper";
import { siteConfig } from "@/config/site";

const iconMap: Record<string, React.ElementType> = {
  Smartphone,
  Globe,
  Brain,
  Lightbulb,
};

export function Services() {
  return (
    <SectionWrapper id="services">
      <div className="text-center mb-16">
        <span className="text-xs font-medium tracking-widest uppercase text-gold">
          What We Do
        </span>
        <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold mt-3 tracking-tight">
          Comprehensive Tech Solutions
        </h2>
        <p className="text-muted-foreground mt-4 max-w-xl mx-auto text-lg">
          From concept to launch, we handle every aspect of building exceptional
          digital products.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {siteConfig.services.map((service, i) => {
          const Icon = iconMap[service.icon];
          return (
            <motion.div
              key={service.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="group card-glow rounded-lg bg-card/50 p-8 backdrop-blur-sm"
            >
              <div className="flex items-start gap-5">
                <div className="shrink-0 w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                  {Icon && <Icon className="h-5 w-5 text-primary" />}
                </div>
                <div>
                  <h3 className="font-display text-lg font-semibold mb-2">
                    {service.title}
                  </h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {service.description}
                  </p>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </SectionWrapper>
  );
}

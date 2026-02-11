"use client";

import { motion } from "framer-motion";
import { Smartphone, Globe, Brain, Lightbulb } from "lucide-react";
import { siteConfig } from "@/config/site";

const iconMap: Record<string, React.ElementType> = {
  Smartphone,
  Globe,
  Brain,
  Lightbulb,
};

const iconColorMap: Record<string, string> = {
  Smartphone: "text-primary",
  Globe: "text-gold",
  Brain: "text-primary",
  Lightbulb: "text-gold",
};

export function Services() {
  return (
    <section id="services" className="py-24 px-6 bg-muted/30">
      <div className="max-w-[1152px] mx-auto">
        <div className="mb-16">
          <h2 className="text-4xl md:text-5xl font-serif font-bold mb-4">
            Our Services
          </h2>
          <p className="text-muted-foreground text-lg max-w-xl">
            From concept to launch, we handle every aspect of building
            exceptional digital products.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {siteConfig.services.map((service, idx) => {
            const Icon = iconMap[service.icon];
            const colorClass = iconColorMap[service.icon] || "text-primary";
            return (
              <motion.div
                key={service.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                whileHover={{ y: -5 }}
                className="p-8 rounded-2xl border border-border bg-background hover:shadow-2xl hover:shadow-primary/5 transition-all"
              >
                <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center mb-6">
                  {Icon && <Icon className={`h-5 w-5 ${colorClass}`} />}
                </div>
                <h3 className="text-xl font-bold mb-3">{service.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {service.description}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

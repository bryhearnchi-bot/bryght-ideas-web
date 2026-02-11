"use client";

import { motion } from "framer-motion";
import { Plane, Theater, Ship, Sparkles } from "lucide-react";
import { siteConfig } from "@/config/site";

const iconMap: Record<string, React.ElementType> = {
  Plane,
  Drama: Theater,
  Ship,
  Sparkles,
};

export function Portfolio() {
  return (
    <section id="portfolio" className="py-24 px-6">
      <div className="max-w-[1152px] mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
          <div>
            <h2 className="text-4xl md:text-5xl font-serif font-bold mb-4">
              Selected Work
            </h2>
            <p className="text-muted-foreground text-lg max-w-xl">
              We don&apos;t just build for clients — we build our own apps too.
              Here&apos;s what&apos;s in the lab.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {siteConfig.apps.map((app, idx) => {
            const Icon = iconMap[app.icon];
            return (
              <motion.div
                key={app.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="group cursor-pointer"
              >
                {/* Gradient placeholder card with icon */}
                <div
                  className="relative aspect-[4/5] rounded-3xl overflow-hidden mb-6 flex items-center justify-center"
                  style={{
                    background: `linear-gradient(135deg, ${app.color}22, ${app.color}44, ${app.color}11)`,
                  }}
                >
                  <div
                    className="absolute inset-0 opacity-20"
                    style={{
                      background: `radial-gradient(circle at 30% 40%, ${app.color}40, transparent 70%)`,
                    }}
                  />
                  {Icon && (
                    <Icon
                      className="h-16 w-16 transition-transform duration-700 group-hover:scale-110"
                      style={{ color: app.color }}
                    />
                  )}
                  <div className="absolute top-4 right-4">
                    <span
                      className="text-[10px] tracking-wider uppercase font-medium px-3 py-1 rounded-full"
                      style={{
                        backgroundColor: `${app.color}20`,
                        color: app.color,
                      }}
                    >
                      {app.status}
                    </span>
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-8">
                    <span className="text-white font-bold text-lg">
                      {app.description}
                    </span>
                  </div>
                </div>
                <h3 className="text-2xl font-bold mb-1">{app.name}</h3>
                <p className="text-muted-foreground text-sm uppercase tracking-widest">
                  {app.category}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

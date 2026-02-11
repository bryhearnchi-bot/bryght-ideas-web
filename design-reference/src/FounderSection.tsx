import React from 'react';
import { Quote } from 'lucide-react';

export function FounderSection() {
  return (
    <section id="founder" className="py-24 px-6">
      <div className="max-w-[1152px] mx-auto flex flex-col md:flex-row items-center gap-16">
        <div className="w-full md:w-1/2">
          <div className="relative">
            <div className="absolute inset-0 bg-primary/10 rounded-3xl rotate-3" />
            <img
              src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=800"
              alt="Founder"
              className="relative rounded-3xl w-full aspect-[4/5] object-cover"
            />
          </div>
        </div>
        <div className="w-full md:w-1/2">
          <Quote size={48} className="text-primary/20 mb-8" />
          <h2 className="text-3xl md:text-4xl font-serif italic font-medium leading-tight mb-8">
            "We believe that every interaction should be an opportunity to delight. Technical excellence is the baseline; emotional connection is the goal."
          </h2>
          <div>
            <p className="font-bold text-xl m-0">Julian Bryght</p>
            <p className="text-muted-foreground m-0">Founder & Creative Director</p>
          </div>
        </div>
      </div>
    </section>
  );
}

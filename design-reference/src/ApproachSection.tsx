import React from 'react';

const steps = [
  {
    num: "01",
    title: "Discovery",
    text: "We dive deep into your business goals, user needs, and technical constraints."
  },
  {
    num: "02",
    title: "Strategy",
    text: "Drafting a roadmap that prioritizes impact and defines the visual language."
  },
  {
    num: "03",
    title: "Execution",
    text: "Crafting the product with rapid iterations and high-fidelity prototypes."
  },
  {
    num: "04",
    title: "Launch",
    text: "Meticulous testing and seamless deployment to your audience."
  }
];

export function ApproachSection() {
  return (
    <section id="approach" className="py-24 px-6 bg-primary/5">
      <div className="max-w-[1152px] mx-auto">
        <div className="text-center mb-20">
          <h2 className="text-4xl md:text-5xl font-serif font-bold mb-4">Our Approach</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Design is not just how it looks. It's how it works, how it feels, and how it grows.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {steps.map((step, idx) => (
            <div key={idx} className="relative">
              <span className="text-7xl font-serif font-black text-foreground/5 absolute -top-10 -left-4 select-none">
                {step.num}
              </span>
              <h3 className="text-xl font-bold mb-4 relative z-10">{step.title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed relative z-10">
                {step.text}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

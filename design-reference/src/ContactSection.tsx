import React from 'react';
import { Mail, MessageCircle, ArrowUpRight } from 'lucide-react';

export function ContactSection() {
  return (
    <section id="contact" className="py-24 px-6 border-t border-border/40">
      <div className="max-w-[1152px] mx-auto text-center">
        <h2 className="text-5xl md:text-7xl font-serif font-bold mb-8">Ready to shine?</h2>
        <p className="text-muted-foreground text-xl mb-12 max-w-2xl mx-auto">
          Let's discuss how we can bring your next bright idea to life.
        </p>

        <div className="flex flex-col md:flex-row items-center justify-center gap-8 mb-16">
          <a
            href="mailto:hello@bryghtideas.co"
            className="flex items-center gap-4 p-6 rounded-2xl bg-muted/50 border border-border hover:border-primary transition-all w-full md:w-auto"
          >
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
              <Mail size={24} />
            </div>
            <div className="text-left">
              <p className="text-xs text-muted-foreground m-0">Email us</p>
              <p className="font-bold m-0">hello@bryghtideas.co</p>
            </div>
          </a>
          <a
            href="https://wa.me/..."
            className="flex items-center gap-4 p-6 rounded-2xl bg-muted/50 border border-border hover:border-accent transition-all w-full md:w-auto"
          >
            <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center text-accent">
              <MessageCircle size={24} />
            </div>
            <div className="text-left">
              <p className="text-xs text-muted-foreground m-0">Chat with us</p>
              <p className="font-bold m-0">+1 (312) 555-BRYT</p>
            </div>
          </a>
        </div>

        <button className="inline-flex items-center gap-2 group text-2xl font-bold">
          Start your inquiry <ArrowUpRight className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
        </button>
      </div>
    </section>
  );
}

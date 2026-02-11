/**
 * FooterSection - Site Footer
 * Glass footer with logo, nav links, copyright, and location.
 */
import React from 'react';
import { BryghtLogo } from './BryghtLogo';

export function FooterSection() {
  return (
    <footer className="border-t border-border/40 bg-background/80 backdrop-blur">
      <div className="max-w-[1152px] mx-auto px-6 py-16">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
          <div>
            <BryghtLogo />
            <p className="text-muted-foreground text-sm max-w-xs mt-3 mb-0">
              Building the future, one bright idea at a time.
            </p>
          </div>
          <div className="flex items-center gap-8">
            <a href="#services" className="text-muted-foreground text-sm hover:text-foreground transition-colors">
              Services
            </a>
            <a href="#portfolio" className="text-muted-foreground text-sm hover:text-foreground transition-colors">
              Portfolio
            </a>
            <a href="#contact" className="text-muted-foreground text-sm hover:text-foreground transition-colors">
              Contact
            </a>
          </div>
        </div>
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 mt-12 pt-8 border-t border-foreground/[0.04]">
          <p className="text-muted-foreground/60 text-xs m-0">
            © 2026 Bryght Ideas LLC. All rights reserved.
          </p>
          <p className="text-muted-foreground/40 text-xs m-0">
            Chicago, Illinois
          </p>
        </div>
      </div>
    </footer>
  );
}

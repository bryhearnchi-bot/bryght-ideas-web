"use client";

import { Logo } from "@/components/logo";
import { siteConfig } from "@/config/site";

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-border/40 bg-background/80 backdrop-blur">
      <div className="max-w-[1152px] mx-auto px-6 py-16">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
          <div>
            <Logo />
            <p className="text-muted-foreground text-sm max-w-xs mt-3 mb-0">
              {siteConfig.footer.tagline}
            </p>
          </div>
          <div className="flex items-center gap-8">
            {siteConfig.footer.links.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-muted-foreground text-sm hover:text-foreground transition-colors"
              >
                {link.label}
              </a>
            ))}
          </div>
        </div>
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 mt-12 pt-8 border-t border-foreground/[0.04]">
          <p className="text-muted-foreground/60 text-xs m-0">
            &copy; {year} {siteConfig.legalName}. All rights reserved.
          </p>
          <p className="text-muted-foreground/40 text-xs m-0">
            {siteConfig.location}
          </p>
        </div>
      </div>
    </footer>
  );
}

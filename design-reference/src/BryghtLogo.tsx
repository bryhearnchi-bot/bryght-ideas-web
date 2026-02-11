import React from 'react';

export function BryghtLogo() {
  return (
    <div className="flex items-center gap-2 group cursor-pointer">
      <div className="relative w-8 h-8 flex items-center justify-center">
        <svg viewBox="0 0 24 24" className="w-full h-full fill-none stroke-[1.5] stroke-primary">
          <path d="M12 2C7.03 2 3 6.03 3 11c0 2.22 1.21 4.15 3 5.19V19a1 1 0 001 1h10a1 1 0 001-1v-2.81c1.79-1.04 3-2.97 3-5.19 0-4.97-4.03-9-9-9z" />
          <path d="M9 20v1a1 1 0 001 1h4a1 1 0 001-1v-1" />
          <path d="M12 7v4m-2 0h4" className="stroke-accent" />
        </svg>
        <div className="absolute inset-0 bg-primary/20 blur-lg rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>
      <span className="font-serif text-xl font-bold tracking-tight text-foreground">
        Bryght<span className="text-primary">Ideas</span>
      </span>
    </div>
  );
}

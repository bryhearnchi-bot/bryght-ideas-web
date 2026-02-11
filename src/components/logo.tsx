"use client";

import Image from "next/image";

export function Logo({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <Image
        src="/logo-lightbulb.png"
        alt="BRYght Ideas logo"
        width={36}
        height={36}
        className="shrink-0"
      />
      <span className="font-serif text-xl font-bold tracking-tight">
        <span className="text-primary">BRY</span>
        <span className="text-foreground">ght</span>{" "}
        <span className="text-foreground/90">Ideas</span>
      </span>
    </div>
  );
}

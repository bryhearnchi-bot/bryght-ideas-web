"use client";

import Image from "next/image";

export function Logo({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <Image
        src="/logo-lightbulb.png"
        alt="BRYght Ideas logo"
        width={28}
        height={42}
        className="shrink-0 object-contain"
      />
      <span className="display text-[26px] tracking-[-0.02em]">
        BRYght Ideas
      </span>
    </div>
  );
}

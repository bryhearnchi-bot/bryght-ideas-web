"use client";

export function Logo({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <svg
        width="36"
        height="36"
        viewBox="0 0 36 36"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="shrink-0"
      >
        {/* Lightbulb shape with B/I hint */}
        <defs>
          <linearGradient id="logo-gradient" x1="0" y1="0" x2="36" y2="36">
            <stop offset="0%" stopColor="#2563eb" />
            <stop offset="60%" stopColor="#7c3aed" />
            <stop offset="100%" stopColor="#2563eb" />
          </linearGradient>
          <linearGradient id="spark-gradient" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#d4a843" />
            <stop offset="100%" stopColor="#e8c45a" />
          </linearGradient>
        </defs>
        {/* Outer glow circle */}
        <circle cx="18" cy="16" r="12" fill="url(#logo-gradient)" opacity="0.15" />
        {/* Main bulb shape */}
        <path
          d="M18 4C12.48 4 8 8.48 8 14c0 3.64 1.94 6.82 4.84 8.58V26a2 2 0 002 2h6.32a2 2 0 002-2v-3.42C26.06 20.82 28 17.64 28 14c0-5.52-4.48-10-10-10z"
          fill="url(#logo-gradient)"
        />
        {/* Filament / spark */}
        <path
          d="M15 30h6M16 32h4"
          stroke="url(#logo-gradient)"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        {/* BI letters stylized inside bulb */}
        <text
          x="18"
          y="18"
          textAnchor="middle"
          dominantBaseline="central"
          fill="white"
          fontFamily="sans-serif"
          fontWeight="700"
          fontSize="10"
          letterSpacing="-0.5"
        >
          BI
        </text>
        {/* Gold spark accent */}
        <path
          d="M26 6l1.5-2M28.5 8.5l2-0.5M27 11l2 1"
          stroke="url(#spark-gradient)"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </svg>
      <span className="font-display text-xl font-bold tracking-tight">
        <span className="text-gradient-blue">Bryght</span>{" "}
        <span className="text-foreground/90">Ideas</span>
      </span>
    </div>
  );
}

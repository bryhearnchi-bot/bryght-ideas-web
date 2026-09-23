import Link from "next/link";

const VERSIONS = [
  { label: "Live", href: "/" },
  { label: "3D·1", href: "/v1" },
  { label: "3D·2", href: "/v2" },
  { label: "3D·3", href: "/v3" },
  { label: "3D·4", href: "/v4" },
];

export function VersionSwitcher({ current }: { current: string }) {
  return (
    <nav
      aria-label="Design versions"
      className="f1-switcher fixed z-50 flex items-center gap-0.5 rounded-full bg-black/85 p-1 text-[11px] font-semibold text-offwhite shadow-[0_6px_20px_rgba(0,0,0,0.18)] backdrop-blur"
    >
      {VERSIONS.map((v) => {
        const active = v.href === current;
        return (
          <Link
            key={v.href}
            href={v.href}
            aria-current={active ? "page" : undefined}
            className={`f1-focus rounded-full px-2.5 py-1.5 leading-none transition-colors ${
              active ? "bg-blue-block text-black" : "text-offwhite/70 hover:text-offwhite"
            }`}
          >
            {v.label}
          </Link>
        );
      })}
    </nav>
  );
}

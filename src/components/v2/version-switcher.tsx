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
    <nav aria-label="Design versions" className="o2-switcher">
      {VERSIONS.map((v) => (
        <Link
          key={v.href}
          href={v.href}
          aria-current={v.href === current ? "page" : undefined}
          className="o2-switcher-link"
        >
          {v.label}
        </Link>
      ))}
    </nav>
  );
}

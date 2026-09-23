import type { Metadata } from "next";
import { SignalOrbitPage } from "@/components/v4/signal-orbit-page";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: `Signal Orbit (3D·4) — ${siteConfig.name}`,
  description: siteConfig.description,
};

export default function Page() {
  return <SignalOrbitPage />;
}

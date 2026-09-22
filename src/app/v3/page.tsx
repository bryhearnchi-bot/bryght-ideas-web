import type { Metadata } from "next";
import { SignalPage } from "@/components/v3/signal-page";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: `Signal (3D·3) — ${siteConfig.name}`,
  description: siteConfig.description,
};

export default function Page() {
  return <SignalPage />;
}

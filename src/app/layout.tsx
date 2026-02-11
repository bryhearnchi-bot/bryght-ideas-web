import type { Metadata } from "next";
import { Space_Grotesk, Plus_Jakarta_Sans, DM_Mono } from "next/font/google";
import { Nav } from "@/components/nav";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

const plusJakarta = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
});

const dmMono = DM_Mono({
  variable: "--font-dm-mono",
  subsets: ["latin"],
  weight: ["300", "400", "500"],
});

export const metadata: Metadata = {
  title: "Bryght Ideas LLC — App Development & Technology Consulting",
  description:
    "Chicago-based app development studio and technology consultancy. We build beautiful, AI-powered mobile and web applications.",
  keywords: [
    "app development",
    "technology consulting",
    "Chicago",
    "mobile apps",
    "web apps",
    "AI",
  ],
  openGraph: {
    title: "Bryght Ideas LLC",
    description:
      "App Development & Technology Consulting — Chicago, Illinois",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark scroll-smooth">
      <body
        className={`${spaceGrotesk.variable} ${plusJakarta.variable} ${dmMono.variable} font-sans antialiased`}
      >
        <div className="grain" />
        <Nav />
        <div className="relative z-10">{children}</div>
      </body>
    </html>
  );
}

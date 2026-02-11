/**
 * Bryght Ideas Landing Page - Root Application
 * A premium tech studio landing with cinematic animations,
 * ambient lighting effects, and editorial typography.
 */
import React from 'react';
import { Navbar } from './Navbar';
import { HeroSection } from './HeroSection';
import { ServicesSection } from './ServicesSection';
import { PortfolioSection } from './PortfolioSection';
import { ApproachSection } from './ApproachSection';
import { FounderSection } from './FounderSection';
import { ContactSection } from './ContactSection';
import { FooterSection } from './FooterSection';

export default function App() {
  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary/30" style={{ fontFamily: "'Satoshi', sans-serif" }}>
      {/* SVG gradient defs for logo */}
      <svg width="0" height="0" className="absolute">
        <defs>
          <linearGradient id="logo-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="hsl(var(--primary))" />
            <stop offset="100%" stopColor="#3b82f6" />
          </linearGradient>
          <linearGradient id="spark-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="hsl(var(--primary))" />
            <stop offset="100%" stopColor="#fbbf24" />
          </linearGradient>
        </defs>
      </svg>
      
      <Navbar />
      
      <main className="overflow-hidden">
        <HeroSection />
        <ServicesSection />
        <PortfolioSection />
        <ApproachSection />
        <FounderSection />
        <ContactSection />
      </main>
      
      <FooterSection />
    </div>
  );
}

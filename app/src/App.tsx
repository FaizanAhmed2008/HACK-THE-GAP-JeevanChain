import { useEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import './index.css';
import useLenis from './hooks/useLenis';
import { siteConfig } from './config';

// Sections
import Hero from './sections/Hero';
import BlockchainCube from './sections/BlockchainCube';
import DashboardPreview from './sections/DashboardPreview';
import Features from './sections/Features';
import HowItWorks from './sections/HowItWorks';
import RoleAccess from './sections/RoleAccess';
import Security from './sections/Security';
import Network from './sections/Network';
import CTA from './sections/CTA';
import Footer from './sections/Footer';

gsap.registerPlugin(ScrollTrigger);

function App() {
  // Initialize Lenis smooth scrolling
  useLenis();

  useEffect(() => {
    // Set page title from config
    if (siteConfig.title) {
      document.title = siteConfig.title;
    }

    // Add viewport meta for better mobile experience
    const metaViewport = document.querySelector('meta[name="viewport"]');
    if (metaViewport) {
      metaViewport.setAttribute('content', 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no');
    }

    // Setup global scroll snap for pinned sections
    const setupScrollSnap = () => {
      // Wait for all ScrollTriggers to be created
      setTimeout(() => {
        const pinned = ScrollTrigger.getAll()
          .filter(st => st.vars.pin)
          .sort((a, b) => a.start - b.start);
        
        const maxScroll = ScrollTrigger.maxScroll(window);
        
        if (!maxScroll || pinned.length === 0) return;

        // Build ranges and snap targets from pinned sections
        const pinnedRanges = pinned.map(st => ({
          start: st.start / maxScroll,
          end: (st.end ?? st.start) / maxScroll,
          center: (st.start + ((st.end ?? st.start) - st.start) * 0.5) / maxScroll,
        }));

        // Create global snap
        ScrollTrigger.create({
          snap: {
            snapTo: (value: number) => {
              // Check if within any pinned range (with small buffer)
              const inPinned = pinnedRanges.some(
                r => value >= r.start - 0.02 && value <= r.end + 0.02
              );
              
              if (!inPinned) return value; // Flowing section: free scroll

              // Find nearest pinned center
              const target = pinnedRanges.reduce(
                (closest, r) =>
                  Math.abs(r.center - value) < Math.abs(closest - value)
                    ? r.center
                    : closest,
                pinnedRanges[0]?.center ?? 0
              );

              return target;
            },
            duration: { min: 0.15, max: 0.35 },
            delay: 0,
            ease: 'power2.out',
          },
        });
      }, 100);
    };

    setupScrollSnap();

    return () => {
      ScrollTrigger.getAll().forEach(st => st.kill());
    };
  }, []);

  return (
    <main className="relative w-full min-h-screen bg-void-black overflow-x-hidden">
      {/* Node grid background */}
      <div className="node-grid" />
      
      {/* Grain overlay */}
      <div className="grain-overlay" />

      {/* Hero Section - Immersive landing */}
      <Hero />

      {/* Blockchain Cube Section - 3D showcase */}
      <BlockchainCube />

      {/* Dashboard Preview Section */}
      <DashboardPreview />

      {/* Features Section */}
      <Features />

      {/* How It Works Section */}
      <HowItWorks />

      {/* Role-Based Access Section */}
      <RoleAccess />

      {/* Trust & Security Section */}
      <Security />

      {/* Live Network Section */}
      <Network />

      {/* CTA Section */}
      <CTA />

      {/* Footer Section */}
      <Footer />
    </main>
  );
}

export default App;

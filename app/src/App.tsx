import { useEffect, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import './index.css';

// Auth
import { AuthProvider, ProtectedRoute, SignInPage, SignUpPage, AuthRedirector } from './features/auth';

// Dashboards
import { CitizenDashboard, HospitalDashboard, AdminDashboard } from './features/dashboard';

// Landing (existing sections)
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

// Config
import { siteConfig } from './config';

gsap.registerPlugin(ScrollTrigger);

// Create React Query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      retry: 1,
    },
  },
});

// Loading fallback component
const PageLoader = () => (
  <div className="min-h-screen bg-void-black flex items-center justify-center">
    <div className="flex flex-col items-center gap-4">
      <div className="w-12 h-12 border-3 border-neon-cyan border-t-transparent rounded-full animate-spin" />
      <span className="text-white/50 font-mono-custom text-sm">Loading...</span>
    </div>
  </div>
);

// Landing Page Component
const LandingPage = () => {
  return (
    <main className="relative w-full min-h-screen bg-void-black overflow-x-hidden">
      {/* Node grid background */}
      <div className="node-grid" />
      
      {/* Grain overlay */}
      <div className="grain-overlay" />

      {/* Hero Section */}
      <Hero />

      {/* Blockchain Cube Section */}
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
};

function App() {
  useEffect(() => {
    // Set page title from config
    if (siteConfig.title) {
      document.title = siteConfig.title;
    }

    // Setup global scroll snap for pinned sections
    const setupScrollSnap = () => {
      setTimeout(() => {
        const pinned = ScrollTrigger.getAll()
          .filter(st => st.vars.pin)
          .sort((a, b) => a.start - b.start);
        
        const maxScroll = ScrollTrigger.maxScroll(window);
        
        if (!maxScroll || pinned.length === 0) return;

        const pinnedRanges = pinned.map(st => ({
          start: st.start / maxScroll,
          end: (st.end ?? st.start) / maxScroll,
          center: (st.start + ((st.end ?? st.start) - st.start) * 0.5) / maxScroll,
        }));

        ScrollTrigger.create({
          snap: {
            snapTo: (value: number) => {
              const inPinned = pinnedRanges.some(
                r => value >= r.start - 0.02 && value <= r.end + 0.02
              );
              
              if (!inPinned) return value;

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
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <Suspense fallback={<PageLoader />}>
            <AuthRedirector />
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<LandingPage />} />
              <Route path="/signin" element={<SignInPage />} />
              <Route path="/signup" element={<SignUpPage />} />

              {/* Protected Citizen Routes */}
              <Route
                path="/citizen/dashboard"
                element={
                  <ProtectedRoute allowedRoles={['citizen']}>
                    <CitizenDashboard />
                  </ProtectedRoute>
                }
              />

              {/* Protected Hospital Routes */}
              <Route
                path="/hospital/dashboard"
                element={
                  <ProtectedRoute allowedRoles={['hospital']}>
                    <HospitalDashboard />
                  </ProtectedRoute>
                }
              />

              {/* Protected Admin Routes */}
              <Route
                path="/admin/dashboard"
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <AdminDashboard />
                  </ProtectedRoute>
                }
              />

              {/* Catch all - redirect to home */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Suspense>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;

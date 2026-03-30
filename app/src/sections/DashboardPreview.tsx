import { useRef, useEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowRight, Database, CheckCircle, Server } from 'lucide-react';
import { dashboardConfig } from '../config';

gsap.registerPlugin(ScrollTrigger);

const DashboardPreview = () => {
  if (!dashboardConfig.sectionTitle) return null;

  const sectionRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!sectionRef.current) return;

    const ctx = gsap.context(() => {
      // Content animation
      gsap.fromTo(
        contentRef.current,
        { x: -60, opacity: 0 },
        {
          x: 0,
          opacity: 1,
          duration: 0.8,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 70%',
            toggleActions: 'play none none reverse',
          },
        }
      );

      // Image animation
      gsap.fromTo(
        imageRef.current,
        { x: 60, opacity: 0, scale: 0.95 },
        {
          x: 0,
          opacity: 1,
          scale: 1,
          duration: 0.8,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 60%',
            toggleActions: 'play none none reverse',
          },
        }
      );

      // Stats animation
      gsap.fromTo(
        statsRef.current?.children || [],
        { y: 30, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.6,
          stagger: 0.1,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 50%',
            toggleActions: 'play none none reverse',
          },
        }
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const statIcons = [Database, CheckCircle, Server];

  return (
    <section
      id="dashboard"
      ref={sectionRef}
      className="relative w-full min-h-screen bg-void-black py-24 overflow-hidden"
    >
      {/* Background glow */}
      <div className="absolute top-1/2 right-0 w-[600px] h-[600px] bg-neon-cyan/5 rounded-full blur-3xl pointer-events-none -translate-y-1/2" />

      <div className="relative z-10 max-w-7xl mx-auto px-8 lg:px-16">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left content */}
          <div ref={contentRef}>
            <p className="font-mono-custom text-xs text-neon-cyan/70 uppercase tracking-[0.2em] mb-4">
              {dashboardConfig.sectionLabel}
            </p>
            <h2 className="font-display text-4xl md:text-5xl lg:text-6xl text-white mb-6 leading-tight">
              {dashboardConfig.sectionTitle}
            </h2>
            <p className="text-text-secondary text-lg mb-8 leading-relaxed max-w-lg">
              {dashboardConfig.body}
            </p>
            <button
              onClick={() => scrollToSection(dashboardConfig.ctaTarget)}
              className="group flex items-center gap-2 px-6 py-3 bg-neon-cyan/10 border border-neon-cyan/30 text-neon-cyan font-display text-sm uppercase tracking-wider rounded-full hover:bg-neon-cyan hover:text-void-black transition-all duration-300"
            >
              {dashboardConfig.cta}
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          {/* Right image */}
          <div ref={imageRef} className="relative">
            <div className="glass-card p-2 overflow-hidden">
              <img
                src={dashboardConfig.dashboardImage}
                alt="JeevanChain Dashboard"
                className="w-full h-auto rounded-2xl"
              />
              
              {/* Overlay gradient */}
              <div className="absolute inset-0 bg-gradient-to-t from-void-black/50 via-transparent to-transparent pointer-events-none" />
            </div>

            {/* Floating badge */}
            <div className="absolute -bottom-4 -left-4 glass-card px-4 py-3 flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-neon-cyan animate-pulse" />
              <span className="font-mono-custom text-xs text-white/80">Live Data</span>
            </div>
          </div>
        </div>

        {/* Stats row */}
        <div ref={statsRef} className="grid grid-cols-3 gap-8 mt-20">
          {dashboardConfig.stats.map((stat, index) => {
            const IconComponent = statIcons[index] || Database;
            return (
              <div key={stat.label} className="glass-card p-6 card-shine glass-card-hover">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-neon-cyan/10 flex items-center justify-center">
                    <IconComponent className="w-5 h-5 text-neon-cyan" />
                  </div>
                  <span className="font-mono-custom text-xs text-white/50 uppercase tracking-wider">
                    {stat.label}
                  </span>
                </div>
                <p className="font-display text-3xl md:text-4xl text-white">{stat.value}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default DashboardPreview;

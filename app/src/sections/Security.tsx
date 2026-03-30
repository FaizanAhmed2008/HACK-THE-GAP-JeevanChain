import { useRef, useEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Lock, FileCheck, ShieldCheck } from 'lucide-react';
import { securityConfig } from '../config';

gsap.registerPlugin(ScrollTrigger);

const proofIcons = [Lock, FileCheck, ShieldCheck];

const Security = () => {
  if (!securityConfig.sectionTitle) return null;

  const sectionRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const proofsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!sectionRef.current) return;

    const ctx = gsap.context(() => {
      // Content animation
      gsap.fromTo(
        contentRef.current,
        { y: 50, opacity: 0 },
        {
          y: 0,
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

      // Proof points animation
      const proofs = proofsRef.current?.children || [];
      gsap.fromTo(
        proofs,
        { y: 40, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.6,
          stagger: 0.1,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: proofsRef.current,
            start: 'top 80%',
            toggleActions: 'play none none reverse',
          },
        }
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      id="security"
      ref={sectionRef}
      className="relative w-full min-h-screen bg-void-black py-24 overflow-hidden"
    >
      {/* Background image */}
      <div className="absolute inset-0 z-0">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${securityConfig.backgroundImage})` }}
        />
        {/* Dark overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-void-black via-void-black/90 to-void-black/70" />
      </div>

      {/* Glow effect */}
      <div className="absolute top-1/2 left-1/4 w-[500px] h-[500px] bg-neon-cyan/5 rounded-full blur-3xl pointer-events-none -translate-y-1/2" />

      <div className="relative z-10 max-w-7xl mx-auto px-8 lg:px-16 min-h-[70vh] flex items-center">
        <div className="grid lg:grid-cols-2 gap-16 items-center w-full">
          {/* Left content */}
          <div ref={contentRef}>
            <p className="font-mono-custom text-xs text-neon-cyan/70 uppercase tracking-[0.2em] mb-4">
              {securityConfig.sectionLabel}
            </p>
            <h2 className="font-display text-4xl md:text-5xl lg:text-6xl text-white mb-6 leading-tight">
              {securityConfig.sectionTitle}
            </h2>
            <p className="text-text-secondary text-lg mb-10 leading-relaxed max-w-lg">
              {securityConfig.body}
            </p>

            {/* Proof points */}
            <div ref={proofsRef} className="grid grid-cols-3 gap-6">
              {securityConfig.proofPoints.map((point, index) => {
                const IconComponent = proofIcons[index] || ShieldCheck;
                return (
                  <div key={point.title} className="text-center">
                    <div className="w-14 h-14 rounded-full bg-neon-cyan/10 flex items-center justify-center mx-auto mb-3 animate-pulse-glow">
                      <IconComponent className="w-7 h-7 text-neon-cyan" />
                    </div>
                    <p className="font-display text-2xl text-white mb-1">{point.title}</p>
                    <p className="font-mono-custom text-xs text-white/50 uppercase tracking-wider">
                      {point.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right - Decorative shield */}
          <div className="hidden lg:flex items-center justify-center">
            <div className="relative">
              {/* Outer rings */}
              <div className="absolute inset-0 w-80 h-80 rounded-full border border-neon-cyan/20 animate-spin-slow" />
              <div className="absolute inset-4 w-72 h-72 rounded-full border border-neon-cyan/10 animate-spin-slow" style={{ animationDirection: 'reverse', animationDuration: '6s' }} />
              
              {/* Central shield */}
              <div className="w-80 h-80 rounded-full bg-gradient-to-br from-neon-cyan/10 to-transparent flex items-center justify-center">
                <div className="w-40 h-40 rounded-full bg-neon-cyan/20 flex items-center justify-center animate-pulse-glow">
                  <ShieldCheck className="w-20 h-20 text-neon-cyan" />
                </div>
              </div>

              {/* Floating particles */}
              <div className="absolute top-0 left-1/2 w-2 h-2 rounded-full bg-neon-cyan animate-float" />
              <div className="absolute bottom-10 right-10 w-3 h-3 rounded-full bg-neon-cyan/50 animate-float" style={{ animationDelay: '0.5s' }} />
              <div className="absolute top-20 left-10 w-2 h-2 rounded-full bg-neon-cyan/30 animate-float" style={{ animationDelay: '1s' }} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Security;

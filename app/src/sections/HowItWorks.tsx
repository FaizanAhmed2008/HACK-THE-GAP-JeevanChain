import { useRef, useEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { UserPlus, FileCheck, ShieldCheck, ArrowRight } from 'lucide-react';
import { howItWorksConfig } from '../config';

gsap.registerPlugin(ScrollTrigger);

const stepIcons = [UserPlus, FileCheck, ShieldCheck];

const HowItWorks = () => {
  if (!howItWorksConfig.sectionTitle || howItWorksConfig.steps.length === 0) return null;

  const sectionRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const stepsRef = useRef<HTMLDivElement>(null);
  const connectorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!sectionRef.current) return;

    const ctx = gsap.context(() => {
      // Header animation
      gsap.fromTo(
        headerRef.current,
        { y: 40, opacity: 0 },
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

      // Steps animation
      const steps = stepsRef.current?.children || [];
      gsap.fromTo(
        steps,
        { y: 50, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.7,
          stagger: 0.2,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: stepsRef.current,
            start: 'top 75%',
            toggleActions: 'play none none reverse',
          },
        }
      );

      // Connector line animation
      gsap.fromTo(
        connectorRef.current,
        { scaleX: 0 },
        {
          scaleX: 1,
          duration: 1.2,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: stepsRef.current,
            start: 'top 70%',
            toggleActions: 'play none none reverse',
          },
        }
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      id="how-it-works"
      ref={sectionRef}
      className="relative w-full bg-void-black py-24 overflow-hidden"
    >
      {/* Background glow */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-neon-cyan/5 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto px-8 lg:px-16">
        {/* Header */}
        <div ref={headerRef} className="text-center mb-20">
          <p className="font-mono-custom text-xs text-neon-cyan/70 uppercase tracking-[0.2em] mb-4">
            {howItWorksConfig.sectionLabel}
          </p>
          <h2 className="font-display text-4xl md:text-5xl lg:text-6xl text-white">
            {howItWorksConfig.sectionTitle}
          </h2>
        </div>

        {/* Steps */}
        <div className="relative">
          {/* Connector line (desktop only) */}
          <div
            ref={connectorRef}
            className="hidden lg:block absolute top-24 left-[16%] right-[16%] h-px step-connector origin-left"
          />

          <div ref={stepsRef} className="grid md:grid-cols-3 gap-12 lg:gap-8">
            {howItWorksConfig.steps.map((step, index) => {
              const IconComponent = stepIcons[index] || ShieldCheck;
              return (
                <div key={step.id} className="relative">
                  {/* Step card */}
                  <div className="glass-card p-8 text-center card-shine glass-card-hover h-full">
                    {/* Icon */}
                    <div className="relative inline-flex items-center justify-center mb-6">
                      <div className="w-20 h-20 rounded-full bg-neon-cyan/10 flex items-center justify-center">
                        <IconComponent className="w-10 h-10 text-neon-cyan" />
                      </div>
                      {/* Step number badge */}
                      <div className="absolute -top-1 -right-1 w-8 h-8 rounded-full bg-neon-cyan flex items-center justify-center">
                        <span className="font-mono-custom text-sm font-bold text-void-black">
                          {step.id}
                        </span>
                      </div>
                    </div>

                    {/* Content */}
                    <h3 className="font-display text-2xl text-white mb-4">{step.title}</h3>
                    <p className="text-text-secondary text-sm leading-relaxed">{step.body}</p>
                  </div>

                  {/* Arrow (not on last item) */}
                  {index < howItWorksConfig.steps.length - 1 && (
                    <div className="hidden lg:flex absolute top-24 -right-4 z-10 items-center justify-center w-8 h-8 rounded-full bg-void-black border border-neon-cyan/30">
                      <ArrowRight className="w-4 h-4 text-neon-cyan" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;

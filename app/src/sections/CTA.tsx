import { useRef, useEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowRight, Mail } from 'lucide-react';
import { ctaConfig } from '../config';

gsap.registerPlugin(ScrollTrigger);

const CTA = () => {
  if (!ctaConfig.headline) return null;

  const sectionRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const buttonsRef = useRef<HTMLDivElement>(null);

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

      // Buttons animation
      gsap.fromTo(
        buttonsRef.current?.children || [],
        { y: 30, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.6,
          stagger: 0.1,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: buttonsRef.current,
            start: 'top 85%',
            toggleActions: 'play none none reverse',
          },
        }
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      id="cta"
      ref={sectionRef}
      className="relative w-full min-h-[70vh] bg-void-black py-24 overflow-hidden"
    >
      {/* Background image */}
      <div className="absolute inset-0 z-0">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${ctaConfig.backgroundImage})` }}
        />
        {/* Dark overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-void-black/70 via-void-black/80 to-void-black" />
      </div>

      {/* Glow effects */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-neon-cyan/5 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 max-w-4xl mx-auto px-8 lg:px-16 min-h-[50vh] flex flex-col items-center justify-center text-center">
        {/* Content */}
        <div ref={contentRef}>
          <h2 className="font-display text-4xl md:text-5xl lg:text-6xl text-white mb-6 leading-tight">
            {ctaConfig.headline}
          </h2>
          <p className="text-text-secondary text-lg mb-10 max-w-xl mx-auto leading-relaxed">
            {ctaConfig.body}
          </p>
        </div>

        {/* Buttons */}
        <div ref={buttonsRef} className="flex flex-col sm:flex-row gap-4">
          <button className="group flex items-center justify-center gap-2 px-8 py-4 bg-neon-cyan text-void-black font-display text-sm uppercase tracking-wider rounded-full hover:bg-white transition-colors duration-300">
            {ctaConfig.ctaPrimary}
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
          <button className="group flex items-center justify-center gap-2 px-8 py-4 border border-white/30 text-white font-display text-sm uppercase tracking-wider rounded-full hover:border-neon-cyan hover:text-neon-cyan transition-colors duration-300">
            <Mail className="w-4 h-4" />
            {ctaConfig.ctaSecondary}
          </button>
        </div>
      </div>
    </section>
  );
};

export default CTA;

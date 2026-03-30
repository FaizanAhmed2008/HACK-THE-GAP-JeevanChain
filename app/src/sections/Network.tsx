import { useRef, useEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Server, Clock, Activity } from 'lucide-react';
import { networkConfig } from '../config';

gsap.registerPlugin(ScrollTrigger);

const statIcons = [Server, Clock, Activity];

const Network = () => {
  if (!networkConfig.sectionTitle) return null;

  const sectionRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);

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

      // Stats animation
      const stats = statsRef.current?.children || [];
      gsap.fromTo(
        stats,
        { y: 40, opacity: 0, scale: 0.9 },
        {
          y: 0,
          opacity: 1,
          scale: 1,
          duration: 0.6,
          stagger: 0.15,
          ease: 'back.out(1.7)',
          scrollTrigger: {
            trigger: statsRef.current,
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
      id="network"
      ref={sectionRef}
      className="relative w-full min-h-screen bg-void-black py-24 overflow-hidden"
    >
      {/* Background image */}
      <div className="absolute inset-0 z-0">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${networkConfig.backgroundImage})` }}
        />
        {/* Dark overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-void-black via-void-black/80 to-void-black/60" />
      </div>

      {/* Animated grid overlay */}
      <div className="absolute inset-0 opacity-10">
        <div 
          className="w-full h-full"
          style={{
            backgroundImage: `
              linear-gradient(rgba(34, 211, 238, 0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(34, 211, 238, 0.1) 1px, transparent 1px)
            `,
            backgroundSize: '50px 50px',
          }}
        />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-8 lg:px-16 min-h-[70vh] flex flex-col items-center justify-center">
        {/* Header */}
        <div ref={contentRef} className="text-center mb-16">
          <p className="font-mono-custom text-xs text-neon-cyan/70 uppercase tracking-[0.2em] mb-4">
            {networkConfig.sectionLabel}
          </p>
          <h2 className="font-display text-4xl md:text-5xl lg:text-6xl text-white mb-6">
            {networkConfig.sectionTitle}
          </h2>
          <p className="text-text-secondary text-lg max-w-2xl mx-auto leading-relaxed">
            {networkConfig.body}
          </p>
        </div>

        {/* Stats */}
        <div ref={statsRef} className="grid grid-cols-3 gap-8 max-w-4xl w-full">
          {networkConfig.stats.map((stat, index) => {
            const IconComponent = statIcons[index] || Activity;
            return (
              <div
                key={stat.label}
                className="glass-card p-8 text-center card-shine glass-card-hover"
              >
                <div className="w-16 h-16 rounded-full bg-neon-cyan/10 flex items-center justify-center mx-auto mb-4">
                  <IconComponent className="w-8 h-8 text-neon-cyan" />
                </div>
                <p className="font-display text-4xl md:text-5xl text-white mb-2">{stat.value}</p>
                <p className="font-mono-custom text-xs text-white/50 uppercase tracking-wider">
                  {stat.label}
                </p>
              </div>
            );
          })}
        </div>

        {/* Live indicator */}
        <div className="mt-12 flex items-center gap-3">
          <div className="w-3 h-3 rounded-full bg-neon-cyan animate-pulse" />
          <span className="font-mono-custom text-sm text-neon-cyan/70 uppercase tracking-wider">
            Network Active
          </span>
        </div>
      </div>
    </section>
  );
};

export default Network;

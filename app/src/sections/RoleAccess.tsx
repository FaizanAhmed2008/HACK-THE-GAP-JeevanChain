import { useRef, useEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { User, Building2, Shield, Check } from 'lucide-react';
import { roleAccessConfig } from '../config';

gsap.registerPlugin(ScrollTrigger);

const roleIcons = [User, Building2, Shield];

const RoleAccess = () => {
  if (!roleAccessConfig.sectionTitle || roleAccessConfig.cards.length === 0) return null;

  const sectionRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);

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

      // Cards animation
      const cards = cardsRef.current?.children || [];
      gsap.fromTo(
        cards,
        { y: 60, opacity: 0, rotateY: -15 },
        {
          y: 0,
          opacity: 1,
          rotateY: 0,
          duration: 0.8,
          stagger: 0.15,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: cardsRef.current,
            start: 'top 75%',
            toggleActions: 'play none none reverse',
          },
        }
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      id="roles"
      ref={sectionRef}
      className="relative w-full bg-void-black py-24 overflow-hidden"
    >
      {/* Background elements */}
      <div className="absolute top-1/2 left-0 w-[500px] h-[500px] bg-neon-cyan/3 rounded-full blur-3xl pointer-events-none -translate-y-1/2" />

      <div className="relative z-10 max-w-7xl mx-auto px-8 lg:px-16">
        {/* Header */}
        <div ref={headerRef} className="text-center mb-16">
          <p className="font-mono-custom text-xs text-neon-cyan/70 uppercase tracking-[0.2em] mb-4">
            {roleAccessConfig.sectionLabel}
          </p>
          <h2 className="font-display text-4xl md:text-5xl lg:text-6xl text-white">
            {roleAccessConfig.sectionTitle}
          </h2>
        </div>

        {/* Cards grid */}
        <div ref={cardsRef} className="grid md:grid-cols-3 gap-8">
          {roleAccessConfig.cards.map((card, index) => {
            const IconComponent = roleIcons[index] || User;
            return (
              <div
                key={card.id}
                className="glass-card overflow-hidden card-shine glass-card-hover group perspective"
                style={{ perspective: '1000px' }}
              >
                {/* Image */}
                <div className="relative h-56 overflow-hidden">
                  <img
                    src={card.image}
                    alt={card.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-void-black via-void-black/60 to-transparent" />
                  
                  {/* Role badge */}
                  <div className="absolute top-4 right-4">
                    <div className="glass-card px-3 py-1.5 flex items-center gap-2">
                      <IconComponent className="w-4 h-4 text-neon-cyan" />
                      <span className="font-mono-custom text-xs text-white/80 uppercase tracking-wider">
                        {card.title}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6">
                  <h3 className="font-display text-2xl text-white mb-4">{card.title}</h3>
                  
                  {/* Bullets */}
                  <ul className="space-y-3">
                    {card.bullets.map((bullet, bulletIndex) => (
                      <li key={bulletIndex} className="flex items-center gap-3">
                        <div className="w-5 h-5 rounded-full bg-neon-cyan/20 flex items-center justify-center flex-shrink-0">
                          <Check className="w-3 h-3 text-neon-cyan" />
                        </div>
                        <span className="text-text-secondary text-sm">{bullet}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Bottom accent line */}
                <div className="h-1 bg-gradient-to-r from-neon-cyan/50 via-neon-cyan to-neon-cyan/50 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default RoleAccess;

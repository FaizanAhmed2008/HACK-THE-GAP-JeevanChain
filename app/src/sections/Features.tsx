import { useRef, useEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { featuresConfig } from '../config';

gsap.registerPlugin(ScrollTrigger);

const Features = () => {
  if (!featuresConfig.sectionTitle || featuresConfig.cards.length === 0) return null;

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
        { y: 60, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.7,
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
      id="features"
      ref={sectionRef}
      className="relative w-full bg-void-black py-24 overflow-hidden"
    >
      {/* Background elements */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-neon-cyan/3 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto px-8 lg:px-16">
        {/* Header */}
        <div ref={headerRef} className="text-center mb-16">
          <p className="font-mono-custom text-xs text-neon-cyan/70 uppercase tracking-[0.2em] mb-4">
            {featuresConfig.sectionLabel}
          </p>
          <h2 className="font-display text-4xl md:text-5xl lg:text-6xl text-white">
            {featuresConfig.sectionTitle}
          </h2>
        </div>

        {/* Cards grid */}
        <div ref={cardsRef} className="grid md:grid-cols-3 gap-8">
          {featuresConfig.cards.map((card) => (
            <div
              key={card.id}
              className="glass-card overflow-hidden card-shine glass-card-hover group"
            >
              {/* Image */}
              <div className="relative h-48 overflow-hidden">
                <img
                  src={card.image}
                  alt={card.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-void-black via-void-black/50 to-transparent" />
                
                {/* Feature number */}
                <div className="absolute top-4 left-4">
                  <span className="font-mono-custom text-xs text-neon-cyan/70 uppercase tracking-wider">
                    0{card.id}
                  </span>
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                <h3 className="font-display text-2xl text-white mb-3">{card.title}</h3>
                <p className="text-text-secondary text-sm leading-relaxed">{card.body}</p>
              </div>

              {/* Bottom accent line */}
              <div className="h-1 bg-gradient-to-r from-neon-cyan/50 via-neon-cyan to-neon-cyan/50 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;

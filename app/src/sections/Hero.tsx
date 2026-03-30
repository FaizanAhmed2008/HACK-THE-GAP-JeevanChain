import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { gsap } from 'gsap';
import { Disc, Play, Shield, Network, Activity } from 'lucide-react';
import { heroConfig } from '../config';

const ICON_MAP = {
  disc: Disc,
  play: Play,
  shield: Shield,
  network: Network,
  calendar: Activity,
  music: Activity,
  users: Activity,
};

const Hero = () => {
  // Null check: if config is empty, do not render
  if (!heroConfig.decodeText && !heroConfig.brandName && heroConfig.navItems.length === 0) {
    return null;
  }

  const heroRef = useRef<HTMLDivElement>(null);
  const navRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const glassCardRef = useRef<HTMLDivElement>(null);
  
  const TARGET_TEXT = heroConfig.decodeText;
  const CHARS = heroConfig.decodeChars || 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()';
  const [displayText, setDisplayText] = useState(' '.repeat(TARGET_TEXT.length));
  const [isDecoding, setIsDecoding] = useState(true);

  // Decode text effect
  useEffect(() => {
    let iteration = 0;
    const maxIterations = TARGET_TEXT.length * 8;

    const interval = setInterval(() => {
      setDisplayText(() => {
        return TARGET_TEXT.split('')
          .map((_, index) => {
            if (index < iteration / 8) {
              return TARGET_TEXT[index];
            }
            return CHARS[Math.floor(Math.random() * CHARS.length)];
          })
          .join('');
      });

      iteration += 1;

      if (iteration >= maxIterations) {
        clearInterval(interval);
        setDisplayText(TARGET_TEXT);
        setIsDecoding(false);
      }
    }, 40);

    return () => clearInterval(interval);
  }, []);

  // GSAP animations
  useEffect(() => {
    const ctx = gsap.context(() => {
      // Nav slide in
      gsap.fromTo(
        navRef.current,
        { y: -100, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8, ease: 'power3.out', delay: 0.3 }
      );

      // Content fade in
      gsap.fromTo(
        contentRef.current,
        { y: 40, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8, ease: 'power3.out', delay: 0.8 }
      );

      // Subtitle fade in
      gsap.fromTo(
        subtitleRef.current,
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8, ease: 'power3.out', delay: 1.2 }
      );

      // Glass card slide in
      gsap.fromTo(
        glassCardRef.current,
        { x: 100, opacity: 0, scale: 0.96 },
        { x: 0, opacity: 1, scale: 1, duration: 0.9, ease: 'power2.out', delay: 1 }
      );
    }, heroRef);

    return () => ctx.revert();
  }, []);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section
      ref={heroRef}
      className="relative w-full h-screen overflow-hidden bg-void-black"
    >
      {/* Background image */}
      <div className="absolute inset-0 z-0">
        <div
          className="absolute inset-0 bg-cover bg-center scale-105"
          style={{ backgroundImage: `url(${heroConfig.backgroundImage})` }}
        />
        {/* Dark overlay */}
        <div className="absolute inset-0 dark-overlay" />
        {/* Animated gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-void-black/30 to-void-black" />
      </div>

      {/* Navigation pill */}
      <nav
        ref={navRef}
        className="fixed top-6 left-1/2 -translate-x-1/2 z-50 nav-pill rounded-full px-2 py-2"
      >
        <div className="flex items-center gap-1">
          {heroConfig.navItems.map((item) => {
            const IconComponent = ICON_MAP[item.icon];
            return (
              <button
                key={item.sectionId}
                onClick={() => scrollToSection(item.sectionId)}
                className="flex items-center gap-2 px-4 py-2 text-xs font-mono-custom uppercase tracking-wider text-white/80 hover:text-white transition-colors rounded-full hover:bg-white/5"
              >
                <IconComponent className="w-3.5 h-3.5" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* Auth buttons - top right */}
      <div className="absolute top-6 right-6 z-50 flex items-center gap-3">
        <Link
          to="/signin"
          className="px-5 py-2 text-sm font-medium text-white/80 hover:text-white transition-colors"
        >
          Sign In
        </Link>
        <Link
          to="/signup"
          className="px-5 py-2 bg-neon-cyan/10 border border-neon-cyan/30 text-neon-cyan text-sm font-medium rounded-full hover:bg-neon-cyan hover:text-void-black transition-all"
        >
          Sign Up
        </Link>
      </div>

      {/* Hero content */}
      <div className="relative z-10 flex flex-col items-start justify-center h-full px-8 lg:px-16">
        {/* Logo / Brand */}
        <div className="absolute top-8 left-8 lg:left-16">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-neon-cyan/20 flex items-center justify-center">
              <Disc className="w-4 h-4 text-neon-cyan" />
            </div>
            <span className="font-display text-lg text-white">{heroConfig.brandName}</span>
          </Link>
        </div>

        {/* Main content area */}
        <div ref={contentRef} className="max-w-3xl">
          {/* Micro label */}
          <p className="font-mono-custom text-xs text-neon-cyan/80 uppercase tracking-[0.2em] mb-4">
            {heroConfig.cornerLabel}
          </p>

          {/* Main title with decode effect */}
          <h1
            ref={titleRef}
            className="font-display text-[14vw] md:text-[10vw] lg:text-[8vw] text-white leading-none tracking-tighter mb-2"
          >
            <span className={`${isDecoding ? 'text-glow-cyan' : ''} transition-all duration-300 block`}>
              {displayText}
            </span>
          </h1>

          {/* Subtitle */}
          <p
            ref={subtitleRef}
            className="font-mono-custom text-lg md:text-xl text-neon-cyan/70 uppercase tracking-[0.3em] mb-8"
          >
            {heroConfig.subtitle}
          </p>

          {/* Description */}
          <p className="text-text-secondary text-base md:text-lg max-w-xl mb-10 leading-relaxed">
            JeevanChain connects citizens, hospitals, and civil registry with tamper-proof data and transparent access—built for trust.
          </p>

          {/* CTA Buttons */}
          <div className="flex gap-4">
            <Link
              to="/signup"
              className="px-8 py-3 bg-neon-cyan text-void-black font-display text-sm uppercase tracking-wider rounded-full hover:bg-white transition-colors duration-300"
            >
              Get Started
            </Link>
            <button
              onClick={() => scrollToSection(heroConfig.ctaSecondaryTarget)}
              className="px-8 py-3 border border-white/30 text-white font-display text-sm uppercase tracking-wider rounded-full hover:border-neon-cyan hover:text-neon-cyan transition-colors duration-300"
            >
              {heroConfig.ctaSecondary}
            </button>
          </div>
        </div>

        {/* Glass stats card */}
        <div
          ref={glassCardRef}
          className="absolute right-8 lg:right-16 top-1/2 -translate-y-1/2 glass-card p-6 w-64 hidden lg:block"
        >
          <p className="font-mono-custom text-xs text-white/50 uppercase tracking-wider mb-2">
            Verified transactions
          </p>
          <p className="font-display text-5xl text-white mb-1">2.4M+</p>
          <p className="text-text-secondary text-sm">Across 180+ nodes</p>
          
          {/* Decorative elements */}
          <div className="mt-6 flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-neon-cyan animate-pulse" />
            <span className="font-mono-custom text-xs text-neon-cyan/70">Live network</span>
          </div>
        </div>
      </div>

      {/* Decorative elements */}
      <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-neon-cyan/30 to-transparent" />

      {/* Corner accents */}
      <div className="absolute top-8 right-8 lg:right-16 text-right hidden lg:block">
        <p className="font-mono-custom text-xs text-white/40 uppercase tracking-wider">Version</p>
        <p className="font-mono-custom text-xs text-neon-cyan/60">{heroConfig.cornerDetail}</p>
      </div>

      {/* Bottom scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2">
        <div className="w-px h-12 bg-gradient-to-b from-neon-cyan/50 to-transparent" />
      </div>
    </section>
  );
};

export default Hero;

import { useRef, useEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Twitter, Linkedin, Github, Disc, ArrowUpRight } from 'lucide-react';
import { footerConfig } from '../config';

gsap.registerPlugin(ScrollTrigger);

const socialIconMap = {
  twitter: Twitter,
  linkedin: Linkedin,
  github: Github,
  instagram: ArrowUpRight,
};

const Footer = () => {
  if (!footerConfig.tagline) return null;

  const sectionRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!sectionRef.current) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        contentRef.current,
        { y: 30, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.6,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 90%',
            toggleActions: 'play none none reverse',
          },
        }
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <footer
      id="footer"
      ref={sectionRef}
      className="relative w-full bg-void-black pt-16 pb-8 overflow-hidden border-t border-white/5"
    >
      {/* Top gradient line */}
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-neon-cyan/30 to-transparent" />

      <div ref={contentRef} className="relative z-10 max-w-7xl mx-auto px-8 lg:px-16">
        {/* Main footer content */}
        <div className="grid md:grid-cols-4 gap-12 mb-12">
          {/* Brand column */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-full bg-neon-cyan/20 flex items-center justify-center">
                <Disc className="w-5 h-5 text-neon-cyan" />
              </div>
              <span className="font-display text-xl text-white">JeevanChain</span>
            </div>
            <p className="text-text-secondary text-sm mb-4 max-w-sm">
              {footerConfig.tagline}
            </p>
            <a
              href={`mailto:${footerConfig.email}`}
              className="text-neon-cyan text-sm hover:underline"
            >
              {footerConfig.email}
            </a>
          </div>

          {/* Quick links */}
          <div>
            <h4 className="font-mono-custom text-xs text-white/50 uppercase tracking-wider mb-4">
              Quick Links
            </h4>
            <ul className="space-y-3">
              {footerConfig.quickLinks.map((link) => (
                <li key={link}>
                  <a
                    href="#"
                    className="text-text-secondary text-sm hover:text-neon-cyan transition-colors"
                  >
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Social links */}
          <div>
            <h4 className="font-mono-custom text-xs text-white/50 uppercase tracking-wider mb-4">
              Connect
            </h4>
            <div className="flex gap-3">
              {footerConfig.socialLinks.map((social) => {
                const IconComponent = socialIconMap[social.icon] || ArrowUpRight;
                return (
                  <a
                    key={social.label}
                    href={social.href}
                    className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-neon-cyan/20 hover:text-neon-cyan transition-colors"
                    aria-label={social.label}
                  >
                    <IconComponent className="w-5 h-5" />
                  </a>
                );
              })}
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-white/40 text-xs">{footerConfig.copyright}</p>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-neon-cyan animate-pulse" />
            <span className="font-mono-custom text-xs text-white/40 uppercase tracking-wider">
              System Operational
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

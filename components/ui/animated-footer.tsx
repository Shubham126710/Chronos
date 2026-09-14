"use client"
import React, { useEffect, useRef, useState } from "react";

const Footer: React.FC<{ barCount?: number }> = ({ barCount = 23 }) => {
  const waveRefs = useRef<(HTMLDivElement | null)[]>([]);
  const footerRef = useRef<HTMLDivElement | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const animationFrameRef = useRef<number | null>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        setIsVisible(entry.isIntersecting);
      },
      { threshold: 0.2 }
    );

    if (footerRef.current) {
      observer.observe(footerRef.current);
    }

    return () => {
      if (footerRef.current) {
        observer.unobserve(footerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    let t = 0;

    const animateWave = () => {
      const waveElements = waveRefs.current;
      let offset = 0;

      waveElements.forEach((element, index) => {
        if (element) {
          offset += Math.max(0, 20 * Math.sin((t + index) * 0.3));
          element.style.transform = `translateY(${index + offset}px)`;
        }
      });

      t += 0.1;
      animationFrameRef.current = requestAnimationFrame(animateWave);
    };

    if (isVisible) {
      animateWave();
    } else if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
    };
  }, [isVisible]);

  return (
    <footer
      ref={footerRef}
      className="bg-foreground text-background relative flex flex-col w-full h-full justify-between select-none overflow-hidden"
    >
      <div className="max-w-[90vw] mx-auto w-full relative z-10 pt-32 pb-12">
        {/* Massive Branding */}
        <div className="mb-24 flex flex-col">
          <h2 className="text-7xl sm:text-[12vw] leading-[0.8] font-medium tracking-tighter mix-blend-difference mb-8">
            CHRONOS.
          </h2>
          <div className="w-full h-[1px] bg-background/20" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-24">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-2 mb-6">
              <div className="flex gap-0.5">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="w-2 h-6 bg-background" />
                ))}
              </div>
            </div>
            <p className="text-background/70 text-sm font-light max-w-sm leading-relaxed">
              An open-source, local-first temporal operating system designed for uncompromising focus and intelligence.
            </p>
          </div>

          <div className="col-span-1 flex flex-col gap-4 text-xs font-mono uppercase tracking-widest">
            <div className="text-background/40 mb-4">SYSTEM</div>
            <a href="#how-it-works" className="hover:text-background/90 transition-colors">How it works</a>
            <a href="#intelligence" className="hover:text-background/90 transition-colors">Intelligence</a>
            <a href="#features" className="hover:text-background/90 transition-colors">Modules</a>
            <a href="#pricing" className="hover:text-background/90 transition-colors">Pricing</a>
          </div>

          <div className="col-span-1 flex flex-col gap-4 text-xs font-mono uppercase tracking-widest">
            <div className="text-background/40 mb-4">RESOURCES</div>
            <a href="#" className="hover:text-background/90 transition-colors">Documentation</a>
            <a href="#" className="hover:text-background/90 transition-colors">GitHub Repository</a>
            <a href="#" className="hover:text-background/90 transition-colors">Twitter / X</a>
            <a href="#" className="hover:text-background/90 transition-colors">Terms of Service</a>
          </div>
        </div>

        <div className="w-full h-[1px] bg-background/20 mb-8" />

        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 text-[10px] font-mono uppercase tracking-widest text-background/50">
          <div>© {new Date().getFullYear()} CHRONOS // ALL RIGHTS RESERVED.</div>
          <div className="flex items-center gap-6">
            <span>DESIGNED FOR FOCUS</span>
            <span>VERSION 1.0.0</span>
          </div>
        </div>
      </div>

      <div
        id="waveContainer"
        aria-hidden="true"
        className="w-full relative"
        style={{ overflow: "hidden", height: 200 }}
      >
        <div style={{ marginTop: 0 }}>
          {Array.from({ length: barCount }).map((_, index) => (
            <div
              key={index}
              ref={(el) => { waveRefs.current[index] = el; }}
              className="wave-segment"
              style={{
                height: `${index + 1}px`,
                backgroundColor: "hsl(var(--background))",
                transition: "transform 0.1s ease",
                willChange: "transform",
                marginTop: "-2px",
              }}
            />
          ))}
        </div>
      </div>
    </footer>
  );
};

export default Footer;

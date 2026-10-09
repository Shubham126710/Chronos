"use client";

import React, { useEffect, useRef } from "react";
import { ArrowRight, Play } from "lucide-react";
import DitherShaderDemo from "@/components/dither-shader-demo";
import gsap from "gsap";

interface HeroSectionProps {
  onStartFree?: () => void;
  onWatchDemo?: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ onStartFree, onWatchDemo }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Intro sequence
      gsap.fromTo(
        ".hero-text",
        { y: 60, opacity: 0, rotationX: 15 },
        { y: 0, opacity: 1, rotationX: 0, duration: 1.2, stagger: 0.1, ease: "power4.out" }
      );
      
      gsap.fromTo(
        ".hero-shader",
        { opacity: 0, scale: 0.95, filter: "blur(10px)" },
        { opacity: 1, scale: 1, filter: "blur(0px)", duration: 1.5, delay: 0.3, ease: "power3.out" }
      );

      gsap.fromTo(
        ".hero-bottom",
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 1, delay: 0.5, ease: "power3.out" }
      );
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={containerRef} className="relative flex flex-col justify-center px-4 sm:px-8 lg:px-12 pt-20 pb-8 overflow-hidden z-10 bg-background text-foreground border-b border-border">
      
      <div className="max-w-[90vw] mx-auto w-full relative flex flex-col">
        
        {/* Subtle structural lines */}
        <div className="absolute top-0 left-0 w-[1px] h-full bg-border-subtle" />
        <div className="absolute top-0 right-0 w-[1px] h-full bg-border-subtle" />
        
        <div className="relative p-6 sm:p-12 lg:p-16 flex flex-col justify-between">
          
          <div className="w-full flex items-center justify-between mb-8 sm:mb-12 hero-text">
            <span className="text-[10px] sm:text-xs font-mono uppercase tracking-widest text-foreground/60 border-b border-border pb-1">
              [ 01 ] SYSTEM INITIALIZATION
            </span>
            <span className="text-[10px] sm:text-xs font-mono uppercase tracking-widest text-foreground/60">
              ©{new Date().getFullYear()} CHRONOS
            </span>
          </div>

          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 lg:gap-16">
            <h1 className="hero-text text-4xl sm:text-6xl md:text-8xl lg:text-[110px] font-medium tracking-tighter leading-[0.9] text-foreground max-w-4xl font-sans">
              your time,<br />
              intelligently<br />
              organized.
            </h1>

            <div className="hero-shader hidden md:flex flex-col items-end shrink-0 max-w-[300px] xl:max-w-[400px] w-full">
              <DitherShaderDemo />
            </div>
          </div>

          <div className="hero-bottom mt-8 sm:mt-12 w-full flex flex-col xl:flex-row xl:items-center justify-between border-t border-border pt-6 sm:pt-8 gap-8">
            <p className="text-lg sm:text-xl md:text-2xl text-foreground/80 max-w-2xl font-light leading-snug">
              chronos shifts productivity toward what it should be: a system that runs, plans, and adapts to your life.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 shrink-0">
              <button
                onClick={onStartFree}
                className="group flex items-center justify-between gap-6 px-6 py-4 bg-foreground text-background hover:bg-foreground/90 transition-colors font-medium text-sm sm:text-base border border-foreground cursor-pointer"
              >
                <span>start system</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                onClick={onWatchDemo}
                className="group flex items-center justify-between gap-6 px-6 py-4 bg-background text-foreground hover:bg-surface-hover transition-colors font-medium text-sm sm:text-base border border-border cursor-pointer"
              >
                <span className="flex items-center gap-2">
                  <Play className="w-3.5 h-3.5" />
                  documentation
                </span>
              </button>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

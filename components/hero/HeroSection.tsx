"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Play } from "lucide-react";

interface HeroSectionProps {
  onStartFree?: () => void;
  onWatchDemo?: () => void;
}

const TemporalSignal = () => {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) return <div className="h-32 w-full" />;

  const bands = 24;

  return (
    <div className="w-full flex items-end justify-between overflow-hidden h-32 opacity-70 gap-[2px]">
      {Array.from({ length: bands }).map((_, i) => {
        // Density-to-sparse transitions: denser and taller on the right
        const progress = i / bands;
        const isDense = progress > 0.4;
        
        const minHeight = isDense ? 30 : 10;
        const maxHeight = isDense ? 90 : 40;
        
        const baseHeight = minHeight + Math.random() * (maxHeight - minHeight);
        const peakHeight = Math.min(100, baseHeight + 20 + Math.random() * 20);
        
        const baseOpacity = isDense ? 0.5 + Math.random() * 0.4 : 0.1 + Math.random() * 0.3;
        const peakOpacity = isDense ? 0.2 + Math.random() * 0.3 : 0.5 + Math.random() * 0.4;
        
        const delay = Math.random() * 2;
        const duration = 2 + Math.random() * 3;
        
        return (
          <motion.div
            key={i}
            className="flex-1 bg-foreground w-full"
            initial={{ height: `${baseHeight}%`, opacity: baseOpacity }}
            animate={{ 
              height: [`${baseHeight}%`, `${peakHeight}%`, `${baseHeight}%`],
              opacity: [baseOpacity, peakOpacity, baseOpacity]
            }}
            transition={{
              duration,
              delay,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        );
      })}
    </div>
  );
};

export const HeroSection: React.FC<HeroSectionProps> = ({ onStartFree, onWatchDemo }) => {
  return (
    <section className="relative flex flex-col justify-center px-4 sm:px-8 lg:px-12 pt-20 pb-8 overflow-hidden z-10 bg-background text-foreground border-b border-border">
      
      <div className="max-w-[90vw] mx-auto w-full relative flex flex-col">
        
        {/* Subtle structural lines */}
        <div className="absolute top-0 left-0 w-[1px] h-full bg-border-subtle" />
        <div className="absolute top-0 right-0 w-[1px] h-full bg-border-subtle" />
        
        <div className="relative p-6 sm:p-12 lg:p-16 flex flex-col justify-between">
          
          <div className="w-full flex items-center justify-between mb-8 sm:mb-12">
            <span className="text-[10px] sm:text-xs font-mono uppercase tracking-widest text-foreground/60 border-b border-border pb-1">
              [ 01 ] SYSTEM INITIALIZATION
            </span>
            <span className="text-[10px] sm:text-xs font-mono uppercase tracking-widest text-foreground/60">
              ©{new Date().getFullYear()} CHRONOS
            </span>
          </div>

          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 lg:gap-16">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="text-5xl sm:text-7xl md:text-8xl lg:text-[110px] font-medium tracking-tighter leading-[0.9] text-foreground max-w-4xl font-sans"
            >
              your time,<br />
              intelligently<br />
              organized.
            </motion.h1>

            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1, delay: 0.4 }}
              className="hidden md:flex flex-col items-end shrink-0 max-w-[300px] xl:max-w-[400px] w-full"
            >
              <div className="text-[9px] font-mono uppercase tracking-widest text-foreground/40 mb-2 w-full text-right">
                TEMPORAL SIGNAL // ACTIVE
              </div>
              <TemporalSignal />
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="mt-8 sm:mt-12 w-full flex flex-col xl:flex-row xl:items-center justify-between border-t border-border pt-6 sm:pt-8 gap-8"
          >
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
          </motion.div>

        </div>
      </div>
    </section>
  );
};

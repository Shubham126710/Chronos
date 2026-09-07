"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";

export default function Loading() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Animate from 0 to 99 quickly, then hold
    const duration = 2000; // 2 seconds
    const startTime = Date.now();
    
    const animate = () => {
      const now = Date.now();
      const elapsed = now - startTime;
      const t = Math.min(elapsed / duration, 1);
      
      // easeOutQuart
      const ease = 1 - Math.pow(1 - t, 4);
      
      const currentProgress = Math.floor(ease * 99);
      setProgress(currentProgress);
      
      if (t < 1) {
        requestAnimationFrame(animate);
      }
    };
    
    requestAnimationFrame(animate);
  }, []);

  return (
    <div className="fixed inset-0 z-[9999] bg-background text-foreground flex flex-col justify-between p-8 sm:p-12 overflow-hidden selection:bg-transparent">
      
      {/* Header */}
      <div className="flex justify-between items-start w-full relative z-10">
        <div className="flex flex-col gap-1">
          <span className="text-[10px] sm:text-xs font-mono uppercase tracking-widest text-foreground/60">
            System Initializing
          </span>
          <span className="text-[10px] sm:text-xs font-mono uppercase tracking-widest text-foreground/30">
            Temporal Engine // V1.0
          </span>
        </div>
        <span className="text-[10px] sm:text-xs font-mono uppercase tracking-widest text-foreground/60">
          ©{new Date().getFullYear()} CHRONOS
        </span>
      </div>

      {/* Center Huge Numbers */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden">
        <div className="flex items-baseline">
          <motion.h1 
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
            className="text-[45vw] sm:text-[35vw] font-medium tracking-tighter leading-none"
            style={{ 
              fontFeatureSettings: '"tnum" 1',
              letterSpacing: '-0.06em'
            }}
          >
            {progress.toString().padStart(2, '0')}
          </motion.h1>
          <motion.span 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.5 }}
            className="text-[12vw] sm:text-[10vw] font-medium tracking-tighter leading-none text-foreground/20 ml-2 sm:ml-6"
          >
            %
          </motion.span>
        </div>
      </div>

      {/* Footer */}
      <div className="flex justify-between items-end w-full relative z-10">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.2 }}
          className="flex flex-col gap-1"
        >
          <span className="text-[10px] sm:text-xs font-mono uppercase tracking-widest text-foreground/60">
            Loading Workspace
          </span>
          <div className="w-48 h-[1px] bg-border mt-2 relative overflow-hidden">
            <div 
              className="absolute top-0 left-0 h-full bg-foreground transition-all duration-75"
              style={{ width: `${progress}%` }}
            />
          </div>
        </motion.div>
        
        <div className="hidden sm:flex items-center gap-1.5">
          <div className="w-1.5 h-4 bg-foreground animate-pulse" />
          <div className="w-1.5 h-4 bg-foreground/60 animate-pulse delay-75" />
          <div className="w-1.5 h-4 bg-foreground/30 animate-pulse delay-150" />
        </div>
      </div>

    </div>
  );
}

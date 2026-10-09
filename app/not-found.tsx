"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-[100dvh] bg-background text-foreground flex flex-col justify-between p-8 sm:p-12 overflow-hidden selection:bg-transparent relative font-sans">
      {/* Header */}
      <div className="flex justify-between items-start w-full relative z-10">
        <div className="flex flex-col gap-1">
          <span className="text-[10px] sm:text-xs font-mono uppercase tracking-widest text-foreground/60">
            System Error // 404
          </span>
          <span className="text-[10px] sm:text-xs font-mono uppercase tracking-widest text-foreground/30">
            Temporal Coordinate Unknown
          </span>
        </div>
        <span className="text-[10px] sm:text-xs font-mono uppercase tracking-widest text-foreground/60">
          [SYS_ERR_NOT_FOUND]
        </span>
      </div>

      {/* Center Huge Numbers */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden">
        <motion.h1 
          initial={{ y: 40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="text-[45vw] sm:text-[35vw] font-medium tracking-tighter leading-none text-foreground"
          style={{ 
            fontFeatureSettings: '"tnum" 1',
            letterSpacing: '-0.06em'
          }}
        >
          404
        </motion.h1>
      </div>

      {/* Footer */}
      <div className="flex justify-between items-end w-full relative z-10">
        <div className="flex flex-col gap-4">
          <p className="text-[10px] sm:text-xs font-mono uppercase tracking-widest text-foreground/50 max-w-sm leading-relaxed">
            The sector you are attempting to access does not exist in the current timeline or has been archived.
          </p>
          <Link href="/">
            <button className="flex items-center gap-2 px-6 py-3 bg-foreground text-background hover:opacity-90 transition-opacity text-[10px] sm:text-xs uppercase tracking-widest font-bold">
              <ArrowLeft className="w-4 h-4" />
              Return to Base
            </button>
          </Link>
        </div>
        
        <div className="hidden sm:flex items-center gap-[3px]">
          <div className="w-1.5 h-4 bg-foreground animate-pulse" />
          <div className="w-1.5 h-4 bg-foreground/80 animate-pulse delay-75" />
          <div className="w-1.5 h-4 bg-foreground/60 animate-pulse delay-150" />
          <div className="w-1.5 h-4 bg-foreground/40 animate-pulse delay-300" />
        </div>
      </div>
    </div>
  );
}

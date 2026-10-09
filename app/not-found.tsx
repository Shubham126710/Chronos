"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#070707] flex flex-col items-center justify-center text-foreground relative overflow-hidden font-mono p-4">
      {/* Background Grid & Glow */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-foreground/5 rounded-full blur-[120px] pointer-events-none" />

      {/* Content Container */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 flex flex-col items-center text-center max-w-2xl"
      >
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1, delay: 0.2, ease: "easeOut" }}
          className="mb-8"
        >
          <div className="w-24 h-24 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center backdrop-blur-xl shadow-[0_0_40px_rgba(255,255,255,0.05)] overflow-hidden relative">
            <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent pointer-events-none" />
            <div className="flex gap-1.5 items-center justify-center">
              {[...Array(4)].map((_, i) => (
                <motion.div 
                  key={i} 
                  className="w-2.5 h-8 bg-foreground/90 rounded-full"
                  initial={{ height: 12, opacity: 0 }}
                  animate={{ height: [12, 32, 12], opacity: 1 }}
                  transition={{ 
                    duration: 2, 
                    repeat: Infinity, 
                    delay: i * 0.15,
                    ease: "easeInOut"
                  }}
                />
              ))}
            </div>
          </div>
        </motion.div>

        <h1 className="text-8xl md:text-9xl font-bold tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-foreground to-foreground/20 mb-6 drop-shadow-sm">
          404
        </h1>
        
        <div className="space-y-3 mb-10">
          <p className="text-sm md:text-base tracking-[0.3em] uppercase text-foreground/80 font-bold">
            Temporal Coordinate Unknown
          </p>
          <p className="text-xs md:text-sm text-foreground/50 tracking-wider max-w-md mx-auto leading-relaxed">
            [SYS_ERR_NOT_FOUND] The sector you are attempting to access does not exist in the current timeline or has been archived.
          </p>
        </div>

        <Link href="/" className="group relative">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-foreground/0 via-foreground/50 to-foreground/0 rounded-lg blur opacity-0 group-hover:opacity-100 transition duration-500" />
          <button className="relative flex items-center gap-3 px-8 py-4 bg-background border border-white/10 rounded-lg hover:bg-white/[0.02] transition-colors text-sm uppercase tracking-widest font-bold text-foreground">
            <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
            Return Home
          </button>
        </Link>
      </motion.div>
    </div>
  );
}

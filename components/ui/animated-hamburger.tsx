"use client";

import React from "react";
import { motion, MotionConfig } from "framer-motion";

interface AnimatedHamburgerProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  className?: string;
}

export const AnimatedHamburger: React.FC<AnimatedHamburgerProps> = ({
  isOpen,
  setIsOpen,
  className = "",
}) => {
  return (
    <MotionConfig transition={{ duration: 0.4, ease: [0.175, 0.885, 0.32, 1.275] }}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`relative h-10 w-10 flex items-center justify-center rounded-full hover:bg-foreground/5 transition-colors ${className}`}
      >
        <motion.div
          className="w-5 h-5 flex flex-col justify-center items-center relative"
          initial={false}
          animate={isOpen ? "open" : "closed"}
        >
          <motion.span
            variants={{
              closed: { rotate: 0, y: -6 },
              open: { rotate: 45, y: 0 },
            }}
            className="w-5 h-[2px] bg-foreground absolute rounded-full"
          />
          <motion.span
            variants={{
              closed: { opacity: 1 },
              open: { opacity: 0 },
            }}
            className="w-5 h-[2px] bg-foreground absolute rounded-full"
          />
          <motion.span
            variants={{
              closed: { rotate: 0, y: 6 },
              open: { rotate: -45, y: 0 },
            }}
            className="w-5 h-[2px] bg-foreground absolute rounded-full"
          />
        </motion.div>
      </button>
    </MotionConfig>
  );
};

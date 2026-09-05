"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ArrowRight } from "lucide-react";
import clsx from "clsx";

interface TourStep {
  targetId: string;
  title: string;
  content: string;
  placement: "top" | "bottom" | "left" | "right";
}

const TOUR_STEPS: TourStep[] = [
  {
    targetId: "chronos-sidebar",
    title: "GLOBAL NAVIGATION",
    content: "Navigate between modules. Your main dashboard is your unified canvas, while other tabs offer dedicated deep-dives into specific systems.",
    placement: "right"
  },
  {
    targetId: "dashboard-canvas",
    title: "THE CANVAS",
    content: "This is your workspace. Widgets are completely drag-and-drop. You can resize them using the dimensions dropdown on each widget header.",
    placement: "top"
  },
  {
    targetId: "add-module-btn",
    title: "MODULE CATALOG",
    content: "Deploy new widgets to your canvas from here. You can add multiple instances of the same widget if needed.",
    placement: "left"
  },
  {
    targetId: "command-palette-trigger",
    title: "AI COMMAND CENTER",
    content: "Hit [⌘K] anywhere to open the Semantic Command Palette. The AI can execute actions, query your database, or just answer questions.",
    placement: "bottom"
  }
];

interface ContextualTourProps {
  onComplete: () => void;
}

export const ContextualTour: React.FC<ContextualTourProps> = ({ onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);

  const updateTargetRect = () => {
    const step = TOUR_STEPS[currentStep];
    const el = document.getElementById(step.targetId);
    if (el) {
      setTargetRect(el.getBoundingClientRect());
      // Smooth scroll if not in view
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    } else {
      setTargetRect(null);
    }
  };

  useEffect(() => {
    updateTargetRect();
    window.addEventListener("resize", updateTargetRect);
    window.addEventListener("scroll", updateTargetRect, true); // true for capture phase to catch internal scrolls
    
    // Timeout fallback just in case DOM isn't ready
    const timer = setTimeout(updateTargetRect, 500);

    return () => {
      window.removeEventListener("resize", updateTargetRect);
      window.removeEventListener("scroll", updateTargetRect, true);
      clearTimeout(timer);
    };
  }, [currentStep]);

  // Keyboard
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === "Enter") {
        if (currentStep < TOUR_STEPS.length - 1) {
          setCurrentStep(c => c + 1);
        } else {
          onComplete();
        }
      } else if (e.key === "ArrowLeft" && currentStep > 0) {
        setCurrentStep(c => c - 1);
      } else if (e.key === "Escape") {
        onComplete();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentStep, onComplete]);

  if (!targetRect) {
    // If element not found, just render a fallback invisible div or skip
    return null;
  }

  const step = TOUR_STEPS[currentStep];
  const padding = 8;
  
  // Calculate highlight box
  const highlightStyle = {
    top: targetRect.top - padding,
    left: targetRect.left - padding,
    width: targetRect.width + padding * 2,
    height: targetRect.height + padding * 2,
    boxShadow: '0 0 0 9999px rgba(11, 9, 16, 0.85)',
  };

  // Calculate tooltip placement
  let tooltipStyle: React.CSSProperties = {};
  if (step.placement === "right") {
    tooltipStyle = { top: targetRect.top, left: targetRect.right + padding + 16 };
  } else if (step.placement === "left") {
    tooltipStyle = { top: targetRect.top, right: window.innerWidth - targetRect.left + padding + 16 };
  } else if (step.placement === "bottom") {
    tooltipStyle = { top: targetRect.bottom + padding + 16, left: targetRect.left };
  } else if (step.placement === "top") {
    tooltipStyle = { bottom: window.innerHeight - targetRect.top + padding + 16, left: targetRect.left };
  }

  // Ensure tooltip doesn't go off screen (simple clamping)
  const isMobile = window.innerWidth < 640;
  if (isMobile) {
    tooltipStyle = {
      bottom: 24,
      left: 24,
      right: 24,
      width: 'auto',
      top: 'auto'
    };
  }

  return (
    <div className="fixed inset-0 z-[150] pointer-events-none font-mono">
      {/* Spotlight */}
      <motion.div 
        className="absolute rounded border-2 border-foreground/50 transition-all duration-300 ease-in-out pointer-events-none"
        style={highlightStyle}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      />
      
      {/* Tooltip */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
          className="absolute bg-[#0B0910] border border-border p-5 flex flex-col gap-3 shadow-2xl pointer-events-auto min-w-[280px] max-w-[320px]"
          style={tooltipStyle}
        >
          <div className="flex items-start justify-between gap-4">
            <h3 className="text-[11px] font-bold uppercase tracking-widest text-foreground">{step.title}</h3>
            <button onClick={onComplete} className="text-foreground/40 hover:text-foreground">
              <X className="w-3 h-3" />
            </button>
          </div>
          
          <p className="text-[10px] text-foreground/70 uppercase tracking-widest leading-relaxed">
            {step.content}
          </p>

          <div className="flex items-center justify-between mt-2 pt-3 border-t border-border">
            <span className="text-[9px] text-foreground/40">
              {currentStep + 1} / {TOUR_STEPS.length}
            </span>
            <div className="flex items-center gap-2">
              <button 
                onClick={onComplete}
                className="text-[9px] text-foreground/50 hover:text-foreground uppercase tracking-widest px-2"
              >
                SKIP
              </button>
              <button 
                onClick={() => {
                  if (currentStep < TOUR_STEPS.length - 1) setCurrentStep(c => c + 1);
                  else onComplete();
                }}
                className="bg-foreground text-background px-3 py-1.5 text-[9px] font-bold uppercase tracking-widest flex items-center gap-1 hover:opacity-90 transition-opacity"
              >
                <span>{currentStep === TOUR_STEPS.length - 1 ? 'FINISH' : 'NEXT'}</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

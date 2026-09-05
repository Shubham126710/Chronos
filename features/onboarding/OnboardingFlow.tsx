"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, ChevronRight, X, Terminal, LayoutDashboard, CheckSquare, Calendar, Activity, Target, Sparkles, Check } from "lucide-react";
import clsx from "clsx";

interface OnboardingFlowProps {
  onComplete: (goal: string) => void;
  onSkip: () => void;
}

const STEPS = [
  {
    id: "intro",
    title: "CHRONOS // SYSTEM INIT",
    icon: <Terminal className="w-6 h-6" />,
    content: "Chronos is your personal productivity operating system. A unified workspace where tasks, time, and artificial intelligence converge to streamline your life. Move beyond disconnected apps into a seamless cognitive environment.",
  },
  {
    id: "dashboard",
    title: "THE DASHBOARD",
    icon: <LayoutDashboard className="w-6 h-6" />,
    content: "Your central command. The dashboard is entirely modular. You can add, remove, resize, and reorder widgets to create a workspace that matches exactly how your brain works. Your layout is persisted automatically.",
  },
  {
    id: "tasks",
    title: "INTELLIGENT TASKS",
    icon: <CheckSquare className="w-6 h-6" />,
    content: "Not just a list. Tasks in Chronos carry priority, estimated time, and dependencies. Connect them to larger projects or goals, and let the system calculate your real-time cognitive productivity score.",
  },
  {
    id: "calendar",
    title: "TIME BLOCKING",
    icon: <Calendar className="w-6 h-6" />,
    content: "A task without a time is just a wish. Chronos integrates time-blocking directly into your workflow. Drag tasks into your schedule and protect your deep work sessions from distractions.",
  },
  {
    id: "habits",
    title: "CONSISTENCY ENGINE",
    icon: <Activity className="w-6 h-6" />,
    content: "Track daily actions that compound over time. Chronos monitors your streaks and calculates completion rates to ensure you are steadily building the routines that lead to mastery.",
  },
  {
    id: "goals",
    title: "GOAL HIERARCHY",
    icon: <Target className="w-6 h-6" />,
    content: "Connect the micro to the macro. Every task can be tied to a high-level Goal or Project. As you complete daily items, watch the progress of your ultimate life objectives tick upward automatically.",
  },
  {
    id: "ai",
    title: "HEURISTIC LAYER",
    icon: <Sparkles className="w-6 h-6" />,
    content: "Chronos isn't just a database. It features an integrated AI command interface. Hit [⌘K] anywhere to trigger semantic actions. Ask the AI to 'Create a high-priority task for tomorrow' and watch the system execute it instantly.",
  },
  {
    id: "finish",
    title: "PRIMARY OBJECTIVE",
    icon: <Check className="w-6 h-6" />,
    content: "To calibrate your Chronos instance, what is your primary objective for using this system?",
  }
];

const GOAL_OPTIONS = [
  "ORGANIZE MY STUDIES",
  "MANAGE PROJECTS",
  "BUILD BETTER HABITS",
  "PLAN MY DAY",
  "MANAGE EVERYTHING IN ONE PLACE"
];

export const OnboardingFlow: React.FC<OnboardingFlowProps> = ({ onComplete, onSkip }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedGoal, setSelectedGoal] = useState<string | null>(null);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === "Enter") {
        if (currentStep < STEPS.length - 1) {
          setCurrentStep(c => c + 1);
        } else if (currentStep === STEPS.length - 1 && selectedGoal) {
          onComplete(selectedGoal);
        }
      } else if (e.key === "ArrowLeft" && currentStep > 0) {
        setCurrentStep(c => c - 1);
      } else if (e.key === "Escape") {
        onSkip();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentStep, selectedGoal, onComplete, onSkip]);

  const step = STEPS[currentStep];
  const isLast = currentStep === STEPS.length - 1;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 sm:p-8 font-mono bg-background text-foreground">
      {/* Grid Background Effect */}
      <div className="absolute inset-0 z-0 opacity-20 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#EBEAE5 1px, transparent 1px)', backgroundSize: '24px 24px' }}></div>
      
      <div className="relative z-10 w-full max-w-2xl bg-[#0B0910] border border-border flex flex-col shadow-2xl overflow-hidden min-h-[500px]">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div className="flex items-center gap-4">
            <div className="text-foreground/50 text-[10px] uppercase tracking-widest">
              [ SETUP_SEQUENCE: {(currentStep + 1).toString().padStart(2, '0')}/{STEPS.length.toString().padStart(2, '0')} ]
            </div>
          </div>
          <button 
            onClick={onSkip}
            className="text-[10px] text-foreground/40 hover:text-foreground transition-colors uppercase tracking-widest flex items-center gap-1"
          >
            <span>SKIP INITIALIZATION</span>
            <X className="w-3 h-3" />
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 p-8 sm:p-12 flex flex-col justify-center relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="flex flex-col h-full"
            >
              <div className="flex items-center gap-4 mb-6">
                <div className="p-3 border border-border text-foreground">
                  {step.icon}
                </div>
                <h2 className="text-xl sm:text-2xl font-bold uppercase tracking-widest">{step.title}</h2>
              </div>
              
              <p className="text-foreground/70 leading-relaxed text-sm sm:text-base max-w-lg mb-8 uppercase tracking-wider">
                {step.content}
              </p>

              {isLast && (
                <div className="flex flex-col gap-3 mt-4">
                  {GOAL_OPTIONS.map(goal => (
                    <button
                      key={goal}
                      onClick={() => setSelectedGoal(goal)}
                      className={clsx(
                        "text-left p-4 border text-[11px] uppercase tracking-widest transition-all duration-200 flex items-center justify-between",
                        selectedGoal === goal 
                          ? "border-foreground bg-foreground text-background font-bold"
                          : "border-border text-foreground/70 hover:border-foreground/50 hover:text-foreground"
                      )}
                    >
                      <span>{goal}</span>
                      {selectedGoal === goal && <Check className="w-4 h-4" />}
                    </button>
                  ))}
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Footer / Controls */}
        <div className="p-6 border-t border-border flex items-center justify-between bg-[#0B0910]">
          <div className="flex items-center gap-2">
            {STEPS.map((_, i) => (
              <div 
                key={i} 
                className={clsx(
                  "h-1 transition-all duration-300",
                  i === currentStep ? "w-8 bg-foreground" : i < currentStep ? "w-2 bg-foreground/40" : "w-2 bg-border"
                )} 
              />
            ))}
          </div>

          <div className="flex items-center gap-4">
            {currentStep > 0 && (
              <button
                onClick={() => setCurrentStep(c => c - 1)}
                className="text-[10px] text-foreground/50 hover:text-foreground transition-colors uppercase tracking-widest px-4 py-2"
              >
                [ BACK ]
              </button>
            )}
            
            {!isLast ? (
              <button
                onClick={() => setCurrentStep(c => c + 1)}
                className="flex items-center gap-2 bg-foreground text-background px-6 py-3 text-[10px] font-bold uppercase tracking-widest hover:opacity-90 transition-opacity"
              >
                <span>CONTINUE</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={() => selectedGoal && onComplete(selectedGoal)}
                disabled={!selectedGoal}
                className="flex items-center gap-2 bg-foreground text-background px-6 py-3 text-[10px] font-bold uppercase tracking-widest hover:opacity-90 transition-opacity disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <span>INITIALIZE SYSTEM</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

"use client";

import React, { useState, useEffect } from "react";
import { Play, Pause, RotateCcw, Volume2, Sparkles } from "lucide-react";
import clsx from "clsx";

export const FocusTimerWidget: React.FC = () => {
  const [secondsLeft, setSecondsLeft] = useState<number>(25 * 60);
  const [isActive, setIsActive] = useState<boolean>(false);
  const [mode, setMode] = useState<"POMODORO" | "SHORT_BREAK" | "DEEP_WORK">("POMODORO");
  const [sessionCount, setSessionCount] = useState<number>(3);

  useEffect(() => {
    let interval: any = null;
    if (isActive && secondsLeft > 0) {
      interval = setInterval(() => {
        setSecondsLeft((s) => s - 1);
      }, 1000);
    } else if (secondsLeft === 0) {
      setIsActive(false);
      setSessionCount((c) => c + 1);
      // Log session completion to backend
      fetch("/api/focus", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "complete-session", durationMinutes: mode === "DEEP_WORK" ? 60 : 25, taskName: "Deep Work Session" }),
      });
    }
    return () => clearInterval(interval);
  }, [isActive, secondsLeft, mode]);

  const switchMode = (newMode: "POMODORO" | "SHORT_BREAK" | "DEEP_WORK") => {
    setIsActive(false);
    setMode(newMode);
    if (newMode === "POMODORO") setSecondsLeft(25 * 60);
    if (newMode === "SHORT_BREAK") setSecondsLeft(5 * 60);
    if (newMode === "DEEP_WORK") setSecondsLeft(60 * 60);
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  return (
    <div className="flex flex-col justify-between h-full min-h-[160px] text-foreground font-mono">
      {/* Header */}
      <div className="flex items-center justify-between text-[10px] uppercase tracking-widest mb-4 px-1">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => switchMode("POMODORO")}
            className={clsx("transition-colors", mode === "POMODORO" ? "text-foreground font-bold" : "text-foreground/40 hover:text-foreground")}
          >
            25M
          </button>
          <button 
            onClick={() => switchMode("SHORT_BREAK")}
            className={clsx("transition-colors", mode === "SHORT_BREAK" ? "text-foreground font-bold" : "text-foreground/40 hover:text-foreground")}
          >
            05M
          </button>
          <button 
            onClick={() => switchMode("DEEP_WORK")}
            className={clsx("transition-colors", mode === "DEEP_WORK" ? "text-foreground font-bold" : "text-foreground/40 hover:text-foreground")}
          >
            60M
          </button>
        </div>
        <span className="text-foreground/50 hidden sm:block">SYSTEM TIMER</span>
      </div>

      <div className="w-full h-[1px] bg-border mb-4" />

      {/* Timer Display */}
      <div className="text-center flex-grow flex flex-col items-center justify-center py-4">
        <div className="text-4xl sm:text-5xl lg:text-6xl font-sans font-medium tracking-tighter leading-none mb-4 whitespace-nowrap overflow-hidden text-ellipsis w-full">
          {formatTime(secondsLeft)}
        </div>
        <div className="text-[9px] text-foreground/50 uppercase tracking-widest px-2 text-center">
          {isActive ? "FLOW STATE ACTIVE" : "SYSTEM PAUSED"} • {sessionCount} CYCLES
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
        <button
          onClick={() => setIsActive(!isActive)}
          className="text-[10px] uppercase tracking-widest font-bold text-foreground hover:opacity-70 transition-opacity"
        >
          {isActive ? "[ PAUSE ]" : "[ START ]"}
        </button>

        <button
          onClick={() => switchMode(mode)}
          className="text-[9px] uppercase tracking-widest text-foreground/40 hover:text-foreground transition-colors"
          title="Reset timer"
        >
          RESET
        </button>
      </div>
    </div>
  );
};

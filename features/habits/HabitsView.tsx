"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { 
  Flame, CheckCircle2, Sparkles, TrendingUp, Calendar, 
  BookOpen, Code, Dumbbell, Moon, HeartPulse, Plus, 
  Award, RefreshCw
} from "lucide-react";



import { useHabits } from "./api/useHabits";

export const HabitsView: React.FC = () => {
  const { habits: fetchedHabits, isLoading, toggleHabit } = useHabits();
  const habits = fetchedHabits || [];

  const toggleCheckIn = (id: string, currentState: boolean) => {
    toggleHabit(id, !currentState);
  };

  return (
    <div className="p-6 sm:p-8 space-y-8 max-w-7xl mx-auto pb-24 font-mono">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-border pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] uppercase tracking-widest text-foreground/50">Compounding Executive Momentum</span>
            <span className="text-[10px] text-foreground/50 px-2 py-0.5 border border-border">
              [ 14 DAYS ACTIVE STREAK ]
            </span>
          </div>
          <h2 className="text-xl font-bold text-foreground tracking-widest uppercase">
            Habits & Consistency Heatmaps
          </h2>
          <p className="text-[10px] text-foreground/40 mt-1 uppercase tracking-widest">
            Excellence is not an act, but a habit. Track your daily consistency.
          </p>
        </div>

        <button className="px-4 py-2 border border-foreground text-foreground hover:bg-foreground hover:text-background transition-all uppercase tracking-widest text-[10px]">
          [ NEW HABIT CHALLENGE ]
        </button>
      </div>

      {/* Top Summary Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 font-mono text-[10px] uppercase tracking-widest">
        <div className="p-6 border border-border space-y-4">
          <span className="text-foreground/60 font-bold border-b border-border pb-2 block w-full">CURRENT LONGEST STREAK</span>
          <div className="flex items-baseline gap-2 pt-2">
            <span className="text-4xl font-bold text-foreground">14</span>
            <span className="text-foreground/80 font-bold">DAYS</span>
          </div>
          <p className="text-foreground/50 border-l border-foreground/30 pl-2">Coding LeetCode & Chronos AI.</p>
        </div>

        <div className="p-6 border border-border space-y-4">
          <span className="text-foreground/60 font-bold border-b border-border pb-2 block w-full">MONTHLY CONSISTENCY RATE</span>
          <div className="flex items-baseline gap-2 pt-2">
            <span className="text-4xl font-bold text-foreground">91%</span>
            <span className="text-foreground/80 font-bold">[ +4% VS LAST MO ]</span>
          </div>
          <p className="text-foreground/50 border-l border-foreground/30 pl-2">Across all 4 active habits.</p>
        </div>

        <div className="p-6 border border-border space-y-4">
          <span className="text-foreground/60 font-bold border-b border-border pb-2 block w-full">TOTAL CHECK-INS</span>
          <div className="flex items-baseline gap-2 pt-2">
            <span className="text-4xl font-bold text-foreground">312</span>
            <span className="text-foreground/50">ALL-TIME LOGS</span>
          </div>
          <p className="text-foreground/50 border-l border-foreground/30 pl-2">Compounding daily.</p>
        </div>
      </div>

      {/* Habits List with GitHub Heatmaps */}
      <div className="space-y-6">
        {habits.map((habit) => (
          <motion.div
            key={habit.id}
            layout
            className={`p-6 border transition-all duration-200 bg-background ${
              habit.isCompletedToday
                ? "border-foreground"
                : "border-border hover:border-foreground/50"
            }`}
          >
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              {/* Left: Habit Info & Check-in Button */}
              <div className="flex items-center gap-4">
                <button
                  onClick={() => toggleCheckIn(habit.id, !!habit.isCompletedToday)}
                  className={`w-10 h-10 border flex items-center justify-center transition-all shrink-0 ${
                    habit.isCompletedToday
                      ? "bg-foreground border-foreground text-background"
                      : "bg-transparent border-foreground/30 hover:border-foreground text-foreground/50"
                  }`}
                >
                  {habit.isCompletedToday ? <span className="font-bold">X</span> : <span className="font-bold">O</span>}
                </button>

                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-foreground uppercase tracking-wider">{habit.title}</h3>
                    <span className="text-[10px] font-mono uppercase px-1 border border-border text-foreground/60">
                      {habit.category}
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-4 text-[10px] uppercase tracking-widest text-foreground/50">
                    <span className="font-bold text-foreground/80">
                      [ {habit.currentStreak}D STREAK ]
                    </span>
                    <span>BEST: {habit.bestStreak}D</span>
                    <span className="border-l border-foreground/30 pl-2">RATE: {habit.completionRate}%</span>
                  </div>
                </div>
              </div>

              {/* Right: GitHub Heatmap Grid (28 Days) */}
              <div className="flex flex-col items-start lg:items-end gap-2 shrink-0">
                <span className="text-[10px] font-mono uppercase tracking-widest text-foreground/40 font-bold border-b border-border pb-1 mb-1">
                  [ LAST 14 DAYS ACTIVITY ]
                </span>
                <div className="grid grid-cols-7 sm:grid-cols-14 gap-1">
                  {habit.history?.map((completed, i) => (
                    <div
                      key={i}
                      title={`Day ${i + 1}: ${completed ? "Completed" : "Missed"}`}
                      className={`w-3 h-3 sm:w-4 sm:h-4 border transition-transform hover:scale-110 cursor-pointer ${
                        completed
                          ? "bg-foreground border-foreground"
                          : "bg-background border-border"
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Check-in celebratory strip if completed today */}
            {habit.isCompletedToday && (
              <div className="mt-6 pt-4 border-t border-border flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[10px] uppercase tracking-widest text-foreground/50">
                <span className="font-bold text-foreground">
                  [ LOGGED TODAY. MOMENTUM PRESERVED. ]
                </span>
                <span>NEXT CHECK-IN AVAILABLE TOMORROW 4:00 AM</span>
              </div>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
};

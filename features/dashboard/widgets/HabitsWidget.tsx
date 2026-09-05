"use client";

import React from "react";
import { Flame, TrendingUp } from "lucide-react";
import clsx from "clsx";
import { useHabits } from "../../habits/api/useHabits";
import { Skeleton } from "../../../components/ui/Skeleton";

export const HabitsWidget: React.FC = () => {
  const { habits, isLoading, error } = useHabits();

  if (isLoading) {
    return (
      <div className="flex flex-col justify-between h-full min-h-[160px] p-4">
        <Skeleton count={2} />
      </div>
    );
  }

  if (error || !habits) {
    return <div className="text-[10px] font-mono text-red-500 p-4 text-center">FAILED TO LOAD HABITS</div>;
  }

  if (habits.length === 0) {
    return (
      <div className="flex flex-col h-full min-h-[160px] p-4 text-[10px] font-mono uppercase tracking-widest text-foreground/40">
        <div>[ NO ACTIVE HABITS ]</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full font-mono">
      {/* Header handled by WidgetContainer */}

      <div className="flex-1 overflow-y-auto scrollbar-none pr-4">
        <div className="flex flex-col space-y-6">
          {habits.map((habit: any, index: number) => {
            const indexStr = (index + 1).toString().padStart(2, '0');
            
            // Generate ASCII blocks based on history (last 14 days for example)
            const history = habit.history || Array(14).fill(false);
            const asciiBlocks = history.slice(-14).map((done: boolean) => done ? "█" : "░").join("");

            return (
              <div key={habit.id} className="flex gap-6 group">
                <span className="text-[10px] uppercase tracking-widest text-foreground/40 pt-1 shrink-0">
                  {indexStr}
                </span>
                <div className="flex flex-col w-full">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium tracking-widest uppercase">
                      {habit.title}
                    </span>
                    <span className="text-[9px] text-foreground/50 uppercase tracking-widest">
                      {habit.currentStreak} STRK
                    </span>
                  </div>
                  <div className="text-[10px] tracking-widest text-foreground/70 overflow-hidden whitespace-pre font-mono">
                    {asciiBlocks}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

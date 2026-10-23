"use client";

import React from "react";
import { Flame, CheckCircle2 } from "lucide-react";
import { useHabits } from "../../habits/api/useHabits";
import { Skeleton } from "../../../components/ui/Skeleton";

export const HabitsWidget: React.FC = () => {
  const { habits, isLoading, error, toggleHabit } = useHabits();

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
      <div className="flex-1 overflow-y-auto scrollbar-none pr-4">
        <div className="flex flex-col space-y-5">
          {habits.map((habit: any, index: number) => {
            const indexStr = (index + 1).toString().padStart(2, "0");
            const history = habit.history || Array(14).fill(false);
            const asciiBlocks = history.slice(-14).map((done: boolean) => (done ? "█" : "░")).join("");

            return (
              <div key={habit.id} className="flex gap-4 group items-start border-b border-border/40 pb-4 last:border-b-0">
                <span className="text-[10px] uppercase tracking-widest text-foreground/40 pt-1 shrink-0">
                  {indexStr}
                </span>

                <div className="flex flex-col w-full min-w-0">
                  <div className="flex items-center justify-between mb-1 gap-2">
                    <span className={`text-xs font-bold tracking-widest uppercase truncate ${habit.isCompletedToday ? "text-foreground line-through opacity-70" : "text-foreground"}`}>
                      {habit.title}
                    </span>

                    <button
                      type="button"
                      onClick={() => toggleHabit(habit.id, !habit.isCompletedToday)}
                      className={`text-[9px] px-2 py-0.5 border shrink-0 transition-all uppercase tracking-widest ${
                        habit.isCompletedToday
                          ? "border-foreground bg-foreground text-background font-bold"
                          : "border-border text-foreground/60 hover:border-foreground hover:text-foreground"
                      }`}
                    >
                      {habit.isCompletedToday ? "[ DONE ]" : "[ LOG ]"}
                    </button>
                  </div>

                  <div className="flex items-center justify-between mt-1 text-[9px] font-mono text-foreground/50 tracking-widest">
                    <span className="overflow-hidden whitespace-pre text-foreground/70">
                      {asciiBlocks}
                    </span>
                    <span className="flex items-center gap-1">
                      <Flame className="w-2.5 h-2.5 text-foreground" /> {habit.currentStreak} STRK
                    </span>
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

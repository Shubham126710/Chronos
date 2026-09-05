"use client";

import React from "react";
import { Target, Zap, ArrowRight, Activity } from "lucide-react";
import { useGoals } from "../../goals/api/useGoals";
import { Skeleton } from "../../../components/ui/Skeleton";

export const GoalsWidget: React.FC = () => {
  const { goals, isLoading, error } = useGoals();

  if (isLoading) {
    return (
      <div className="flex flex-col justify-between h-full min-h-[160px] text-foreground p-4">
        <Skeleton count={2} />
      </div>
    );
  }

  if (error || !goals) {
    return <div className="text-[10px] font-mono text-red-500 p-4 text-center">FAILED TO LOAD GOALS</div>;
  }

  if (goals.length === 0) {
    return (
      <div className="flex flex-col h-full min-h-[160px] p-4 text-[10px] font-mono uppercase tracking-widest text-foreground/40">
        <div>[ NO ACTIVE GOALS ]</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full font-mono">
      {/* Header handled by WidgetContainer */}

      <div className="flex-1 overflow-y-auto scrollbar-none pr-4">
        <div className="flex flex-col space-y-6">
          {goals.map((goal: any, i: number) => {
            const indexStr = (i + 1).toString().padStart(2, '0');
            const progress = goal.progress || 0;
            
            // Create a dynamic line based on progress
            const lineLength = 20;
            const filledLength = Math.round((progress / 100) * lineLength);
            const lineStr = "─".repeat(filledLength) + " ".repeat(lineLength - filledLength);

            return (
              <div key={goal.id} className="flex gap-6 group">
                <span className="text-[10px] uppercase tracking-widest text-foreground/40 pt-1 shrink-0">
                  {indexStr}
                </span>
                <div className="flex flex-col w-full">
                  <span className="text-sm font-medium tracking-widest uppercase mb-1">
                    {goal.title}
                  </span>
                  <div className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-foreground/50">
                    <span className="font-bold tracking-[-0.1em] overflow-hidden whitespace-pre">
                      {lineStr.replace(/ /g, "·")}
                    </span>
                    <span className="shrink-0">{progress}%</span>
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

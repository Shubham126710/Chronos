"use client";

import React from "react";
import { useDashboard } from "../api/useDashboard";
import { Skeleton } from "../../../components/ui/Skeleton";

export const ProductivityScoreWidget: React.FC = () => {
  const { data, isLoading } = useDashboard();

  if (isLoading) {
    return (
      <div className="flex flex-col h-full min-h-[160px] p-4 text-[10px] font-mono uppercase tracking-widest text-foreground/40">
        <Skeleton count={1} />
      </div>
    );
  }

  const score = data?.user?.productivityScore || 0;
  const isOptimal = score >= 90;

  return (
    <div className="flex flex-col justify-between h-full min-h-[160px] text-foreground font-mono">
      <div>
        <div className="flex items-center justify-between text-[10px] uppercase tracking-widest mb-4">
          <span className="text-foreground/50"></span>
          <span className="text-foreground">+2% THIS WEEK</span>
        </div>
        
        <div className="flex items-baseline mb-6">
          <span className="text-7xl sm:text-8xl font-sans font-medium tracking-tighter leading-none">
            {score}
          </span>
          <span className="text-sm text-foreground/40 font-mono tracking-widest ml-1">
            /100
          </span>
        </div>
      </div>

      <div className="flex flex-col gap-2 border-t border-border pt-4">
        <div className="flex justify-between items-center text-[10px] font-mono uppercase tracking-widest text-foreground/50">
          <span>{isOptimal ? "PEAK EFFICIENCY" : "BUILDING MOMENTUM"}</span>
          <span>STATE ACHIEVED</span>
        </div>
        <div className="h-[1px] w-full bg-border-subtle overflow-hidden mt-1">
          <div 
            className="h-full bg-foreground transition-all duration-1000" 
            style={{ width: `${score}%` }} 
          />
        </div>
      </div>
    </div>
  );
};

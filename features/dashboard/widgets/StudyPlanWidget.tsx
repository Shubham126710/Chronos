"use client";

import React, { useState } from "react";
import { BookOpen, CheckCircle2, Clock, ShieldAlert, Sparkles } from "lucide-react";
import clsx from "clsx";

export const StudyPlanWidget: React.FC = () => {
  const [plan, setPlan] = useState({
    title: "4-Week GATE & Placement Study Roadmap",
    weeks: [
      { week: 1, focus: "Trees, BST & Graph Traversals (BFS/DFS)", hours: 15, status: "COMPLETED" },
      { week: 2, focus: "Dynamic Programming (Knapsack, LCS, LIS)", hours: 18, status: "ACTIVE" },
      { week: 3, focus: "Operating Systems (Virtual Memory & Deadlocks)", hours: 14, status: "UPCOMING" },
      { week: 4, focus: "Full Length Mock Tests & Company Specific Archives", hours: 20, status: "UPCOMING" },
    ],
    bufferRule: "Every Friday afternoon is automatically blocked as a 4-hour Buffer Window to absorb spillover without cognitive anxiety.",
  });

  return (
    <div className="flex flex-col justify-between h-full min-h-[160px] text-white">
      <div>
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-xs font-bold text-emerald-300 uppercase tracking-widest flex items-center gap-1.5">
            <BookOpen className="w-4 h-4" />
            <span>{plan.title}</span>
          </h4>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
            Week 2 Active
          </span>
        </div>

        <div className="space-y-2">
          {plan.weeks.map((w) => (
            <div
              key={w.week}
              className={clsx(
                "p-2.5 rounded-xl border flex items-center justify-between gap-2 text-xs transition-all",
                w.status === "ACTIVE"
                  ? "bg-emerald-500/15 border-emerald-500/40 text-white font-medium shadow-md"
                  : w.status === "COMPLETED"
                  ? "bg-white/5 border-white/10 text-white/50 line-through"
                  : "bg-white/5 border-white/5 text-white/70"
              )}
            >
              <div className="flex items-center gap-2 truncate">
                <span className="font-mono text-emerald-400 font-bold shrink-0">W{w.week}</span>
                <span className="truncate">{w.focus}</span>
              </div>
              <span className="font-mono text-[10px] text-white/50 shrink-0">{w.hours}h goal</span>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-white/10 flex items-start gap-2 text-[11px] text-emerald-300 bg-emerald-500/10 p-2.5 rounded-xl border border-emerald-500/20">
        <Sparkles className="w-3.5 h-3.5 shrink-0 mt-0.5" />
        <span className="leading-relaxed">{plan.bufferRule}</span>
      </div>
    </div>
  );
};

"use client";

import React, { useState } from "react";
import { Code2, CheckCircle2, Award, Zap, BookOpen, ShieldCheck } from "lucide-react";
import clsx from "clsx";

export const DsaPlacementWidget: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"dsa" | "gate" | "interviews">("dsa");

  const dsaTopics = [
    { topic: "Dynamic Programming (Knapsack, LCS)", solved: 28, total: 35, level: "High" },
    { topic: "Trees & BST (Traversals, LCA)", solved: 32, total: 35, level: "Mastered" },
    { topic: "Graph Algorithms (Dijkstra, BFS/DFS)", solved: 20, total: 30, level: "In Progress" },
    { topic: "Arrays & Sliding Window", solved: 45, total: 50, level: "Mastered" },
  ];

  const gateTopics = [
    { subject: "Operating Systems (Virtual Memory & Deadlocks)", weightage: "10-12 marks", progress: 75 },
    { subject: "Computer Networks (TCP/IP & Routing)", weightage: "8-10 marks", progress: 60 },
    { subject: "Database Management (Normal Forms & SQL)", weightage: "8-10 marks", progress: 85 },
    { subject: "Data Structures & Algorithms", weightage: "12-15 marks", progress: 90 },
  ];

  return (
    <div className="flex flex-col justify-between h-full min-h-[180px] text-white">
      {/* Top Nav Tabs */}
      <div className="flex items-center gap-1.5 border-b border-white/10 pb-2 mb-3">
        {[
          { id: "dsa", label: "LeetCode / DSA (125/150)" },
          { id: "gate", label: "GATE Syllabus (78%)" },
          { id: "interviews", label: "Mock Readiness (85%)" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={clsx(
              "px-3 py-1 rounded-xl text-xs font-medium transition-all",
              activeTab === tab.id
                ? "bg-[#81C3D7]/20 text-[#81C3D7] border border-[#81C3D7]/40 font-bold shadow-sm"
                : "text-white/60 hover:text-white hover:bg-white/5"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto space-y-2.5 max-h-[220px] pr-1 scrollbar-none">
        {activeTab === "dsa" && (
          <div className="space-y-2">
            {dsaTopics.map((t, idx) => {
              const pct = Math.round((t.solved / t.total) * 100);
              return (
                <div key={idx} className="bg-white/5 border border-white/10 rounded-2xl p-3">
                  <div className="flex justify-between items-center text-xs mb-1.5">
                    <span className="font-semibold text-white">{t.topic}</span>
                    <span className="font-mono text-[#81C3D7] font-bold">{t.solved}/{t.total} ({pct}%)</span>
                  </div>
                  <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-[#81C3D7] to-teal-400 rounded-full" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {activeTab === "gate" && (
          <div className="space-y-2">
            {gateTopics.map((g, idx) => (
              <div key={idx} className="bg-white/5 border border-white/10 rounded-2xl p-3 flex items-center justify-between gap-3">
                <div className="truncate flex-1">
                  <h4 className="text-xs font-semibold text-white truncate">{g.subject}</h4>
                  <div className="text-[10px] font-mono text-white/50 mt-0.5">Weightage: {g.weightage}</div>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-xs font-mono font-bold text-emerald-400">{g.progress}%</div>
                  <div className="text-[9px] uppercase tracking-widest text-white/40">Syllabus</div>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === "interviews" && (
          <div className="bg-white/5 border border-white/10 rounded-2xl p-4 text-center space-y-3">
            <div className="inline-flex p-3 rounded-2xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              <Award className="w-8 h-8" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">Senior Engineer Readiness: 85%</h4>
              <p className="text-xs text-white/60 mt-1 leading-relaxed">
                You have completed 14 mock system design and live coding rounds. Strong performance noted in Graph Shortest Path trade-offs.
              </p>
            </div>
            <div className="flex justify-center gap-2 pt-2">
              <span className="px-2.5 py-1 rounded-full bg-white/10 text-[10px] font-mono text-white/80">System Design: 9/10</span>
              <span className="px-2.5 py-1 rounded-full bg-white/10 text-[10px] font-mono text-white/80">Live Coding: 8.5/10</span>
            </div>
          </div>
        )}
      </div>

      <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-xs text-white/60">
        <span className="flex items-center gap-1.5 text-[#81C3D7]">
          <Zap className="w-3.5 h-3.5" />
          <span>Placement Season 2026 Ready</span>
        </span>
        <span className="font-mono text-[10px] uppercase text-white/40">Student Command Center</span>
      </div>
    </div>
  );
};

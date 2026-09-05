"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Target, Sparkles, ChevronRight, ChevronDown, CheckCircle2, 
  Plus, TrendingUp, Layers, Calendar, ArrowUpRight, Zap, Flag
} from "lucide-react";

// Mock data removed in favor of React Query hook

import { useGoals, GoalNode } from "./api/useGoals";

export const GoalsView: React.FC = () => {
  const { goals: fetchedGoals, isLoading } = useGoals();
  const goals = fetchedGoals || [];
  const [expandedNodes, setExpandedNodes] = useState<Record<string, boolean>>({
    g_root_1: true,
    g_root_2: true,
  });
  const [selectedGoal, setSelectedGoal] = useState<GoalNode | null>(null);

  // Automatically select first goal when loaded
  React.useEffect(() => {
    if (goals.length > 0 && !selectedGoal) {
      setSelectedGoal(goals[0]);
    }
  }, [goals, selectedGoal]);
  const [isGeneratingRoadmap, setIsGeneratingRoadmap] = useState(false);
  const [roadmapGenerated, setRoadmapGenerated] = useState(false);

  const toggleExpand = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedNodes((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleGenerateRoadmap = () => {
    setIsGeneratingRoadmap(true);
    setTimeout(() => {
      setIsGeneratingRoadmap(false);
      setRoadmapGenerated(true);
    }, 1000);
  };

  const renderGoalNode = (node: GoalNode, depth = 0) => {
    const isExpanded = expandedNodes[node.id];
    const isSelected = selectedGoal?.id === node.id;
    const hasChildren = node.children && node.children.length > 0;

    return (
      <div key={node.id} className="space-y-2">
        <div
          onClick={() => setSelectedGoal(node)}
          className={`p-3 border transition-all cursor-pointer flex items-start sm:items-center justify-between gap-4 font-mono text-xs ${
            isSelected
              ? "border-foreground bg-foreground/5"
              : "border-border hover:border-foreground/50"
          }`}
          style={{ marginLeft: `${depth * 24}px` }}
        >
          <div className="flex items-center gap-3 min-w-0">
            {hasChildren ? (
              <button
                onClick={(e) => toggleExpand(node.id, e)}
                className="hover:text-foreground text-foreground/50 transition-colors"
              >
                {isExpanded ? "[-]" : "[+]"}
              </button>
            ) : (
              <span className="text-foreground/30">[*]</span>
            )}

            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h4 className="text-xs uppercase tracking-widest font-bold text-foreground truncate">{node.title}</h4>
                <span className="text-[10px] uppercase px-1 border border-border text-foreground/60">
                  {node.category}
                </span>
              </div>
              <p className="text-[10px] uppercase tracking-widest text-foreground/50 truncate mt-1">{node.description}</p>
            </div>
          </div>

          <div className="flex items-center gap-4 shrink-0 uppercase tracking-widest text-[10px]">
            <div className="text-right hidden sm:block w-24">
              <div className="flex items-center justify-end gap-2 text-foreground/80">
                <span>[ {node.progress}% ]</span>
              </div>
            </div>

            <span className="text-foreground/60">
              [ {node.linkedTasksCount} TASKS ]
            </span>
          </div>
        </div>

        {/* Render children if expanded */}
        {hasChildren && isExpanded && (
          <div className="space-y-2 border-l border-border ml-[5px] pl-2">
            {node.children!.map((child) => renderGoalNode(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="p-6 sm:p-8 space-y-8 max-w-7xl mx-auto pb-24 font-mono">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-border pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] uppercase tracking-widest text-foreground/50">Hierarchical Ambition Engine</span>
            <span className="text-[10px] text-foreground/50 px-2 py-0.5 border border-border">
              [ 2 Root Goals Active ]
            </span>
          </div>
          <h2 className="text-xl font-bold text-foreground tracking-widest uppercase">
            Goal Tree Hierarchy
          </h2>
          <p className="text-[10px] text-foreground/40 mt-1 uppercase tracking-widest">
            Connect everyday tasks and habits directly to overarching life ambitions. Watch execution compound.
          </p>
        </div>

        <button className="px-4 py-2 border border-foreground text-foreground hover:bg-foreground hover:text-background transition-all uppercase tracking-widest text-[10px]">
          [ NEW LIFE GOAL ]
        </button>
      </div>

      {/* Main Grid: Goal Tree vs Goal Inspector & Roadmap */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Tree List (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between px-2 text-[10px] uppercase tracking-widest text-foreground/50 border-b border-border pb-2">
            <span className="font-bold">
              Active Goal Trees
            </span>
            <span>[ Click goal to inspect ]</span>
          </div>

          <div className="space-y-3">
            {goals.map((rootNode) => renderGoalNode(rootNode, 0))}
          </div>
        </div>

        {/* Right Inspector & AI Roadmap Generator (5 cols) */}
        <div className="lg:col-span-5 space-y-6 sticky top-28">
          {selectedGoal ? (
            <div className="p-6 border border-foreground/30 bg-background space-y-6">
              <div className="flex items-start justify-between gap-4 border-b border-border pb-4">
                <div>
                  <span className="text-[10px] uppercase tracking-widest text-foreground/60 border border-border px-2 py-0.5">
                    [ {selectedGoal.category} AMBITION ]
                  </span>
                  <h3 className="text-sm font-bold text-foreground mt-4 uppercase tracking-widest leading-snug">
                    {selectedGoal.title}
                  </h3>
                  <p className="text-[10px] text-foreground/60 mt-2 uppercase tracking-widest leading-relaxed">
                    {selectedGoal.description}
                  </p>
                </div>
              </div>

              {/* Progress Stat */}
              <div className="p-4 border border-border space-y-4">
                <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest">
                  <span className="text-foreground/70">OVERALL COMPLETION RATE</span>
                  <span className="text-foreground">[{selectedGoal.progress}%]</span>
                </div>
                <div className="flex items-center justify-between text-[10px] text-foreground/50 uppercase tracking-widest">
                  <span>TARGET: {selectedGoal.targetDate}</span>
                  <span>[ {selectedGoal.linkedTasksCount} LINKED TASKS ACTIVE ]</span>
                </div>
              </div>

              {/* AI Roadmap Breakdown Button */}
              <div className="space-y-4 pt-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase tracking-widest text-foreground/60 font-bold">
                    [ AI EXECUTION ROADMAP ]
                  </span>
                </div>

                {!roadmapGenerated ? (
                  <button
                    onClick={handleGenerateRoadmap}
                    disabled={isGeneratingRoadmap}
                    className="w-full py-3 border border-foreground/50 hover:border-foreground text-foreground transition-all uppercase tracking-widest text-[10px]"
                  >
                    {isGeneratingRoadmap ? "[ GENERATING WEEKLY MILESTONES... ]" : "[ GENERATE WEEKLY AI ROADMAP ]"}
                  </button>
                ) : (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-3 p-4 border border-foreground/50"
                  >
                    <div className="flex items-center justify-between border-b border-border pb-2 text-[10px] uppercase tracking-widest">
                      <span className="font-bold text-foreground">WEEKLY AI MILESTONES</span>
                      <span className="text-foreground/60">
                        [ ON TRACK ]
                      </span>
                    </div>

                    <div className="space-y-3 text-[10px] uppercase tracking-widest text-foreground/80 mt-4">
                      <div className="pl-3 border-l border-foreground flex flex-col gap-1">
                        <p className="font-bold text-foreground">WEEK 1-2: COMPLETE LEETCODE GRAPH 50</p>
                        <p className="text-foreground/50">Focus on Dijkstra and Minimum Spanning Trees.</p>
                      </div>

                      <div className="pl-3 border-l border-border flex flex-col gap-1">
                        <p className="font-bold text-foreground">WEEK 3-4: LAUNCH CHRONOS AI OS DEMO</p>
                        <p className="text-foreground/50">Deploy Next.js 15 app with WebGL shaders and Prisma 6.</p>
                      </div>

                      <div className="pl-3 border-l border-border flex flex-col gap-1">
                        <p className="font-bold text-foreground">WEEK 5-6: CONDUCT 5 SENIOR PEER MOCKS</p>
                        <p className="text-foreground/50">Simulate 45-min system design interview loops.</p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </div>
            </div>
          ) : (
            <div className="p-8 border border-border text-center text-[10px] uppercase tracking-widest text-foreground/50">
              [ SELECT ANY GOAL FROM THE TREE TO INSPECT ROADMAP ]
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

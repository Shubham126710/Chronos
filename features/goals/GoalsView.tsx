"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { 
  Target, Sparkles, ChevronRight, ChevronDown, CheckCircle2, 
  Plus, TrendingUp, Layers, Calendar, ArrowUpRight, Zap, Flag
} from "lucide-react";
import { useGoals, GoalNode } from "./api/useGoals";

export const GoalsView: React.FC = () => {
  const { goals: fetchedGoals, isLoading, generateRoadmap, isGeneratingRoadmap } = useGoals();
  const goals = fetchedGoals || [];
  const [expandedNodes, setExpandedNodes] = useState<Record<string, boolean>>({});
  const [selectedGoal, setSelectedGoal] = useState<GoalNode | null>(null);

  // Automatically select first goal or update selected when goals change
  React.useEffect(() => {
    if (goals.length > 0) {
      if (!selectedGoal) {
        setSelectedGoal(goals[0]);
      } else {
        const found = goals.find(g => g.id === selectedGoal.id);
        if (found) setSelectedGoal(found);
      }
    }
  }, [goals, selectedGoal]);

  const toggleExpand = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedNodes((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleGenerateRoadmap = async () => {
    if (!selectedGoal) return;
    try {
      await generateRoadmap(selectedGoal.id);
    } catch (err: any) {
      alert(err?.message || "Failed to generate roadmap");
    }
  };

  const renderGoalNode = (node: GoalNode, depth = 0) => {
    const isExpanded = expandedNodes[node.id] ?? true;
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
              [ {goals.length} Root Goals Active ]
            </span>
          </div>
          <h2 className="text-xl font-bold text-foreground tracking-widest uppercase">
            Goal Tree Hierarchy
          </h2>
          <p className="text-[10px] text-foreground/40 mt-1 uppercase tracking-widest">
            Connect everyday tasks and habits directly to overarching life ambitions. Watch execution compound.
          </p>
        </div>
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
            {goals.length === 0 ? (
              <div className="p-8 border border-border text-center text-[10px] uppercase tracking-widest text-foreground/40">
                [ NO ACTIVE GOALS. USE COMMAND PALETTE (CMD+K) TO CREATE ONE ]
              </div>
            ) : (
              goals.map((rootNode) => renderGoalNode(rootNode, 0))
            )}
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

              {/* AI Roadmap Breakdown */}
              <div className="space-y-4 pt-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase tracking-widest text-foreground/60 font-bold">
                    [ AI EXECUTION ROADMAP ]
                  </span>
                </div>

                {/* Display existing milestones if present */}
                {selectedGoal.children && selectedGoal.children.length > 0 ? (
                  <div className="space-y-3 p-4 border border-foreground/30">
                    <div className="flex items-center justify-between border-b border-border pb-2 text-[10px] uppercase tracking-widest">
                      <span className="font-bold text-foreground">ACTIVE MILESTONES</span>
                      <span className="text-foreground/60">
                        [ {selectedGoal.children.length} TOTAL ]
                      </span>
                    </div>

                    <div className="space-y-4 text-[10px] uppercase tracking-widest text-foreground/80 mt-4">
                      {selectedGoal.children.map((child, idx) => (
                        <div key={child.id} className="pl-3 border-l border-foreground flex flex-col gap-1.5">
                          <div className="flex items-center justify-between">
                            <p className="font-bold text-foreground">M{idx + 1}: {child.title}</p>
                            <span className="text-foreground/60">[{child.progress}%]</span>
                          </div>
                          <p className="text-foreground/50">{child.description}</p>
                          {child.tasks && child.tasks.length > 0 && (
                            <div className="mt-1 space-y-1">
                              {child.tasks.map(t => (
                                <div key={t.id} className="flex items-center gap-2 text-[9px] text-foreground/70">
                                  <span>{t.isCompleted ? "[✓]" : "[ ]"}</span>
                                  <span className={t.isCompleted ? "line-through opacity-50" : ""}>{t.title}</span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>

                    <button
                      onClick={handleGenerateRoadmap}
                      disabled={isGeneratingRoadmap}
                      className="w-full mt-4 py-2 border border-border hover:border-foreground text-foreground transition-all uppercase tracking-widest text-[9px] disabled:opacity-50"
                    >
                      {isGeneratingRoadmap ? "[ REGENERATING ROADMAP... ]" : "[ REGENERATE MILESTONES ]"}
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={handleGenerateRoadmap}
                    disabled={isGeneratingRoadmap}
                    className="w-full py-3 border border-foreground/50 hover:border-foreground text-foreground transition-all uppercase tracking-widest text-[10px] disabled:opacity-50"
                  >
                    {isGeneratingRoadmap ? "[ GENERATING WEEKLY MILESTONES... ]" : "[ GENERATE WEEKLY AI ROADMAP ]"}
                  </button>
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

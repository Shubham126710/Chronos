"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { 
  Sparkles, Brain, Clock, CheckCircle2, CloudRain, Flame, 
  Target, ArrowRight, Zap, Calendar as CalendarIcon, 
  TrendingUp, RefreshCw, AlertCircle, ShieldCheck
} from "lucide-react";
import { TabType } from "../../components/layout/Sidebar";

interface DashboardViewProps {
  onNavigate: (tab: TabType) => void;
  onOpenCommandPalette: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  onNavigate,
  onOpenCommandPalette,
}) => {
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [aiMessage, setAiMessage] = useState(
    "“You have enough time to finish everything today if you begin with DSA: Dynamic Programming.”"
  );
  const [weatherAlertDismissed, setWeatherAlertDismissed] = useState(false);
  const [tasksCompleted, setTasksCompleted] = useState<Record<string, boolean>>({
    task1: false,
    task2: false,
    task3: true,
  });

  const handleOptimizeSchedule = () => {
    setIsOptimizing(true);
    setTimeout(() => {
      setIsOptimizing(false);
      setAiMessage(
        "“Schedule re-balanced! I shifted your evening walk to tomorrow morning at 8:00 AM to avoid the 4 PM rain, preserving your 4-hour deep work block.”"
      );
    }, 1000);
  };

  const toggleTask = (id: string) => {
    setTasksCompleted((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="p-6 sm:p-8 space-y-8 max-w-7xl mx-auto pb-24">
      {/* 1. AI Recommendation Banner */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-6 rounded-3xl bg-white/5 backdrop-blur-3xl border border-white/20 relative overflow-hidden group shadow-xl"
      >
        <div className="absolute top-0 right-0 w-80 h-80 bg-[#FF8C61]/10 rounded-full blur-2xl -mr-20 -mt-20 pointer-events-none group-hover:bg-[#FF8C61]/20 transition-colors" />
        
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
          <div className="flex items-start sm:items-center gap-4">
            <div className="p-3.5 rounded-2xl bg-[#FF8C61]/10 border border-[#FF8C61]/30 text-[#FF8C61] shrink-0">
              {isOptimizing ? (
                <RefreshCw className="w-6 h-6 animate-spin" />
              ) : (
                <Brain className="w-6 h-6 animate-pulse" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-mono uppercase tracking-widest text-[#FFAC81] font-bold flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5" /> Chronos Executive Intelligence
                </span>
                <span className="text-[10px] bg-white/10 text-white/60 px-2 py-0.5 rounded-full font-mono border border-white/10">
                  Live Adaptive
                </span>
              </div>
              <h3 className="text-base sm:text-lg font-semibold text-white leading-snug">
                {aiMessage}
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto shrink-0">
            <button
              onClick={handleOptimizeSchedule}
              disabled={isOptimizing}
              className="flex-1 md:flex-initial px-5 py-3 rounded-2xl bg-white/10 hover:bg-white/15 text-white font-semibold text-xs border border-white/10 transition-all flex items-center justify-center gap-2 backdrop-blur-md hover:scale-[1.02]"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isOptimizing ? "animate-spin" : ""}`} />
              <span>{isOptimizing ? "Optimizing..." : "Re-balance Schedule"}</span>
            </button>
            <button
              onClick={onOpenCommandPalette}
              className="px-5 py-3 rounded-2xl bg-gradient-to-r from-[#FF8C61] to-[#FF9FFC] text-white font-bold text-xs shadow-lg shadow-[#FF8C61]/20 transition-all flex items-center gap-1.5 hover:scale-[1.02]"
            >
              <span>AI Command</span>
              <kbd className="px-1 py-0.5 rounded bg-white/20 font-mono text-[10px]">⌘K</kbd>
            </button>
          </div>
        </div>
      </motion.div>

      {/* 2. Top Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Productivity Score */}
        <div 
          onClick={() => onNavigate("analytics")}
          className="glass-panel-interactive p-5 rounded-2xl border border-white/10 bg-[#120F17]/80 cursor-pointer group relative overflow-hidden"
        >
          <div className="flex justify-between items-start mb-3">
            <span className="text-xs font-mono uppercase tracking-wider text-[#B497CF]">Productivity Score</span>
            <div className="p-2 rounded-xl bg-[#5227FF]/20 text-[#7B5CFF]">
              <Zap className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-white tracking-tight">94<span className="text-sm font-normal text-white/40">/100</span></span>
            <span className="text-xs font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20 flex items-center gap-0.5">
              <TrendingUp className="w-3 h-3" /> +8%
            </span>
          </div>
          <div className="w-full bg-white/5 h-1.5 rounded-full mt-4 overflow-hidden">
            <div className="bg-[#FF8C61] h-full rounded-full w-[94%]" />
          </div>
          <span className="text-[11px] text-white/50 mt-2 block">Peak efficiency state achieved</span>
        </div>

        {/* Metric 2: Habit Consistency */}
        <div 
          onClick={() => onNavigate("habits")}
          className="glass-panel-interactive p-5 rounded-2xl border border-white/10 bg-[#120F17]/80 cursor-pointer group relative overflow-hidden"
        >
          <div className="flex justify-between items-start mb-3">
            <span className="text-xs font-mono uppercase tracking-wider text-[#FF9FFC]">Habit Consistency</span>
            <div className="p-2 rounded-xl bg-[#FF9FFC]/20 text-[#FF9FFC]">
              <Flame className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-white tracking-tight">14<span className="text-sm font-normal text-white/40"> days</span></span>
            <span className="text-xs font-semibold text-[#FF9FFC] bg-[#FF9FFC]/10 px-2 py-0.5 rounded-full border border-[#FF9FFC]/20">
              98% Rate
            </span>
          </div>
          <div className="flex items-center gap-1 mt-4">
            {[...Array(7)].map((_, i) => (
              <div key={i} className={`flex-1 h-1.5 rounded-full ${i < 6 ? "bg-[#FF9FFC]" : "bg-white/10"}`} />
            ))}
          </div>
          <span className="text-[11px] text-white/50 mt-2 block">Coding &amp; Sleep streaks active</span>
        </div>

        {/* Metric 3: Focus Hours */}
        <div 
          onClick={() => onNavigate("calendar")}
          className="glass-panel-interactive p-5 rounded-2xl border border-white/10 bg-[#120F17]/80 cursor-pointer group relative overflow-hidden"
        >
          <div className="flex justify-between items-start mb-3">
            <span className="text-xs font-mono uppercase tracking-wider text-[#B497CF]">Weekly Deep Work</span>
            <div className="p-2 rounded-xl bg-[#7B5CFF]/20 text-[#B497CF]">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-white tracking-tight">28.5<span className="text-sm font-normal text-white/40"> hrs</span></span>
            <span className="text-xs text-white/60">/ 35h goal</span>
          </div>
          <div className="w-full bg-white/5 h-1.5 rounded-full mt-4 overflow-hidden">
            <div className="bg-[#7B5CFF] h-full rounded-full w-[81%]" />
          </div>
          <span className="text-[11px] text-white/50 mt-2 block">4.0 hrs scheduled today</span>
        </div>

        {/* Metric 4: Goal Progress */}
        <div 
          onClick={() => onNavigate("goals")}
          className="glass-panel-interactive p-5 rounded-2xl border border-white/10 bg-[#120F17]/80 cursor-pointer group relative overflow-hidden"
        >
          <div className="flex justify-between items-start mb-3">
            <span className="text-xs font-mono uppercase tracking-wider text-emerald-400">Primary Ambition</span>
            <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400">
              <Target className="w-4 h-4" />
            </div>
          </div>
          <p className="text-base font-bold text-white truncate">Crack Top Placements</p>
          <div className="flex items-baseline justify-between mt-3 text-xs text-white/70 font-medium">
            <span>Overall Progress</span>
            <span className="text-emerald-400 font-bold">65%</span>
          </div>
          <div className="w-full bg-white/5 h-1.5 rounded-full mt-2 overflow-hidden">
            <div className="bg-emerald-400 h-full rounded-full w-[65%]" />
          </div>
        </div>
      </div>

      {/* 3. Weather Alert & Smart Adaptation Card */}
      {!weatherAlertDismissed && (
        <motion.div
          initial={{ opacity: 0, scale: 0.99 }}
          animate={{ opacity: 1, scale: 1 }}
          className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
        >
          <div className="flex items-center gap-3.5">
            <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-400 shrink-0">
              <CloudRain className="w-5 h-5 animate-bounce" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-amber-400">Weather Adaptation Alert</span>
                <span className="text-[10px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full font-mono">
                  Smart Trigger
                </span>
              </div>
              <p className="text-sm text-white/90 font-medium mt-0.5">
                Heavy rain expected at 4:00 PM during your scheduled &ldquo;Evening Walk &amp; Audiobook&rdquo; block.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              onClick={() => {
                setWeatherAlertDismissed(true);
                handleOptimizeSchedule();
              }}
              className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-[#0B0910] font-bold text-xs transition-colors shrink-0 shadow-md shadow-amber-500/20"
            >
              Move Walk to Tomorrow 8 AM
            </button>
            <button
              onClick={() => setWeatherAlertDismissed(true)}
              className="px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/60 hover:text-white text-xs transition-colors shrink-0"
            >
              Dismiss
            </button>
          </div>
        </motion.div>
      )}

      {/* 4. Main Two-Column Layout: Today's Timeline vs Tasks & Deadlines */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Today's Schedule Timeline (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
                <span>Today&apos;s Schedule</span>
                <span className="text-xs font-normal font-mono text-[#B497CF] bg-[#5227FF]/10 px-2.5 py-0.5 rounded-full border border-[#5227FF]/20">
                  3 Focus Blocks
                </span>
              </h3>
              <p className="text-xs text-white/50 mt-0.5">Time-blocked automatically to prevent cognitive overload</p>
            </div>
            <button
              onClick={() => onNavigate("calendar")}
              className="text-xs font-medium text-[#7B5CFF] hover:text-[#9B7CFF] flex items-center gap-1 transition-colors"
            >
              <span>Full Calendar</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {/* Timeline Item 1: DSA */}
            <div className="p-5 rounded-2xl bg-[#120F17]/90 border border-[#5227FF]/40 relative overflow-hidden flex items-start gap-4 group hover:border-[#5227FF] transition-all">
              <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-[#5227FF]" />
              <div className="p-3 rounded-xl bg-[#5227FF]/20 text-[#7B5CFF] shrink-0 font-mono text-xs font-bold flex flex-col items-center justify-center min-w-[64px]">
                <span>09:00</span>
                <span className="text-[10px] text-white/50 font-normal">11:00 AM</span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-mono uppercase tracking-wider text-[#7B5CFF] font-semibold">Deep Work Focus</span>
                  <span className="text-[11px] bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-500/20 font-mono">
                    Active Now
                  </span>
                </div>
                <h4 className="text-base font-bold text-white truncate">DSA: Dynamic Programming &amp; Graphs</h4>
                <p className="text-xs text-white/60 mt-1 line-clamp-1">
                  Solve 3 medium/hard problems on trees and graph shortest paths (Dijkstra / Bellman-Ford).
                </p>
                <div className="mt-3 flex items-center gap-3 text-[11px] text-white/50">
                  <span className="flex items-center gap-1 text-[#B497CF]"><Target className="w-3.5 h-3.5" /> Goal: Master DSA</span>
                  <span>•</span>
                  <span>Project: Chronos AI OS</span>
                </div>
              </div>
            </div>

            {/* Timeline Item 2: AI Sync */}
            <div className="p-5 rounded-2xl bg-[#120F17]/60 border border-white/10 relative overflow-hidden flex items-start gap-4 group hover:bg-[#120F17]/90 hover:border-white/20 transition-all">
              <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-[#7B5CFF]/60" />
              <div className="p-3 rounded-xl bg-white/5 text-white/70 shrink-0 font-mono text-xs font-bold flex flex-col items-center justify-center min-w-[64px]">
                <span>14:00</span>
                <span className="text-[10px] text-white/50 font-normal">15:00 PM</span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-mono uppercase tracking-wider text-[#B497CF]">Team Collaboration</span>
                  <span className="text-[11px] text-white/50 font-mono">Google Calendar</span>
                </div>
                <h4 className="text-base font-bold text-white truncate">AI System Architecture Sync</h4>
                <p className="text-xs text-white/60 mt-1 line-clamp-1">
                  Meeting with co-creators on heuristic scheduling algorithms and Prisma 6 database optimization.
                </p>
              </div>
            </div>

            {/* Timeline Item 3: Evening Walk */}
            <div className="p-5 rounded-2xl bg-[#120F17]/60 border border-white/10 relative overflow-hidden flex items-start gap-4 group hover:bg-[#120F17]/90 hover:border-white/20 transition-all">
              <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-[#FF9FFC]/60" />
              <div className="p-3 rounded-xl bg-white/5 text-white/70 shrink-0 font-mono text-xs font-bold flex flex-col items-center justify-center min-w-[64px]">
                <span>16:00</span>
                <span className="text-[10px] text-white/50 font-normal">17:00 PM</span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-mono uppercase tracking-wider text-[#FF9FFC]">Personal Wellness</span>
                  <span className="text-[11px] text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20 font-mono">
                    🌧️ Rain Alert
                  </span>
                </div>
                <h4 className="text-base font-bold text-white truncate">Evening Walk &amp; Audiobook</h4>
                <p className="text-xs text-white/60 mt-1 line-clamp-1">
                  Scheduled outdoor exercise. (Note: Chronos recommends moving to tomorrow morning 8 AM).
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: AI Prioritized Tasks & Upcoming Deadlines (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* AI Prioritized Tasks */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
                  <span>Priority Tasks</span>
                  <span className="text-xs font-mono bg-[#FF9FFC]/10 text-[#FF9FFC] px-2 py-0.5 rounded-full border border-[#FF9FFC]/20">
                    AI Sorted
                  </span>
                </h3>
              </div>
              <button
                onClick={() => onNavigate("tasks")}
                className="text-xs font-medium text-[#7B5CFF] hover:text-[#9B7CFF] flex items-center gap-1 transition-colors"
              >
                <span>View All Tasks</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-2.5">
              {/* Task 1 */}
              <div 
                onClick={() => toggleTask("task1")}
                className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-start gap-3.5 ${
                  tasksCompleted.task1 
                    ? "bg-white/5 border-white/10 opacity-40 line-through"
                    : "bg-white/5 backdrop-blur-3xl border-white/20 hover:bg-white/10"
                }`}
              >
                <div className={`w-5 h-5 rounded-lg border mt-0.5 flex items-center justify-center transition-colors shrink-0 ${
                  tasksCompleted.task1 ? "bg-[#5227FF] border-[#5227FF] text-white" : "border-white/30"
                }`}>
                  {tasksCompleted.task1 && <CheckCircle2 className="w-3.5 h-3.5" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-semibold text-white truncate">DSA: Dynamic Programming</span>
                    <span className="text-[10px] font-mono bg-rose-500/10 text-rose-400 px-2 py-0.2 rounded border border-rose-500/20">
                      High Priority
                    </span>
                  </div>
                  <p className="text-xs text-white/60 truncate">Due Today • 120 mins estimated</p>
                </div>
              </div>

              {/* Task 2 */}
              <div 
                onClick={() => toggleTask("task2")}
                className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-start gap-3.5 ${
                  tasksCompleted.task2 
                    ? "bg-white/5 border-white/10 opacity-40 line-through"
                    : "bg-white/5 backdrop-blur-3xl border-white/20 hover:bg-white/10"
                }`}
              >
                <div className={`w-5 h-5 rounded-lg border mt-0.5 flex items-center justify-center transition-colors shrink-0 ${
                  tasksCompleted.task2 ? "bg-[#5227FF] border-[#5227FF] text-white" : "border-white/30"
                }`}>
                  {tasksCompleted.task2 && <CheckCircle2 className="w-3.5 h-3.5" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-semibold text-white truncate">OS Exam: Synchronization &amp; Deadlocks</span>
                    <span className="text-[10px] font-mono bg-rose-500/10 text-rose-400 px-2 py-0.2 rounded border border-rose-500/20">
                      High Priority
                    </span>
                  </div>
                  <p className="text-xs text-white/60 truncate">Due Tomorrow • 90 mins estimated</p>
                </div>
              </div>

              {/* Task 3 (Completed) */}
              <div 
                onClick={() => toggleTask("task3")}
                className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-start gap-3.5 ${
                  tasksCompleted.task3 
                    ? "bg-white/5 border-white/10 opacity-40"
                    : "bg-white/5 backdrop-blur-3xl border-white/20 hover:bg-white/10"
                }`}
              >
                <div className={`w-5 h-5 rounded-lg border mt-0.5 flex items-center justify-center transition-colors shrink-0 ${
                  tasksCompleted.task3 ? "bg-emerald-500 border-emerald-500 text-[#0B0910]" : "border-white/30"
                }`}>
                  {tasksCompleted.task3 && <CheckCircle2 className="w-3.5 h-3.5" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className={`text-xs font-semibold truncate ${tasksCompleted.task3 ? "line-through text-white/50" : "text-white"}`}>
                      Review Resume with Senior Mentor
                    </span>
                    <span className="text-[10px] font-mono bg-emerald-500/10 text-emerald-400 px-2 py-0.2 rounded border border-emerald-500/20">
                      Completed
                    </span>
                  </div>
                  <p className="text-xs text-white/40 truncate">Due in 3 days • 45 mins estimated</p>
                </div>
              </div>
            </div>
          </div>

          {/* Upcoming Deadlines Widget */}
          <div className="p-5 rounded-3xl bg-white/5 backdrop-blur-3xl border border-white/20 space-y-4 shadow-xl relative overflow-hidden group">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <span className="text-xs font-mono uppercase tracking-wider text-[#B497CF] font-semibold flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-[#B497CF]" /> Upcoming Deadlines
              </span>
              <span className="text-[11px] text-white/50">Buffer Protected</span>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold text-white">Operating Systems Exam</p>
                  <p className="text-xs text-white/50 mt-0.5">University Semester Final</p>
                </div>
                <div className="text-right">
                  <span className="text-xs font-bold text-[#FF9FFC] bg-[#FF9FFC]/10 px-2.5 py-1 rounded-full border border-[#FF9FFC]/20">
                    10 Days Left
                  </span>
                  <p className="text-[10px] text-emerald-400 mt-1">2 buffer days active</p>
                </div>
              </div>

              <div className="border-t border-white/5 pt-3 flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold text-white">Portfolio Revamp &amp; Shaders</p>
                  <p className="text-xs text-white/50 mt-0.5">Chronos Project Milestone</p>
                </div>
                <div className="text-right">
                  <span className="text-xs font-bold text-[#B497CF] bg-[#B497CF]/10 px-2.5 py-1 rounded-full border border-[#B497CF]/20">
                    5 Days Left
                  </span>
                  <p className="text-[10px] text-white/40 mt-1">90% completed</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

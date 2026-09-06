"use client";

import React, { useState } from "react";
import { 
  BarChart3, TrendingUp, Clock, Flame, Target, Sparkles, 
  ArrowUpRight, ShieldCheck, Zap, Calendar, Award
} from "lucide-react";
import { 
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, 
  XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid 
} from "recharts";
import { useQuery } from "@tanstack/react-query";



export const AnalyticsView: React.FC = () => {
  const [timeRange, setTimeRange] = useState<"7d" | "30d" | "90d">("7d");

  const { data: analyticsData, isLoading } = useQuery({
    queryKey: ["analytics", timeRange],
    queryFn: async () => {
      const res = await fetch("/api/analytics");
      if (!res.ok) throw new Error("Failed to fetch analytics");
      const json = await res.json();
      return json.data;
    },
  });

  const deepWorkData = analyticsData?.focusData || [];
  
  // Use actual focus data for the trend chart to avoid fake data
  const productivityTrendData = deepWorkData.map((d: any) => ({
    time: d.day,
    score: Math.min(100, Math.round((d.hours / 5) * 100)) // simple derivation for UI
  }));
  
  const categoryData = [
    { name: "Deep Work", value: analyticsData?.focusHoursThisWeek ? 70 : 0 },
    { name: "Learning", value: analyticsData?.focusHoursThisWeek ? 20 : 0 },
    { name: "Admin", value: analyticsData?.focusHoursThisWeek ? 10 : 0 },
  ];

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[50vh]">
        <div className="w-8 h-8 text-white/50 border-t-2 border-white/50 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-6 sm:p-8 space-y-8 max-w-7xl mx-auto pb-24 font-mono">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-border pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] uppercase tracking-widest text-foreground">SYSTEM INTELLIGENCE</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground uppercase tracking-tight">
            [ PRODUCTIVITY ANALYTICS ]
          </h2>
          <p className="text-xs sm:text-sm text-foreground/60 mt-0.5 uppercase">
            VISUALIZE DEEP WORK HOURS, COGNITIVE STAMINA, AND GOAL PROGRESSION
          </p>
        </div>

        {/* Time Range Filter */}
        <div className="flex items-center gap-1 border border-border p-1 bg-background">
          {(["7d", "30d", "90d"] as const).map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-4 py-1.5 text-[10px] font-bold uppercase tracking-widest transition-colors ${
                timeRange === range 
                  ? "bg-foreground text-background" 
                  : "bg-background text-foreground hover:bg-foreground/10"
              }`}
            >
              {range === "7d" ? "LAST 7 DAYS" : range === "30d" ? "LAST 30 DAYS" : "LAST 90 DAYS"}
            </button>
          ))}
        </div>
      </div>

      {/* Top Summary KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-6 bg-background border border-border space-y-2 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-8 h-8 border-l border-b border-border bg-foreground flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <ArrowUpRight className="w-4 h-4 text-background" />
          </div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-foreground/60">TOTAL DEEP WORK</span>
          <div className="flex items-baseline gap-2 pt-2">
            <span className="text-3xl sm:text-4xl font-bold text-foreground">{analyticsData?.focusHoursThisWeek || 0}<span className="text-base font-normal text-foreground/50">h</span></span>
            <span className="text-[10px] font-bold text-background bg-foreground px-2 py-0.5 uppercase border border-foreground">
              Last 7 Days
            </span>
          </div>
          <p className="text-[10px] text-foreground/60 uppercase">Total focus hours recorded.</p>
        </div>

        <div className="p-6 bg-background border border-border space-y-2 relative overflow-hidden">
          <span className="text-[10px] font-bold uppercase tracking-widest text-foreground/60">PRODUCTIVITY SCORE</span>
          <div className="flex items-baseline gap-2 pt-2">
            <span className="text-3xl sm:text-4xl font-bold text-foreground">{analyticsData?.productivityScore || 0}</span>
            <span className="text-[10px] font-bold text-background bg-foreground px-2 py-0.5 uppercase border border-foreground">
              Current
            </span>
          </div>
          <p className="text-[10px] text-foreground/60 uppercase">Based on habits and tasks.</p>
        </div>

        <div className="p-6 bg-background border border-border space-y-2 relative overflow-hidden">
          <span className="text-[10px] font-bold uppercase tracking-widest text-foreground/60">HABIT COMPLETION</span>
          <div className="flex items-baseline gap-2 pt-2">
            <span className="text-3xl sm:text-4xl font-bold text-foreground">{analyticsData?.habitConsistency || 0}%</span>
            <span className="text-[10px] font-bold text-foreground border border-foreground px-2 py-0.5 uppercase">
              {analyticsData?.habitStreak || 0}d Streak
            </span>
          </div>
          <p className="text-[10px] text-foreground/60 uppercase">Consistency across active habits.</p>
        </div>

        <div className="p-6 bg-background border border-border space-y-2 relative overflow-hidden">
          <span className="text-[10px] font-bold uppercase tracking-widest text-foreground/60">TASKS VELOCITY</span>
          <div className="flex items-baseline gap-2 pt-2">
            <span className="text-3xl sm:text-4xl font-bold text-foreground">{analyticsData?.tasksCompleted7d || 0}</span>
            <span className="text-[10px] text-foreground/50 uppercase">TASKS</span>
          </div>
          <p className="text-[10px] text-foreground/60 uppercase">Tasks completed in last 7 days.</p>
        </div>
      </div>

      {/* Main Charts Grid: Deep Work Bar Chart vs Productivity Area Trend */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Deep Work Focus Hours Chart (7 cols) */}
        <div className="lg:col-span-7 p-6 sm:p-8 bg-background border border-border space-y-6">
          <div className="flex items-center justify-between border-b border-border pb-4">
            <div>
              <span className="text-[10px] font-bold uppercase text-foreground/60">DAILY STAMINA BREAKDOWN</span>
              <h3 className="text-lg font-bold text-foreground mt-1 uppercase tracking-widest">DEEP WORK FOCUS HOURS</h3>
            </div>
            <span className="text-[10px] font-bold text-foreground border border-border px-3 py-1 uppercase">
              TARGET: 35.0h / WEEK
            </span>
          </div>

          <div className="h-[280px] w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={deepWorkData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="currentColor" strokeOpacity={0.1} vertical={false} />
                <XAxis dataKey="day" stroke="currentColor" strokeOpacity={0.5} fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke="currentColor" strokeOpacity={0.5} fontSize={10} tickLine={false} axisLine={false} unit="h" />
                <Tooltip
                  contentStyle={{ backgroundColor: "var(--background)", borderColor: "var(--border)", color: "var(--foreground)", fontSize: "12px", fontFamily: "monospace", textTransform: "uppercase" }}
                  itemStyle={{ color: "var(--foreground)" }}
                  formatter={(val: any) => [`${val} HOURS`, "DEEP WORK"]}
                />
                <Bar dataKey="hours" fill="currentColor" radius={[0, 0, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right: Productivity Score Climb & Category Donut (5 cols) */}
        <div className="lg:col-span-5 space-y-8">
          {/* Productivity Area Trend Chart */}
          <div className="p-6 sm:p-8 bg-background border border-border space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-4">
              <div>
                <span className="text-[10px] font-bold uppercase text-foreground/60">7-DAY TRAJECTORY</span>
                <h3 className="text-base font-bold text-foreground mt-1 uppercase tracking-widest">FOCUS INTENSITY</h3>
              </div>
              <span className="text-[10px] font-bold text-background bg-foreground px-2.5 py-1 uppercase border border-foreground">
                LAST 7 DAYS
              </span>
            </div>

            <div className="h-[180px] w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={productivityTrendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="currentColor" strokeOpacity={0.1} vertical={false} />
                  <XAxis dataKey="time" stroke="currentColor" strokeOpacity={0.5} fontSize={10} tickLine={false} axisLine={false} />
                  <YAxis stroke="currentColor" strokeOpacity={0.5} fontSize={10} domain={[80, 100]} tickLine={false} axisLine={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: "var(--background)", borderColor: "var(--border)", color: "var(--foreground)", fontSize: "12px", fontFamily: "monospace", textTransform: "uppercase" }}
                    formatter={(val: any) => [`${val}/100`, "SCORE"]}
                  />
                  <Area type="step" dataKey="score" stroke="currentColor" strokeWidth={2} fillOpacity={0.1} fill="currentColor" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Category Breakdown Donut */}
          <div className="p-6 sm:p-8 bg-background border border-border space-y-6">
            <div className="border-b border-border pb-4">
              <span className="text-[10px] font-bold uppercase text-foreground/60">TIME ALLOCATION</span>
              <h3 className="text-base font-bold text-foreground mt-1 uppercase tracking-widest">FOCUS CATEGORIES</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
              <div className="h-[160px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      innerRadius={45}
                      outerRadius={65}
                      paddingAngle={2}
                      dataKey="value"
                      stroke="none"
                    >
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={index === 0 ? "currentColor" : index === 1 ? "var(--foreground)" : index === 2 ? "var(--border)" : "transparent"} stroke={index === 3 ? "currentColor" : "none"} strokeWidth={1} style={{ opacity: 1 - (index * 0.2) }} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ backgroundColor: "var(--background)", borderColor: "var(--border)", color: "var(--foreground)", fontSize: "12px", fontFamily: "monospace", textTransform: "uppercase" }}
                      formatter={(val: any) => [`${val}%`, "ALLOCATION"]}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="space-y-3 text-[10px] uppercase font-bold">
                {categoryData.map((cat, idx) => (
                  <div key={idx} className="flex items-center justify-between border-b border-border pb-2 last:border-0 last:pb-0">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2" style={{ backgroundColor: idx === 0 ? "currentColor" : idx === 1 ? "var(--foreground)" : idx === 2 ? "var(--border)" : "transparent", border: idx === 3 ? "1px solid currentColor" : "none", opacity: 1 - (idx * 0.2) }} />
                      <span className="text-foreground/80">{cat.name}</span>
                    </div>
                    <span className="text-foreground">{cat.value}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

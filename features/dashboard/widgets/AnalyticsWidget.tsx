"use client";

import React, { useState } from "react";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, BarChart, Bar } from "recharts";
import { BarChart3, TrendingUp, Sparkles, Clock, Flame, BookOpen } from "lucide-react";
import clsx from "clsx";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "../../../components/ui/Skeleton";

export const AnalyticsWidget: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"focus" | "habits" | "study">("focus");

  const { data, isLoading, error } = useQuery({
    queryKey: ["analytics"],
    queryFn: async () => {
      const res = await fetch("/api/analytics");
      const json = await res.json();
      if (!json.success) throw new Error(json.message);
      return json.data;
    },
    refetchInterval: 60000,
  });

  if (isLoading) {
    return (
      <div className="flex flex-col h-full min-h-[260px] p-4 text-[10px] font-mono uppercase tracking-widest text-foreground/40">
        <Skeleton count={4} />
      </div>
    );
  }

  const focusData = data?.focusData || [];
  const totalFocusHours = data?.focusHoursThisWeek || 0;
  const habitConsistency = data?.habitConsistency || 0;

  const studyData = [
    { subject: "DEEP WORK", hours: totalFocusHours * 0.6 },
    { subject: "ADMIN", hours: totalFocusHours * 0.2 },
    { subject: "LEARNING", hours: totalFocusHours * 0.2 },
  ];

  return (
    <div className="flex flex-col h-full min-h-[260px] text-foreground font-mono">
      {/* Header */}
      <div className="flex items-center justify-between text-[10px] uppercase tracking-widest mb-4 px-1">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setActiveTab("focus")}
            className={clsx("transition-colors", activeTab === "focus" ? "text-foreground font-bold" : "text-foreground/40 hover:text-foreground")}
          >
            FOCUS
          </button>
          <button 
            onClick={() => setActiveTab("study")}
            className={clsx("transition-colors", activeTab === "study" ? "text-foreground font-bold" : "text-foreground/40 hover:text-foreground")}
          >
            ALLOCATION
          </button>
          <button 
            onClick={() => setActiveTab("habits")}
            className={clsx("transition-colors", activeTab === "habits" ? "text-foreground font-bold" : "text-foreground/40 hover:text-foreground")}
          >
            HABITS
          </button>
        </div>
        <span className="text-foreground/50 hidden sm:block">DATA SYNCED</span>
      </div>

      <div className="w-full h-[1px] bg-border mb-4" />

      {/* Charts */}
      <div className="flex-1 min-h-[160px] w-full mt-2 pr-2">
        {activeTab === "focus" && (
          <ResponsiveContainer width="100%" height={160}>
            <AreaChart data={focusData}>
              <XAxis dataKey="day" stroke="var(--foreground)" strokeOpacity={0.2} fontSize={9} tickLine={false} axisLine={false} fontFamily="monospace" />
              <YAxis stroke="var(--foreground)" strokeOpacity={0.2} fontSize={9} tickLine={false} axisLine={false} fontFamily="monospace" />
              <Tooltip 
                contentStyle={{ backgroundColor: "var(--background)", border: "1px solid var(--border)", fontSize: "10px", fontFamily: "monospace", textTransform: "uppercase" }} 
                itemStyle={{ color: "var(--foreground)" }}
                cursor={{ stroke: "var(--foreground)", strokeOpacity: 0.1 }}
              />
              <Area type="step" dataKey="hours" stroke="var(--foreground)" strokeWidth={1} fill="var(--foreground)" fillOpacity={0.05} />
            </AreaChart>
          </ResponsiveContainer>
        )}

        {activeTab === "study" && (
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={studyData}>
              <XAxis dataKey="subject" stroke="var(--foreground)" strokeOpacity={0.2} fontSize={9} tickLine={false} axisLine={false} fontFamily="monospace" />
              <YAxis stroke="var(--foreground)" strokeOpacity={0.2} fontSize={9} tickLine={false} axisLine={false} fontFamily="monospace" />
              <Tooltip 
                contentStyle={{ backgroundColor: "var(--background)", border: "1px solid var(--border)", fontSize: "10px", fontFamily: "monospace", textTransform: "uppercase" }} 
                itemStyle={{ color: "var(--foreground)" }}
                cursor={{ fill: 'var(--foreground)', opacity: 0.05 }}
              />
              <Bar dataKey="hours" fill="var(--foreground)" fillOpacity={0.8} />
            </BarChart>
          </ResponsiveContainer>
        )}

        {activeTab === "habits" && (
          <div className="flex flex-col items-center justify-center h-full text-center p-4">
            <h4 className="text-[10px] font-mono uppercase tracking-widest text-foreground/50 mb-2">Consistency Engine</h4>
            <div className="text-4xl text-foreground mb-1 tracking-tighter">
              {habitConsistency}%
            </div>
            <p className="text-[9px] text-foreground/40 font-mono tracking-widest">
              7-DAY COMPLETION RATE
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

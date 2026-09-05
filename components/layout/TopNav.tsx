"use client";

import React from "react";
import { TabType } from "./Sidebar";

interface TopNavProps {
  activeTab: TabType;
  onOpenCommandPalette: () => void;
}

export const TopNav: React.FC<TopNavProps> = ({ activeTab, onOpenCommandPalette }) => {
  const getTabTitle = (tab: TabType): { title: string; subtitle: string } => {
    switch (tab) {
      case "dashboard":
        return { title: "EXECUTIVE DASHBOARD", subtitle: "SYSTEM OVERVIEW" };
      case "tasks":
        return { title: "INTELLIGENT TASKS", subtitle: "AI-PRIORITIZED MATRIX" };
      case "calendar":
        return { title: "TIME BLOCKING", subtitle: "DYNAMIC SCHEDULE" };
      case "goals":
        return { title: "GOAL HIERARCHY", subtitle: "LONG-TERM OBJECTIVES" };
      case "habits":
        return { title: "HABIT CONSISTENCY", subtitle: "ACTIVITY TRACKING" };
      case "projects":
        return { title: "ACTIVE PROJECTS", subtitle: "PROJECT TIMELINES" };
      case "notes":
        return { title: "CONTEXTUAL NOTES", subtitle: "MARKDOWN CAPTURE" };
      case "analytics":
        return { title: "PRODUCTIVITY ANALYTICS", subtitle: "FOCUS INSIGHTS" };
      default:
        return { title: "SYSTEM DASHBOARD", subtitle: "TIME ORGANIZED" };
    }
  };

  const { title, subtitle } = getTabTitle(activeTab);

  return (
    <header className="h-16 bg-background border-b border-border px-8 flex items-center justify-between sticky top-0 z-20 text-[10px] font-mono uppercase tracking-widest text-foreground">
      {/* Title & Subtitle */}
      <div className="flex items-center gap-4">
        <span className="font-medium">{title}</span>
        <span className="text-foreground/40 hidden sm:inline">/</span>
        <span className="text-foreground/40 hidden sm:inline">{subtitle}</span>
      </div>

      {/* Right Side Controls */}
      <div className="flex items-center gap-6">
        <div className="hidden lg:flex items-center gap-2">
          <span className="text-foreground">ALERT:</span> 
          <span className="text-foreground/50">RAIN AT 16:00</span>
        </div>

        <button
          onClick={onOpenCommandPalette}
          className="text-foreground/50 hover:text-foreground transition-colors"
        >
          INPUT [⌘K]
        </button>

        <div className="flex items-center gap-2">
          <span className="text-foreground">SYSTEM ACTIVE</span>
        </div>
      </div>
    </header>
  );
};

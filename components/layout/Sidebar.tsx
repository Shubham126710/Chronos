"use client";

import React from "react";
import { LogOut } from "lucide-react";

export type TabType = "dashboard" | "tasks" | "calendar" | "goals" | "habits" | "projects" | "notes" | "analytics" | "integrations";

export interface SidebarProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  onOpenCommandPalette: () => void;
  onSignOut: () => void;
  onOpenTour?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  onOpenCommandPalette,
  onSignOut,
  onOpenTour,
}) => {
  const navItems: { id: TabType; label: string }[] = [
    { id: "dashboard", label: "DASHBOARD" },
    { id: "tasks", label: "TASKS" },
    { id: "calendar", label: "CALENDAR" },
    { id: "goals", label: "GOALS" },
    { id: "habits", label: "HABITS" },
    { id: "projects", label: "PROJECTS" },
    { id: "notes", label: "NOTES" },
    { id: "analytics", label: "ANALYTICS" },
    { id: "integrations", label: "INTEGRATIONS" },
  ];

  return (
    <aside className="w-64 bg-background border-r border-border flex flex-col justify-between h-screen sticky top-0 shrink-0 select-none z-30 font-mono">
      {/* Top Header */}
      <div className="p-8">
        {/* Brand */}
        <div className="flex flex-col gap-1 pb-6 border-b border-border mb-6">
          <h1 className="text-sm font-medium tracking-widest text-foreground uppercase">
            CHRONOS
          </h1>
          <span className="text-[10px] uppercase tracking-widest text-foreground/50">SYSTEM OS</span>
        </div>

        {/* AI Assistant Command Trigger */}
        <button
          id="command-palette-trigger"
          onClick={onOpenCommandPalette}
          className="w-full mb-8 text-left group"
        >
          <div className="flex items-center justify-between text-[10px] uppercase tracking-widest text-foreground/50 group-hover:text-foreground transition-colors pb-2">
            <span>[SYSTEM INPUT]</span>
            <span>⌘K</span>
          </div>
        </button>

        {/* Navigation List */}
        <nav className="space-y-4">
          <div className="text-[10px] uppercase tracking-widest text-foreground/40 mb-4 border-b border-border pb-2">
            MODULES
          </div>
          <div className="flex flex-col space-y-2">
            {navItems.map((item, index) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center text-xs uppercase tracking-widest transition-colors duration-150 ${
                    isActive
                      ? "text-background bg-foreground px-2 py-1 font-medium"
                      : "text-foreground/50 hover:text-foreground py-1 px-2"
                  }`}
                >
                  <span className={`w-6 text-[10px] ${isActive ? 'opacity-100' : 'opacity-40'}`}>0{index + 1}</span>
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
        </nav>
      </div>

      {/* Bottom Profile & Streaks */}
      <div className="p-8 border-t border-border">
        {/* Streak & Focus mini stat */}
        <div className="flex flex-col gap-2 mb-6 text-[9px] uppercase tracking-widest">
          <div className="flex items-center justify-between">
            <span className="text-foreground/50">STREAK</span>
            <span className="text-foreground">14 DAYS</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-foreground/50">EFFICIENCY</span>
            <span className="text-foreground">94/100</span>
          </div>
        </div>

        {/* User Info */}
        <div className="flex flex-col gap-4 pt-4 border-t border-border">
          <div className="flex items-center justify-between">
            <div className="flex flex-col gap-0.5">
              <span className="text-[10px] font-medium text-foreground tracking-widest uppercase">ALEX VANCE</span>
              <span className="text-[9px] text-foreground/40 tracking-widest uppercase">USER.ALEX</span>
            </div>
            <button 
              onClick={onSignOut}
              title="Terminate Session"
              className="text-foreground/40 hover:text-foreground transition-colors text-[9px] uppercase tracking-widest"
            >
              [EXIT]
            </button>
          </div>
          {onOpenTour && (
            <button 
              onClick={onOpenTour}
              className="text-left text-foreground/40 hover:text-foreground transition-colors text-[9px] uppercase tracking-widest flex items-center gap-2"
            >
              <span>[RE-RUN SYSTEM TOUR]</span>
            </button>
          )}
        </div>
      </div>
    </aside>
  );
};

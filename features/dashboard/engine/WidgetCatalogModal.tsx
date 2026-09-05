"use client";

import React, { useState } from "react";
import { 
  X, 
  Plus, 
  Sparkles, 
  Cpu, 
  Calendar, 
  Clock, 
  CheckSquare, 
  Target, 
  Flame, 
  FileText, 
  FolderGit2, 
  BarChart3, 
  Zap, 
  Search
} from "lucide-react";
import clsx from "clsx";
import { createPortal } from "react-dom";

export interface CatalogWidgetMeta {
  type: string;
  title: string;
  category: "STUDENT" | "DEVELOPER" | "CREATOR" | "EXECUTIVE" | "LIFE";
  description: string;
  icon: React.ReactNode;
  defaultColSpan: number;
  defaultRowSpan: number;
  theme: string;
  badge?: string;
}

export const WIDGET_CATALOG: CatalogWidgetMeta[] = [
  {
    type: "PRODUCTIVITY_SCORE",
    title: "Productivity Score",
    category: "EXECUTIVE",
    description: "Real-time cognitive score calculated from task completion, overdue items, and focus sessions.",
    icon: <Cpu className="w-4 h-4" />,
    defaultColSpan: 1,
    defaultRowSpan: 1,
    theme: "orange",
    badge: "LIVE",
  },
  {
    type: "FOCUS_TIMER",
    title: "Focus Timer",
    category: "EXECUTIVE",
    description: "Interactive focus timer with database logging to power your weekly focus analytics.",
    icon: <Clock className="w-4 h-4" />,
    defaultColSpan: 2,
    defaultRowSpan: 1,
    theme: "orange",
    badge: "TIMER",
  },
  {
    type: "CALENDAR",
    title: "Today's Schedule",
    category: "EXECUTIVE",
    description: "View your internal calendar events and time blocks for today.",
    icon: <Calendar className="w-4 h-4" />,
    defaultColSpan: 2,
    defaultRowSpan: 2,
    theme: "default",
    badge: "SYNCED",
  },
  {
    type: "HABITS",
    title: "Habit Streak",
    category: "LIFE",
    description: "Track your consistency across your daily habits and view your current streaks.",
    icon: <Flame className="w-4 h-4" />,
    defaultColSpan: 2,
    defaultRowSpan: 1,
    theme: "orange",
    badge: "STREAK",
  },
  {
    type: "GOALS",
    title: "Goal Progress",
    category: "EXECUTIVE",
    description: "Hierarchical goal tracking with progress calculated from actual completed tasks.",
    icon: <Target className="w-4 h-4" />,
    defaultColSpan: 2,
    defaultRowSpan: 1,
    theme: "purple",
    badge: "TREE",
  },
  {
    type: "TASKS",
    title: "Today's Tasks",
    category: "EXECUTIVE",
    description: "Tasks due today, sorted by priority. Includes one-click completion.",
    icon: <CheckSquare className="w-4 h-4" />,
    defaultColSpan: 2,
    defaultRowSpan: 2,
    theme: "default",
    badge: "CRITICAL",
  },
  {
    type: "NOTES",
    title: "Quick Notes",
    category: "CREATOR",
    description: "Rich markdown preview attached to projects and tasks. Supports quick capture.",
    icon: <FileText className="w-4 h-4" />,
    defaultColSpan: 2,
    defaultRowSpan: 1,
    theme: "default",
    badge: "MARKDOWN",
  },
  {
    type: "PROJECTS",
    title: "Recent Projects",
    category: "DEVELOPER",
    description: "Project timelines and progress bars powered by real tasks.",
    icon: <FolderGit2 className="w-4 h-4" />,
    defaultColSpan: 2,
    defaultRowSpan: 1,
    theme: "orange",
    badge: "ACTIVE",
  },
  {
    type: "ANALYTICS",
    title: "Weekly Focus",
    category: "EXECUTIVE",
    description: "Aggregated focus session charts over the last 7 days.",
    icon: <BarChart3 className="w-4 h-4" />,
    defaultColSpan: 3,
    defaultRowSpan: 2,
    theme: "teal",
    badge: "CHARTS",
  },
  {
    type: "QUICK_CAPTURE",
    title: "Instant Idea Inbox",
    category: "CREATOR",
    description: "Lightning-fast thought capture for your tasks and notes.",
    icon: <Zap className="w-4 h-4" />,
    defaultColSpan: 2,
    defaultRowSpan: 1,
    theme: "orange",
    badge: "INBOX",
  },
];

export interface WidgetCatalogModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddWidget: (widgetType: string, colSpan: number, rowSpan: number, theme: string) => void;
}

export const WidgetCatalogModal: React.FC<WidgetCatalogModalProps> = ({
  isOpen,
  onClose,
  onAddWidget,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  if (!isOpen) return null;

  const filteredWidgets = WIDGET_CATALOG.filter((w) => {
    const matchesCategory = selectedCategory === "ALL" || w.category === selectedCategory;
    const matchesSearch =
      w.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      w.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      w.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const categories = [
    { id: "ALL", label: "ALL" },
    { id: "STUDENT", label: "STUDENT" },
    { id: "DEVELOPER", label: "DEVELOPER" },
    { id: "CREATOR", label: "CREATOR" },
    { id: "EXECUTIVE", label: "EXECUTIVE" },
    { id: "LIFE", label: "LIFE" },
  ];

  const modalContent = (
    <div className="fixed inset-0 z-[100] flex flex-col font-mono bg-background">
      {/* Modal */}
      <div className="relative w-full h-full flex flex-col">
        
        {/* Header */}
        <div className="p-6 border-b border-border flex items-center justify-between">
          <div className="flex flex-col gap-1">
            <h2 className="text-xs uppercase tracking-widest text-foreground font-medium">
              [ MODULE CATALOG ]
            </h2>
            <p className="text-[10px] uppercase tracking-widest text-foreground/50">
              ASSEMBLE YOUR SYSTEM CANVAS. SELECT MODULES TO DEPLOY.
            </p>
          </div>
          <button 
            onClick={onClose}
            className="text-foreground/50 hover:text-foreground transition-colors p-2"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Toolbar */}
        <div className="px-6 py-4 border-b border-border flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto scrollbar-none pb-2 md:pb-0">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={clsx(
                  "px-2 py-1 text-[9px] font-mono uppercase tracking-widest transition-colors whitespace-nowrap border border-border",
                  selectedCategory === cat.id
                    ? "bg-foreground text-background font-semibold"
                    : "text-foreground/50 hover:text-foreground hover:bg-surface-hover"
                )}
              >
                {cat.label}
              </button>
            ))}
          </div>

          <div className="relative w-full md:w-64 shrink-0 flex items-center border border-border">
            <span className="text-foreground/40 px-3 border-r border-border text-[10px]">QRY</span>
            <input
              type="text"
              placeholder="SEARCH MODULES..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 bg-transparent px-3 py-1.5 text-[10px] text-foreground placeholder:text-foreground/30 focus:outline-none uppercase tracking-widest"
            />
          </div>
        </div>

        {/* Grid */}
        <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 sm:grid-cols-2 gap-4 scrollbar-none">
          {filteredWidgets.map((widget, i) => {
            const indexStr = (i + 1).toString().padStart(2, '0');
            return (
              <div
                key={widget.type}
                className="group border border-border bg-background hover:bg-surface-hover transition-colors flex flex-col justify-between"
              >
                <div className="p-4 flex flex-col h-full">
                  <div className="flex items-center justify-between mb-3 border-b border-border pb-2">
                    <div className="flex items-center gap-2 text-foreground">
                      <span className="text-[10px] text-foreground/40">{indexStr}</span>
                      {widget.icon}
                    </div>
                    {widget.badge && (
                      <span className="text-[9px] font-mono px-1.5 py-0.5 border border-foreground/30 text-foreground/70 uppercase tracking-widest">
                        {widget.badge}
                      </span>
                    )}
                  </div>

                  <h3 className="text-xs uppercase tracking-widest font-bold text-foreground mb-1 group-hover:text-foreground/80 transition-colors">
                    {widget.title}
                  </h3>
                  <p className="text-[9px] text-foreground/50 leading-relaxed uppercase tracking-widest flex-1">
                    {widget.description}
                  </p>
                </div>

                <div className="border-t border-border flex items-center justify-between p-2">
                  <span className="text-[9px] font-mono text-foreground/40 uppercase tracking-widest px-2">
                    {widget.defaultColSpan}x{widget.defaultRowSpan}
                  </span>
                  <button
                    onClick={() => {
                      onAddWidget(widget.type, widget.defaultColSpan, widget.defaultRowSpan, widget.theme);
                      onClose();
                    }}
                    className="flex items-center gap-1.5 px-3 py-1 bg-foreground text-background font-medium text-[9px] uppercase tracking-widest transition-colors hover:bg-foreground/90 shrink-0"
                  >
                    <Plus className="w-3 h-3" />
                    <span>DEPLOY</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );

  if (typeof window === "undefined") return null;
  return createPortal(modalContent, document.body);
};

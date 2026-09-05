"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
    icon: <Cpu className="w-5 h-5 text-[#FF8C61]" />,
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
    icon: <Clock className="w-5 h-5 text-[#FF8C61]" />,
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
    icon: <Calendar className="w-5 h-5 text-white" />,
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
    icon: <Flame className="w-5 h-5 text-[#FF8C61]" />,
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
    icon: <Target className="w-5 h-5 text-purple-400" />,
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
    icon: <CheckSquare className="w-5 h-5 text-white" />,
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
    icon: <FileText className="w-5 h-5 text-white" />,
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
    icon: <FolderGit2 className="w-5 h-5 text-[#FF8C61]" />,
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
    icon: <BarChart3 className="w-5 h-5 text-[#81C3D7]" />,
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
    icon: <Zap className="w-5 h-5 text-[#FF8C61]" />,
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
    { id: "ALL", label: "All Modules" },
    { id: "STUDENT", label: "Student & Placements" },
    { id: "DEVELOPER", label: "Developer OS" },
    { id: "CREATOR", label: "Creator Studio" },
    { id: "EXECUTIVE", label: "Executive Intelligence" },
    { id: "LIFE", label: "Life & Biometrics" },
  ];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 md:p-10">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-[#0B0910]/80 backdrop-blur-xl"
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-5xl max-h-[85vh] bg-[#120F17]/90 border border-white/20 rounded-3xl shadow-2xl backdrop-blur-3xl flex flex-col overflow-hidden z-10"
        >
          <div className="p-6 border-b border-white/10 flex items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-[#FF8C61]" />
                <h2 className="text-xl font-bold text-white tracking-wide">Chronos Module Catalog</h2>
              </div>
              <p className="text-sm text-white/60 mt-1">
                Assemble your personal operating system canvas. Add independent modules to customize your command center.
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-full transition-colors shrink-0"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="p-6 pb-2 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-white/5">
            <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 scrollbar-none">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={clsx(
                    "px-3.5 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all",
                    selectedCategory === cat.id
                      ? "bg-[#FF8C61] text-white shadow-lg shadow-[#FF8C61]/25 font-semibold"
                      : "bg-white/5 text-white/70 hover:bg-white/10 hover:text-white border border-white/10"
                  )}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            <div className="relative w-full md:w-64 shrink-0">
              <Search className="w-4 h-4 text-white/40 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search modules..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-1.5 rounded-full bg-white/5 border border-white/15 text-white text-xs placeholder:text-white/40 focus:outline-none focus:border-[#FF8C61] transition-colors"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredWidgets.map((widget) => (
              <div
                key={widget.type}
                className="bg-white/5 border border-white/15 hover:border-white/30 rounded-2xl p-5 flex flex-col justify-between transition-all group relative overflow-hidden"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/15 flex items-center justify-center shrink-0">
                      {widget.icon}
                    </div>
                    {widget.badge && (
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/10 text-white/80 border border-white/20 uppercase tracking-widest">
                        {widget.badge}
                      </span>
                    )}
                  </div>

                  <h3 className="text-base font-semibold text-white tracking-wide group-hover:text-[#FF8C61] transition-colors">
                    {widget.title}
                  </h3>
                  <p className="text-xs text-white/60 mt-1.5 leading-relaxed line-clamp-3">
                    {widget.description}
                  </p>
                </div>

                <div className="mt-5 pt-4 border-t border-white/10 flex items-center justify-between">
                  <span className="text-[11px] font-mono text-white/40">
                    Default: {widget.defaultColSpan}x{widget.defaultRowSpan}
                  </span>
                  <button
                    onClick={() => {
                      onAddWidget(widget.type, widget.defaultColSpan, widget.defaultRowSpan, widget.theme);
                      onClose();
                    }}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#FF8C61]/20 hover:bg-[#FF8C61] text-[#FF8C61] hover:text-white font-medium text-xs transition-all border border-[#FF8C61]/30 hover:shadow-lg hover:shadow-[#FF8C61]/30"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add to Canvas</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

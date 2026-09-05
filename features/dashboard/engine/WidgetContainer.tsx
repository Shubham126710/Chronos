"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  GripVertical, 
  Pin, 
  ChevronDown, 
  ChevronUp, 
  RefreshCw, 
  Copy, 
  X
} from "lucide-react";
import clsx from "clsx";
import { ErrorBoundary } from "../../../components/ui/ErrorBoundary";

export interface WidgetContainerProps {
  id: string;
  widgetType: string;
  title: string;
  subtitle?: string;
  badge?: string;
  icon?: React.ReactNode;
  colSpan: number; // 1 to 4
  rowSpan: number; // 1 to 3
  isPinned: boolean;
  isCollapsed: boolean;
  theme?: string;
  onRemove: (id: string) => void;
  onResize: (id: string, colSpan: number, rowSpan: number) => void;
  onTogglePin: (id: string) => void;
  onToggleCollapse: (id: string) => void;
  onDuplicate?: (id: string) => void;
  onRefresh?: (id: string) => void;
  onOpenSettings?: (id: string) => void;
  children: React.ReactNode;
  dragHandleProps?: any;
  isDragging?: boolean;
}

export const WidgetContainer: React.FC<WidgetContainerProps> = ({
  id,
  widgetType,
  title,
  subtitle,
  badge,
  icon,
  colSpan,
  rowSpan,
  isPinned,
  isCollapsed,
  theme = "default",
  onRemove,
  onResize,
  onTogglePin,
  onToggleCollapse,
  onDuplicate,
  onRefresh,
  onOpenSettings,
  children,
  dragHandleProps,
  isDragging,
}) => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showSizeMenu, setShowSizeMenu] = useState(false);

  const handleRefreshClick = () => {
    setIsRefreshing(true);
    if (onRefresh) onRefresh(id);
    setTimeout(() => setIsRefreshing(false), 800);
  };

  const colSpanClasses: Record<number, string> = {
    1: "col-span-1",
    2: "col-span-1 md:col-span-2",
    3: "col-span-1 md:col-span-2 lg:col-span-3",
    4: "col-span-1 md:col-span-2 lg:col-span-4",
  };

  const rowSpanClasses: Record<number, string> = {
    1: "row-span-1",
    2: "row-span-2",
    3: "row-span-3",
  };

  return (
    <motion.div
      id={`widget-${widgetType.toLowerCase()}`}
      layout
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.15 } }}
      transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
      className={clsx(
        "relative pt-6 pb-12 transition-colors duration-200 flex flex-col group border-t border-border",
        colSpanClasses[colSpan] || "col-span-1",
        !isCollapsed && (rowSpanClasses[rowSpan] || "row-span-1"),
        isDragging && "z-[70] shadow-2xl opacity-90 border-foreground scale-100 bg-background",
        showSizeMenu && "z-[60]"
      )}
    >
      {/* Top Header Bar */}
      <div className="flex items-center justify-between gap-3 mb-6 relative z-10 select-none pb-2">
        <div className="flex items-center gap-3 w-full opacity-50 group-hover:opacity-100 transition-opacity">
          {/* Drag Handle */}
          <div
            {...dragHandleProps}
            className="cursor-grab active:cursor-grabbing text-foreground/40 hover:text-foreground transition-colors -ml-2 p-1"
            title="Drag to reorder"
          >
            <GripVertical className="w-3.5 h-3.5" />
          </div>

          <div className="flex items-center w-full gap-4">
            <span className="text-[10px] font-mono uppercase tracking-widest text-foreground whitespace-nowrap">
              {title}
            </span>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
          {/* Refresh */}
          {onRefresh && (
            <button
              onClick={handleRefreshClick}
              className="text-foreground/40 hover:text-foreground transition-colors"
              title="Refresh widget data"
            >
              <RefreshCw className={clsx("w-3.5 h-3.5", isRefreshing && "animate-spin")} />
            </button>
          )}

          {/* Size Switcher */}
          <div className="relative flex items-center">
            <button
              onPointerDown={(e) => {
                e.stopPropagation();
                setShowSizeMenu(!showSizeMenu);
              }}
              className="text-foreground/40 hover:text-foreground transition-colors flex items-center gap-1 text-[10px] font-mono px-1"
              title="Resize grid dimensions"
            >
              <span>[{colSpan}x{rowSpan}]</span>
            </button>
          </div>

          {/* Pin */}
          <button
            onPointerDown={(e) => { e.stopPropagation(); onTogglePin(id); }}
            className={clsx(
              "transition-colors",
              isPinned ? "text-foreground" : "text-foreground/40 hover:text-foreground"
            )}
            title={isPinned ? "Unpin from top" : "Pin to top"}
          >
            <Pin className="w-3.5 h-3.5" />
          </button>

          {/* Collapse */}
          <button
            onPointerDown={(e) => { e.stopPropagation(); onToggleCollapse(id); }}
            className="text-foreground/40 hover:text-foreground transition-colors ml-1"
            title={isCollapsed ? "Expand module" : "Collapse module"}
          >
            {isCollapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
          </button>

          {/* Remove */}
          <button
            onPointerDown={(e) => { e.stopPropagation(); onRemove(id); }}
            className="text-foreground/30 hover:text-red-500 transition-colors ml-2"
            title="Remove from canvas"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Size Dropdown Placed Outside Opacity Group to avoid glassy transparency */}
      <AnimatePresence>
        {showSizeMenu && (
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            style={{ backgroundColor: '#0B0910' }}
            className="absolute right-4 top-14 z-[100] border border-border p-2 min-w-[140px] flex flex-col gap-1 shadow-2xl opacity-100"
          >
            <div className="text-[9px] font-mono text-foreground/40 px-2 py-1 uppercase border-b border-border mb-1 flex justify-between items-center">
              <span>Dimensions</span>
              <button onPointerDown={(e) => { e.stopPropagation(); setShowSizeMenu(false); }} className="hover:text-foreground"><X className="w-3 h-3" /></button>
            </div>
            {[
              { label: "1x1 Compact", col: 1, row: 1 },
              { label: "2x1 Wide", col: 2, row: 1 },
              { label: "2x2 Large", col: 2, row: 2 },
              { label: "3x1 Hero Wide", col: 3, row: 1 },
              { label: "4x1 Full Span", col: 4, row: 1 },
              { label: "4x2 Command Center", col: 4, row: 2 },
            ].map((s) => (
              <button
                key={s.label}
                onPointerDown={(e) => {
                  e.stopPropagation();
                  onResize(id, s.col, s.row);
                  setShowSizeMenu(false);
                }}
                className={clsx(
                  "text-left px-2 py-1.5 text-[10px] font-mono uppercase tracking-wider flex items-center justify-between transition-colors",
                  colSpan === s.col && rowSpan === s.row
                    ? "bg-foreground text-[#0B0910] font-bold"
                    : "text-foreground/70 hover:bg-foreground/10 hover:text-foreground"
                )}
              >
                <span>{s.label}</span>
                <span className="opacity-50">{s.col}x{s.row}</span>
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Widget Body Content */}
      <AnimatePresence initial={false}>
        {!isCollapsed && (
          <motion.div
            key="content"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className="flex-1 flex flex-col relative z-10 overflow-hidden"
          >
            <ErrorBoundary>
              {children}
            </ErrorBoundary>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Collapsed Indicator */}
      {isCollapsed && (
        <div className="text-[10px] font-mono text-foreground/40 flex items-center justify-between py-2">
          <span>MODULE SUSPENDED // EXPAND TO RESUME</span>
          <span className="uppercase tracking-widest bg-foreground text-background px-1">Active</span>
        </div>
      )}
    </motion.div>
  );
};

"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Plus, 
  Layout, 
  SlidersHorizontal,
  Check,
  Sparkles
} from "lucide-react";
import clsx from "clsx";
import { WidgetContainer } from "./WidgetContainer";
import { WidgetCatalogModal, WIDGET_CATALOG } from "./WidgetCatalogModal";

// Import core Phase 1 modular widgets
import { ProductivityScoreWidget } from "../widgets/ProductivityScoreWidget";
import { FocusTimerWidget } from "../widgets/FocusTimerWidget";
import { CalendarWidget } from "../widgets/CalendarWidget";
import { HabitsWidget } from "../widgets/HabitsWidget";
import { GoalsWidget } from "../widgets/GoalsWidget";
import { TasksWidget } from "../widgets/TasksWidget";
import { NotesWidget } from "../widgets/NotesWidget";
import { ProjectsWidget } from "../widgets/ProjectsWidget";
import { AnalyticsWidget } from "../widgets/AnalyticsWidget";
import { QuickCaptureWidget } from "../widgets/QuickCaptureWidget";

import { DashboardCustomizerModal } from "./DashboardCustomizerModal";

import { TabType } from "../../../components/layout/Sidebar";
import { useDashboard } from "../api/useDashboard";

export interface DashboardLayoutData {
  id: string;
  name: string;
  isDefault: boolean;
  widgets: any[];
}

export interface WidgetCanvasProps {
  onNavigate?: (tab: TabType) => void;
  onOpenCommandPalette?: () => void;
}

export const WidgetCanvas: React.FC<WidgetCanvasProps> = ({ onNavigate, onOpenCommandPalette }) => {
  const { data: dashboardData } = useDashboard();
  const [layouts, setLayouts] = useState<DashboardLayoutData[]>([]);
  const [activeLayoutId, setActiveLayoutId] = useState<string>("");
  const [widgets, setWidgets] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isCatalogOpen, setIsCatalogOpen] = useState<boolean>(false);
  const [isCustomizerOpen, setIsCustomizerOpen] = useState<boolean>(false);
  const [draggedWidgetId, setDraggedWidgetId] = useState<string | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [liveHeartbeat, setLiveHeartbeat] = useState<any>(null);

  // Fetch initial layouts and connect SSE
  useEffect(() => {
    fetchLayouts();

    // Connect to SSE real-time heartbeat endpoint
    const eventSource = new EventSource("/api/realtime");
    eventSource.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data);
        if (payload.type === "HEARTBEAT") {
          setLiveHeartbeat(payload.data);
        }
      } catch (err) {
        console.error("SSE parse error:", err);
      }
    };

    return () => {
      eventSource.close();
    };
  }, []);

  const fetchLayouts = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/dashboard/layout").then((r) => r.json());
      if (res.success && res.data && res.data.length > 0) {
        setLayouts(res.data);
        const defaultLayout = res.data.find((l: any) => l.isDefault) || res.data[0];
        setActiveLayoutId(defaultLayout.id);
        setWidgets(defaultLayout.widgets || []);
      }
    } catch (err) {
      console.error("Failed to fetch layouts:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSwitchLayout = async (layoutId: string) => {
    setActiveLayoutId(layoutId);
    const selected = layouts.find((l) => l.id === layoutId);
    if (selected) {
      setWidgets(selected.widgets || []);
    }
    // Persist switch in DB
    await fetch("/api/dashboard/layout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "switch-default", layoutId }),
    });
  };

  const handleAddWidget = async (widgetType: string, colSpan: number, rowSpan: number, theme: string) => {
    if (!activeLayoutId) return;
    try {
      const res = await fetch("/api/dashboard/widgets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ layoutId: activeLayoutId, widgetType, colSpan, rowSpan, theme }),
      }).then((r) => r.json());

      if (res.success && res.data) {
        const updated = [...widgets, res.data];
        setWidgets(updated);
        updateLayoutsState(activeLayoutId, updated);
      }
    } catch (err) {
      console.error("Failed to add widget:", err);
    }
  };

  const handleRemoveWidget = async (widgetId: string) => {
    const updated = widgets.filter((w) => w.id !== widgetId);
    setWidgets(updated);
    updateLayoutsState(activeLayoutId, updated);

    await fetch(`/api/dashboard/widgets?id=${widgetId}`, { method: "DELETE" });
  };

  const handleToggleWidget = async (widgetType: string, isVisible: boolean) => {
    if (isVisible) {
      // Add widget with default spans
      await handleAddWidget(widgetType, 1, 1, "default");
    } else {
      // Remove all instances of this widget type
      const targetWidgets = widgets.filter(w => w.widgetType === widgetType);
      for (const target of targetWidgets) {
        await handleRemoveWidget(target.id);
      }
    }
  };

  const handleResetToDefault = async () => {
    if (!activeLayoutId) return;
    
    // 1. Remove all existing widgets
    for (const w of widgets) {
      await fetch(`/api/dashboard/widgets?id=${w.id}`, { method: "DELETE" });
    }
    setWidgets([]);
    updateLayoutsState(activeLayoutId, []);

    // 2. Re-seed default widgets
    const defaultWidgets = [
      { widgetType: "FOCUS_TIMER", colSpan: 1, rowSpan: 1, theme: "orange" },
      { widgetType: "CALENDAR", colSpan: 2, rowSpan: 2, theme: "default" },
      { widgetType: "TASKS", colSpan: 2, rowSpan: 2, theme: "default" },
      { widgetType: "PROJECTS", colSpan: 2, rowSpan: 1, theme: "teal" },
      { widgetType: "HABITS", colSpan: 2, rowSpan: 1, theme: "purple" },
      { widgetType: "GOALS", colSpan: 2, rowSpan: 1, theme: "orange" },
      { widgetType: "NOTES", colSpan: 2, rowSpan: 1, theme: "default" }
    ];

    const newWidgets = [];
    for (const w of defaultWidgets) {
      const res = await fetch("/api/dashboard/widgets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ layoutId: activeLayoutId, ...w }),
      }).then((r) => r.json());
      if (res.success && res.data) {
        newWidgets.push(res.data);
      }
    }

    setWidgets(newWidgets);
    updateLayoutsState(activeLayoutId, newWidgets);
    setIsCustomizerOpen(false);
  };

  const handleSaveAsNew = async (name: string) => {
    try {
      const res = await fetch("/api/dashboard/layout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "create-layout", name, copyFromId: activeLayoutId }),
      });
      if (res.ok) {
        fetchLayouts(); // Refresh layouts list
      }
    } catch (err) {
      console.error("Failed to save layout as new:", err);
    }
  };

  const handleResizeWidget = async (widgetId: string, colSpan: number, rowSpan: number) => {
    const updated = widgets.map((w) => (w.id === widgetId ? { ...w, colSpan, rowSpan } : w));
    setWidgets(updated);
    updateLayoutsState(activeLayoutId, updated);

    await fetch("/api/dashboard/widgets", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: widgetId, colSpan, rowSpan }),
    });
  };

  const handleTogglePin = async (widgetId: string) => {
    const target = widgets.find((w) => w.id === widgetId);
    if (!target) return;
    const newPinned = !target.isPinned;
    const updated = widgets.map((w) => (w.id === widgetId ? { ...w, isPinned: newPinned } : w));
    
    // Sort pinned to top
    const sorted = [...updated].sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      return a.order - b.order;
    });

    setWidgets(sorted);
    updateLayoutsState(activeLayoutId, sorted);

    await fetch("/api/dashboard/widgets", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: widgetId, isPinned: newPinned }),
    });
  };

  const handleToggleCollapse = async (widgetId: string) => {
    const target = widgets.find((w) => w.id === widgetId);
    if (!target) return;
    const newCollapsed = !target.isCollapsed;
    const updated = widgets.map((w) => (w.id === widgetId ? { ...w, isCollapsed: newCollapsed } : w));
    setWidgets(updated);
    updateLayoutsState(activeLayoutId, updated);

    await fetch("/api/dashboard/widgets", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: widgetId, isCollapsed: newCollapsed }),
    });
  };

  const handleDuplicateWidget = async (widgetId: string) => {
    const target = widgets.find((w) => w.id === widgetId);
    if (!target) return;
    await handleAddWidget(target.widgetType, target.colSpan, target.rowSpan, target.theme || "default");
  };

  const updateLayoutsState = (layoutId: string, newWidgets: any[]) => {
    setLayouts((prev) =>
      prev.map((l) => (l.id === layoutId ? { ...l, widgets: newWidgets } : l))
    );
  };

  // HTML5 Drag and Drop for Grid Reordering
  const handleDragStart = (e: React.DragEvent, id: string) => {
    setDraggedWidgetId(id);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    setDragOverIndex(index);
  };

  const handleDrop = async (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    setDragOverIndex(null);
    if (!draggedWidgetId) return;

    const dragIndex = widgets.findIndex((w) => w.id === draggedWidgetId);
    if (dragIndex === -1 || dragIndex === dropIndex) return;

    const newWidgets = [...widgets];
    const [removed] = newWidgets.splice(dragIndex, 1);
    newWidgets.splice(dropIndex, 0, removed);

    // Re-index order
    const reordered = newWidgets.map((w, idx) => ({ ...w, order: idx }));
    setWidgets(reordered);
    updateLayoutsState(activeLayoutId, reordered);
    setDraggedWidgetId(null);

    // Save order in background
    setIsSaving(true);
    await fetch("/api/dashboard/layout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "update-widgets", widgets: reordered }),
    });
    setTimeout(() => setIsSaving(false), 500);
  };

  // Map widgetType to catalog meta
  const getWidgetMeta = (type: string) => {
    return WIDGET_CATALOG.find((w) => w.type === type) || {
      title: type.replace(/_/g, " "),
      icon: null,
      badge: "MODULE",
    };
  };

  // Render specific widget component
  const renderWidgetContent = (type: string) => {
    switch (type) {
      case "PRODUCTIVITY_SCORE":
        return <ProductivityScoreWidget />;
      case "FOCUS_TIMER":
        return <FocusTimerWidget />;
      case "CALENDAR":
        return <CalendarWidget />;
      case "HABITS":
        return <HabitsWidget />;
      case "GOALS":
        return <GoalsWidget />;
      case "PROJECTS":
        return <ProjectsWidget />;
      case "NOTES":
        return <NotesWidget />;
      case "TASKS":
        return <TasksWidget />;
      case "ANALYTICS":
        return <AnalyticsWidget />;
      case "QUICK_CAPTURE":
        return <QuickCaptureWidget />;
      default:
        return (
          <div className="p-4 text-center text-xs text-foreground/50">
            Intelligent module active: <span className="font-mono text-foreground">{type}</span>
          </div>
        );
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div className="w-12 h-12 border border-border flex items-center justify-center text-foreground animate-spin">
          <Sparkles className="w-6 h-6" />
        </div>
        <div className="text-sm font-medium text-foreground tracking-wide font-mono uppercase">Initializing System Canvas...</div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-8 relative z-10 pb-20 p-4 sm:p-8">
      {/* Top Workspace Bar / Editorial Hero */}
      <div className="flex flex-col xl:flex-row items-start justify-between gap-8 pb-12 pt-8">
        <div className="max-w-3xl w-full">
          <div className="text-[10px] font-mono uppercase tracking-widest text-foreground/50 mb-6 break-words">
            EXECUTIVE DASHBOARD // {dashboardData?.user?.name || "SYSTEM"}
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-normal text-foreground leading-[1.1] tracking-tight mb-8">
            {dashboardData?.stats?.activeTasks && dashboardData.stats.activeTasks > 0 ? (
              <>
                you have <span className="text-foreground/60 italic">{dashboardData.stats.activeTasks}</span> active tasks<br className="hidden sm:block" />
                remaining for today if you begin<br className="hidden sm:block" />
                with your next focus block.
              </>
            ) : (
              <>
                all systems nominal.<br className="hidden sm:block" />
                you are currently operating at<br className="hidden sm:block" />
                <span className="text-foreground/60 italic">peak efficiency.</span>
              </>
            )}
          </h1>
          <div className="flex flex-col gap-1 text-[10px] font-mono uppercase tracking-widest">
            <span className="text-foreground">CHRONOS INTELLIGENCE</span>
            <span className="text-foreground/40">SYSTEM ADAPTIVE</span>
          </div>
          {isSaving && (
            <span className="text-[9px] font-mono px-2 py-0.5 mt-8 border border-border inline-flex items-center gap-1 uppercase tracking-widest text-foreground/50">
              <Check className="w-3 h-3" />
              <span>Saving Grid</span>
            </span>
          )}
        </div>

        {/* Workspace Switcher & Actions */}
        <div className="flex flex-wrap items-center gap-4 w-full xl:w-auto justify-start xl:justify-end">
          {/* Workspaces */}
          <div className="flex items-center gap-1 overflow-x-auto max-w-[calc(100vw-32px)] scrollbar-none border border-border p-1">
            {layouts.map((layout) => (
              <button
                key={layout.id}
                onClick={() => handleSwitchLayout(layout.id)}
                className={clsx(
                  "px-3 py-1.5 text-[10px] font-mono uppercase tracking-wider transition-colors whitespace-nowrap flex items-center gap-1.5",
                  activeLayoutId === layout.id
                    ? "bg-foreground text-background font-semibold"
                    : "text-foreground/70 hover:text-foreground hover:bg-surface-hover"
                )}
              >
                <Layout className="w-3.5 h-3.5 shrink-0" />
                <span>{layout.name}</span>
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 mt-2 sm:mt-0 w-full sm:w-auto">
            {/* Customize Button */}
            <button
              onClick={() => setIsCustomizerOpen(true)}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 border border-border hover:bg-surface-hover text-foreground font-medium text-[11px] font-mono uppercase tracking-widest transition-colors shrink-0"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>Customize</span>
            </button>
            
            {/* Add Module Button */}
            {widgets.length < 10 && (
              <button 
                id="add-module-btn"
                onClick={() => setIsCatalogOpen(true)}
                className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-3 py-1.5 text-[9px] uppercase tracking-widest text-foreground/40 hover:text-foreground hover:bg-surface-hover transition-colors font-mono border border-transparent hover:border-border"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Module ({widgets.length}/10)</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Grid Canvas */}
      {widgets.length === 0 ? (
        <div className="border-t border-border pt-16 pb-32 space-y-4">
          <div className="text-[10px] font-mono uppercase tracking-widest text-foreground/40">
            SYSTEM STATUS // CANVAS EMPTY
          </div>
          <div>
            <h3 className="text-2xl font-normal text-foreground tracking-tight">No active modules.</h3>
          </div>
          <button
            onClick={() => setIsCustomizerOpen(true)}
            className="inline-flex items-center text-[10px] font-mono uppercase tracking-widest text-foreground hover:text-foreground/70 transition-colors"
          >
            [ CUSTOMIZE WORKSPACE ]
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-12 gap-y-0 auto-rows-[minmax(160px,auto)] border-t border-border pt-12">
          {widgets.map((w, index) => {
            const meta = getWidgetMeta(w.widgetType);
            return (
              <div
                key={w.id}
                draggable={draggedWidgetId === w.id || undefined}
                onDragStart={(e) => handleDragStart(e, w.id)}
                onDragOver={(e) => handleDragOver(e, index)}
                onDrop={(e) => handleDrop(e, index)}
                className={clsx(
                  "transition-all",
                  dragOverIndex === index && "scale-100 ring-2 ring-foreground",
                  w.colSpan === 1 && "col-span-1",
                  w.colSpan === 2 && "col-span-1 md:col-span-2",
                  w.colSpan === 3 && "col-span-1 md:col-span-2 lg:col-span-3",
                  w.colSpan === 4 && "col-span-1 md:col-span-2 lg:col-span-4",
                  !w.colSpan && "col-span-1",
                  !w.isCollapsed && w.rowSpan === 1 && "row-span-1",
                  !w.isCollapsed && w.rowSpan === 2 && "row-span-2",
                  !w.isCollapsed && w.rowSpan === 3 && "row-span-3"
                )}
              >
                <WidgetContainer
                  id={w.id}
                  widgetType={w.widgetType}
                  title={meta.title}
                  badge={meta.badge}
                  icon={meta.icon}
                  colSpan={w.colSpan || 1}
                  rowSpan={w.rowSpan || 1}
                  isPinned={w.isPinned || false}
                  isCollapsed={w.isCollapsed || false}
                  theme={w.theme || (meta as any).theme || "default"}
                  onRemove={handleRemoveWidget}
                  onResize={handleResizeWidget}
                  onTogglePin={handleTogglePin}
                  onToggleCollapse={handleToggleCollapse}
                  onDuplicate={handleDuplicateWidget}
                  onRefresh={() => {}}
                  isDragging={draggedWidgetId === w.id}
                  dragHandleProps={{
                    onMouseEnter: () => setDraggedWidgetId(w.id),
                    onMouseLeave: () => setDraggedWidgetId(null),
                    onPointerDown: (e: any) => e.target.parentElement?.parentElement?.parentElement?.parentElement?.setAttribute('draggable', 'true'),
                    onPointerUp: (e: any) => e.target.parentElement?.parentElement?.parentElement?.parentElement?.removeAttribute('draggable')
                  }}
                >
                  {renderWidgetContent(w.widgetType)}
                </WidgetContainer>
              </div>
            );
          })}
        </div>
      )}

      {/* Modals */}
      <WidgetCatalogModal
        isOpen={isCatalogOpen}
        onClose={() => setIsCatalogOpen(false)}
        onAddWidget={handleAddWidget}
      />
      
      <DashboardCustomizerModal
        isOpen={isCustomizerOpen}
        onClose={() => setIsCustomizerOpen(false)}
        activeLayoutId={activeLayoutId}
        widgets={widgets}
        onToggleWidget={handleToggleWidget}
        onResetToDefault={handleResetToDefault}
        onSaveAsNew={handleSaveAsNew}
      />
    </div>
  );
};

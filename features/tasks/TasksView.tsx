"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Sparkles, CheckCircle2, Clock, Calendar, Tag, AlertCircle, 
  Plus, Filter, LayoutList, LayoutGrid, ArrowUpRight, 
  RefreshCw, Layers, CheckSquare, ChevronRight, MoreHorizontal,
  Flame, Zap, CornerDownRight, FileText
} from "lucide-react";


import { useTasks } from "./api/useTasks";

export const TasksView: React.FC = () => {
  const { tasks: fetchedTasks, isLoading, toggleTask, createTask } = useTasks();
  const tasks = fetchedTasks || [];
  const [viewMode, setViewMode] = useState<"list" | "kanban" | "matrix">("list");
  const [isPrioritizing, setIsPrioritizing] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [filterPriority, setFilterPriority] = useState<string>("ALL");

  // New Task state
  const [newTitle, setNewTitle] = useState("");
  const [newPriority, setNewPriority] = useState<"HIGH" | "MEDIUM" | "LOW">("MEDIUM");
  const [newDuration, setNewDuration] = useState("45");
  const [newProject, setNewProject] = useState("Chronos AI OS");

  const handleAIPrioritize = () => {
    setIsPrioritizing(true);
    setTimeout(() => {
      // With real data, AI prioritize would likely call a backend endpoint.
      // For now, it's a visual state toggle.
      setIsPrioritizing(false);
    }, 900);
  };

  const toggleComplete = (id: string) => {
    const task = tasks.find((t) => t.id === id);
    if (task) {
      toggleTask(id, !task.isCompleted);
    }
  };

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    createTask({
      title: newTitle,
      description: "Added via quick executive creation.",
      priority: newPriority,
      estimatedMinutes: parseInt(newDuration) || 30,
      dueDate: new Date().toISOString(), // Or 'Upcoming' logic
    });

    setNewTitle("");
    setShowAddModal(false);
  };

  const filteredTasks = tasks.filter((t) => {
    if (filterPriority === "ALL") return true;
    return t.priority === filterPriority;
  });

  return (
    <div className="p-6 sm:p-8 space-y-8 max-w-7xl mx-auto pb-24">
      {/* Top Bar: Title & Controls */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-border pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-mono uppercase tracking-widest text-foreground/50">Executive Action Matrix</span>
            <span className="text-[10px] text-foreground/50 px-2 py-0.5 font-mono">
              [ {tasks.filter(t => !t.isCompleted).length} Active Tasks ]
            </span>
          </div>
          <h2 className="text-xl uppercase font-mono tracking-widest text-foreground">
            Intelligent Task Management
          </h2>
          <p className="text-[10px] font-mono uppercase tracking-widest text-foreground/40 mt-1">
            Every task is evaluated for priority, cognitive load, and dependencies to optimize execution.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto text-[10px] font-mono uppercase tracking-widest">
          {/* AI Prioritize Button */}
          <button
            onClick={handleAIPrioritize}
            disabled={isPrioritizing}
            className="flex-1 sm:flex-initial px-4 py-2 hover:text-foreground text-foreground/50 transition-colors flex items-center justify-center gap-2"
          >
            <span>{isPrioritizing ? "[ AI SORTING... ]" : "[ AI PRIORITIZE ]"}</span>
          </button>

          {/* Save to Notion Button */}
          <button
            onClick={() => {
              window.dispatchEvent(
                new KeyboardEvent("keydown", {
                  key: "k",
                  metaKey: true,
                  bubbles: true,
                })
              );
              // Small delay to let modal open, then we could ideally pass a context, 
              // but for now relying on the user to type or select the prompt.
              // We'll add this specific prompt to the CommandPalette quick prompts.
            }}
            className="px-4 py-2 text-foreground/70 hover:text-foreground border border-foreground/30 hover:border-foreground transition-all flex items-center gap-1.5"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>[ SAVE TO NOTION ]</span>
          </button>

          {/* Add Task Button */}
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 text-foreground hover:bg-foreground hover:text-background border border-foreground transition-all flex items-center gap-1.5"
          >
            <span>[ NEW TASK ]</span>
          </button>
        </div>
      </div>

      {/* Filter & View Switcher */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-[10px] font-mono uppercase tracking-widest text-foreground/60">
        {/* Priority Filter */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => setFilterPriority("ALL")}
            className={`transition-colors ${
              filterPriority === "ALL" ? "text-foreground font-bold" : "hover:text-foreground"
            }`}
          >
            [ All ({tasks.length}) ]
          </button>
          <button
            onClick={() => setFilterPriority("HIGH")}
            className={`transition-colors ${
              filterPriority === "HIGH" ? "text-foreground font-bold" : "hover:text-foreground"
            }`}
          >
            [ High ({tasks.filter(t => t.priority === "HIGH").length}) ]
          </button>
          <button
            onClick={() => setFilterPriority("MEDIUM")}
            className={`transition-colors ${
              filterPriority === "MEDIUM" ? "text-foreground font-bold" : "hover:text-foreground"
            }`}
          >
            [ Medium ({tasks.filter(t => t.priority === "MEDIUM").length}) ]
          </button>
          <button
            onClick={() => setFilterPriority("LOW")}
            className={`transition-colors ${
              filterPriority === "LOW" ? "text-foreground font-bold" : "hover:text-foreground"
            }`}
          >
            [ Low ]
          </button>
        </div>

        {/* View Mode Switcher */}
        <div className="flex items-center gap-1 bg-white/5 p-1 rounded-xl border border-white/10">
          <button
            onClick={() => setViewMode("list")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
              viewMode === "list" ? "bg-white/15 text-white shadow" : "text-white/60 hover:text-white"
            }`}
          >
            <LayoutList className="w-3.5 h-3.5" /> List
          </button>
          <button
            onClick={() => setViewMode("kanban")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
              viewMode === "kanban" ? "bg-white/15 text-white shadow" : "text-white/60 hover:text-white"
            }`}
          >
            <LayoutGrid className="w-3.5 h-3.5" /> Kanban
          </button>
          <button
            onClick={() => setViewMode("matrix")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
              viewMode === "matrix" ? "bg-white/15 text-white shadow" : "text-white/60 hover:text-white"
            }`}
          >
            <Zap className="w-3.5 h-3.5" /> Matrix
          </button>
        </div>
      </div>

      {/* 1. LIST VIEW */}
      {viewMode === "list" && (
        <div className="space-y-3 font-mono text-xs">
          <AnimatePresence>
            {filteredTasks.map((task) => (
              <motion.div
                key={task.id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className={`p-4 border transition-all duration-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 group ${
                  task.isCompleted
                    ? "border-border border-dashed opacity-50"
                    : "border-foreground hover:bg-foreground/5"
                }`}
              >
                {/* Left: Checkbox & Title */}
                <div className="flex items-start gap-4 flex-1 min-w-0">
                  <button
                    onClick={() => toggleComplete(task.id)}
                    className={`w-5 h-5 border mt-0.5 flex items-center justify-center transition-all shrink-0 ${
                      task.isCompleted
                        ? "bg-foreground text-background border-foreground"
                        : "border-foreground/50 hover:border-foreground"
                    }`}
                  >
                    {task.isCompleted && <span className="font-bold">x</span>}
                  </button>

                  <div className="space-y-2 min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className={`text-sm uppercase tracking-wider truncate ${task.isCompleted ? "line-through text-foreground/50" : "text-foreground"}`}>
                        {task.title}
                      </h4>
                      {/* Priority Badge */}
                      <span className={`text-[10px] uppercase font-bold ${
                        task.priority === "HIGH"
                          ? "text-foreground"
                          : task.priority === "MEDIUM"
                          ? "text-foreground/70"
                          : "text-foreground/50"
                      }`}>
                        [{task.priority}]
                      </span>
                      {task.isRecurring && (
                        <span className="text-[10px] text-foreground/50 px-2 uppercase tracking-widest">
                          [ {task.recurringRule} ]
                        </span>
                      )}
                    </div>

                    <p className="text-[10px] uppercase tracking-widest text-foreground/60 line-clamp-1">
                      {task.description}
                    </p>

                    {/* Metadata tags */}
                    <div className="flex flex-wrap items-center gap-4 pt-1 text-[10px] uppercase tracking-widest text-foreground/50">
                      <span>[ {task.estimatedMinutes} MINS ]</span>
                      <span>[ DUE: {task.dueDate} ]</span>
                      {task.project && (
                        <span className="border-l border-foreground/30 pl-2">
                          [ {task.project} ]
                        </span>
                      )}
                      {task.dependsOn && (
                        <span className="border-l border-foreground/30 pl-2 text-foreground/80">
                          DEPENDS ON: {task.dependsOn}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right: Actions */}
                <div className="flex items-center gap-4 self-end sm:self-center text-[10px] uppercase tracking-widest">
                  {task.notesCount && (
                    <span className="text-foreground/60">
                      [ {task.notesCount} NOTES ]
                    </span>
                  )}
                  <button 
                    onClick={() => toggleComplete(task.id)}
                    className="text-foreground hover:bg-foreground hover:text-background px-3 py-1 border border-foreground transition-all"
                  >
                    {task.isCompleted ? "[ REOPEN ]" : "[ COMPLETE ]"}
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* 2. KANBAN BOARD VIEW */}
      {viewMode === "kanban" && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 font-mono text-xs">
          {(["HIGH", "MEDIUM", "LOW"] as const).map((prio) => {
            const columnTasks = filteredTasks.filter((t) => t.priority === prio);
            return (
              <div key={prio} className="p-4 border border-border space-y-4">
                <div className="flex items-center justify-between border-b border-border pb-3 px-2 text-[10px] uppercase tracking-widest text-foreground/60">
                  <span className={`font-bold ${
                    prio === "HIGH" ? "text-foreground" : prio === "MEDIUM" ? "text-foreground/70" : "text-foreground/50"
                  }`}>
                    [{prio} PRIORITY]
                  </span>
                  <span>
                    [ {columnTasks.length} ]
                  </span>
                </div>

                <div className="space-y-3 min-h-[200px]">
                  {columnTasks.map((task) => (
                    <div
                      key={task.id}
                      onClick={() => toggleComplete(task.id)}
                      className={`p-4 border transition-all cursor-pointer group ${
                        task.isCompleted
                          ? "border-border border-dashed opacity-50 line-through"
                          : "border-foreground/30 hover:border-foreground hover:bg-foreground/5"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <h5 className="text-sm font-bold uppercase tracking-wider text-foreground">{task.title}</h5>
                        <span className="text-[10px] uppercase text-foreground/50 shrink-0">
                          [{task.estimatedMinutes}M]
                        </span>
                      </div>
                      <p className="text-[10px] uppercase tracking-widest text-foreground/60 line-clamp-2 mb-3">{task.description}</p>
                      <div className="flex items-center justify-between text-[10px] uppercase tracking-widest text-foreground/40 border-t border-border pt-2">
                        <span>DUE: {task.dueDate}</span>
                        {task.project && <span>[{task.project}]</span>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 3. PRIORITY MATRIX VIEW (Eisenhower style) */}
      {viewMode === "matrix" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 font-mono text-xs">
          <div className="p-6 border border-foreground/30 bg-foreground/5 space-y-4">
            <div className="flex items-center justify-between border-b border-foreground/30 pb-3 text-[10px] uppercase tracking-widest text-foreground">
              <span className="font-bold flex items-center gap-2">
                [URGENT & IMPORTANT (DO FIRST)]
              </span>
              <span>[HIGH IMPACT]</span>
            </div>
            <div className="space-y-2">
              {filteredTasks.filter(t => t.priority === "HIGH").map(task => (
                <div key={task.id} className="p-3 border border-foreground/20 flex items-center justify-between bg-background">
                  <span className={`text-[10px] uppercase tracking-widest font-bold ${task.isCompleted ? "line-through text-foreground/40" : "text-foreground"}`}>{task.title}</span>
                  <span className="text-[10px] text-foreground/50">[{task.estimatedMinutes}M]</span>
                </div>
              ))}
            </div>
          </div>

          <div className="p-6 border border-border space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3 text-[10px] uppercase tracking-widest text-foreground/70">
              <span className="font-bold flex items-center gap-2">
                [NOT URGENT, IMPORTANT (SCHEDULE)]
              </span>
              <span>[STRATEGIC]</span>
            </div>
            <div className="space-y-2">
              {filteredTasks.filter(t => t.priority === "MEDIUM").map(task => (
                <div key={task.id} className="p-3 border border-border flex items-center justify-between bg-background">
                  <span className={`text-[10px] uppercase tracking-widest font-bold ${task.isCompleted ? "line-through text-foreground/40" : "text-foreground"}`}>{task.title}</span>
                  <span className="text-[10px] text-foreground/50">[{task.estimatedMinutes}M]</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ADD TASK MODAL */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-lg bg-background border border-foreground p-6 space-y-6 font-mono text-xs uppercase tracking-widest"
            >
              <div className="flex items-center justify-between border-b border-border pb-4">
                <h3 className="text-sm font-bold text-foreground">
                  [ CREATE INTELLIGENT TASK ]
                </h3>
                <button onClick={() => setShowAddModal(false)} className="text-foreground/50 hover:text-foreground">[ X ]</button>
              </div>

              <form onSubmit={handleAddTask} className="space-y-4">
                <div>
                  <label className="text-[10px] font-bold text-foreground/70 block mb-2">TASK TITLE</label>
                  <input
                    type="text"
                    required
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="e.g., Complete DP 150 problems..."
                    className="w-full p-3 bg-transparent border border-border text-foreground placeholder-foreground/30 focus:outline-none focus:border-foreground"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-bold text-foreground/70 block mb-2">PRIORITY</label>
                    <select
                      value={newPriority}
                      onChange={(e) => setNewPriority(e.target.value as any)}
                      className="w-full p-3 bg-transparent border border-border text-foreground focus:outline-none focus:border-foreground uppercase appearance-none"
                    >
                      <option value="HIGH" className="bg-background">HIGH PRIORITY</option>
                      <option value="MEDIUM" className="bg-background">MEDIUM PRIORITY</option>
                      <option value="LOW" className="bg-background">LOW PRIORITY</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-foreground/70 block mb-2">ESTIMATED MINS</label>
                    <input
                      type="number"
                      value={newDuration}
                      onChange={(e) => setNewDuration(e.target.value)}
                      className="w-full p-3 bg-transparent border border-border text-foreground focus:outline-none focus:border-foreground"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-foreground/70 block mb-2">LINKED PROJECT</label>
                  <input
                    type="text"
                    value={newProject}
                    onChange={(e) => setNewProject(e.target.value)}
                    className="w-full p-3 bg-transparent border border-border text-foreground focus:outline-none focus:border-foreground"
                  />
                </div>

                <div className="pt-4 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="px-4 py-2 text-foreground/70 hover:text-foreground transition-colors"
                  >
                    [ CANCEL ]
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-foreground border border-foreground hover:bg-foreground hover:text-background transition-colors"
                  >
                    [ CREATE TASK ]
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

"use client";

import React from "react";
import { CheckSquare, CheckCircle2, Clock, Zap } from "lucide-react";
import clsx from "clsx";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTasks } from "../../tasks/api/useTasks";
import { Skeleton } from "../../../components/ui/Skeleton";

export const TasksWidget: React.FC = () => {
  const [filter, setFilter] = React.useState<"all" | "priority">("all");
  const [newTaskTitle, setNewTaskTitle] = React.useState("");

  const { tasks: data, isLoading, error } = useTasks();
  const queryClient = useQueryClient();

  const toggleMutation = useMutation({
    mutationFn: async ({ id, isCompleted }: { id: string; isCompleted: boolean }) => {
      const res = await fetch(`/api/tasks/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isCompleted }),
      });
      return res.json();
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
  });

  const handleToggle = (id: string) => {
    if (!data) return;
    const task = data.find((t: any) => t.id === id);
    if (!task) return;
    toggleMutation.mutate({ id, isCompleted: !task.isCompleted });
  };

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;
    await fetch("/api/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: newTaskTitle, isCompleted: false, priority: "MEDIUM" }),
    });
    setNewTaskTitle("");
    queryClient.invalidateQueries({ queryKey: ["tasks"] });
  };

  if (isLoading) return <div className="h-full p-4"><Skeleton count={4} /></div>;
  if (error || !data) return <div className="text-[10px] font-mono text-red-500">ERROR</div>;

  const filteredTasks = filter === "priority" 
    ? data.filter((t: any) => t.priority === "HIGH" || t.priority === "CRITICAL") 
    : data;

  return (
    <div className="flex flex-col h-full font-mono">
      {/* Header handled by WidgetContainer now */}
      
      {/* Filter / Sort minimal control */}
      <div className="flex items-center gap-4 text-[10px] uppercase tracking-widest text-foreground/40 mb-6 pb-2 border-b border-border">
        <button 
          onClick={() => setFilter("all")}
          className={clsx(filter === "all" ? "text-foreground" : "hover:text-foreground/70")}
        >
          [ ALL ]
        </button>
        <button 
          onClick={() => setFilter("priority")}
          className={clsx(filter === "priority" ? "text-foreground" : "hover:text-foreground/70")}
        >
          [ HIGH PRIORITY ]
        </button>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-none pr-2">
        <div className="flex flex-col space-y-6">
          {filteredTasks.length === 0 ? (
            <div className="text-[10px] text-foreground/40 uppercase tracking-widest">
              NO TASKS IN MATRIX
            </div>
          ) : (
            filteredTasks.map((t: any, idx: number) => (
              <div 
                key={t.id} 
                className="flex items-start gap-4 group cursor-pointer"
                onClick={() => handleToggle(t.id)}
              >
                <div className="text-[10px] text-foreground/40 w-4 shrink-0 mt-0.5">
                  {(idx + 1).toString().padStart(2, '0')}
                </div>
                
                <button 
                  className="text-foreground shrink-0 mt-0.5"
                >
                  {t.isCompleted ? "■" : "□"}
                </button>
                
                <div className="flex flex-col gap-1 w-full min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <span className={clsx(
                      "text-sm tracking-tight",
                      t.isCompleted ? "text-foreground/40 line-through" : "text-foreground"
                    )}>
                      {t.title}
                    </span>
                    {(t.priority === "HIGH" || t.priority === "CRITICAL") && (
                      <span className="text-foreground text-[10px] shrink-0 mt-0.5">*</span>
                    )}
                  </div>
                  
                  <div className="text-[9px] uppercase tracking-widest text-foreground/40 flex items-center gap-2">
                    {t.dueDate && <span>{t.dueDate}</span>}
                    {t.dueDate && t.estimatedMinutes && <span>·</span>}
                    {t.estimatedMinutes && <span>{t.estimatedMinutes} MIN</span>}
                    {t.category && (
                      <>
                        <span>·</span>
                        <span className="text-foreground/60">{t.category}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <form onSubmit={handleAddTask} className="mt-8 flex items-center border-t border-border pt-4">
        <span className="text-foreground/40 text-xs mr-2">/</span>
        <input
          type="text"
          value={newTaskTitle}
          onChange={(e) => setNewTaskTitle(e.target.value)}
          placeholder="INPUT NEW TASK..."
          className="w-full bg-transparent text-xs text-foreground placeholder:text-foreground/40 focus:outline-none uppercase tracking-wider"
        />
        <button type="submit" className="text-[10px] text-foreground/50 hover:text-foreground uppercase tracking-widest transition-colors">
          ENTER
        </button>
      </form>
    </div>
  );
};

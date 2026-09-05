"use client";

import React from "react";
import { FolderGit2, Calendar, Target, Zap } from "lucide-react";
import clsx from "clsx";
import { useProjects } from "../../projects/api/useProjects";
import { Skeleton } from "../../../components/ui/Skeleton";

export const ProjectsWidget: React.FC = () => {
  const { projects, isLoading, error } = useProjects();

  if (isLoading) {
    return (
      <div className="flex flex-col justify-between h-full min-h-[160px] text-foreground p-4">
        <Skeleton count={2} />
      </div>
    );
  }

  if (error || !projects) {
    return <div className="text-[10px] font-mono text-red-500 p-4 text-center">FAILED TO LOAD PROJECTS</div>;
  }

  if (projects.length === 0) {
    return (
      <div className="flex flex-col h-full min-h-[160px] p-4 text-[10px] font-mono uppercase tracking-widest text-foreground/40">
        <div>[ NO ACTIVE PROJECTS ]</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full font-mono">
      {/* Header handled by WidgetContainer */}
      
      <div className="flex-1 overflow-y-auto scrollbar-none pr-4">
        <div className="flex flex-col space-y-6">
          {projects.map((p: any, i: number) => {
            const indexStr = (i + 1).toString().padStart(2, '0');
            const progress = p.progress || 0;
            
            // Create a dynamic line based on progress
            const lineLength = 20;
            const filledLength = Math.round((progress / 100) * lineLength);
            const lineStr = "─".repeat(filledLength) + " ".repeat(lineLength - filledLength);

            return (
              <div key={p.id} className="flex gap-6 group cursor-pointer">
                <span className="text-[10px] uppercase tracking-widest text-foreground/40 pt-1 shrink-0 group-hover:text-foreground transition-colors">
                  {indexStr}
                </span>
                <div className="flex flex-col w-full">
                  <div className="flex items-start justify-between mb-1">
                    <span className="text-sm font-medium tracking-widest uppercase">
                      {p.title}
                    </span>
                    <span className="text-[9px] uppercase tracking-widest text-foreground/50">
                      {p.status}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between text-[10px] uppercase tracking-widest text-foreground/50">
                    <div className="flex items-center gap-2">
                      <span className="font-bold tracking-[-0.1em] overflow-hidden whitespace-pre">
                        {lineStr.replace(/ /g, "·")}
                      </span>
                      <span className="shrink-0">{progress}%</span>
                    </div>
                    {p.deadline && (
                      <span className="shrink-0">{new Date(p.deadline).toLocaleDateString()}</span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

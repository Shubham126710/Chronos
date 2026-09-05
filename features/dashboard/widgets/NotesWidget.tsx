"use client";

import React, { useState } from "react";
import { FileText, ArrowRight } from "lucide-react";
import clsx from "clsx";
import { useNotes } from "../../notes/api/useNotes";
import { Skeleton } from "../../../components/ui/Skeleton";

export const NotesWidget: React.FC = () => {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const { notes, isLoading, error } = useNotes();

  if (isLoading) {
    return (
      <div className="flex flex-col h-full min-h-[160px] p-4 text-foreground">
        <Skeleton count={2} />
      </div>
    );
  }

  if (error || !notes) {
    return <div className="text-[10px] font-mono text-red-500 p-4 text-center">FAILED TO LOAD NOTES</div>;
  }

  if (notes.length === 0) {
    return (
      <div className="flex flex-col h-full min-h-[160px] p-4 text-[10px] font-mono uppercase tracking-widest text-foreground/40">
        <div>[ NO ACTIVE NOTES ]</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full font-mono">
      {/* Header handled by WidgetContainer */}

      <div className="flex-1 overflow-y-auto pr-4 scrollbar-none">
        <div className="flex flex-col space-y-6">
          {notes.map((note: any, i: number) => {
            const indexStr = (i + 1).toString().padStart(2, '0');
            const isExpanded = expandedId === note.id;
            return (
              <div key={note.id} className="flex gap-6 cursor-pointer group" onClick={() => setExpandedId(isExpanded ? null : note.id)}>
                <span className="text-foreground/40 text-[10px] pt-1 shrink-0 group-hover:text-foreground transition-colors">
                  {indexStr}
                </span>
                <div className="flex flex-col w-full">
                  <div className="flex items-start justify-between w-full mb-1">
                    <span className={clsx("text-sm tracking-widest uppercase", isExpanded ? "text-foreground font-medium" : "text-foreground/80")}>
                      {note.title}
                    </span>
                    <span className="text-[10px] text-foreground/50 uppercase tracking-widest shrink-0 ml-2 pt-0.5">
                      {isExpanded ? "[ CLOSE ]" : "[ OPEN ]"}
                    </span>
                  </div>
                  
                  {isExpanded && (
                    <div className="mt-4 text-xs text-foreground/70 leading-relaxed font-mono whitespace-pre-wrap pl-4 border-l border-border mb-4">
                      {note.content}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

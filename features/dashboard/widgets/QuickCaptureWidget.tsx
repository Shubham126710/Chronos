"use client";

import React, { useState } from "react";
import { Send, Sparkles } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export const QuickCaptureWidget: React.FC = () => {
  const [idea, setIdea] = useState("");
  const queryClient = useQueryClient();

  const { data: notes = [] } = useQuery({
    queryKey: ["notes"],
    queryFn: async () => {
      const res = await fetch("/api/notes");
      const data = await res.json();
      return data.data || [];
    },
  });

  const captureMutation = useMutation({
    mutationFn: async (content: string) => {
      const res = await fetch("/api/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: "Quick Capture",
          content,
          tags: idea.toLowerCase().includes("code") ? ["DEVELOPER"] : ["STUDENT"]
        }),
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notes"] });
    },
  });

  const handleCapture = (e: React.FormEvent) => {
    e.preventDefault();
    if (!idea.trim()) return;
    captureMutation.mutate(idea);
    setIdea("");
  };

  return (
    <div className="flex flex-col h-full min-h-[160px] text-foreground font-mono">
      <div className="flex-1 overflow-y-auto scrollbar-none pr-4 mb-4">
        <div className="flex flex-col space-y-3">
          {notes.map((c: any, idx: number) => (
            <div key={c.id || idx} className="flex gap-4 group">
              <span className="text-foreground/40 text-[10px] mt-0.5 shrink-0">
                {idx === 0 ? ">>>" : ">"}
              </span>
              <div className="flex flex-col w-full min-w-0">
                <span className="text-xs tracking-tight text-foreground/80 group-hover:text-foreground transition-colors">{c.content}</span>
                <span className="text-[9px] uppercase tracking-widest text-foreground/40 mt-1">
                  [{c.tags && c.tags.length > 0 ? c.tags[0] : "NOTE"}]
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <form onSubmit={handleCapture} className="relative flex items-center border-t border-border pt-3">
        <span className="text-foreground/40 text-xs mr-2">/</span>
        <input
          type="text"
          value={idea}
          onChange={(e) => setIdea(e.target.value)}
          placeholder="INPUT LOG..."
          className="w-full bg-transparent text-xs text-foreground placeholder:text-foreground/40 focus:outline-none uppercase tracking-wider"
        />
        <button type="submit" className="absolute right-0 text-[10px] text-foreground/50 hover:text-foreground uppercase tracking-widest transition-colors">
          ENTER
        </button>
      </form>
    </div>
  );
};

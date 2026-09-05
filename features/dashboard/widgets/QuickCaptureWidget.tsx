"use client";

import React, { useState } from "react";
import { Send, Sparkles } from "lucide-react";

export const QuickCaptureWidget: React.FC = () => {
  const [idea, setIdea] = useState("");
  const [captures, setCaptures] = useState([
    { text: "Add drag handle animations to widget grid", tag: "DEVELOPER" },
    { text: "Review bankers algorithm for deadlock avoidance", tag: "STUDENT" },
  ]);

  const handleCapture = (e: React.FormEvent) => {
    e.preventDefault();
    if (!idea.trim()) return;
    const tag = idea.toLowerCase().includes("code") || idea.toLowerCase().includes("grid") ? "DEVELOPER" : "STUDENT";
    setCaptures([{ text: idea, tag }, ...captures]);
    setIdea("");
  };

  return (
    <div className="flex flex-col h-full min-h-[160px] text-foreground font-mono">
      <div className="flex-1 overflow-y-auto scrollbar-none pr-4 mb-4">
        <div className="flex flex-col space-y-3">
          {captures.map((c, idx) => (
            <div key={idx} className="flex gap-4 group">
              <span className="text-foreground/40 text-[10px] mt-0.5 shrink-0">
                {idx === 0 ? ">>>" : ">"}
              </span>
              <div className="flex flex-col w-full min-w-0">
                <span className="text-xs tracking-tight text-foreground/80 group-hover:text-foreground transition-colors">{c.text}</span>
                <span className="text-[9px] uppercase tracking-widest text-foreground/40 mt-1">
                  [{c.tag}]
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

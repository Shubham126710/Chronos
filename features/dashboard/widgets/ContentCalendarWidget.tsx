"use client";

import React, { useState } from "react";

import clsx from "clsx";

export const ContentCalendarWidget: React.FC = () => {
  const [pipeline] = useState([
    { title: "Building a Personal OS in Next.js 16", stage: "FILMING", platform: "YouTube", date: "Friday" },
    { title: "Why I Stopped Using Generic Admin Panels", stage: "SCRIPTING", platform: "Twitter/X", date: "Tomorrow" },
    { title: "Graph Shortest Path Visualizer Demo", stage: "PUBLISHED", platform: "LinkedIn", date: "Yesterday" },
  ]);

  return (
    <div className="flex flex-col justify-between h-full min-h-[160px] text-white space-y-3">
      <div className="space-y-2">
        {pipeline.map((p, idx) => (
          <div key={idx} className="bg-white/5 border border-white/10 p-2.5 rounded-2xl flex items-center justify-between gap-3">
            <div className="truncate flex-1">
              <h4 className="text-xs font-bold text-white truncate">{p.title}</h4>
              <div className="text-[10px] text-white/50 mt-0.5 flex items-center gap-2 font-mono">
                <span>{p.platform}</span>
                <span>•</span>
                <span className="text-purple-300">{p.date}</span>
              </div>
            </div>
            <span
              className={clsx(
                "text-[9px] font-mono px-2 py-0.5 rounded-full border uppercase tracking-wider font-bold shrink-0",
                p.stage === "PUBLISHED" ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30" : "bg-purple-500/20 text-purple-300 border-purple-500/30"
              )}
            >
              {p.stage}
            </span>
          </div>
        ))}
      </div>

      <div className="mt-2 pt-2 border-t border-white/10 flex items-center justify-between text-[11px] text-white/60 font-mono">
        <span>Creator Studio Pipeline</span>
        <span className="text-purple-300">3 Active Pieces</span>
      </div>
    </div>
  );
};

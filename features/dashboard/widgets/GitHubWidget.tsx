"use client";

import React, { useEffect, useState } from "react";
import { FolderGit2, GitCommit, GitBranch, Flame, ShieldCheck } from "lucide-react";
import clsx from "clsx";

export const GitHubWidget: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    fetch("/api/github")
      .then((res) => res.json())
      .then((res) => {
        if (res.success) setData(res.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading || !data) {
    return <div className="text-xs text-white/50 p-4">Syncing GitHub commits & streak...</div>;
  }

  const { username, totalCommitsThisYear, currentStreak, topRepo, recentCommits = [], contributionGraph = [] } = data;

  return (
    <div className="flex flex-col justify-between h-full min-h-[160px] text-white">
      {/* Top Header */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 truncate">
          <div className="w-9 h-9 rounded-xl bg-[#81C3D7]/20 border border-[#81C3D7]/30 flex items-center justify-center text-[#81C3D7] shrink-0">
            <FolderGit2 className="w-5 h-5" />
          </div>
          <div className="truncate">
            <div className="text-sm font-bold text-white truncate">@{username}</div>
            <div className="text-xs text-white/60">{totalCommitsThisYear} commits this year</div>
          </div>
        </div>

        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FF8C61]/20 text-[#FF8C61] border border-[#FF8C61]/30 font-mono text-xs font-bold shrink-0">
          <Flame className="w-3.5 h-3.5 fill-[#FF8C61]" />
          <span>{currentStreak} Day Streak</span>
        </div>
      </div>

      {/* Contribution Heatmap Preview */}
      <div className="my-4">
        <div className="text-[10px] font-mono text-white/40 uppercase tracking-widest mb-1.5 flex justify-between">
          <span>Contribution Activity</span>
          <span>Top Repo: {topRepo}</span>
        </div>
        <div className="grid grid-flow-col gap-1 overflow-x-auto pb-1 scrollbar-none">
          {contributionGraph.slice(-20).map((week: any, wIdx: number) => (
            <div key={wIdx} className="grid grid-rows-7 gap-1">
              {week.days?.map((day: any, dIdx: number) => {
                const colorMap = [
                  "bg-white/5",
                  "bg-[#81C3D7]/30",
                  "bg-[#81C3D7]/60",
                  "bg-[#81C3D7]",
                ];
                return (
                  <div
                    key={dIdx}
                    className={clsx("w-2.5 h-2.5 rounded-[2px] transition-all", colorMap[day.level] || "bg-white/5")}
                    title={`${day.count} commits`}
                  />
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Recent Commits List */}
      <div className="space-y-1.5 border-t border-white/10 pt-3">
        {recentCommits.slice(0, 2).map((c: any, idx: number) => (
          <div key={idx} className="flex items-center justify-between gap-2 text-xs text-white/80 font-mono">
            <div className="flex items-center gap-1.5 truncate">
              <GitCommit className="w-3.5 h-3.5 text-[#81C3D7] shrink-0" />
              <span className="truncate">{c.message}</span>
            </div>
            <span className="text-[10px] text-white/40 shrink-0">{c.timestamp}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

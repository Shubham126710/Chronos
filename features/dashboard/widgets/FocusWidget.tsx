"use client";

import React, { useEffect, useState } from "react";
import { Clock, Play, CheckCircle2, Zap } from "lucide-react";

export const FocusWidget: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    fetch("/api/focus")
      .then((res) => res.json())
      .then((res) => {
        if (res.success) setData(res.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading || !data) {
    return <div className="text-xs text-white/50 p-4">Loading focus intelligence...</div>;
  }

  const progress = Math.min(100, Math.round((data.todayFocusHours / data.targetDailyHours) * 100));

  return (
    <div className="flex flex-col justify-between h-full min-h-[160px] text-white">
      <div>
        <div className="flex items-center justify-between">
          <div>
            <div className="text-2xl font-bold tracking-tight">{data.todayFocusHours}h / {data.targetDailyHours}h</div>
            <div className="text-xs text-white/60">Today's Deep Work Goal</div>
          </div>
          <div className="w-10 h-10 rounded-full bg-[#FF8C61]/20 border border-[#FF8C61]/30 flex items-center justify-center text-[#FF8C61] font-mono text-xs font-bold">
            {progress}%
          </div>
        </div>

        {/* Progress bar */}
        <div className="w-full h-2 bg-white/10 rounded-full mt-3 overflow-hidden">
          <div className="h-full bg-gradient-to-r from-[#FF8C61] to-[#FFAC81] rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
        </div>
      </div>

      {data.activeSession && (
        <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-xs bg-white/5 p-2.5 rounded-xl border border-white/10">
          <div className="flex items-center gap-2 truncate">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping shrink-0" />
            <span className="truncate font-medium text-white/90">{data.activeSession.taskName}</span>
          </div>
          <span className="font-mono text-[#FF8C61] shrink-0">{data.activeSession.remainingMinutes}m left</span>
        </div>
      )}
    </div>
  );
};

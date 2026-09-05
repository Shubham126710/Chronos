"use client";

import React from "react";
import { HeartPulse, Moon, Zap, Activity } from "lucide-react";

export const FitnessHealthWidget: React.FC = () => {
  return (
    <div className="flex flex-col justify-between h-full min-h-[160px] text-white space-y-3">
      <div className="grid grid-cols-2 gap-2">
        <div className="bg-white/5 border border-white/10 rounded-2xl p-3">
          <div className="flex items-center gap-1.5 text-xs text-white/60 mb-1">
            <Moon className="w-3.5 h-3.5 text-[#81C3D7]" />
            <span>Sleep Duration</span>
          </div>
          <div className="text-2xl font-black text-white font-mono">7.8h</div>
          <div className="text-[10px] text-emerald-400 font-mono mt-0.5">+1.2h vs avg</div>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-3">
          <div className="flex items-center gap-1.5 text-xs text-white/60 mb-1">
            <Activity className="w-3.5 h-3.5 text-[#FF8C61]" />
            <span>HIIT Recovery</span>
          </div>
          <div className="text-2xl font-black text-white font-mono">96%</div>
          <div className="text-[10px] text-[#FF8C61] font-mono mt-0.5">Peak Window</div>
        </div>
      </div>

      <div className="mt-2 pt-2 border-t border-white/10 text-xs text-white/70 leading-relaxed">
        <span className="font-bold text-white">Biometric Insight: </span>
        High physical recovery score aligns with your scheduled 45-minute Dynamic Programming focus block.
      </div>
    </div>
  );
};

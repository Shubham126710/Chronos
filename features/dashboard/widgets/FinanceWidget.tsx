"use client";

import React, { useState } from "react";
import { CreditCard, DollarSign, TrendingDown, ShieldAlert } from "lucide-react";

export const FinanceWidget: React.FC = () => {
  const [subs] = useState([
    { name: "ChatGPT Plus & Claude Pro", cost: "$40/mo", nextBilling: "In 4 days", category: "AI Tools" },
    { name: "GitHub Copilot & Vercel Pro", cost: "$30/mo", nextBilling: "In 12 days", category: "Dev Cloud" },
    { name: "Spotify Premium", cost: "$11/mo", nextBilling: "In 18 days", category: "Focus Audio" },
  ]);

  return (
    <div className="flex flex-col justify-between h-full min-h-[160px] text-white space-y-3">
      <div className="flex items-center justify-between border-b border-white/10 pb-2">
        <div>
          <div className="text-2xl font-black tracking-tight">$81.00 / mo</div>
          <div className="text-xs text-white/60">Active Productivity Stack ROI</div>
        </div>
        <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold font-mono text-xs">
          ROI 10x
        </div>
      </div>

      <div className="space-y-1.5">
        {subs.map((s, idx) => (
          <div key={idx} className="bg-white/5 border border-white/10 p-2 rounded-xl flex items-center justify-between text-xs">
            <div>
              <div className="font-bold text-white">{s.name}</div>
              <div className="text-[10px] text-white/50 font-mono">{s.nextBilling}</div>
            </div>
            <div className="font-mono font-bold text-emerald-300">{s.cost}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

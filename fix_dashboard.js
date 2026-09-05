const fs = require("fs");
let content = fs.readFileSync("/Users/shubhamupadhyay/Documents/Projects/Chronos/features/dashboard/DashboardView.tsx", "utf8");

// AI Banner
content = content.replace(
  "bg-gradient-to-r from-[#5227FF]/30 via-[#7B5CFF]/20 to-[#120F17] border border-[#7B5CFF]/50 relative overflow-hidden shadow-2xl shadow-[#5227FF]/10 group",
  "bg-white/5 backdrop-blur-3xl border border-white/20 relative overflow-hidden group shadow-xl"
);
content = content.replace(
  "bg-[#5227FF]/15 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none group-hover:bg-[#5227FF]/25",
  "bg-[#FF8C61]/10 rounded-full blur-2xl -mr-20 -mt-20 pointer-events-none group-hover:bg-[#FF8C61]/20"
);
content = content.replace(
  "bg-gradient-to-tr from-[#5227FF] to-[#FF9FFC] text-white shadow-lg shadow-[#5227FF]/30 shrink-0",
  "bg-[#FF8C61]/10 border border-[#FF8C61]/30 text-[#FF8C61] shrink-0"
);
content = content.replace(
  "text-[#FF9FFC] font-semibold flex items-center gap-1",
  "text-[#FFAC81] font-bold flex items-center gap-1"
);
content = content.replace(
  "bg-white/10 text-white/70 px-2 py-0.5 rounded-full font-mono",
  "bg-white/10 text-white/60 px-2 py-0.5 rounded-full font-mono border border-white/10"
);
content = content.replace(
  "bg-gradient-to-r from-[#5227FF] to-[#7B5CFF] hover:from-[#6237FF] hover:to-[#8B6CFF] text-white font-semibold text-xs shadow-lg shadow-[#5227FF]/25 transition-all flex items-center gap-1.5 hover:scale-[1.02]",
  "bg-gradient-to-r from-[#FF8C61] to-[#FF9FFC] text-white font-bold text-xs shadow-lg shadow-[#FF8C61]/20 transition-all flex items-center gap-1.5 hover:scale-[1.02]"
);

// Glass Cards
content = content.replaceAll(
  "bg-white/[0.02] backdrop-blur-xl border border-white/[0.05] relative overflow-hidden group hover:bg-white/[0.04]",
  "bg-white/5 backdrop-blur-3xl border border-white/20 relative overflow-hidden group hover:bg-white/10 shadow-lg"
);

// Progress Bars
content = content.replace(
  "bg-gradient-to-r from-[#5227FF] via-[#7B5CFF] to-[#FF9FFC] h-full rounded-full w-[94%]",
  "bg-[#FF8C61] h-full rounded-full w-[94%]"
);
content = content.replace(
  "bg-gradient-to-r from-[#7B5CFF] to-[#FF9FFC] h-full rounded-full w-[98%]",
  "bg-[#81C3D7] h-full rounded-full w-[98%]"
);
content = content.replace(
  "bg-gradient-to-r from-[#5227FF] to-[#7B5CFF] h-full rounded-full w-[40%]",
  "bg-[#FF8C61] h-full rounded-full w-[40%]"
);
content = content.replace(
  "bg-gradient-to-r from-[#5227FF] to-[#81C3D7] h-full rounded-full w-[65%]",
  "bg-[#5227FF] h-full rounded-full w-[65%]"
);

// Weather Alert
content = content.replace(
  "bg-amber-500/[0.05] border border-amber-500/20 backdrop-blur-md relative overflow-hidden flex flex-col md:flex-row items-start md:items-center gap-4",
  "bg-amber-500/10 border border-amber-500/30 backdrop-blur-xl relative overflow-hidden flex flex-col md:flex-row items-start md:items-center gap-4 shadow-lg"
);

// Schedule & Tasks sections
content = content.replace(
  "bg-white/[0.02] backdrop-blur-xl border border-white/[0.05] relative overflow-hidden group",
  "bg-white/5 backdrop-blur-3xl border border-white/20 relative overflow-hidden group shadow-lg"
);

// Priority Tasks
content = content.replaceAll(
  "bg-[#120F17]/90 border-white/10 hover:border-[#7B5CFF]/50",
  "bg-white/5 backdrop-blur-3xl border-white/20 hover:bg-white/10"
);
content = content.replaceAll(
  "bg-white/5 border-white/5 opacity-50",
  "bg-white/5 border-white/10 opacity-40"
);

// Deadlines Widget
content = content.replace(
  "bg-gradient-to-b from-[#120F17] to-[#1C1726] border border-white/10 space-y-4",
  "bg-white/5 backdrop-blur-3xl border border-white/20 space-y-4 shadow-xl relative overflow-hidden group"
);

fs.writeFileSync("/Users/shubhamupadhyay/Documents/Projects/Chronos/features/dashboard/DashboardView.tsx", content);
console.log("Updated DashboardView.tsx successfully");

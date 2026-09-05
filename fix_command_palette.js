const fs = require("fs");
let content = fs.readFileSync("/Users/shubhamupadhyay/Documents/Projects/Chronos/components/layout/CommandPalette.tsx", "utf8");

content = content.replace("bg-[#0B0910]/80", "bg-background/80");
content = content.replace("bg-[#120F17]", "bg-background");
content = content.replace("border-white/15", "border-border");
content = content.replace("bg-[#1C1726]/50", "bg-foreground/5");
content = content.replace("border-white/10", "border-border");
content = content.replace("text-[#FF9FFC]", "text-foreground");
content = content.replace("text-[#7B5CFF]", "text-foreground");
content = content.replace("text-emerald-400", "text-foreground");
content = content.replace("text-amber-400", "text-foreground");
content = content.replace("text-[#B497CF]", "text-foreground/70");

content = content.replace("bg-gradient-to-tr from-[#5227FF] to-[#FF9FFC]", "bg-foreground");
content = content.replace("text-white", "text-background"); // only for the loading spinner if needed, wait no.
content = content.replaceAll("text-white", "text-foreground");
content = content.replaceAll("bg-white/10", "bg-foreground/10");
content = content.replaceAll("bg-white/5", "bg-foreground/5");
content = content.replaceAll("border-white/5", "border-border");
content = content.replaceAll("hover:bg-white/10", "hover:bg-foreground/10");
content = content.replaceAll("border-white/15", "border-border");
content = content.replaceAll("bg-gradient-to-b from-[#5227FF]/15 to-transparent", "bg-foreground/5");
content = content.replaceAll("border-[#7B5CFF]/40", "border-border");
content = content.replaceAll("bg-[#5227FF]/30", "bg-foreground/10");
content = content.replaceAll("border-[#5227FF]/50", "border-foreground/20");
content = content.replaceAll("bg-gradient-to-r from-[#5227FF] via-[#7B5CFF] to-[#B497CF]", "bg-foreground");

fs.writeFileSync("/Users/shubhamupadhyay/Documents/Projects/Chronos/components/layout/CommandPalette.tsx", content);
console.log("Updated CommandPalette.tsx successfully");

const fs = require("fs");
let content = fs.readFileSync("/Users/shubhamupadhyay/Documents/Projects/Chronos/components/layout/CommandPalette.tsx", "utf8");

content = content.replaceAll("text-[#7B5CFF]", "text-foreground");
content = content.replaceAll("text-[#FF9FFC]", "text-foreground");
content = content.replaceAll("text-[#B497CF]", "text-foreground");
content = content.replaceAll("text-[#FF8C61]", "text-foreground");
content = content.replaceAll("text-emerald-400", "text-foreground");
content = content.replaceAll("text-amber-400", "text-foreground");
content = content.replaceAll("shadow-[#5227FF]/30", "shadow-foreground/10");
content = content.replaceAll("bg-gradient-to-tr from-[#5227FF] to-[#FF9FFC]", "bg-foreground");
content = content.replaceAll("bg-gradient-to-b from-[#5227FF]/15 to-transparent", "bg-foreground/5");
content = content.replaceAll("border-[#7B5CFF]/40", "border-border");
content = content.replaceAll("bg-[#5227FF]/30", "bg-foreground/10");
content = content.replaceAll("border-[#5227FF]/50", "border-foreground/20");
content = content.replaceAll("bg-gradient-to-r from-[#5227FF] via-[#7B5CFF] to-[#B497CF]", "bg-foreground");

fs.writeFileSync("/Users/shubhamupadhyay/Documents/Projects/Chronos/components/layout/CommandPalette.tsx", content);
console.log("Updated CommandPalette.tsx successfully");

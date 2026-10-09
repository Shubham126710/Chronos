const fs = require('fs');

let content = fs.readFileSync('components/layout/CommandPalette.tsx', 'utf8');

// Replace Modal Box outer div
content = content.replace(
  'className="relative w-full max-w-2xl rounded-2xl bg-[#0a0a0a]/95 backdrop-blur-2xl border border-white/10 shadow-[0_0_80px_rgba(255,255,255,0.03)] overflow-hidden z-10 flex flex-col max-h-[80vh]"',
  'className="relative w-full max-w-3xl bg-background border border-border shadow-2xl overflow-hidden z-10 flex flex-col max-h-[85vh] font-sans"'
);

// Replace Top Header / Search Input
content = content.replace(
  /<form onSubmit={handleCustomSubmit}.*?<\/form>/s,
  `<form onSubmit={handleCustomSubmit} className="relative flex items-center w-full border-b border-border">
          <div className="absolute left-6 text-foreground/40 font-mono text-[10px] uppercase tracking-widest flex items-center gap-2 pointer-events-none">
            <span className="w-1.5 h-1.5 bg-foreground/40 rounded-full animate-pulse" />
            Command
          </div>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="What is your focus?"
            className="w-full bg-transparent text-foreground placeholder:text-foreground/20 font-medium text-2xl sm:text-3xl tracking-tight focus:outline-none pl-32 pr-12 py-8 sm:py-12"
          />
          {query && (
            <button
              type="button"
              onClick={() => { setQuery(""); setActiveResponse(null); }}
              className="absolute right-6 p-2 text-foreground/40 hover:text-foreground transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </form>`
);

// Replace Quick Prompts List
content = content.replace(
  /{!isThinking && !activeResponse && \(.*?Navigation Shortcuts/s,
  `{!isThinking && !activeResponse && (
            <div className="flex flex-col">
              <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-white/[0.01]">
                <span className="text-[10px] font-mono uppercase tracking-widest text-foreground/50">
                  Suggested Directives
                </span>
                <span className="text-[10px] font-mono uppercase tracking-widest text-foreground/30 hidden sm:inline-block">
                  [ Click to execute ]
                </span>
              </div>

              <div className="flex flex-col">
                {quickPrompts.map((prompt, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSelectPrompt(prompt)}
                    className="w-full text-left px-6 py-5 border-b border-border/50 hover:bg-white/[0.02] hover:pl-8 transition-all duration-300 flex items-center justify-between group relative"
                  >
                    <div className="absolute left-0 top-0 bottom-0 w-0 group-hover:w-1 bg-foreground transition-all duration-300" />
                    <div className="flex items-center gap-4 min-w-0">
                      <div className="text-foreground/30 group-hover:text-foreground transition-colors shrink-0">
                        {prompt.icon}
                      </div>
                      <div className="min-w-0">
                        <p className="text-base sm:text-lg font-medium text-foreground/90 group-hover:text-foreground transition-colors truncate tracking-tight">
                          {prompt.title.replace(/[“”]/g, "")}
                        </p>
                        <p className="text-[10px] sm:text-xs text-foreground/50 truncate mt-1 font-mono uppercase tracking-wider">
                          {prompt.subtitle}
                        </p>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-foreground/0 group-hover:text-foreground/50 transition-all shrink-0 ml-4 -translate-x-4 group-hover:translate-x-0" />
                  </button>
                ))}
              </div>

              {/* Navigation Shortcuts`
);

// Clean up Navigation Shortcuts to make it premium
content = content.replace(
  /{/\* Navigation Shortcuts \*\/.*?<\/div>\n              <\/div>/s,
  `{/* Navigation Shortcuts */}
              <div className="px-6 py-6 bg-background">
                <span className="text-[10px] font-mono uppercase tracking-widest text-foreground/40 block mb-4">
                  System Modules
                </span>
                <div className="flex flex-wrap gap-2 sm:gap-4">
                  {(["dashboard", "tasks", "calendar", "goals"] as TabType[]).map((tab) => (
                    <button
                      key={tab}
                      type="button"
                      onClick={() => {
                        if (onNavigate) onNavigate(tab);
                        onClose();
                      }}
                      className="px-4 py-2 border border-border hover:border-foreground/30 hover:bg-white/[0.02] text-[10px] font-mono uppercase tracking-widest text-foreground/70 hover:text-foreground transition-colors"
                    >
                      {tab}
                    </button>
                  ))}
                </div>
              </div>`
);

// Change the footer text
content = content.replace(
  /<div className="p-3 border-t border-white\/10 flex items-center justify-between bg-black\/40">.*?<\/div>\n      <\/motion\.div>/s,
  `<div className="px-6 py-4 border-t border-border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-background">
          <div className="flex items-center gap-2">
            <Sparkles className="w-3 h-3 text-foreground/40" />
            <span className="text-[9px] font-mono uppercase tracking-widest text-foreground/40">Powered by Chronos Temporal Engine</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-[9px] font-mono uppercase tracking-widest text-foreground/40">Abort:</span>
            <kbd className="px-2 py-1 bg-white/5 border border-white/10 text-[9px] font-mono text-foreground/60">ESC</kbd>
          </div>
        </div>
      </motion.div>`
);

// Remove the `p-5 overflow-y-auto space-y-6 flex-1 custom-scrollbar` around the list
content = content.replace(
  /<div className="p-5 overflow-y-auto space-y-6 flex-1 custom-scrollbar">/g,
  '<div className="overflow-y-auto flex-1 custom-scrollbar bg-background">'
);

// Update AI Response view
content = content.replace(
  /<motion\.div\n              initial={{ opacity: 0, y: 10 }}\n              animate={{ opacity: 1, y: 0 }}\n              className="p-5 rounded-2xl bg-foreground\/5 border border-border space-y-4"/s,
  `<motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-6 space-y-8"
`
);

content = content.replace(
  /<span className="text-\[10px\] font-mono uppercase bg-foreground\/10 text-foreground px-2 py-0\.5 rounded-full border border-foreground\/20">\n                  AI Recommendation\n                <\/span>/s,
  `<span className="text-[9px] font-mono uppercase tracking-widest text-foreground/50 border border-border px-3 py-1">
                  AI Directive
                </span>`
);

content = content.replace(
  /<p className="text-sm text-foreground\/90 leading-relaxed font-light">/s,
  `<p className="text-lg md:text-xl text-foreground leading-relaxed font-light tracking-tight">`
);

content = content.replace(
  /<span className="text-xs font-semibold text-foreground uppercase tracking-wider block">Execution Roadmap:<\/span>/s,
  `<span className="text-[10px] font-mono text-foreground/50 uppercase tracking-widest block mb-4">Execution Protocol:</span>`
);

content = content.replace(
  /className="flex items-start gap-2 text-xs text-foreground\/80 bg-foreground\/5 p-2\.5 rounded-xl border border-border"/g,
  'className="flex items-start gap-4 text-sm text-foreground/80 py-3 border-b border-border/50"'
);

content = content.replace(
  /<button\n                  type="button"\n                  onClick={() => setActiveResponse\(null\)}\n                  className="px-4 py-2 text-xs font-semibold text-foreground\/70 hover:text-foreground transition-colors uppercase tracking-wider"/s,
  `<button
                  type="button"
                  onClick={() => setActiveResponse(null)}
                  className="px-4 py-2 text-[10px] font-mono text-foreground/50 hover:text-foreground transition-colors uppercase tracking-widest"`
);

content = content.replace(
  /className="px-4 py-2 bg-foreground text-background text-xs font-bold rounded-lg hover:opacity-90 transition-opacity uppercase tracking-wider flex items-center gap-2"/s,
  `className="px-6 py-2 bg-foreground text-background text-[10px] font-mono font-bold hover:opacity-90 transition-opacity uppercase tracking-widest flex items-center gap-2"`
);

fs.writeFileSync('components/layout/CommandPalette.tsx', content);

"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Search, Sparkles, Brain, Clock, CheckCircle2, ArrowRight, 
  Calendar, Zap, Target, X, Layers, Flame, RefreshCw, Mail
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { TabType } from "./Sidebar";
import { ThinkingOrb } from "@/components/ui/thinking-orbs";

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate?: (tab: TabType) => void;
}

interface AIQueryResponse {
  title: string;
  summary: string;
  actionLabel: string;
  details: string[];
  operations?: any[];
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  onNavigate,
}) => {
  const [query, setQuery] = useState("");
  const [isThinking, setIsThinking] = useState(false);
  const [isExecuting, setIsExecuting] = useState(false);
  const [activeResponse, setActiveResponse] = useState<AIQueryResponse | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const queryClient = useQueryClient();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        if (isOpen) {
          onClose();
        } else {
          setActiveResponse(null);
          setQuery("");
        }
      } else if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  const quickPrompts = [
    {
      title: "“I have my Operating Systems exam in 10 days.”",
      subtitle: "Generate a structured 10-day study & revision plan with buffer days.",
      icon: <Brain className="w-4 h-4 text-foreground" />,
    },
    {
      title: "“Miss today’s study session?”",
      subtitle: "Automatically reorganize remaining tasks without increasing daily load.",
      icon: <Zap className="w-4 h-4 text-foreground" />,
    },
    {
      title: "“When should I study today?”",
      subtitle: "Find your optimal cognitive peak window.",
      icon: <Clock className="w-4 h-4 text-foreground/70" />,
    },
    {
      title: "“Can I finish everything before Friday?”",
      subtitle: "Analyze remaining task hours versus free time blocks.",
      icon: <Target className="w-4 h-4 text-foreground" />,
    },
    {
      title: "“Turn today's tasks into a Notion weekly review.”",
      subtitle: "Save your active tasks and progress to your connected Notion workspace.",
      icon: <Sparkles className="w-4 h-4 text-foreground/70" />,
    },
    {
      title: "“Search Notion for my project notes.”",
      subtitle: "Find your existing documentation and meeting notes seamlessly.",
      icon: <Search className="w-4 h-4 text-foreground" />,
    },
    {
      title: "“Find the emails I need to respond to today and schedule time to handle them.”",
      subtitle: "Create time blocks automatically based on your unread important emails.",
      icon: <Mail className="w-4 h-4 text-foreground/80" />,
    },
    {
      title: "“Plan my day based on my calendar and emails.”",
      subtitle: "Sync Gmail, Google Calendar, and Chronos Tasks for a unified action plan.",
      icon: <Calendar className="w-4 h-4 text-[#4285F4]" />,
    },
  ];

  const handleSelectPrompt = (prompt: typeof quickPrompts[0]) => {
    setQuery(prompt.title);
    executeAIQuery(prompt.title);
  };

  const executeAIQuery = async (searchQuery: string) => {
    if (!searchQuery.trim()) return;

    setIsThinking(true);
    setActiveResponse(null);

    try {
      const res = await fetch("/api/ai/semantic-command", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: searchQuery }),
      });
      const data = await res.json();
      
      if (data.success) {
        setActiveResponse(data.data);
      } else {
        setActiveResponse({
          title: "AI Analysis Error",
          summary: data.message || "Failed to parse command.",
          actionLabel: "Dismiss",
          details: ["Please check your connection and try again."],
        });
      }
    } catch (err) {
      setActiveResponse({
        title: "Connection Error",
        summary: "Could not reach the AI Executive Service.",
        actionLabel: "Dismiss",
        details: ["Make sure the server is running and reachable."],
      });
    } finally {
      setIsThinking(false);
    }
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    executeAIQuery(query);
  };

  const handleExecute = async () => {
    if (!activeResponse) return;
    
    // If no operations, just close and navigate
    if (!activeResponse.operations || activeResponse.operations.length === 0) {
      onClose();
      if (onNavigate) onNavigate("tasks");
      return;
    }

    setIsExecuting(true);
    try {
      const res = await fetch("/api/ai/execute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ operations: activeResponse.operations }),
      });
      const data = await res.json();
      
      if (data.success) {
        // Force the app to re-fetch data so the newly created tasks/goals appear immediately
        if (typeof window !== 'undefined') {
          window.location.reload();
        }
        
        setActiveResponse({
          title: "Execution Successful",
          summary: "I have successfully applied these changes to your system.",
          actionLabel: "Done",
          details: (Array.isArray(activeResponse.operations) ? activeResponse.operations : []).map(op => `Successfully executed: ${op.type}`),
          operations: [],
        });
        queryClient.invalidateQueries();
        router.refresh();
      } else {
        setActiveResponse({
          ...activeResponse,
          title: "Execution Failed",
          summary: data.message || "Failed to execute operations.",
          operations: [],
        });
      }
    } catch (err) {
      console.error(err);
      setActiveResponse({
        ...activeResponse,
        title: "Execution Error",
        summary: "Could not reach the execution endpoint.",
        operations: [],
      });
    } finally {
      setIsExecuting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-200">
      {/* Backdrop click to close */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Modal Box */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: -10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: -10 }}
        transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
        className="relative w-full max-w-3xl bg-[#070707] border border-white/10 shadow-2xl overflow-hidden z-10 flex flex-col max-h-[85vh] font-sans"
      >
        {/* Top Header / Search Input */}
        <form onSubmit={handleCustomSubmit} className="relative flex items-center w-full border-b border-white/10">
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
        </form>

        {/* Modal Content Area */}
        <div className="overflow-y-auto flex-1 custom-scrollbar bg-transparent">
          {/* If thinking */}
          {isThinking && (
            <div className="py-16 flex flex-col items-center justify-center text-center space-y-6">
              <span className="[&_canvas]:!size-16 relative flex items-center justify-center w-16 h-16 mb-2">
                <ThinkingOrb state="working" size={64} theme="dark" />
              </span>
              <div className="space-y-2">
                <p className="text-xs font-bold tracking-[0.2em] uppercase text-foreground">Processing Command</p>
                <p className="text-[10px] font-mono tracking-wider text-foreground/40 uppercase">Analyzing cognitive load & temporal constraints...</p>
              </div>
            </div>
          )}

          {/* If Response Ready */}
          {!isThinking && activeResponse && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-5 rounded-2xl bg-foreground/5 border border-border space-y-4"
            >
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div className="flex items-center gap-2">
                  <Brain className="w-5 h-5 text-foreground" />
                  <h3 className="text-base font-bold text-foreground">{activeResponse.title}</h3>
                </div>
                <span className="text-[9px] font-mono uppercase tracking-widest text-foreground/50 border border-white/10 px-3 py-1">
                  AI Directive
                </span>
              </div>

              <p className="text-lg md:text-xl text-foreground leading-relaxed font-light tracking-tight">
                {activeResponse.summary}
              </p>

              <div className="space-y-2 pt-2">
                <span className="text-[10px] font-mono text-foreground/50 uppercase tracking-widest block mb-4">Execution Protocol:</span>
                {(Array.isArray(activeResponse.details) ? activeResponse.details : []).map((detail, idx) => (
                  <div key={idx} className="flex items-start gap-4 text-sm text-foreground/80 py-3 border-b border-white/5">
                    <CheckCircle2 className="w-4 h-4 text-foreground shrink-0 mt-0.5" />
                    <span>{detail}</span>
                  </div>
                ))}
              </div>

              <div className="pt-3 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setActiveResponse(null)}
                  disabled={isExecuting}
                  className="px-4 py-2 rounded-xl bg-foreground/5 hover:bg-foreground/10 text-foreground/70 text-xs font-medium transition-colors disabled:opacity-50"
                >
                  Back to commands
                </button>
                <button
                  type="button"
                  onClick={handleExecute}
                  disabled={isExecuting}
                  className="px-5 py-2 rounded-xl bg-foreground text-background font-semibold text-xs border border-border shadow-lg hover:scale-[1.02] transition-transform flex items-center gap-1.5 disabled:opacity-50 disabled:hover:scale-100"
                >
                  {isExecuting ? (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <span>{activeResponse.actionLabel}</span>
                  )}
                  {!isExecuting && <ArrowRight className="w-3.5 h-3.5" />}
                </button>
              </div>
            </motion.div>
          )}

          {/* Quick Prompts List */}
          {!isThinking && !activeResponse && (
            <div className="flex flex-col">
              <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-white/[0.01]">
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
                    className="w-full text-left px-6 py-5 border-b border-white/5 hover:bg-white/[0.02] hover:pl-8 transition-all duration-300 flex items-center justify-between group relative"
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

              {/* Navigation Shortcuts */}
              <div className="px-6 py-6 bg-transparent">
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
                      className="px-4 py-2 border border-white/10 hover:border-foreground/30 hover:bg-white/[0.02] text-[10px] font-mono uppercase tracking-widest text-foreground/70 hover:text-foreground transition-colors"
                    >
                      {tab}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 bg-[#0B0910] border-t border-white/10 flex items-center justify-between text-[11px] text-foreground/40 px-5">
          <span className="flex items-center gap-1.5">
            <Sparkles className="w-3 h-3 text-foreground" /> Powered by Chronos Heuristic AI &amp; Gemini
          </span>
          <span>Press <strong className="text-foreground/70">ESC</strong> or <strong className="text-foreground/70">⌘K</strong> to close</span>
        </div>
      </motion.div>
    </div>
  );
};

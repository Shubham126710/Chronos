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
        setActiveResponse({
          title: "Execution Successful",
          summary: "I have successfully applied these changes to your system.",
          actionLabel: "Done",
          details: activeResponse.operations.map(op => `Successfully executed: ${op.type}`),
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
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 bg-background/80 backdrop-blur-md animate-in fade-in duration-200">
      {/* Backdrop click to close */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Modal Box */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: -10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: -10 }}
        transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
        className="relative w-full max-w-2xl rounded-2xl bg-background border border-border shadow-2xl overflow-hidden z-10 flex flex-col max-h-[80vh]"
      >
        {/* Top Header / Search Input */}
        <form onSubmit={handleCustomSubmit} className="p-4 border-b border-border flex items-center gap-3 bg-foreground/5">
          <Sparkles className="w-5 h-5 text-foreground shrink-0 animate-pulse" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Ask Chronos AI anything, or select a command below..."
            className="w-full bg-transparent text-foreground placeholder-white/40 font-medium text-base focus:outline-none"
          />
          {query && (
            <button
              type="button"
              onClick={() => { setQuery(""); setActiveResponse(null); }}
              className="p-1 rounded-lg hover:bg-foreground/10 text-foreground/50 hover:text-foreground transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <kbd className="hidden sm:inline-block px-2 py-1 rounded bg-foreground/10 border border-white/10 font-mono text-[11px] text-foreground/60">
            ESC
          </kbd>
        </form>

        {/* Modal Content Area */}
        <div className="p-4 overflow-y-auto space-y-6 flex-1 custom-scrollbar">
          {/* If thinking */}
          {isThinking && (
            <div className="py-12 flex flex-col items-center justify-center text-center space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-foreground flex items-center justify-center animate-spin">
                <RefreshCw className="w-6 h-6 text-foreground" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">Chronos AI is thinking...</p>
                <p className="text-xs text-foreground/50 mt-1">Analyzing schedule, cognitive peaks, and upcoming deadlines...</p>
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
                <span className="text-[10px] font-mono uppercase bg-foreground/10 text-foreground px-2 py-0.5 rounded-full border border-foreground/20">
                  AI Recommendation
                </span>
              </div>

              <p className="text-sm text-foreground/90 leading-relaxed font-light">
                {activeResponse.summary}
              </p>

              <div className="space-y-2 pt-2">
                <span className="text-xs font-semibold text-foreground uppercase tracking-wider block">Execution Roadmap:</span>
                {activeResponse.details.map((detail, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-xs text-foreground/80 bg-foreground/5 p-2.5 rounded-xl border border-border">
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
            <div className="space-y-3">
              <div className="flex items-center justify-between px-2">
                <span className="text-xs font-mono uppercase tracking-widest text-foreground/40 font-semibold">
                  Intelligent Suggestions
                </span>
                <span className="text-[11px] text-foreground">Click to execute AI workflow</span>
              </div>

              <div className="space-y-2">
                {quickPrompts.map((prompt, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSelectPrompt(prompt)}
                    className="w-full text-left p-3.5 rounded-xl bg-foreground/5 hover:bg-foreground/10 border border-border hover:border-border transition-all flex items-center justify-between group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="p-2 rounded-lg bg-foreground/10 shrink-0">
                        {prompt.icon}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-foreground group-hover:text-foreground transition-colors truncate">
                          {prompt.title}
                        </p>
                        <p className="text-xs text-foreground/50 truncate mt-0.5">
                          {prompt.subtitle}
                        </p>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-foreground/40 group-hover:text-foreground group-hover:translate-x-1 transition-all shrink-0 ml-2" />
                  </button>
                ))}
              </div>

              {/* Navigation Shortcuts */}
              <div className="pt-4 border-t border-white/10">
                <span className="text-xs font-mono uppercase tracking-widest text-foreground/40 font-semibold px-2 block mb-2">
                  Module Navigation
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {(["dashboard", "tasks", "calendar", "goals"] as TabType[]).map((tab) => (
                    <button
                      key={tab}
                      type="button"
                      onClick={() => {
                        if (onNavigate) onNavigate(tab);
                        onClose();
                      }}
                      className="p-2.5 rounded-xl bg-foreground/5 hover:bg-foreground/10 text-xs font-medium text-foreground/80 hover:text-foreground text-center capitalize border border-border transition-colors"
                    >
                      Go to {tab}
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

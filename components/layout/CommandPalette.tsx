"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { 
  Search, Sparkles, Brain, Clock, CheckCircle2, ArrowRight, 
  Calendar, Zap, Target, X, Mail, RefreshCw, AlertCircle, ShieldAlert
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
  executionResults?: Array<{
    type: string;
    title?: string;
    status: "success" | "error" | "requires_auth";
    message: string;
    externalSync?: {
      provider: string;
      status: "synced" | "failed" | "not_connected";
      details?: string;
    };
  }>;
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
      title: "“Schedule two hours of Operating Systems revision tomorrow.”",
      subtitle: "Schedule dedicated focus session and sync to Google Calendar.",
      icon: <Clock className="w-4 h-4 text-foreground/70" />,
    },
    {
      title: "“Create a morning reading habit and remind me every day.”",
      subtitle: "Establish daily habit tracking with calendar focus blocks.",
      icon: <Zap className="w-4 h-4 text-foreground" />,
    },
    {
      title: "“Break my goal of cracking GATE into manageable milestones.”",
      subtitle: "Generate a hierarchical roadmap with tasks and milestone progress.",
      icon: <Target className="w-4 h-4 text-foreground" />,
    },
    {
      title: "“Plan my day around my deadlines, existing events, and priorities.”",
      subtitle: "Analyze temporal availability and schedule optimized work blocks.",
      icon: <Calendar className="w-4 h-4 text-[#4285F4]" />,
    },
    {
      title: "“Turn today's tasks into a Notion weekly review.”",
      subtitle: "Save active tasks and progress to your connected Notion workspace.",
      icon: <Sparkles className="w-4 h-4 text-foreground/70" />,
    },
  ];

  const handleSelectPrompt = (prompt: typeof quickPrompts[0]) => {
    setQuery(prompt.title.replace(/[“”]/g, ""));
    executeAIQuery(prompt.title.replace(/[“”]/g, ""));
  };

  const executeAIQuery = async (searchQuery: string) => {
    if (!searchQuery.trim() || isThinking) return;

    setIsThinking(true);
    setActiveResponse(null);

    try {
      const res = await fetch("/api/ai/semantic-command", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: searchQuery }),
      });
      const data = await res.json();
      
      if (data.success && data.data) {
        setActiveResponse(data.data);
      } else {
        setActiveResponse({
          title: "Command Processing Notice",
          summary: data.message || "Failed to parse command.",
          actionLabel: "Dismiss",
          details: ["Please check your connection or quota limits and try again."],
        });
      }
    } catch (err) {
      setActiveResponse({
        title: "Connection Error",
        summary: "Could not reach the AI Executive Service.",
        actionLabel: "Dismiss",
        details: ["Make sure the server is reachable and try again."],
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
    if (!activeResponse || isExecuting) return;
    
    // If completed or no operations, close modal
    if (!activeResponse.operations || activeResponse.operations.length === 0) {
      onClose();
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
      
      if (data.success && data.results) {
        // Invalidate all relevant module queries so UI updates instantly
        queryClient.invalidateQueries({ queryKey: ["tasks"] });
        queryClient.invalidateQueries({ queryKey: ["calendar"] });
        queryClient.invalidateQueries({ queryKey: ["goals"] });
        queryClient.invalidateQueries({ queryKey: ["habits"] });
        queryClient.invalidateQueries({ queryKey: ["notes"] });
        router.refresh();

        const allSucceeded = data.results.every((r: any) => r.status === "success");
        const hasRequiresAuth = data.results.some((r: any) => r.status === "requires_auth");

        setActiveResponse({
          title: allSucceeded ? "Plan Executed Successfully" : (hasRequiresAuth ? "Executed (Authorization Needed)" : "Partial Execution"),
          summary: allSucceeded
            ? "All operations were confirmed and persisted across Chronos and connected integrations."
            : "Some operations completed while others require authorization or adjustments.",
          actionLabel: "Done",
          details: data.results.map((r: any) => {
            const prefix = r.status === "success" ? "[ ✓ ]" : (r.status === "requires_auth" ? "[ ⚠ ]" : "[ ✕ ]");
            const ext = r.externalSync?.provider
              ? ` (${r.externalSync.provider}: ${r.externalSync.status})`
              : "";
            return `${prefix} ${r.title || r.type}: ${r.message}${ext}`;
          }),
          operations: [], // Clear so button changes to Done/Dismiss
          executionResults: data.results
        });
      } else {
        setActiveResponse({
          ...activeResponse,
          title: "Execution Notice",
          summary: data.message || "Operations could not be applied.",
          operations: [],
        });
      }
    } catch (err) {
      console.error(err);
      setActiveResponse({
        ...activeResponse,
        title: "Execution Error",
        summary: "Network error occurred while calling the execution endpoint.",
        operations: [],
      });
    } finally {
      setIsExecuting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-200">
      <div className="absolute inset-0" onClick={onClose} />

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
            disabled={isThinking || isExecuting}
            placeholder="What is your focus?"
            className="w-full bg-transparent text-foreground placeholder:text-foreground/20 font-medium text-xl sm:text-2xl tracking-tight focus:outline-none pl-32 pr-12 py-6 sm:py-8 disabled:opacity-50"
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
          {/* Thinking State */}
          {isThinking && (
            <div className="py-16 flex flex-col items-center justify-center text-center space-y-6">
              <span className="[&_canvas]:!size-16 relative flex items-center justify-center w-16 h-16 mb-2">
                <ThinkingOrb state="working" size={64} theme="dark" />
              </span>
              <div className="space-y-2">
                <p className="text-xs font-bold tracking-[0.2em] uppercase text-foreground">Formulating Execution Plan</p>
                <p className="text-[10px] font-mono tracking-wider text-foreground/40 uppercase">Orchestrating temporal constraints &amp; task dependencies...</p>
              </div>
            </div>
          )}

          {/* Response Ready State */}
          {!isThinking && activeResponse && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-6 sm:p-8 space-y-6 font-mono"
            >
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div className="flex items-center gap-2">
                  <Brain className="w-4 h-4 text-foreground" />
                  <h3 className="text-sm font-bold uppercase tracking-widest text-foreground">{activeResponse.title}</h3>
                </div>
                <span className="text-[9px] uppercase tracking-widest text-foreground/50 border border-white/10 px-2 py-0.5">
                  AI Directive
                </span>
              </div>

              <p className="text-sm sm:text-base text-foreground/90 leading-relaxed font-sans font-light">
                {activeResponse.summary}
              </p>

              <div className="space-y-3 pt-2">
                <span className="text-[10px] uppercase tracking-widest text-foreground/50 block">
                  {activeResponse.executionResults ? "Execution Status Report:" : "Proposed Directives:"}
                </span>
                {(Array.isArray(activeResponse.details) ? activeResponse.details : []).map((detail, idx) => (
                  <div key={idx} className="flex items-start gap-3 text-xs text-foreground/80 py-2.5 border-b border-white/5 font-mono">
                    <CheckCircle2 className="w-3.5 h-3.5 text-foreground shrink-0 mt-0.5" />
                    <span>{detail}</span>
                  </div>
                ))}
              </div>

              <div className="pt-4 flex justify-end gap-3 font-mono text-[10px] uppercase tracking-widest">
                <button
                  type="button"
                  onClick={() => { setActiveResponse(null); setQuery(""); }}
                  disabled={isExecuting}
                  className="px-4 py-2 border border-white/10 hover:border-white/30 text-foreground/70 transition-colors disabled:opacity-50"
                >
                  [ Back ]
                </button>
                <button
                  type="button"
                  onClick={handleExecute}
                  disabled={isExecuting}
                  className="px-5 py-2 bg-foreground text-background font-bold border border-foreground hover:bg-background hover:text-foreground transition-all flex items-center gap-2 disabled:opacity-50"
                >
                  {isExecuting ? (
                    <RefreshCw className="w-3 h-3 animate-spin" />
                  ) : (
                    <span>[ {activeResponse.actionLabel} ]</span>
                  )}
                  {!isExecuting && <ArrowRight className="w-3 h-3" />}
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
                  {(["dashboard", "tasks", "calendar", "goals", "habits", "notes"] as TabType[]).map((tab) => (
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
        <div className="p-3 bg-[#070707] border-t border-white/10 flex items-center justify-between text-[10px] font-mono uppercase text-foreground/40 px-6">
          <span className="flex items-center gap-1.5">
            <Sparkles className="w-3 h-3 text-foreground" /> Chronos AI OS &bull; Gemini 3.5 Flash
          </span>
          <span>[ ESC ] or [ ⌘K ] to close</span>
        </div>
      </motion.div>
    </div>
  );
};

"use client";

import React, { useState } from "react";
import { Sparkles, Send, User, Zap } from "lucide-react";
import clsx from "clsx";

export const AIAssistantWidget: React.FC = () => {
  const [messages, setMessages] = useState<Array<{ role: string; content: string; timestamp: string }>>([
    {
      role: "assistant",
      content: "Hello! I have analyzed your 14-day coding streak and upcoming schedule. How can I assist your command center today?",
      timestamp: "Just now",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSend = async (e?: React.FormEvent, customPrompt?: string) => {
    if (e) e.preventDefault();
    const text = customPrompt || input;
    if (!text.trim() || loading) return;

    const newMsg = { role: "user", content: text, timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) };
    setMessages((prev) => [...prev, newMsg]);
    if (!customPrompt) setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/ai/semantic-command", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: text }),
      });
      const data = await res.json();
      
      let replyContent = "I encountered a minor network glitch, but your local database state is safe.";
      if (data.success && data.data) {
        replyContent = data.data.summary;
        if (data.data.actionLabel && data.data.actionLabel !== "Dismiss") {
          replyContent += `\n\n[PROPOSED ACTION: ${data.data.actionLabel}] - Open Command Palette (⌘K) to execute.`;
        }
      } else {
        replyContent = data.message || "Failed to analyze command.";
      }

      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: replyContent, timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) },
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "I encountered a minor network glitch, but your local database state is safe.", timestamp: "Just now" },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const quickPrompts = [
    { label: "Plan Today", action: "Plan today's schedule based on my calendar and priority tasks" },
    { label: "Rebalance", action: "Rebalance my schedule because rain is expected this afternoon" },
    { label: "Study Plan", action: "Generate a 4-week GATE & Placement study plan with buffer blocks" },
    { label: "Summarize", action: "Summarize my weekly focus hours and habit streaks" },
  ];

  return (
    <div className="flex flex-col justify-between h-full min-h-[260px] text-foreground font-mono">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-4 max-h-[220px] scrollbar-none mb-6">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className="flex flex-col gap-1 text-[10px] leading-relaxed uppercase tracking-widest"
          >
            <div className="flex items-center gap-2 text-foreground/40">
              <span>[{msg.timestamp}]</span>
              <span>{msg.role === "assistant" ? "SYS" : "USR"}</span>
            </div>
            <div className={clsx(
              "whitespace-pre-wrap",
              msg.role === "assistant" ? "text-foreground" : "text-foreground/70"
            )}>
              {msg.role === "assistant" ? `> ${msg.content}` : `$ ${msg.content}`}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex items-center gap-2 text-[10px] text-foreground/50 font-mono uppercase tracking-widest mt-4">
            <Sparkles className="w-3 h-3 animate-pulse" />
            <span>PROCESSING...</span>
          </div>
        )}
      </div>

      {/* Input bar */}
      <form onSubmit={(e) => handleSend(e)} className="relative flex items-center border-t border-border pt-4">
        <span className="text-foreground/40 mr-2">$</span>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="ENTER COMMAND..."
          className="w-full bg-transparent text-[10px] font-mono text-foreground placeholder:text-foreground/30 focus:outline-none uppercase tracking-widest"
        />
        <button
          type="submit"
          disabled={!input.trim() || loading}
          className="absolute right-0 text-[10px] uppercase tracking-widest text-foreground/50 hover:text-foreground disabled:opacity-30 transition-colors"
        >
          [EXEC]
        </button>
      </form>
    </div>
  );
};

"use client";

import React, { useState, useEffect } from "react";
import { FileText, Search, ExternalLink, RefreshCw, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export const NotionWidget: React.FC = () => {
  const [pages, setPages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchPages = async (query = "") => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/integrations/notion/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query }),
      });
      const data = await res.json();
      if (data.success) {
        setPages(data.data);
      } else {
        setError(data.message || "Failed to fetch Notion pages.");
      }
    } catch (err) {
      setError("Network error connecting to Notion.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPages();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchPages(searchQuery);
  };

  return (
    <div className="flex flex-col h-full font-mono text-xs w-full bg-background border border-border">
      {/* Header Area */}
      <div className="flex items-center justify-between p-3 border-b border-border">
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4 text-foreground/70" />
          <span className="font-bold text-foreground uppercase tracking-widest text-[10px]">Recent Notes</span>
        </div>
        <button
          onClick={() => fetchPages(searchQuery)}
          disabled={loading}
          className="text-foreground/50 hover:text-foreground transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
        </button>
      </div>

      {/* Search Bar */}
      <form onSubmit={handleSearch} className="flex items-center p-2 border-b border-border bg-foreground/5">
        <Search className="w-3 h-3 text-foreground/50 ml-1 mr-2 shrink-0" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search workspace..."
          className="bg-transparent w-full border-none focus:outline-none text-[10px] text-foreground uppercase tracking-widest placeholder:text-foreground/30"
        />
      </form>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto p-2 scrollbar-none custom-scrollbar">
        {error ? (
          <div className="h-full flex flex-col items-center justify-center p-4 text-center space-y-2">
            <AlertCircle className="w-5 h-5 text-red-500/80 mb-1" />
            <span className="text-[10px] text-foreground/60 uppercase tracking-widest">{error}</span>
            {error.includes("not connected") && (
              <a href="/app/integrations" className="text-[9px] px-3 py-1.5 border border-border hover:bg-foreground hover:text-background mt-2 inline-block transition-colors">
                [ CONNECT NOTION ]
              </a>
            )}
          </div>
        ) : loading && pages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center p-4 text-foreground/40 text-[10px] uppercase tracking-widest">
            [ SYNCING... ]
          </div>
        ) : pages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center p-4 text-foreground/40 text-[10px] uppercase tracking-widest">
            NO PAGES FOUND.
          </div>
        ) : (
          <AnimatePresence>
            <div className="space-y-1">
              {pages.map((page) => (
                <motion.a
                  key={page.id}
                  href={page.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="group flex flex-col p-2.5 hover:bg-foreground/5 border border-transparent hover:border-border transition-colors cursor-pointer"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-foreground text-[10px] uppercase tracking-widest truncate max-w-[85%] group-hover:text-foreground/80">
                      {page.title}
                    </span>
                    <ExternalLink className="w-3 h-3 text-foreground/30 group-hover:text-foreground/60 transition-colors" />
                  </div>
                  <span className="text-[9px] text-foreground/50 tracking-widest uppercase">
                    Edited: {new Date(page.lastEdited).toLocaleDateString()}
                  </span>
                </motion.a>
              ))}
            </div>
          </AnimatePresence>
        )}
      </div>
    </div>
  );
};

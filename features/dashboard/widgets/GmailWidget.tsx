"use client";

import React, { useState, useEffect } from "react";
import { Mail, RefreshCw, AlertCircle, ExternalLink, Inbox } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export const GmailWidget: React.FC = () => {
  const [emails, setEmails] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEmails = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/integrations/gmail/inbox");
      const data = await res.json();
      if (data.success) {
        setEmails(data.data);
      } else {
        setError(data.message || "Failed to fetch emails.");
      }
    } catch (err) {
      setError("Network error connecting to Gmail.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmails();
  }, []);

  return (
    <div className="flex flex-col h-full font-mono text-xs w-full bg-background border border-border">
      {/* Header Area */}
      <div className="flex items-center justify-between p-3 border-b border-border">
        <div className="flex items-center gap-2">
          <Mail className="w-4 h-4 text-foreground/70" />
          <span className="font-bold text-foreground uppercase tracking-widest text-[10px]">Primary Inbox</span>
        </div>
        <button
          onClick={fetchEmails}
          disabled={loading}
          className="text-foreground/50 hover:text-foreground transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
        </button>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto p-2 scrollbar-none custom-scrollbar">
        {error ? (
          <div className="h-full flex flex-col items-center justify-center p-4 text-center space-y-2">
            <AlertCircle className="w-5 h-5 text-red-500/80 mb-1" />
            <span className="text-[10px] text-foreground/60 uppercase tracking-widest">{error}</span>
            {error.includes("not connected") && (
              <a href="/app/integrations" className="text-[9px] px-3 py-1.5 border border-border hover:bg-foreground hover:text-background mt-2 inline-block transition-colors">
                [ CONNECT GOOGLE ]
              </a>
            )}
          </div>
        ) : loading && emails.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center p-4 text-foreground/40 text-[10px] uppercase tracking-widest">
            [ SYNCING INBOX... ]
          </div>
        ) : emails.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center p-4 text-foreground/40 text-[10px] uppercase tracking-widest text-center space-y-2">
            <Inbox className="w-6 h-6 opacity-30 mb-2" />
            <span>INBOX ZERO.</span>
          </div>
        ) : (
          <AnimatePresence>
            <div className="space-y-1">
              {emails.map((email) => (
                <motion.a
                  key={email.id}
                  href={`https://mail.google.com/mail/u/0/#inbox/${email.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="group flex flex-col p-2.5 hover:bg-foreground/5 border border-transparent hover:border-border transition-colors cursor-pointer"
                >
                  <div className="flex items-start justify-between mb-1 gap-2">
                    <span className={`text-[10px] uppercase tracking-widest truncate max-w-[85%] transition-colors ${email.isUnread ? 'font-bold text-foreground' : 'text-foreground/80 group-hover:text-foreground'}`}>
                      {email.from.split('<')[0].trim()}
                    </span>
                    <ExternalLink className="w-3 h-3 text-foreground/30 group-hover:text-foreground/60 transition-colors shrink-0" />
                  </div>
                  <span className={`text-[11px] mb-1 truncate ${email.isUnread ? 'font-bold text-foreground' : 'text-foreground/70'}`}>
                    {email.subject}
                  </span>
                  <span className="text-[9px] text-foreground/40 tracking-wide line-clamp-1">
                    {email.snippet}
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

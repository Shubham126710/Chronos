"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { 
  Calendar as CalendarIcon, Clock, Sparkles, RefreshCw, Plus, 
  ChevronLeft, ChevronRight, ShieldCheck, AlertCircle, CloudRain, 
  CheckCircle2, Lock, ArrowRight, Zap
} from "lucide-react";

// Mock data removed in favor of React Query hook

import { useCalendar, TimeBlock } from "./api/useCalendar";

export const CalendarView: React.FC = () => {
  const { blocks: fetchedBlocks, isGoogleConnected, isLoading } = useCalendar(new Date().toISOString(), "day");
  const blocks = fetchedBlocks || [];

  const timeSlots = ["08:00", "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00"];

  return (
    <div className="p-6 sm:p-8 space-y-8 max-w-7xl mx-auto pb-24">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-border pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-mono uppercase tracking-widest text-foreground/50">Dynamic Time Blocking</span>
          </div>
          <h2 className="text-xl uppercase font-mono tracking-widest text-foreground">
            Calendar & Focus Blocks
          </h2>
          <p className="text-[10px] font-mono uppercase tracking-widest text-foreground/40 mt-1">
            Tasks are automatically scheduled around meetings and cognitive energy peaks with built-in buffer protection.
          </p>
        </div>

        {/* Sync & Action Controls */}
        <div className="flex items-center gap-3 w-full md:w-auto text-[10px] font-mono uppercase tracking-widest">
          <button className="px-4 py-2 text-foreground hover:bg-foreground hover:text-background border border-foreground transition-all flex items-center gap-1.5">
            <span>[ NEW FOCUS BLOCK ]</span>
          </button>
        </div>
      </div>

      {/* Date Navigation */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-[10px] font-mono uppercase tracking-widest text-foreground/60">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <button className="hover:text-foreground transition-colors">
              {"<"}
            </button>
            <span className="text-foreground">Today</span>
            <button className="hover:text-foreground transition-colors">
              {">"}
            </button>
          </div>
          <span className="text-foreground/40">
            [ Dynamic Schedule ]
          </span>
        </div>
      </div>

      {!isLoading && isGoogleConnected === false && (
        <div className="w-full p-4 border border-dashed border-[#4285F4]/50 bg-[#4285F4]/5 flex items-center justify-between rounded-lg">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-[#4285F4]" />
            <div>
              <p className="text-xs font-bold text-foreground">Google Calendar not connected</p>
              <p className="text-[10px] text-foreground/60 uppercase tracking-widest mt-0.5">Connect your account to sync external events automatically.</p>
            </div>
          </div>
          <a href="/app/integrations" className="text-[10px] px-4 py-2 border border-[#4285F4]/50 text-[#4285F4] hover:bg-[#4285F4] hover:text-white transition-colors uppercase tracking-widest font-bold">
            Connect Google
          </a>
        </div>
      )}

      {/* DAY VIEW SCHEDULE GRID */}
      <div className="font-mono text-foreground text-xs border border-border">
        <div className="grid grid-cols-12 border-b border-border bg-border-subtle p-2 text-[10px] uppercase tracking-widest text-foreground/60">
          <div className="col-span-2 sm:col-span-1 text-center">Time</div>
          <div className="col-span-10 sm:col-span-11 px-4">Scheduled Focus Block & AI Protection</div>
        </div>

        <div className="divide-y divide-border">
          {timeSlots.map((time) => {
            const matchingBlock = blocks.find((b) => b.startTime === time);

            return (
              <div key={time} className="grid grid-cols-12 min-h-[60px] group hover:bg-border-subtle transition-colors">
                  {/* Time slot label */}
                  <div className="col-span-2 sm:col-span-1 p-3 text-center text-[10px] text-foreground/40 border-r border-border flex flex-col justify-start">
                    <span>{time}</span>
                  </div>

                  {/* Content area */}
                  <div className="col-span-10 sm:col-span-11 p-2 sm:p-3 relative flex items-center">
                    {matchingBlock ? (
                      <div className={`w-full p-3 border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
                          matchingBlock.isGoogleEvent
                            ? "border-[#4285F4]/50 text-[#4285F4] bg-[#4285F4]/5"
                            : matchingBlock.category === "DeepWork"
                            ? "border-foreground text-foreground bg-foreground/5"
                            : matchingBlock.category === "Buffer"
                            ? "border-border border-dashed text-foreground/60"
                            : matchingBlock.category === "Meeting"
                            ? "border-foreground/40 text-foreground/80"
                            : "border-foreground/30 text-foreground/70"
                        }`}
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 flex-wrap text-[10px] uppercase tracking-widest text-foreground/50">
                            <span className="font-bold text-foreground/80">
                              [{matchingBlock.isGoogleEvent ? "GOOGLE CALENDAR" : matchingBlock.category === "DeepWork" ? "DEEP WORK" : matchingBlock.category.toUpperCase()}]
                            </span>
                            <span>
                              {matchingBlock.startTime} - {matchingBlock.endTime}
                            </span>
                            {(matchingBlock.isSynced || matchingBlock.isGoogleEvent) && (
                              <span className={matchingBlock.isGoogleEvent ? "text-[#4285F4]/80" : ""}>[ GCAL SYNCED ]</span>
                            )}
                          </div>
                          <h4 className="text-sm tracking-wider text-foreground uppercase">{matchingBlock.title}</h4>
                          {matchingBlock.alert && (
                            <p className="text-[10px] text-foreground/60 mt-1 uppercase tracking-widest border-l border-foreground/30 pl-2">
                              {matchingBlock.alert}
                            </p>
                          )}
                        </div>

                        <div className="flex items-center gap-4 self-end sm:self-center text-[10px] uppercase tracking-widest">
                          {matchingBlock.category === "Buffer" && (
                            <span className="text-foreground/40">
                              [ AUTO-OVERFLOW PROTECTED ]
                            </span>
                          )}
                          <button className="text-foreground/50 hover:text-foreground transition-colors">
                            [ EDIT ]
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="w-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <button className="text-[10px] uppercase tracking-widest text-foreground/40 hover:text-foreground transition-colors">
                          [ + TIME BLOCK HERE ]
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

    </div>
  );
};

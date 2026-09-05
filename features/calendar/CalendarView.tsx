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
  const [viewMode, setViewMode] = useState<"day" | "week" | "month">("day");
  const { blocks: fetchedBlocks, isLoading } = useCalendar(new Date().toISOString(), viewMode);
  const blocks = fetchedBlocks || [];
  
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncedStatus, setSyncedStatus] = useState(true);

  const handleSyncGoogle = () => {
    setIsSyncing(true);
    setTimeout(() => {
      setIsSyncing(false);
      setSyncedStatus(true);
    }, 1000);
  };

  const timeSlots = ["08:00", "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00"];

  return (
    <div className="p-6 sm:p-8 space-y-8 max-w-7xl mx-auto pb-24">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-border pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-mono uppercase tracking-widest text-foreground/50">Dynamic Time Blocking</span>
            <span className="text-[10px] text-foreground/50 px-2 py-0.5 font-mono flex items-center gap-1">
              [ 2-Way Google Calendar Synced ]
            </span>
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
          <button
            onClick={handleSyncGoogle}
            disabled={isSyncing}
            className="flex-1 md:flex-initial px-4 py-2 hover:text-foreground text-foreground/50 transition-colors flex items-center justify-center gap-2"
          >
            <span>{isSyncing ? "[ SYNCING... ]" : "[ SYNC GOOGLE CALENDAR ]"}</span>
          </button>
          <button className="px-4 py-2 text-foreground hover:bg-foreground hover:text-background border border-foreground transition-all flex items-center gap-1.5">
            <span>[ NEW FOCUS BLOCK ]</span>
          </button>
        </div>
      </div>

      {/* Date Navigation & View Mode Tabs */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-[10px] font-mono uppercase tracking-widest text-foreground/60">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <button className="hover:text-foreground transition-colors">
              {"<"}
            </button>
            <span className="text-foreground">Today, July 6</span>
            <button className="hover:text-foreground transition-colors">
              {">"}
            </button>
          </div>
          <span className="text-foreground/40">
            [ 4.0 hrs Deep Work Scheduled ]
          </span>
        </div>

        {/* View Switcher */}
        <div className="flex items-center gap-4">
          {(["day", "week", "month"] as const).map((mode) => (
            <button
              key={mode}
              onClick={() => setViewMode(mode)}
              className={`transition-colors ${
                viewMode === mode ? "text-foreground font-bold" : "hover:text-foreground"
              }`}
            >
              [ {mode} ]
            </button>
          ))}
        </div>
      </div>

      {/* 1. DAY VIEW SCHEDULE GRID */}
      {viewMode === "day" && (
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
                          matchingBlock.category === "DeepWork"
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
                              [{matchingBlock.category === "DeepWork" ? "DEEP WORK" : matchingBlock.category.toUpperCase()}]
                            </span>
                            <span>
                              {matchingBlock.startTime} - {matchingBlock.endTime}
                            </span>
                            {matchingBlock.isSynced && (
                              <span>[ GCAL SYNCED ]</span>
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
      )}

      {/* 2. WEEK VIEW MOCK */}
      {viewMode === "week" && (
        <div className="p-8 border border-border font-mono text-foreground text-xs">
          <div className="grid grid-cols-7 gap-4 text-center">
            {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day, idx) => (
              <div key={day} className={`p-4 border ${idx === 1 ? "border-foreground bg-foreground/5" : "border-border"}`}>
                <span className="text-[10px] uppercase text-foreground/50 tracking-widest block">{day}</span>
                <span className="text-xs uppercase text-foreground mt-2 block">July {idx + 5}</span>
                <div className="mt-4 space-y-2 text-[10px] uppercase tracking-widest text-left">
                  <div className="border-l border-foreground pl-2 text-foreground truncate">DSA Practice</div>
                  {idx < 5 && <div className="border-l border-border pl-2 text-foreground/60 truncate">OS Revision</div>}
                  {idx === 1 && <div className="border-l border-foreground/50 pl-2 text-foreground/80 truncate">AI Architecture Sync</div>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. MONTH VIEW MOCK */}
      {viewMode === "month" && (
        <div className="p-12 border border-border text-center text-foreground/60 font-mono text-[10px] uppercase tracking-widest space-y-4">
          <h3 className="text-sm font-bold text-foreground">Month View — July 2026</h3>
          <p className="max-w-md mx-auto leading-relaxed">
            You have 140 focus hours planned across July with 6 buffer review days scheduled prior to your university final exams.
          </p>
        </div>
      )}
    </div>
  );
};

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
  const { blocks: fetchedBlocks, isGoogleConnected, isLoading, createEvent, updateEvent, deleteEvent } = useCalendar(new Date().toISOString(), "day");
  const blocks = fetchedBlocks || [];

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBlock, setEditingBlock] = useState<Partial<TimeBlock> | null>(null);

  const handleOpenModal = (block?: Partial<TimeBlock>) => {
    if (block) {
      setEditingBlock(block);
    } else {
      setEditingBlock({ title: "", startTime: "09:00", endTime: "10:00", category: "DeepWork" });
    }
    setIsModalOpen(true);
  };

  const handleSave = () => {
    if (editingBlock) {
      const today = new Date().toISOString().split('T')[0];
      if (editingBlock.id) {
        updateEvent({ ...editingBlock, date: today } as any);
      } else {
        createEvent({ ...editingBlock, date: today } as any);
      }
    }
    setIsModalOpen(false);
  };

  const handleDelete = () => {
    if (editingBlock?.id) {
      deleteEvent(editingBlock.id);
    }
    setIsModalOpen(false);
  };

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
          <button onClick={() => handleOpenModal()} className="px-4 py-2 text-foreground hover:bg-foreground hover:text-background border border-foreground transition-all flex items-center gap-1.5">
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
                          <button onClick={() => handleOpenModal(matchingBlock)} className="text-foreground/50 hover:text-foreground transition-colors">
                            [ EDIT ]
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="w-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => handleOpenModal({ title: "", startTime: time, endTime: `${parseInt(time.split(':')[0]) + 1}:00`.padStart(5, '0'), category: "DeepWork" })} className="text-[10px] uppercase tracking-widest text-foreground/40 hover:text-foreground transition-colors">
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

    {isModalOpen && editingBlock && (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4 font-mono">
        <div className="bg-background border border-foreground max-w-md w-full p-6 space-y-6 shadow-2xl">
          <div className="flex justify-between items-center border-b border-border pb-4">
            <h3 className="text-lg font-bold uppercase tracking-widest">{editingBlock.id ? "Edit Block" : "New Block"}</h3>
            <button onClick={() => setIsModalOpen(false)} className="text-foreground/50 hover:text-foreground">✕</button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-[10px] uppercase tracking-widest text-foreground/60 block mb-1">Title</label>
              <input
                type="text"
                value={editingBlock.title || ""}
                onChange={(e) => setEditingBlock({ ...editingBlock, title: e.target.value })}
                className="w-full bg-background border border-border p-2 text-sm text-foreground focus:outline-none focus:border-foreground"
                placeholder="Meeting or task name"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] uppercase tracking-widest text-foreground/60 block mb-1">Start Time</label>
                <input
                  type="time"
                  value={editingBlock.startTime || ""}
                  onChange={(e) => setEditingBlock({ ...editingBlock, startTime: e.target.value })}
                  className="w-full bg-background border border-border p-2 text-sm text-foreground focus:outline-none focus:border-foreground"
                />
              </div>
              <div>
                <label className="text-[10px] uppercase tracking-widest text-foreground/60 block mb-1">End Time</label>
                <input
                  type="time"
                  value={editingBlock.endTime || ""}
                  onChange={(e) => setEditingBlock({ ...editingBlock, endTime: e.target.value })}
                  className="w-full bg-background border border-border p-2 text-sm text-foreground focus:outline-none focus:border-foreground"
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] uppercase tracking-widest text-foreground/60 block mb-1">Category</label>
              <select
                value={editingBlock.category || "DeepWork"}
                onChange={(e) => setEditingBlock({ ...editingBlock, category: e.target.value as any })}
                className="w-full bg-background border border-border p-2 text-sm text-foreground focus:outline-none focus:border-foreground"
              >
                <option value="DeepWork">Deep Work</option>
                <option value="Meeting">Meeting</option>
                <option value="Wellness">Wellness</option>
                <option value="Buffer">Buffer</option>
                <option value="EXTERNAL">External (Google)</option>
              </select>
            </div>
          </div>

          <div className="flex justify-between pt-4 border-t border-border">
            {editingBlock.id ? (
              <button onClick={handleDelete} className="text-red-500 text-[10px] font-bold uppercase tracking-widest hover:underline">
                [ DELETE ]
              </button>
            ) : (
              <div />
            )}
            <button onClick={handleSave} className="bg-foreground text-background px-4 py-2 text-[10px] font-bold uppercase tracking-widest hover:opacity-90">
              [ SAVE ]
            </button>
          </div>
        </div>
      </div>
    )}
    </div>
  );
};

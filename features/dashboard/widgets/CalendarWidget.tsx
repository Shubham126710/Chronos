"use client";

import React from "react";
import { Calendar as CalendarIcon, Clock, ArrowRight, Zap } from "lucide-react";
import clsx from "clsx";
import { useCalendar } from "../../calendar/api/useCalendar";
import { Skeleton } from "../../../components/ui/Skeleton";

export const CalendarWidget: React.FC = () => {
  const { blocks: events, isLoading, error } = useCalendar();

  if (isLoading) {
    return (
      <div className="flex flex-col h-full min-h-[160px] p-4 text-[10px] font-mono uppercase tracking-widest text-foreground/40">
        <Skeleton count={2} />
      </div>
    );
  }

  if (error || !events) {
    return <div className="text-[10px] font-mono text-red-500 p-4 text-center">FAILED TO LOAD CALENDAR</div>;
  }

  if (events.length === 0) {
    return (
      <div className="flex flex-col h-full min-h-[220px] p-4 text-[10px] font-mono uppercase tracking-widest text-foreground/40">
        <div>[ CLEAR SCHEDULE ]</div>
      </div>
    );
  }

  const now = new Date();

  return (
    <div className="flex flex-col h-full font-mono">
      {/* Header handled by WidgetContainer */}
      
      <div className="flex-1 overflow-y-auto scrollbar-none pr-4">
        <div className="flex flex-col space-y-6">
          {events.map((event: any, index: number) => {
            const start = new Date(event.startTime);
            const end = new Date(event.endTime);
            const isPast = end < now;
            const isCurrent = start <= now && end >= now;

            return (
              <div 
                key={event.id} 
                className={clsx(
                  "grid grid-cols-[48px_1fr] gap-6 group transition-colors", 
                  isPast ? "opacity-30" : "opacity-100",
                  isCurrent && "text-foreground"
                )}
              >
                {/* Time Column */}
                <div className="text-[10px] uppercase tracking-widest text-foreground/50 pt-1">
                  {start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })}
                </div>

                {/* Content Column */}
                <div className="flex flex-col border-t border-border pt-1">
                  <div className="flex flex-col mb-1">
                    <span className="text-sm font-medium tracking-widest uppercase">
                      {event.title}
                    </span>
                    {event.description && (
                      <span className="text-xs text-foreground/60 tracking-tight mt-1">
                        {event.description}
                      </span>
                    )}
                  </div>

                  {isCurrent && (
                    <div className="mt-2 text-[9px] uppercase tracking-widest text-foreground/50 flex items-center gap-2">
                      <span className="w-1.5 h-1.5 bg-foreground animate-pulse" />
                      <span>IN PROGRESS</span>
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

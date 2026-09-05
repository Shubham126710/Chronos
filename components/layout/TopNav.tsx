"use client";

import React, { useState, useEffect } from "react";
import { TabType } from "./Sidebar";
import { format } from "date-fns";

interface TopNavProps {
  activeTab: TabType;
  onOpenCommandPalette: () => void;
}

export const TopNav: React.FC<TopNavProps> = ({ activeTab, onOpenCommandPalette }) => {
  const [time, setTime] = useState<Date>(new Date());
  const [weatherAlert, setWeatherAlert] = useState("SCANNING...");
  const [isAlertCritical, setIsAlertCritical] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        const res = await fetch("/api/weather?lat=40.7128&lon=-74.0060");
        const data = await res.json();
        if (data && data.weather && data.weather.length > 0) {
          const main = data.weather[0].main.toUpperCase();
          if (main.includes("RAIN") || main.includes("STORM") || main.includes("SNOW")) {
            setWeatherAlert(`PRECIPITATION / ${main}`);
            setIsAlertCritical(true);
          } else {
            setWeatherAlert(`CLEAR / ${main}`);
            setIsAlertCritical(false);
          }
        }
      } catch (e) {
        setWeatherAlert("OFFLINE");
      }
    };
    fetchWeather();
    const interval = setInterval(fetchWeather, 15 * 60 * 1000); // 15 mins
    return () => clearInterval(interval);
  }, []);

  const getTabTitle = (tab: TabType): { title: string; subtitle: string } => {
    switch (tab) {
      case "dashboard":
        return { title: "EXECUTIVE DASHBOARD", subtitle: "SYSTEM OVERVIEW" };
      case "tasks":
        return { title: "INTELLIGENT TASKS", subtitle: "AI-PRIORITIZED MATRIX" };
      case "calendar":
        return { title: "TIME BLOCKING", subtitle: "DYNAMIC SCHEDULE" };
      case "goals":
        return { title: "GOAL HIERARCHY", subtitle: "LONG-TERM OBJECTIVES" };
      case "habits":
        return { title: "HABIT CONSISTENCY", subtitle: "ACTIVITY TRACKING" };
      case "projects":
        return { title: "ACTIVE PROJECTS", subtitle: "PROJECT TIMELINES" };
      case "notes":
        return { title: "CONTEXTUAL NOTES", subtitle: "MARKDOWN CAPTURE" };
      case "analytics":
        return { title: "PRODUCTIVITY ANALYTICS", subtitle: "FOCUS INSIGHTS" };
      default:
        return { title: "SYSTEM DASHBOARD", subtitle: "TIME ORGANIZED" };
    }
  };

  const { title, subtitle } = getTabTitle(activeTab);

  return (
    <header className="h-16 bg-background border-b border-border px-8 flex items-center justify-between sticky top-0 z-20 text-[10px] font-mono uppercase tracking-widest text-foreground">
      {/* Title & Subtitle */}
      <div className="flex items-center gap-4">
        <span className="font-medium">{title}</span>
        <span className="text-foreground/40 hidden sm:inline">/</span>
        <span className="text-foreground/40 hidden sm:inline">{subtitle}</span>
      </div>

      {/* Right Side Controls */}
      <div className="flex items-center gap-6">
        <div className="hidden lg:flex items-center gap-4">
          <span className="text-foreground/50">{format(time, "yyyy.MM.dd // HH:mm:ss")}</span>
        </div>

        <div className="hidden lg:flex items-center gap-2">
          <span className={isAlertCritical ? "text-foreground" : "text-foreground/50"}>WEATHER:</span> 
          <span className={isAlertCritical ? "text-foreground font-bold" : "text-foreground/50"}>{weatherAlert}</span>
        </div>

        <button
          onClick={onOpenCommandPalette}
          className="text-foreground/50 hover:text-foreground transition-colors"
        >
          INPUT [⌘K]
        </button>

        <div className="flex items-center gap-2">
          <span className="text-foreground">SYSTEM ACTIVE</span>
        </div>
      </div>
    </header>
  );
};

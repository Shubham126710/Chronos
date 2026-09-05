"use client";

import React, { useEffect, useState } from "react";
import { CloudRain, Sun, Wind, Droplets, Sparkles } from "lucide-react";

export const WeatherWidget: React.FC = () => {
  const [weather, setWeather] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    fetch("/api/weather")
      .then((res) => res.json())
      .then((res) => {
        if (res.success) setWeather(res.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading || !weather) {
    return <div className="text-xs text-white/50 p-4">Fetching weather sensor intelligence...</div>;
  }

  return (
    <div className="flex flex-col justify-between h-full min-h-[160px] text-white">
      <div>
        <div className="flex items-center justify-between">
          <div>
            <div className="text-3xl font-extrabold tracking-tight">{weather.temp}°F</div>
            <div className="text-xs text-white/60">{weather.condition} — {weather.location}</div>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-[#81C3D7]/20 border border-[#81C3D7]/30 flex items-center justify-center text-[#81C3D7]">
            <CloudRain className="w-6 h-6" />
          </div>
        </div>

        {/* Forecast pills */}
        <div className="grid grid-cols-4 gap-2 mt-4">
          {weather.forecast?.map((f: any, idx: number) => (
            <div key={idx} className="bg-white/5 border border-white/10 rounded-xl p-2 text-center">
              <div className="text-[10px] text-white/50 font-mono">{f.time}</div>
              <div className="text-xs font-bold my-0.5">{f.temp}°</div>
              <div className="text-[10px] text-[#81C3D7] font-mono">{f.rain} rain</div>
            </div>
          ))}
        </div>
      </div>

      {weather.aiScheduleAdaptation && (
        <div className="mt-4 pt-3 border-t border-white/10 flex items-start gap-2 text-xs text-[#81C3D7] bg-[#81C3D7]/10 p-3 rounded-xl border border-[#81C3D7]/20">
          <Sparkles className="w-4 h-4 shrink-0 mt-0.5" />
          <span className="leading-relaxed">{weather.aiScheduleAdaptation}</span>
        </div>
      )}
    </div>
  );
};

"use client";

import React, { useEffect, useState } from "react";
import { Music, Play, Pause, SkipForward, SkipBack, Disc, Volume2, Sparkles, Link as LinkIcon } from "lucide-react";
import clsx from "clsx";

export const SpotifyWidget: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    fetch("/api/spotify")
      .then((res) => res.json())
      .then((res) => {
        if (res.success) setData(res.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleTogglePlay = async () => {
    if (!data?.isConnected) return;
    const res = await fetch("/api/spotify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "toggle-play" }),
    }).then((r) => r.json());
    if (res.success) setData((prev: any) => ({ ...prev, isPlaying: !prev.isPlaying }));
  };

  const handleNext = async () => {
    if (!data?.isConnected) return;
    await fetch("/api/spotify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "next" }),
    });
  };

  const handlePrev = async () => {
    if (!data?.isConnected) return;
    await fetch("/api/spotify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "prev" }),
    });
  };

  if (loading || !data) {
    return <div className="text-xs text-white/50 p-4">Loading Spotify...</div>;
  }

  if (!data.isConnected) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[160px] text-white/70">
        <Music className="w-8 h-8 mb-3 opacity-50" />
        <p className="text-xs font-medium mb-3">Spotify Not Connected</p>
        <button 
          onClick={() => window.location.href = "/api/integrations/spotify/auth"}
          className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-bold rounded-lg transition-colors flex items-center gap-2"
        >
          <LinkIcon className="w-3 h-3" /> Connect Spotify
        </button>
      </div>
    );
  }

  const { currentTrack, isPlaying } = data;

  return (
    <div className="flex flex-col justify-between h-full min-h-[160px] text-white">
      {/* Player header */}
      <div className="flex items-center gap-3">
        {currentTrack?.coverUrl ? (
          <img src={currentTrack.coverUrl} alt="Cover" className={clsx("w-12 h-12 rounded-xl border border-white/10 shadow-lg object-cover", isPlaying && "animate-pulse")} />
        ) : (
          <div className="relative w-12 h-12 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center shrink-0 overflow-hidden shadow-lg">
            <Disc className={clsx("w-6 h-6 text-emerald-400", isPlaying && "animate-spin")} style={{ animationDuration: "3s" }} />
          </div>
        )}
        <div className="truncate flex-1">
          <h4 className="text-sm font-bold text-white truncate">{currentTrack?.title || "No track playing"}</h4>
          <p className="text-xs text-white/60 truncate">{currentTrack?.artist || "Spotify"}</p>
        </div>
      </div>

      {/* Playback Controls */}
      <div className="mt-4 flex items-center justify-center gap-4">
        <button onClick={handlePrev} className="text-white/60 hover:text-white transition-colors">
          <SkipBack className="w-5 h-5 fill-current" />
        </button>
        <button
          onClick={handleTogglePlay}
          className="w-10 h-10 rounded-full bg-emerald-500 hover:bg-emerald-400 text-black flex items-center justify-center transition-all shadow-md"
        >
          {isPlaying ? <Pause className="w-5 h-5 fill-black" /> : <Play className="w-5 h-5 fill-black ml-0.5" />}
        </button>
        <button onClick={handleNext} className="text-white/60 hover:text-white transition-colors">
          <SkipForward className="w-5 h-5 fill-current" />
        </button>
      </div>

      {/* Audio Stats Footer */}
      <div className="mt-4 pt-2.5 border-t border-white/10 flex items-center justify-between text-[11px] text-white/60 font-mono">
        <span className="flex items-center gap-1.5">
          <Volume2 className="w-3.5 h-3.5 text-emerald-400" />
          <span>Listening now</span>
        </span>
        <span className="text-emerald-300">Spotify OAuth Active</span>
      </div>
    </div>
  );
};


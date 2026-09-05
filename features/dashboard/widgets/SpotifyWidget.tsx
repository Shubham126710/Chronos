"use client";

import React, { useEffect, useState } from "react";
import { Music, Play, Pause, SkipForward, Disc, Volume2, Sparkles } from "lucide-react";
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
    if (!data) return;
    const res = await fetch("/api/spotify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "toggle-play" }),
    }).then((r) => r.json());
    if (res.success) setData((prev: any) => ({ ...prev, isPlaying: !prev.isPlaying }));
  };

  const handleSwitchPlaylist = async (pl: string) => {
    const res = await fetch("/api/spotify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "switch-playlist", playlist: pl }),
    }).then((r) => r.json());
    if (res.success) setData((prev: any) => ({ ...prev, activePlaylist: pl }));
  };

  if (loading || !data) {
    return <div className="text-xs text-white/50 p-4">Connecting to Spotify Focus Audio...</div>;
  }

  const { currentTrack, isPlaying, activePlaylist, playlists = [], sessionStats } = data;

  return (
    <div className="flex flex-col justify-between h-full min-h-[160px] text-white">
      {/* Player header */}
      <div className="flex items-center gap-3">
        <div className="relative w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center shrink-0 overflow-hidden shadow-lg">
          <Disc className={clsx("w-6 h-6 text-emerald-400", isPlaying && "animate-spin")} style={{ animationDuration: "3s" }} />
        </div>
        <div className="truncate flex-1">
          <h4 className="text-sm font-bold text-white truncate">{currentTrack?.title || "Resonance"}</h4>
          <p className="text-xs text-white/60 truncate">{currentTrack?.artist || "Home"} — {currentTrack?.album}</p>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={handleTogglePlay}
            className="w-8 h-8 rounded-full bg-emerald-500 hover:bg-emerald-400 text-black flex items-center justify-center transition-all shadow-md"
          >
            {isPlaying ? <Pause className="w-4 h-4 fill-black" /> : <Play className="w-4 h-4 fill-black ml-0.5" />}
          </button>
        </div>
      </div>

      {/* Playlist Selector */}
      <div className="mt-4">
        <div className="text-[10px] font-mono uppercase tracking-wider text-white/40 mb-1.5 flex items-center justify-between">
          <span>Active Focus Playlist</span>
          <span className="text-emerald-400 font-bold">{sessionStats?.audioFocusScoreBoost} boost</span>
        </div>
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {playlists.map((pl: string) => (
            <button
              key={pl}
              onClick={() => handleSwitchPlaylist(pl)}
              className={clsx(
                "px-2.5 py-1 rounded-xl text-[10px] font-medium whitespace-nowrap transition-all border",
                activePlaylist === pl
                  ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40 shadow-sm"
                  : "bg-white/5 text-white/60 border-white/10 hover:text-white hover:bg-white/10"
              )}
            >
              {pl}
            </button>
          ))}
        </div>
      </div>

      {/* Audio Stats Footer */}
      <div className="mt-3 pt-2.5 border-t border-white/10 flex items-center justify-between text-[11px] text-white/60 font-mono">
        <span className="flex items-center gap-1.5">
          <Volume2 className="w-3.5 h-3.5 text-emerald-400" />
          <span>{sessionStats?.focusAudioHours || 14.2}h streamed</span>
        </span>
        <span className="text-emerald-300">Spotify OAuth Active</span>
      </div>
    </div>
  );
};

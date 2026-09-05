"use client";

import React, { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowRight, Loader2, Key } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("alex.vance@chronos.ai");
  const [password, setPassword] = useState("password123");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await signIn("credentials", {
        redirect: false,
        email,
        password,
      });

      if (res?.error) {
        setError(res.error);
        setLoading(false);
      } else {
        router.push("/app/dashboard");
        router.refresh();
      }
    } catch (err: any) {
      setError("An unexpected error occurred.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-background text-foreground overflow-hidden selection:bg-foreground selection:text-background relative">
      {/* Background Grid & Decor */}
      <div className="absolute inset-0 z-0 opacity-20 pointer-events-none">
        <div className="absolute inset-0" style={{ 
          backgroundImage: `linear-gradient(to right, var(--border) 1px, transparent 1px), linear-gradient(to bottom, var(--border) 1px, transparent 1px)`,
          backgroundSize: '4rem 4rem' 
        }} />
      </div>

      <div className="absolute top-8 left-8 z-10 hidden sm:block">
        <div className="text-[10px] font-mono uppercase tracking-widest opacity-50">
          SYSTEM_OS / BUILD 0.1.0<br/>
          AUTHORIZED PERSONNEL ONLY
        </div>
      </div>

      {/* Main Content Area */}
      <div className="w-full lg:w-[45%] flex flex-col justify-center px-8 sm:px-16 xl:px-24 z-10 relative bg-background/80 backdrop-blur-md border-r border-border h-screen overflow-y-auto custom-scrollbar">
        
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-8">
            {/* Minimal Logo */}
            <div className="flex gap-[3px]">
              <div className="w-1.5 h-6 bg-foreground" />
              <div className="w-1.5 h-6 bg-foreground opacity-80" />
              <div className="w-1.5 h-6 bg-foreground opacity-60" />
              <div className="w-1.5 h-6 bg-foreground opacity-40" />
            </div>
            <span className="font-mono text-sm uppercase tracking-widest font-bold">Chronos</span>
          </div>

          <h1 className="text-4xl sm:text-5xl font-sans tracking-tighter leading-none mb-4">
            System<br />Authentication.
          </h1>
          <p className="text-xs font-mono text-foreground/50 uppercase tracking-widest">
            Enter your credentials to access the central intelligence operating system.
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6 max-w-sm">
          {error && (
            <div className="p-3 border border-red-500/50 bg-red-500/10 text-red-500 text-[10px] uppercase tracking-widest font-mono">
              [ ERROR: {error} ]
            </div>
          )}

          <div className="space-y-2">
            <label className="text-[10px] font-mono font-bold text-foreground uppercase tracking-widest block">
              Operator Email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-4 bg-background border border-border text-foreground text-sm focus:outline-none focus:border-foreground transition-all font-mono"
              placeholder="operator@chronos.os"
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-[10px] font-mono font-bold text-foreground uppercase tracking-widest block">
                Access Key
              </label>
              <span className="text-[9px] font-mono text-foreground/40 uppercase tracking-widest hover:text-foreground cursor-pointer transition-colors">
                Recover Key?
              </span>
            </div>
            <div className="relative">
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-4 pr-12 bg-background border border-border text-foreground text-sm focus:outline-none focus:border-foreground transition-all font-mono"
                placeholder="••••••••"
              />
              <Key className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/30" />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full p-4 bg-foreground text-background font-mono font-bold uppercase tracking-widest text-xs hover:bg-background hover:text-foreground border border-foreground transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed group mt-4"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                Initiate Session
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>
        </form>

        <div className="mt-12 pt-8 border-t border-border flex items-center gap-4">
          <p className="text-[10px] font-mono text-foreground/50 uppercase tracking-widest">
            No active clearance?
          </p>
          <Link href="/signup" className="text-[10px] font-mono text-foreground font-bold hover:underline uppercase tracking-widest flex items-center gap-1">
            Request Access <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      </div>

      {/* Decorative Right Side (Hidden on Mobile) */}
      <div className="hidden lg:flex flex-1 relative items-center justify-center p-12 overflow-hidden bg-background">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,var(--foreground)_0%,transparent_0%)] opacity-[0.02] animate-pulse" />
        
        {/* Code Graffiti */}
        <div className="absolute inset-0 p-12 overflow-hidden pointer-events-none opacity-20 font-mono text-[8px] sm:text-[10px] leading-relaxed text-foreground select-none whitespace-pre flex flex-col justify-center">
{`const heuristic_engine = new Engine({
  threads: 12,
  vectorSearch: true,
  model: 'gemini-pro-vision',
  fallback: 'heuristic-core'
});

async function analyzeCognitiveState(userId: string) {
  const data = await db.fetch('SELECT metrics FROM user_state WHERE id = ?', userId);
  const flowIndex = computeFlowScore(data.focusSessions, data.interruptions);
  
  if (flowIndex > 0.85) {
    system.log('PEAK COGNITIVE STATE DETECTED');
    engine.routeTask(userId, 'deep_work');
  } else {
    engine.suggestBreak(userId);
  }
}

// Memory allocation module
function allocateMemory(poolSize) {
  const buffer = new ArrayBuffer(poolSize);
  const view = new Float64Array(buffer);
  
  for(let i=0; i<view.length; i++) {
    view[i] = Math.random() * flowIndex;
  }
  return view;
}

[SYSTEM INITIATING VERIFICATION MODULE...]
[LOAD MEMORY...] OK
[VERIFY CREDENTIALS...] PENDING`}
        </div>

        <div className="relative z-10 max-w-xl text-center space-y-6 opacity-40 select-none pointer-events-none border border-foreground/10 bg-background/50 p-8 backdrop-blur-sm">
          <div className="font-mono text-sm uppercase tracking-[0.2em] space-y-2">
            <p className="font-bold text-foreground">Heuristic Analytics</p>
            <p>Deep Work Management</p>
            <p>Cognitive Optimization</p>
            <p>System Adaptive Intelligence</p>
          </div>
        </div>
        
        {/* Decorative elements */}
        <div className="absolute top-12 right-12 text-[10px] font-mono text-foreground/30 uppercase tracking-widest text-right">
          STATUS: ONLINE<br/>
          NODE: US-EAST-1<br/>
          LATENCY: 12ms
        </div>
        <div className="absolute bottom-12 right-12 w-32 h-32 border-r border-b border-foreground/10" />
        <div className="absolute top-12 left-12 w-32 h-32 border-l border-t border-foreground/10" />
      </div>
    </div>
  );
}

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
    <div className="min-h-screen flex bg-[#0B0910] text-foreground overflow-hidden selection:bg-foreground selection:text-[#0B0910]">
      {/* Left Typography Canvas */}
      <div className="hidden lg:flex flex-1 relative flex-col justify-between p-16 border-r border-border/50 bg-[#0B0910]">
        
        {/* Subtle decorative grid overlay */}
        <div 
          className="absolute inset-0 pointer-events-none opacity-[0.03]"
          style={{
            backgroundImage: `linear-gradient(to right, #FFFFFF 1px, transparent 1px), linear-gradient(to bottom, #FFFFFF 1px, transparent 1px)`,
            backgroundSize: '3rem 3rem'
          }}
        />

        <div className="relative z-10 space-y-4">
          <div className="flex gap-[3px] mb-12">
            <div className="w-2 h-8 bg-foreground" />
            <div className="w-2 h-8 bg-foreground opacity-80" />
            <div className="w-2 h-8 bg-foreground opacity-60" />
            <div className="w-2 h-8 bg-foreground opacity-40" />
          </div>
          
          <h1 className="text-7xl xl:text-[6rem] font-sans font-medium tracking-tighter leading-[0.9]">
            the operating<br/>
            system for<br/>
            <span className="text-foreground/40 italic font-light">deep work.</span>
          </h1>
        </div>

        <div className="relative z-10 flex items-end justify-between font-mono text-[10px] uppercase tracking-widest text-foreground/40">
          <div className="space-y-1">
            <p className="text-foreground/80 font-bold">CHRONOS_OS // V1.0</p>
            <p>INTELLIGENT COGNITIVE SCHEDULING</p>
          </div>
          <div className="text-right space-y-1">
            <p>STATUS: ONLINE</p>
            <p>NETWORK: STABLE</p>
          </div>
        </div>
      </div>

      {/* Right Login Form */}
      <div className="w-full lg:w-[35%] flex flex-col justify-center px-8 sm:px-16 xl:px-20 z-10 bg-[#0B0910] h-screen overflow-y-auto">
        <div className="w-full max-w-sm mx-auto">
          
          {/* Mobile Logo */}
          <div className="lg:hidden flex gap-[3px] mb-12">
            <div className="w-1.5 h-6 bg-foreground" />
            <div className="w-1.5 h-6 bg-foreground opacity-80" />
            <div className="w-1.5 h-6 bg-foreground opacity-60" />
            <div className="w-1.5 h-6 bg-foreground opacity-40" />
          </div>

          <div className="mb-12">
            <h2 className="text-3xl font-sans font-medium tracking-tight mb-2">Initiate Session.</h2>
            <p className="text-xs font-mono text-foreground/50 uppercase tracking-widest">
              Provide operator clearance
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            {error && (
              <div className="p-3 border border-red-500/50 bg-red-500/10 text-red-500 text-[10px] uppercase tracking-widest font-mono">
                [ ERROR: {error} ]
              </div>
            )}

            <div className="space-y-2">
              <label className="text-[10px] font-mono font-bold text-foreground uppercase tracking-widest block">
                Operator ID
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-4 bg-transparent border-b border-border text-foreground text-sm focus:outline-none focus:border-foreground transition-all font-mono placeholder-foreground/20"
                placeholder="operator@chronos.os"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-[10px] font-mono font-bold text-foreground uppercase tracking-widest block">
                  Access Key
                </label>
                <span className="text-[9px] font-mono text-foreground/40 uppercase tracking-widest hover:text-foreground cursor-pointer transition-colors">
                  Lost Key?
                </span>
              </div>
              <div className="relative">
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full p-4 pr-12 bg-transparent border-b border-border text-foreground text-sm focus:outline-none focus:border-foreground transition-all font-mono placeholder-foreground/20"
                  placeholder="••••••••"
                />
                <Key className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/30" />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full p-5 mt-8 bg-foreground text-[#0B0910] font-mono font-bold uppercase tracking-widest text-xs hover:bg-foreground/90 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed group"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  Authenticate
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          <div className="mt-12 pt-8 flex items-center justify-between">
            <p className="text-[10px] font-mono text-foreground/40 uppercase tracking-widest">
              No clearance?
            </p>
            <Link href="/signup" className="text-[10px] font-mono text-foreground font-bold hover:underline uppercase tracking-widest flex items-center gap-1">
              Initialize Node <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
}

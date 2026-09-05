"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowRight, Loader2, Key, User, Mail } from "lucide-react";

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to create account");
      }

      router.push("/login?registered=true");
    } catch (err: any) {
      setError(err.message);
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
            initialize<br/>
            your new<br/>
            <span className="text-foreground/40 italic font-light">workspace.</span>
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

      {/* Right Signup Form */}
      <div className="w-full lg:w-[35%] flex flex-col justify-center px-8 sm:px-16 xl:px-20 z-10 bg-[#0B0910] h-screen overflow-y-auto custom-scrollbar">
        <div className="w-full max-w-sm mx-auto py-12">
          
          {/* Mobile Logo */}
          <div className="lg:hidden flex gap-[3px] mb-12">
            <div className="w-1.5 h-6 bg-foreground" />
            <div className="w-1.5 h-6 bg-foreground opacity-80" />
            <div className="w-1.5 h-6 bg-foreground opacity-60" />
            <div className="w-1.5 h-6 bg-foreground opacity-40" />
          </div>

          <div className="mb-12">
            <h2 className="text-3xl font-sans font-medium tracking-tight mb-2">Create Node.</h2>
            <p className="text-xs font-mono text-foreground/50 uppercase tracking-widest">
              Register new operator credentials
            </p>
          </div>

          <form onSubmit={handleSignup} className="space-y-6">
            {error && (
              <div className="p-3 border border-red-500/50 bg-red-500/10 text-red-500 text-[10px] uppercase tracking-widest font-mono">
                [ ERROR: {error} ]
              </div>
            )}

            <div className="space-y-2">
              <label className="text-[10px] font-mono font-bold text-foreground uppercase tracking-widest block">
                Operator Name
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full p-4 pl-12 bg-transparent border-b border-border text-foreground text-sm focus:outline-none focus:border-foreground transition-all font-mono placeholder-foreground/20"
                  placeholder="ALEX VANCE"
                />
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/30" />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-mono font-bold text-foreground uppercase tracking-widest block">
                Operator Email
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full p-4 pl-12 bg-transparent border-b border-border text-foreground text-sm focus:outline-none focus:border-foreground transition-all font-mono placeholder-foreground/20"
                  placeholder="operator@chronos.os"
                />
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/30" />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-mono font-bold text-foreground uppercase tracking-widest block">
                Access Key
              </label>
              <div className="relative">
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full p-4 pl-12 bg-transparent border-b border-border text-foreground text-sm focus:outline-none focus:border-foreground transition-all font-mono placeholder-foreground/20"
                  placeholder="••••••••"
                />
                <Key className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/30" />
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
                  Register Node
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          <div className="mt-12 pt-8 flex items-center justify-between">
            <p className="text-[10px] font-mono text-foreground/40 uppercase tracking-widest">
              Already initialized?
            </p>
            <Link href="/login" className="text-[10px] font-mono text-foreground font-bold hover:underline uppercase tracking-widest flex items-center gap-1">
              Initiate Session <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
}

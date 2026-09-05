"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Sparkles, ArrowRight, Loader2 } from "lucide-react";

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
      // In a real app, you would have a POST /api/auth/signup route.
      // For now, let's just simulate the route existing, or we can build it.
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to create account.");
        setLoading(false);
      } else {
        router.push("/login?success=1");
      }
    } catch (err: any) {
      setError("An unexpected error occurred.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background font-mono p-4">
      <div className="w-full max-w-md p-8 border border-border">
        <div className="mb-8">
          <h1 className="text-xl font-bold text-foreground uppercase tracking-widest">[ SYSTEM REGISTRATION ]</h1>
          <p className="text-[10px] text-foreground/50 uppercase tracking-widest mt-2">
            INITIALIZE CHRONOS OS INSTANCE.
          </p>
        </div>

        <form onSubmit={handleSignup} className="space-y-6">
          {error && (
            <div className="p-3 border border-red-500/50 bg-red-500/10 text-red-500 text-[10px] uppercase tracking-widest">
              [ ERROR: {error} ]
            </div>
          )}

          <div className="space-y-2">
            <label className="text-[10px] font-bold text-foreground uppercase tracking-widest block">
              [ OPERATOR NAME ]
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-3 bg-background border border-border text-foreground text-sm focus:outline-none focus:border-foreground transition-colors"
              placeholder="ALEX VANCE"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-bold text-foreground uppercase tracking-widest block">
              [ EMAIL ADDRESS ]
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3 bg-background border border-border text-foreground text-sm focus:outline-none focus:border-foreground transition-colors"
              placeholder="operator@chronos.os"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-bold text-foreground uppercase tracking-widest block">
              [ PASSWORD ]
            </label>
            <input
              type="password"
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 bg-background border border-border text-foreground text-sm focus:outline-none focus:border-foreground transition-colors"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full p-3 border border-foreground bg-foreground text-background font-bold uppercase tracking-widest text-[10px] hover:bg-background hover:text-foreground transition-colors flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "[ INITIALIZE ACCOUNT ]"}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-border text-center">
          <p className="text-[10px] text-foreground/50 uppercase tracking-widest">
            ALREADY HAVE CLEARANCE?{" "}
            <Link href="/login" className="text-foreground font-bold hover:underline">
              [ INITIATE SESSION ]
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowLeft, BookOpen, Terminal, Sparkles, LayoutDashboard, Target, Calendar } from "lucide-react";
import { motion } from "framer-motion";
import gsap from "gsap";

export default function DocsPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".doc-fade",
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.8, stagger: 0.1, ease: "power3.out" }
      );
    }, containerRef);
    return () => ctx.revert();
  }, []);

  return (
    <div className="min-h-[100dvh] bg-background text-foreground selection:bg-foreground selection:text-background font-sans overflow-x-hidden">
      {/* Background Grid */}
      <div className="fixed inset-0 z-0 opacity-20 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#EBEAE5 1px, transparent 1px)', backgroundSize: '24px 24px' }}></div>
      
      <div ref={containerRef} className="relative z-10 w-full max-w-5xl mx-auto px-6 py-12 md:py-20 lg:py-32 flex flex-col md:flex-row gap-12 lg:gap-24">
        
        {/* Sidebar Nav */}
        <div className="w-full md:w-64 shrink-0 doc-fade">
          <Link href="/" className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-foreground/50 hover:text-foreground transition-colors mb-12">
            <ArrowLeft className="w-4 h-4" />
            Return to System
          </Link>
          
          <div className="sticky top-12 space-y-8">
            <div>
              <h4 className="text-[10px] font-mono uppercase tracking-widest text-foreground/40 mb-4">Documentation</h4>
              <ul className="space-y-3 text-sm font-medium">
                <li><a href="#overview" className="text-foreground hover:text-foreground/70 transition-colors">Overview</a></li>
                <li><a href="#features" className="text-foreground/70 hover:text-foreground transition-colors">Core Features</a></li>
                <li><a href="#ai" className="text-foreground/70 hover:text-foreground transition-colors">AI Intelligence</a></li>
                <li><a href="#architecture" className="text-foreground/70 hover:text-foreground transition-colors">Architecture</a></li>
              </ul>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 space-y-24 doc-fade">
          
          {/* Header */}
          <header className="space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/5 border border-white/10 rounded-full text-[10px] font-mono uppercase tracking-widest">
              <BookOpen className="w-3 h-3" />
              <span>Chronos OS Manual</span>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-7xl font-normal tracking-tight leading-[1.1]">
              System<br />
              <span className="text-foreground/60 italic">Documentation.</span>
            </h1>
            <p className="text-lg text-foreground/60 max-w-xl font-light leading-relaxed">
              A premium, high-performance productivity operating system designed for deep work. Learn how to leverage the full power of Chronos.
            </p>
          </header>

          <div className="w-full h-px bg-border"></div>

          {/* Sections */}
          <section id="overview" className="space-y-6 scroll-mt-24">
            <h2 className="text-2xl font-bold tracking-tight">Overview</h2>
            <div className="prose prose-invert prose-p:text-foreground/70 prose-p:leading-relaxed max-w-none">
              <p>
                Chronos is a state-of-the-art productivity operating system designed for high performers. It provides a sleek, high-performance, and deeply immersive interface for managing tasks, tracking habits, scheduling deep work, and aligning daily actions with long-term goals.
              </p>
              <p>
                Built with aesthetic excellence at its core, Chronos leverages a premium monochromatic design language with subtle dark mode accents and fluid micro-animations to create a distraction-free, luxurious user experience.
              </p>
            </div>
          </section>

          <section id="features" className="space-y-12 scroll-mt-24">
            <h2 className="text-2xl font-bold tracking-tight">Core Features</h2>
            
            <div className="grid gap-8 sm:grid-cols-2">
              <div className="p-6 bg-[#0B0910] border border-border rounded-xl space-y-4">
                <LayoutDashboard className="w-6 h-6 text-foreground/50" />
                <h3 className="font-bold tracking-wide">Dynamic Dashboard</h3>
                <p className="text-sm text-foreground/60 leading-relaxed">
                  A deeply interactive user hub where you control the layout. The Dashboard Canvas features an array of modular widgets, including Productivity Score, Focus Timer, Calendar, Habits, and Tasks.
                </p>
              </div>

              <div className="p-6 bg-[#0B0910] border border-border rounded-xl space-y-4">
                <Target className="w-6 h-6 text-foreground/50" />
                <h3 className="font-bold tracking-wide">Goal Hierarchy</h3>
                <p className="text-sm text-foreground/60 leading-relaxed">
                  Align your daily tasks with macro-level goals. The system connects micro-actions directly to your long-term objectives, ensuring you are always moving the needle.
                </p>
              </div>

              <div className="p-6 bg-[#0B0910] border border-border rounded-xl space-y-4">
                <Calendar className="w-6 h-6 text-foreground/50" />
                <h3 className="font-bold tracking-wide">Time Blocking</h3>
                <p className="text-sm text-foreground/60 leading-relaxed">
                  Seamlessly schedule deep work sessions. Tasks integrate with calendar views to protect your time and manage cognitive load efficiently.
                </p>
              </div>

              <div className="p-6 bg-[#0B0910] border border-border rounded-xl space-y-4">
                <Terminal className="w-6 h-6 text-foreground/50" />
                <h3 className="font-bold tracking-wide">Premium UX</h3>
                <p className="text-sm text-foreground/60 leading-relaxed">
                  Engineered with Framer Motion, GSAP, and Lenis for silken smooth scrolls, staggering reveals, and interactive micro-animations.
                </p>
              </div>
            </div>
          </section>

          <section id="ai" className="space-y-6 scroll-mt-24">
            <h2 className="text-2xl font-bold tracking-tight flex items-center gap-3">
              <Sparkles className="w-6 h-6" />
              AI Intelligence Layer
            </h2>
            <div className="prose prose-invert prose-p:text-foreground/70 prose-p:leading-relaxed max-w-none">
              <p>
                Chronos isn't just a database. It features an integrated <strong>Semantic AI Command Palette</strong> accessible via <code>[⌘ + K]</code>. 
              </p>
              <p>
                Powered by Gemini AI models, the assistant parses natural language requests, connects to external integrations like Google Calendar and Notion, and autonomously organizes your workspace. You can ask it to <em>"Reschedule my afternoon meetings"</em> or <em>"Create a project timeline for next week"</em>, and watch the system execute it instantly.
              </p>
            </div>
          </section>

          <section id="architecture" className="space-y-6 scroll-mt-24 pb-32">
            <h2 className="text-2xl font-bold tracking-tight">Architecture</h2>
            <div className="p-8 border border-border bg-white/5 font-mono text-sm leading-loose text-foreground/70 overflow-x-auto">
              <div className="flex items-center gap-4 border-b border-border/50 pb-4 mb-4">
                <span className="text-foreground font-bold">Frontend:</span>
                <span>Next.js 14, React, Tailwind CSS, Framer Motion, GSAP</span>
              </div>
              <div className="flex items-center gap-4 border-b border-border/50 pb-4 mb-4">
                <span className="text-foreground font-bold">Backend:</span>
                <span>Next.js API Routes, Prisma ORM, PostgreSQL</span>
              </div>
              <div className="flex items-center gap-4 border-b border-border/50 pb-4 mb-4">
                <span className="text-foreground font-bold">Intelligence:</span>
                <span>Google Gemini API, Vercel AI SDK</span>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-foreground font-bold">Authentication:</span>
                <span>NextAuth.js (Credentials + OAuth)</span>
              </div>
            </div>
          </section>

        </div>
      </div>
    </div>
  );
}

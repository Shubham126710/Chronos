"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ArrowRight, Brain, Calendar, Target, Activity, FileText, 
  CheckCircle2, Clock, Layers, Menu, X
} from "lucide-react";
import { HeroSection } from "../hero/HeroSection";

import { useRouter } from "next/navigation";

interface LandingPageProps {
  onEnterApp?: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onEnterApp }) => {
  const [activeSection, setActiveSection] = useState(0);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const sections = [
    "system", "how-it-works", "intelligence", "features", "pricing"
  ];

  const integrations = [
    { name: "Spotify", src: "https://cdn.simpleicons.org/spotify/white" },
    { name: "Slack", src: "https://upload.wikimedia.org/wikipedia/commons/d/d5/Slack_icon_2019.svg" },
    { name: "Discord", src: "https://cdn.simpleicons.org/discord/white" },
    { name: "GitHub", src: "https://cdn.simpleicons.org/github/white" },
    { name: "Google Calendar", src: "https://cdn.simpleicons.org/googlecalendar/white" },
    { name: "Figma", src: "https://cdn.simpleicons.org/figma/white" },
    { name: "Notion", src: "https://cdn.simpleicons.org/notion/white" },
    { name: "Gmail", src: "https://cdn.simpleicons.org/gmail/white" },
    { name: "Linear", src: "https://cdn.simpleicons.org/linear/white" },
    { name: "Zoom", src: "https://cdn.simpleicons.org/zoom/white" },
  ];

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = sections.indexOf(entry.target.id);
            if (index !== -1) {
              setActiveSection(index);
            }
          }
        });
      },
      { rootMargin: "-40% 0px -40% 0px", threshold: 0 }
    );

    sections.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [sections]);

  return (
    <div className="min-h-screen bg-background text-foreground font-sans relative selection:bg-foreground selection:text-background">
      
      {/* 1. Dynamic Editorial Navigation */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/90 backdrop-blur-md border-b border-border">
        <div className="w-full px-4 sm:px-8 lg:px-12 py-4 flex items-center justify-between">
          <div className="flex items-center gap-6">
            {/* Logo Mark - Fixed */}
            <div 
              className="flex items-center gap-2 cursor-pointer shrink-0" 
              onClick={onEnterApp}
            >
              <div className="flex gap-0.5">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="w-1.5 h-4 bg-foreground" />
                ))}
              </div>
              <span className="text-sm font-bold tracking-tight font-mono ml-2">CHRONOS</span>
            </div>
            
            <div className="w-[1px] h-4 bg-border hidden sm:block shrink-0" />
            
            {/* Clipped Horizontal Viewport for Navigation */}
            <div className="hidden sm:block overflow-hidden relative w-[320px] shrink-0" style={{ maskImage: 'linear-gradient(to right, black 80%, transparent 100%)', WebkitMaskImage: 'linear-gradient(to right, black 80%, transparent 100%)' }}>
              <motion.nav 
                animate={{ x: `-${activeSection * 6}rem` }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className="flex items-center gap-8 text-[10px] font-mono uppercase tracking-widest whitespace-nowrap"
              >
                {sections.map((section, idx) => (
                  <a 
                    key={idx} 
                    href={`#${section}`}
                    className={`transition-all w-24 shrink-0 flex items-center ${
                      activeSection === idx 
                        ? "text-foreground font-bold" 
                        : "text-foreground/40 hover:text-foreground/70"
                    }`}
                  >
                    {activeSection === idx && <span className="mr-2 text-[#FF8C61]">►</span>}
                    {section.replace(/-/g, " ")}
                  </a>
                ))}
              </motion.nav>
            </div>
          </div>

          <div className="flex items-center gap-4 shrink-0 text-xs font-mono lowercase">
            <span className="text-foreground/50 hidden md:inline-block">[ documentation ]</span>
            <button 
              onClick={onEnterApp}
              className="hover:text-foreground/70 transition-colors hidden sm:block"
            >
              sign up / log in
            </button>
            <button 
              onClick={() => setIsMenuOpen(true)}
              className="p-1 hover:text-foreground/70 transition-colors"
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Full-Screen Hamburger Menu Overlay */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="fixed inset-0 z-[100] bg-background flex flex-col"
          >
            <div className="w-full px-4 sm:px-8 lg:px-12 py-4 flex items-center justify-between border-b border-border">
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2 cursor-pointer shrink-0" onClick={() => setIsMenuOpen(false)}>
                  <div className="flex gap-0.5">
                    {[...Array(4)].map((_, i) => (
                      <div key={i} className="w-1.5 h-4 bg-foreground" />
                    ))}
                  </div>
                  <span className="text-sm font-bold tracking-tight font-mono ml-2">CHRONOS</span>
                </div>
              </div>
              <div className="flex items-center gap-4 shrink-0">
                <button 
                  onClick={() => setIsMenuOpen(false)}
                  className="p-1 hover:text-foreground/70 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
          
          <div className="flex-1 overflow-y-auto px-4 sm:px-8 lg:px-12 py-12 flex flex-col justify-center max-w-4xl mx-auto w-full">
            <nav className="flex flex-col gap-6 sm:gap-8">
              {[
                { label: "System", id: "system" },
                { label: "How it works", id: "how-it-works" },
                { label: "Intelligence", id: "intelligence" },
                { label: "Features", id: "features" },
                { label: "Pricing", id: "pricing" },
              ].map((item, idx) => (
                <a
                  key={idx}
                  href={`#${item.id}`}
                  onClick={() => setIsMenuOpen(false)}
                  className="text-3xl sm:text-5xl md:text-7xl font-medium tracking-tight hover:text-foreground/60 transition-colors border-b border-border/30 pb-4 flex items-baseline gap-4 group"
                >
                  <span className="text-sm font-mono text-foreground/40 group-hover:text-foreground/60 transition-colors">0{idx + 1}</span>
                  {item.label}
                </a>
              ))}
              <div className="pt-8 flex flex-col sm:flex-row gap-6 sm:gap-12">
                <button onClick={onEnterApp} className="text-xl font-medium hover:text-foreground/60 text-left">
                  Sign up / Log in
                </button>
                <a href="#" className="text-xl font-medium hover:text-foreground/60 text-foreground/70">
                  Documentation
                </a>
              </div>
            </nav>
          </div>
        </motion.div>
      )}
      </AnimatePresence>

      {/* Hero Section */}
      <div id="system">
        <HeroSection onStartFree={onEnterApp} onWatchDemo={() => {}} />
      </div>

      {/* Integrations Marquee Carousel */}
      <div className="py-6 border-b border-border bg-background overflow-hidden flex items-center group">
        <motion.div 
          animate={{ x: ["0%", "-50%"] }}
          transition={{ duration: 35, ease: "linear", repeat: Infinity }}
          className="flex whitespace-nowrap items-center text-[10px] font-mono uppercase tracking-widest text-foreground/50 gap-16 group-hover:[animation-play-state:paused]"
        >
          {/* Double the array for seamless infinite scrolling */}
          {[...integrations, ...integrations].map((integration, i) => (
            <div key={i} className="flex shrink-0 items-center justify-center hover:text-foreground transition-colors cursor-default opacity-60 hover:opacity-100">
              {integration.src ? (
                <img 
                  src={integration.src} 
                  alt={integration.name} 
                  className={`w-8 h-8 sm:w-10 sm:h-10 shrink-0 object-contain ${integration.name === "Slack" ? "brightness-0 invert" : ""}`}
                />
              ) : (
                <div className="w-1.5 h-1.5 rounded-none bg-foreground/30 shrink-0" />
              )}
            </div>
          ))}
        </motion.div>
      </div>

      {/* 02 — HOW CHRONOS WORKS */}
      <section id="how-it-works" className="py-32 px-4 sm:px-8 lg:px-12 border-b border-border">
        <div className="max-w-[90vw] mx-auto w-full relative">
          <div className="flex flex-col md:flex-row justify-between items-start mb-16 gap-8">
            <span className="text-[10px] font-mono uppercase tracking-widest text-foreground/50">
              [ 02 ] HOW CHRONOS WORKS
            </span>
            <h2 className="text-3xl sm:text-5xl lg:text-6xl font-medium tracking-tight max-w-3xl leading-[1.1]">
              traditional productivity tools are static databases. <br className="hidden sm:block" />
              chronos is an active engine.
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-0 border border-border">
            {/* Block 1 */}
            <div className="p-8 sm:p-12 border-b md:border-b-0 md:border-r border-border hover:bg-surface-hover transition-colors">
              <div className="text-[10px] font-mono uppercase tracking-widest mb-8 text-foreground/50">01 / INPUT</div>
              <h3 className="text-2xl font-medium mb-4">Intent & Context</h3>
              <p className="text-foreground/70 font-light leading-relaxed">
                Connect your long-term goals, dump your daily tasks, and set your baseline habits. Chronos ingests your intentions without forcing manual time-boxing.
              </p>
            </div>
            
            {/* Block 2 */}
            <div className="p-8 sm:p-12 border-b md:border-b-0 md:border-r border-border hover:bg-surface-hover transition-colors">
              <div className="text-[10px] font-mono uppercase tracking-widest mb-8 text-foreground/50">02 / COMPUTE</div>
              <h3 className="text-2xl font-medium mb-4">Heuristic Engine</h3>
              <p className="text-foreground/70 font-light leading-relaxed">
                The local system analyzes deadlines, cognitive load, and your calendar availability to compute the optimal daily execution path.
              </p>
            </div>

            {/* Block 3 */}
            <div className="p-8 sm:p-12 hover:bg-surface-hover transition-colors">
              <div className="text-[10px] font-mono uppercase tracking-widest mb-8 text-foreground/50">03 / OUTPUT</div>
              <h3 className="text-2xl font-medium mb-4">Adaptive Action</h3>
              <p className="text-foreground/70 font-light leading-relaxed">
                You receive a fluid, auto-balancing schedule. Miss a session? The system silently recalculates and shifts items into buffer blocks. Zero guilt.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 03 — ADAPTIVE INTELLIGENCE (Visual block with heavy typography) */}
      <section id="intelligence" className="py-32 px-4 sm:px-8 lg:px-12 bg-foreground text-background">
        <div className="max-w-[90vw] mx-auto w-full relative">
          <div className="flex flex-col mb-16">
            <span className="text-[10px] font-mono uppercase tracking-widest text-background/50 mb-8">
              [ 03 ] ADAPTIVE INTELLIGENCE
            </span>
            <h2 className="text-4xl sm:text-6xl lg:text-8xl font-medium tracking-tighter leading-[0.9] max-w-5xl">
              chronos takes your intent, acts on it, and recovers from disruptions automatically.
            </h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 pt-16 border-t border-background/20 mt-16">
            <div>
              <div className="flex items-center gap-3 mb-6">
                <Brain className="w-5 h-5 text-background/60" />
                <h3 className="text-2xl font-medium">Cognitive Load Matching</h3>
              </div>
              <p className="text-background/70 font-light text-lg leading-relaxed">
                "You have an optimal 2-hour deep work window free between 9:00 AM and 11:00 AM. Based on your energy patterns, I recommend starting with 'DSA' while focus is at its peak."
              </p>
            </div>
            
            <div>
              <div className="flex items-center gap-3 mb-6">
                <Clock className="w-5 h-5 text-background/60" />
                <h3 className="text-2xl font-medium">Fluid Rescheduling</h3>
              </div>
              <p className="text-background/70 font-light text-lg leading-relaxed">
                "Missed your 2:00 PM study block? I've moved it to tomorrow morning's buffer slot and shifted your low-priority review. Your weekly goal remains 100% on track."
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 04 — MODULES (Bento) */}
      <section id="features" className="py-32 px-4 sm:px-8 lg:px-12 border-b border-border">
        <div className="max-w-[90vw] mx-auto w-full relative">
          <div className="flex flex-col md:flex-row justify-between items-start mb-16 gap-8">
            <span className="text-[10px] font-mono uppercase tracking-widest text-foreground/50">
              [ 04 ] MODULAR ARCHITECTURE
            </span>
            <h2 className="text-3xl sm:text-5xl font-medium tracking-tight max-w-2xl leading-[1.1]">
              configure your own personal operating system.
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            
            {/* Module 1 */}
            <div className="system-panel p-8 aspect-square flex flex-col justify-between group border border-border hover:bg-surface-hover transition-colors bg-background">
              <div className="flex justify-between items-start">
                <span className="text-[10px] font-mono uppercase tracking-widest text-foreground/50">Module / Tasks</span>
                <CheckCircle2 className="w-4 h-4 text-foreground/40" />
              </div>
              <div>
                <h3 className="text-3xl font-medium mb-2">Priority Engine</h3>
                <p className="text-foreground/60 text-sm">Not just a list. An ordered execution stack.</p>
              </div>
            </div>

            {/* Module 2 */}
            <div className="system-panel p-8 aspect-square flex flex-col justify-between group border border-border hover:bg-surface-hover transition-colors bg-background">
              <div className="flex justify-between items-start">
                <span className="text-[10px] font-mono uppercase tracking-widest text-foreground/50">Module / Calendar</span>
                <Calendar className="w-4 h-4 text-foreground/40" />
              </div>
              <div>
                <h3 className="text-3xl font-medium mb-2">Time Blocks</h3>
                <p className="text-foreground/60 text-sm">Visualize your day. Protect your deep work.</p>
              </div>
            </div>

            {/* Module 3 */}
            <div className="system-panel p-8 aspect-square flex flex-col justify-between group border border-border hover:bg-surface-hover transition-colors bg-background">
              <div className="flex justify-between items-start">
                <span className="text-[10px] font-mono uppercase tracking-widest text-foreground/50">Module / Habits</span>
                <Activity className="w-4 h-4 text-foreground/40" />
              </div>
              <div>
                <h3 className="text-3xl font-medium mb-2">Consistency</h3>
                <p className="text-foreground/60 text-sm">GitHub-style heatmaps for your daily routines.</p>
              </div>
            </div>

            {/* Module 4 - Wide */}
            <div className="system-panel p-8 md:col-span-2 lg:col-span-2 flex flex-col justify-between group min-h-[300px] border border-border hover:bg-surface-hover transition-colors bg-background">
              <div className="flex justify-between items-start">
                <span className="text-[10px] font-mono uppercase tracking-widest text-foreground/50">Module / Goals</span>
                <Target className="w-4 h-4 text-foreground/40" />
              </div>
              <div className="mt-8">
                <h3 className="text-4xl font-medium mb-4">Hierarchical Objectives</h3>
                <p className="text-foreground/60 max-w-md">
                  Connect daily micro-actions directly to quarterly objectives. Watch your progress compound visually through the system.
                </p>
                <div className="w-full h-1 bg-border mt-8 relative">
                  <div className="absolute top-0 left-0 h-full w-[65%] bg-foreground" />
                </div>
                <div className="flex justify-between text-[10px] font-mono mt-2 text-foreground/50 tracking-widest">
                  <span>Q3 PROGRESS</span>
                  <span>65.0%</span>
                </div>
              </div>
            </div>

            {/* Module 5 */}
            <div className="system-panel p-8 flex flex-col justify-between group min-h-[300px] border border-border hover:bg-surface-hover transition-colors bg-background">
              <div className="flex justify-between items-start">
                <span className="text-[10px] font-mono uppercase tracking-widest text-foreground/50">Module / Notes</span>
                <FileText className="w-4 h-4 text-foreground/40" />
              </div>
              <div>
                <h3 className="text-3xl font-medium mb-2">Knowledge</h3>
                <p className="text-foreground/60 text-sm">Markdown capture seamlessly linked to your active projects.</p>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 05 — PRICING & CTA */}
      <section id="pricing" className="py-32 px-4 sm:px-8 lg:px-12">
        <div className="max-w-[90vw] mx-auto w-full relative">
          
          <div className="flex flex-col items-start gap-12">
            <h2 className="text-5xl sm:text-7xl lg:text-8xl font-medium tracking-tighter leading-[0.9]">
              system<br/>
              pricing<br/>
              access.
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-0 border border-border w-full max-w-4xl">
              
              <div className="p-8 sm:p-12 border-b md:border-b-0 md:border-r border-border">
                <div className="text-[10px] font-mono uppercase tracking-widest text-foreground/50 mb-8">LOCAL SYSTEM</div>
                <div className="text-5xl font-medium mb-2">$0<span className="text-xl text-foreground/50 font-light">/mo</span></div>
                <p className="text-sm text-foreground/60 mb-8 pb-8 border-b border-border">
                  Everything required for personal life management and local development.
                </p>
                <ul className="space-y-3 text-[10px] font-mono uppercase tracking-widest text-foreground/80">
                  <li>+ unlimited tasks & goals</li>
                  <li>+ habit tracking & heatmaps</li>
                  <li>+ local heuristic engine</li>
                  <li>+ open source core</li>
                </ul>
                <button onClick={onEnterApp} className="w-full mt-12 py-4 bg-foreground text-background font-medium hover:bg-foreground/90 transition-colors uppercase text-xs tracking-widest font-mono">
                  initialize
                </button>
              </div>

              <div className="p-8 sm:p-12">
                <div className="text-[10px] font-mono uppercase tracking-widest text-[#FF8C61] mb-8">CLOUD / PRO</div>
                <div className="text-5xl font-medium mb-2">$12<span className="text-xl text-foreground/50 font-light">/mo</span></div>
                <p className="text-sm text-foreground/60 mb-8 pb-8 border-b border-border">
                  For users requiring continuous cloud sync, advanced LLM inference, and team spaces.
                </p>
                <ul className="space-y-3 text-[10px] font-mono uppercase tracking-widest text-foreground/80">
                  <li>+ cross-device real-time sync</li>
                  <li>+ gemini / claude integration</li>
                  <li>+ calendar 2-way sync</li>
                  <li>+ priority support</li>
                </ul>
                <button onClick={onEnterApp} className="w-full mt-12 py-4 border border-foreground text-foreground font-medium hover:bg-surface-hover transition-colors uppercase text-xs tracking-widest font-mono">
                  upgrade
                </button>
              </div>

            </div>
          </div>

        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-foreground text-background pt-32 pb-12 px-4 sm:px-8 lg:px-12 relative overflow-hidden">
        <div className="max-w-[90vw] mx-auto w-full relative z-10">
          
          {/* Massive Branding */}
          <div className="mb-24 flex flex-col">
            <h2 className="text-7xl sm:text-[12vw] leading-[0.8] font-medium tracking-tighter mix-blend-difference mb-8">
              CHRONOS.
            </h2>
            <div className="w-full h-[1px] bg-background/20" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-24">
            
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center gap-2 mb-6">
                <div className="flex gap-0.5">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="w-2 h-6 bg-background" />
                  ))}
                </div>
              </div>
              <p className="text-background/70 text-sm font-light max-w-sm leading-relaxed">
                An open-source, local-first temporal operating system designed for uncompromising focus and intelligence.
              </p>
            </div>
            
            <div className="col-span-1 flex flex-col gap-4 text-xs font-mono uppercase tracking-widest">
              <div className="text-background/40 mb-4">SYSTEM</div>
              <a href="#how-it-works" className="hover:text-background/90 transition-colors">How it works</a>
              <a href="#intelligence" className="hover:text-background/90 transition-colors">Intelligence</a>
              <a href="#features" className="hover:text-background/90 transition-colors">Modules</a>
              <a href="#pricing" className="hover:text-background/90 transition-colors">Pricing</a>
            </div>

            <div className="col-span-1 flex flex-col gap-4 text-xs font-mono uppercase tracking-widest">
              <div className="text-background/40 mb-4">RESOURCES</div>
              <a href="#" className="hover:text-background/90 transition-colors">Documentation</a>
              <a href="#" className="hover:text-background/90 transition-colors">GitHub Repository</a>
              <a href="#" className="hover:text-background/90 transition-colors">Twitter / X</a>
              <a href="#" className="hover:text-background/90 transition-colors">Terms of Service</a>
            </div>

          </div>

          <div className="w-full h-[1px] bg-background/20 mb-8" />
          
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 text-[10px] font-mono uppercase tracking-widest text-background/50">
            <div>© {new Date().getFullYear()} CHRONOS // ALL RIGHTS RESERVED.</div>
            <div className="flex items-center gap-6">
              <span>DESIGNED FOR FOCUS</span>
              <span>VERSION 1.0.0</span>
            </div>
          </div>
        </div>
      </footer>

    </div>
  );
};

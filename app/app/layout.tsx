"use client";

import React, { useEffect, useState, useRef } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import { Sidebar, TabType } from "../../components/layout/Sidebar";
import { TopNav } from "../../components/layout/TopNav";
import { CommandPalette } from "../../components/layout/CommandPalette";
import { OnboardingFlow } from "../../features/onboarding/OnboardingFlow";
import { ContextualTour } from "../../features/onboarding/ContextualTour";
import { ThinkingOrb } from "@/components/ui/thinking-orbs";
import gsap from "gsap";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const layoutRef = useRef<HTMLDivElement>(null);
  
  // Onboarding State
  const [isCheckingOnboarding, setIsCheckingOnboarding] = useState(true);
  const [needsOnboarding, setNeedsOnboarding] = useState(false);
  const [showTour, setShowTour] = useState(false);

  // Mobile Nav State
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

  useEffect(() => {
    setMounted(true);

    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setIsCommandPaletteOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    } else if (status === "authenticated") {
      fetch("/api/user/onboarding")
        .then(res => res.json())
        .then(data => {
          if (data.success && data.data && !data.data.hasCompletedOnboarding) {
            setNeedsOnboarding(true);
          }
        })
        .catch(console.error)
        .finally(() => setIsCheckingOnboarding(false));
    }
  }, [status, router]);

  const isLoading = !mounted || status === "loading" || status === "unauthenticated" || isCheckingOnboarding;

  useEffect(() => {
    if (!isLoading && layoutRef.current) {
      const ctx = gsap.context(() => {
        gsap.fromTo(
          ".gsap-sidebar",
          { x: -50, opacity: 0 },
          { x: 0, opacity: 1, duration: 0.8, ease: "power3.out" }
        );
        gsap.fromTo(
          ".gsap-topnav",
          { y: -30, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.8, ease: "power3.out", delay: 0.1 }
        );
        gsap.fromTo(
          ".gsap-content",
          { opacity: 0, y: 20 },
          { opacity: 1, y: 0, duration: 0.8, ease: "power3.out", delay: 0.2 }
        );
      }, layoutRef);

      return () => ctx.revert();
    }
  }, [isLoading]);

  const completeOnboarding = async (primaryGoal?: string) => {
    setNeedsOnboarding(false);
    setShowTour(true);
    try {
      await fetch("/api/user/onboarding", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ primaryGoal }),
      });
    } catch (e) {
      console.error("Failed to save onboarding state", e);
    }
  };

  const skipOnboarding = async () => {
    setNeedsOnboarding(false);
    try {
      await fetch("/api/user/onboarding", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ primaryGoal: "SKIPPED" }),
      });
    } catch (e) {
      console.error("Failed to skip onboarding", e);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col gap-6 items-center justify-center bg-background">
        <ThinkingOrb state="working" size={64} theme="dark" />
        <span className="text-sm font-mono tracking-widest uppercase text-foreground/50 animate-pulse">Initializing System...</span>
      </div>
    );
  }

  // Derive active tab from pathname
  const segments = pathname.split("/");
  const currentTab = (segments[2] as TabType) || "dashboard";

  return (
    <div ref={layoutRef} className="h-screen w-full flex bg-background overflow-hidden text-foreground selection:bg-foreground selection:text-background font-sans relative">
      {/* Sidebar - Premium Black */}
      {isMobileNavOpen && (
        <div 
          className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm lg:hidden"
          onClick={() => setIsMobileNavOpen(false)}
        />
      )}
      <div 
        id="chronos-sidebar" 
        className={`gsap-sidebar fixed inset-y-0 left-0 z-50 transform transition-transform duration-300 lg:relative lg:translate-x-0 ${isMobileNavOpen ? "translate-x-0" : "-translate-x-full"} flex shrink-0 h-full border-r border-border`}
      >
        <Sidebar 
          activeTab={currentTab} 
          setActiveTab={(tab) => {
            router.push(`/app/${tab}`);
            setIsMobileNavOpen(false);
          }}
          onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
          onSignOut={() => signOut({ callbackUrl: "/login" })}
          onOpenTour={() => {
            setIsMobileNavOpen(false);
            setShowTour(true);
          }}
        />
      </div>

      {/* Main Content Area */}
      <main className="flex-1 min-w-0 flex flex-col relative overflow-hidden">
        <div className="gsap-topnav">
          <TopNav 
            activeTab={currentTab}
            onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
            onToggleMobileMenu={() => setIsMobileNavOpen(!isMobileNavOpen)}
          />
        </div>
        
        <div id="dashboard-canvas" className="gsap-content flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
          {children}
        </div>
      </main>

      <CommandPalette 
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        onNavigate={(tab) => router.push(`/app/${tab}`)}
      />

      {needsOnboarding && (
        <OnboardingFlow 
          onComplete={completeOnboarding} 
          onSkip={skipOnboarding} 
        />
      )}

      {showTour && (
        <ContextualTour onComplete={() => setShowTour(false)} />
      )}
    </div>
  );
}

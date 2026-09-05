"use client";

import React, { useEffect, useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import { Loader2 } from "lucide-react";
import { Sidebar, TabType } from "../../components/layout/Sidebar";
import { TopNav } from "../../components/layout/TopNav";
import { CommandPalette } from "../../components/layout/CommandPalette";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);

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
    }
  }, [status, router]);

  if (!mounted || status === "loading" || status === "unauthenticated") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0B0910]">
        <Loader2 className="w-8 h-8 text-white/50 animate-spin" />
      </div>
    );
  }

  // Derive active tab from pathname
  const segments = pathname.split("/");
  const currentTab = (segments[2] as TabType) || "dashboard";

  return (
    <div className="h-screen w-full flex bg-background overflow-hidden text-foreground selection:bg-foreground selection:text-background font-sans">
      {/* Sidebar - Premium Black */}
      <div className="relative z-30 flex shrink-0 h-full border-r border-border">
        <Sidebar 
          activeTab={currentTab} 
          setActiveTab={(tab) => router.push(`/app/${tab}`)}
          onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
          onSignOut={() => signOut({ callbackUrl: "/login" })}
        />
      </div>

      {/* Main Content Area */}
      <main className="flex-1 min-w-0 flex flex-col relative overflow-hidden">
        <TopNav 
          activeTab={currentTab}
          onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
        />
        
        <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
          {children}
        </div>
      </main>

      <CommandPalette 
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
      />
    </div>
  );
}

"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import "lenis/dist/lenis.css";
import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";
import { usePathname } from "next/navigation";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export function SmoothScrollProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  useEffect(() => {
    // Disable smooth scrolling in the application dashboard
    if (pathname.startsWith("/app")) {
      return;
    }

    const lenis = new Lenis({
      lerp: 0.1, // Smoothness
      wheelMultiplier: 1.2, // Faster wheel scrolling
    });

    lenis.on("scroll", ScrollTrigger.update);

    // Add GSAP ticker integration
    gsap.ticker.add((time) => {
      lenis.raf(time * 1000);
    });
    gsap.ticker.lagSmoothing(0);

    // Scroll to top on route change
    window.scrollTo(0, 0);
    lenis.scrollTo(0, { immediate: true });

    return () => {
      gsap.ticker.remove((time) => {
        lenis.raf(time * 1000);
      });
      lenis.destroy();
    };
  }, [pathname]);

  return <>{children}</>;
}

import type { Metadata } from "next";
import { Geist, Geist_Mono, Outfit } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/components/providers/AuthProvider";
import { QueryProvider } from "@/components/providers/QueryProvider";
import { GlobalLoader } from "@/components/GlobalLoader";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

import { SmoothScrollProvider } from "@/components/providers/SmoothScrollProvider";

export const metadata: Metadata = {
  title: "Chronos — AI Operating System for Life",
  description: "An AI operating system that plans your day, organizes your goals, adapts to your schedule, and helps you focus on what matters.",
  keywords: ["Chronos", "AI Operating System", "Productivity", "Time Blocking", "Goals", "Habits", "Smart Assistant"],
  icons: {
    icon: [
      { url: '/icon.svg', type: 'image/svg+xml' }
    ]
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${outfit.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body 
        className="min-h-full flex flex-col bg-background text-foreground overflow-x-hidden selection:bg-foreground selection:text-background font-sans"
        suppressHydrationWarning
      >
        <QueryProvider>
          <SmoothScrollProvider>
            <AuthProvider>
              <GlobalLoader />
              {children}
            </AuthProvider>
          </SmoothScrollProvider>
        </QueryProvider>
      </body>
    </html>
  );
}

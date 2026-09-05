"use client";

import React from "react";
import { WidgetCanvas } from "../../../features/dashboard/engine/WidgetCanvas";
import { useRouter } from "next/navigation";

export default function DashboardPage() {
  const router = useRouter();

  return (
    <div className="w-full relative z-10">
      <WidgetCanvas 
        onNavigate={(tab) => router.push(`/app/${tab}`)}
        onOpenCommandPalette={() => {
          window.dispatchEvent(
            new KeyboardEvent("keydown", {
              key: "k",
              metaKey: true,
              bubbles: true,
            })
          );
        }}
      />
    </div>
  );
}

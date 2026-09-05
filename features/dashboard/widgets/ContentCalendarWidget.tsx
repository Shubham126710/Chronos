"use client";

import React, { useState } from "react";

import clsx from "clsx";

export const ContentCalendarWidget: React.FC = () => {
  return (
    <div className="flex flex-col h-full min-h-[160px] p-4 text-[10px] font-mono uppercase tracking-widest text-foreground/40">
      <div>[ NO CONTENT SCHEDULED ]</div>
    </div>
  );
};

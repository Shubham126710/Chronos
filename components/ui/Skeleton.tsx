import React from "react";
import clsx from "clsx";

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
  count?: number;
}

export function Skeleton({ className, count = 1, ...props }: SkeletonProps) {
  if (count > 1) {
    return (
      <div className="flex flex-col gap-3 w-full">
        {Array.from({ length: count }).map((_, i) => (
          <div
            key={i}
            className={clsx("animate-pulse bg-border-subtle h-12 w-full", className)}
            {...props}
          />
        ))}
      </div>
    );
  }

  return (
    <div
      className={clsx("animate-pulse bg-border-subtle h-full w-full", className)}
      {...props}
    />
  );
}

export function SkeletonText({ className, lines = 1 }: { className?: string, lines?: number }) {
  return (
    <div className="flex flex-col gap-2 w-full">
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className={clsx(
            "animate-pulse bg-border-subtle h-3",
            i === lines - 1 ? "w-2/3" : "w-full",
            className
          )}
        />
      ))}
    </div>
  );
}

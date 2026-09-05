"use client";

import React from "react";
import { AlertTriangle, RefreshCcw } from "lucide-react";

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Widget Error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center h-full min-h-[160px] p-4 text-center border border-destructive/20 bg-destructive/5 font-mono">
          <AlertTriangle className="w-5 h-5 text-destructive mb-3" />
          <div className="text-[10px] uppercase tracking-widest text-destructive font-medium mb-1">
            MODULE FAILURE
          </div>
          <div className="text-[9px] uppercase tracking-widest text-foreground/50 mb-4 max-w-[80%] truncate">
            {this.state.error?.message || "SYSTEM ENCOUNTERED AN ANOMALY"}
          </div>
          <button
            onClick={() => this.setState({ hasError: false, error: undefined })}
            className="flex items-center gap-2 px-3 py-1.5 border border-border hover:bg-surface-hover text-foreground transition-colors text-[9px] uppercase tracking-widest"
          >
            <RefreshCcw className="w-3 h-3" />
            <span>REBOOT</span>
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

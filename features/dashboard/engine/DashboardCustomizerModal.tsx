"use client";

import React, { useState } from "react";
import { X, RotateCcw, Save, Check } from "lucide-react";
import clsx from "clsx";
import { createPortal } from "react-dom";
import { WIDGET_CATALOG } from "./WidgetCatalogModal";

interface DashboardCustomizerModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeLayoutId: string;
  widgets: any[];
  onToggleWidget: (widgetType: string, isVisible: boolean) => void;
  onResetToDefault: () => void;
  onSaveAsNew: (name: string) => void;
}

export const DashboardCustomizerModal: React.FC<DashboardCustomizerModalProps> = ({
  isOpen,
  onClose,
  widgets,
  onToggleWidget,
  onResetToDefault,
  onSaveAsNew,
}) => {
  const [newLayoutName, setNewLayoutName] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  if (!isOpen) return null;

  const activeWidgetTypes = new Set(widgets.map((w) => w.widgetType));

  const handleSave = () => {
    if (newLayoutName.trim()) {
      setIsSaving(true);
      onSaveAsNew(newLayoutName);
      setTimeout(() => {
        setIsSaving(false);
        setNewLayoutName("");
        onClose();
      }, 500);
    }
  };

  const modalContent = (
    <div className="fixed inset-0 z-[100] flex flex-col font-mono bg-background">
      {/* Modal */}
      <div className="relative w-full h-full flex flex-col">
        
        {/* Header */}
        <div className="p-6 border-b border-border flex items-center justify-between">
          <div className="flex flex-col gap-1">
            <h2 className="text-xs uppercase tracking-widest text-foreground font-medium">
              [ SYSTEM CONFIGURATION ]
            </h2>
            <p className="text-[10px] uppercase tracking-widest text-foreground/50">
              CONFIGURE ACTIVE MODULES AND WORKSPACE LAYOUT
            </p>
          </div>
          <button 
            onClick={onClose}
            className="text-foreground/50 hover:text-foreground transition-colors p-2"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-12 scrollbar-none">
          
          {/* Module Visibility Toggles */}
          <div>
            <h3 className="text-[10px] font-medium text-foreground uppercase tracking-widest mb-6 border-b border-border pb-2">
              MODULE VISIBILITY
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4">
              {WIDGET_CATALOG.filter(w => !["GITHUB", "WEATHER", "SPOTIFY", "EXTERNAL_AI"].includes(w.type)).map((meta, i) => {
                const isVisible = activeWidgetTypes.has(meta.type);
                const indexStr = (i + 1).toString().padStart(2, '0');
                return (
                  <div key={meta.type} className="flex items-start justify-between group">
                    <div className="flex items-center gap-4">
                      <span className="text-[10px] text-foreground/40 shrink-0">{indexStr}</span>
                      <span className="text-xs uppercase tracking-widest text-foreground">{meta.title}</span>
                    </div>
                    
                    <button 
                      onClick={() => onToggleWidget(meta.type, !isVisible)}
                      className={clsx(
                        "text-[10px] uppercase tracking-widest transition-colors font-bold w-12 text-right",
                        isVisible ? "text-foreground" : "text-foreground/30 hover:text-foreground/60"
                      )}
                    >
                      {isVisible ? "[ON]" : "[OFF]"}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Layout Management */}
          <div>
            <h3 className="text-[10px] font-medium text-foreground uppercase tracking-widest mb-6 border-b border-border pb-2">
              LAYOUT MANAGEMENT
            </h3>
            
            <div className="space-y-6">
              <button 
                onClick={onResetToDefault}
                className="text-[10px] uppercase tracking-widest text-foreground/50 hover:text-foreground transition-colors flex items-center gap-2"
              >
                <RotateCcw className="w-3 h-3" />
                <span>RESTORE FACTORY DEFAULTS</span>
              </button>

              <div className="flex flex-col gap-2 pt-4 border-t border-border">
                <label className="block text-[10px] text-foreground/50 uppercase tracking-widest">
                  SAVE CURRENT STATE
                </label>
                <div className="flex items-center border border-border">
                  <span className="text-foreground/40 px-3 border-r border-border text-[10px]">NEW</span>
                  <input 
                    type="text" 
                    placeholder="ENTER CONFIGURATION NAME..."
                    value={newLayoutName}
                    onChange={(e) => setNewLayoutName(e.target.value)}
                    className="flex-1 bg-transparent px-3 py-2 text-[10px] text-foreground placeholder:text-foreground/30 focus:outline-none uppercase tracking-widest"
                  />
                  <button 
                    onClick={handleSave}
                    disabled={isSaving || !newLayoutName.trim()}
                    className="px-4 py-2 border-l border-border hover:bg-foreground/5 text-foreground text-[10px] uppercase tracking-widest transition-colors disabled:opacity-30 disabled:hover:bg-transparent flex items-center gap-2"
                  >
                    {isSaving ? <Check className="w-3 h-3" /> : <Save className="w-3 h-3" />}
                    <span>{isSaving ? "SAVED" : "COMMIT"}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );

  if (typeof window === "undefined") return null;
  return createPortal(modalContent, document.body);
};

"use client";

import React, { useState } from "react";
import { 
  FileText, Plus, Search, Tag, Layers, Calendar, Edit3, 
  Eye, Save, Trash2, CheckCircle2, Sparkles, FolderGit2
} from "lucide-react";

// Mock data replaced with React Query hook

import { useNotes, NoteItem } from "./api/useNotes";

export const NotesView: React.FC = () => {
  const { notes: fetchedNotes, isLoading, updateNote, createNote } = useNotes();
  const notes = fetchedNotes || [];
  
  const [selectedNote, setSelectedNote] = useState<NoteItem | null>(null);

  React.useEffect(() => {
    if (notes.length > 0 && !selectedNote) {
      handleSelectNote(notes[0]);
    }
  }, [notes, selectedNote]);

  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editContent, setEditContent] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const handleSelectNote = (note: NoteItem) => {
    setSelectedNote(note);
    setEditTitle(note.title);
    setEditContent(note.content);
    setIsEditing(false);
  };

  const handleSave = () => {
    if (!selectedNote) return;
    setIsSaving(true);
    updateNote(selectedNote.id, editTitle, editContent);
    
    // Optimistic UI update
    setSelectedNote({ ...selectedNote, title: editTitle, content: editContent, updatedAt: "Just now" });
    setIsSaving(false);
    setIsEditing(false);
  };

  const handleCreateNew = () => {
    createNote({
      title: "Untitled Executive Note",
      content: `# New Contextual Note\n\nStart typing markdown notes, system design RFCs, or meeting agendas here...`,
      tags: ["New", "Draft"],
    });
    // With real server state, the query invalidation will fetch it, but we won't automatically select it 
    // immediately because we don't know its ID yet until refetch completes.
  };

  return (
    <div className="p-6 sm:p-8 space-y-8 max-w-7xl mx-auto pb-24 font-mono">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-border pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] uppercase tracking-widest text-foreground">CONTEXTUAL KNOWLEDGE BASE</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground uppercase tracking-tight">
            [ NOTES & ARCHIVE ]
          </h2>
          <p className="text-xs sm:text-sm text-foreground/60 mt-0.5 uppercase">
            STUDY STRATEGIES, SYSTEM DESIGN RFCS, AND MEETING NOTES
          </p>
        </div>

        <button
          onClick={handleCreateNew}
          className="px-4 py-2 bg-foreground text-background font-bold text-[10px] uppercase tracking-widest hover:bg-background hover:text-foreground border border-foreground transition-colors flex items-center gap-2"
        >
          <Plus className="w-3 h-3" />
          <span>[ NEW NOTE ]</span>
        </button>
      </div>

      {/* Main Grid: Notes List (4 cols) vs Editor/Preview (8 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Sidebar: Notes List */}
        <div className="lg:col-span-4 space-y-4">
          <div className="relative">
            <Search className="w-3 h-3 text-foreground/40 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="SEARCH NOTES..."
              className="w-full pl-9 pr-4 py-2 bg-background border border-border text-[10px] text-foreground placeholder-foreground/40 focus:outline-none focus:border-foreground uppercase tracking-widest"
            />
          </div>

          <div className="space-y-2">
            {notes.map((note) => {
              const isSelected = selectedNote?.id === note.id;
              return (
                <div
                  key={note.id}
                  onClick={() => handleSelectNote(note)}
                  className={`p-4 border transition-colors cursor-pointer space-y-3 ${
                    isSelected
                      ? "bg-foreground text-background border-foreground"
                      : "bg-background text-foreground border-border hover:border-foreground"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="text-sm font-bold uppercase line-clamp-1">{note.title}</h4>
                  </div>
                  <p className={`text-xs line-clamp-2 uppercase ${isSelected ? 'text-background/70' : 'text-foreground/50'}`}>
                    {note.content.replace(/#/g, "")}
                  </p>
                  <div className={`flex items-center justify-between pt-2 border-t text-[10px] uppercase ${isSelected ? 'border-background/20 text-background/60' : 'border-border text-foreground/40'}`}>
                    <span className="flex items-center gap-1 font-bold">
                      <FolderGit2 className="w-3 h-3" /> {note.attachedToName}
                    </span>
                    <span>{note.updatedAt}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Area: Editor / Preview */}
        <div className="lg:col-span-8 flex flex-col h-full space-y-6">
        {selectedNote ? (
          <div className="flex-1 bg-background border border-foreground/30 flex flex-col min-h-[600px]">
          {/* Editor Header Bar */}
          <div className="px-6 py-4 border-b border-border flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <span className="text-[10px] font-bold uppercase border border-border px-2 py-1 flex items-center gap-2">
                <FolderGit2 className="w-3 h-3" /> LINKED TO {selectedNote.attachedToType}: {selectedNote.attachedToName}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsEditing(!isEditing)}
                className={`px-3 py-1.5 text-[10px] font-bold uppercase flex items-center gap-1.5 transition-colors border ${
                  isEditing 
                    ? "bg-foreground text-background border-foreground" 
                    : "bg-background text-foreground border-border hover:border-foreground"
                }`}
              >
                {isEditing ? <Eye className="w-3 h-3" /> : <Edit3 className="w-3 h-3" />}
                <span>{isEditing ? "PREVIEW" : "EDIT"}</span>
              </button>

              {isEditing && (
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="px-3 py-1.5 bg-foreground text-background font-bold text-[10px] uppercase transition-colors flex items-center gap-1.5 border border-foreground hover:bg-background hover:text-foreground disabled:opacity-50"
                >
                  <Save className="w-3 h-3" />
                  <span>{isSaving ? "SAVING..." : "SAVE"}</span>
                </button>
              )}
            </div>
          </div>

          {/* Editor Title */}
          <div className="p-6 pb-4 border-b border-border">
            {isEditing ? (
              <input
                type="text"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                className="w-full bg-background text-2xl font-bold text-foreground focus:outline-none border-b border-border pb-2 uppercase tracking-widest"
              />
            ) : (
              <h3 className="text-2xl font-bold text-foreground uppercase tracking-widest">{selectedNote.title}</h3>
            )}
            <div className="flex items-center gap-2 mt-4 text-[10px] uppercase font-bold text-foreground/50">
              <span>TAGS:</span>
              {selectedNote.tags.map((tag, idx) => (
                <span key={idx} className="border border-border px-2 py-0.5 text-foreground">
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* Content Area */}
          <div className="p-6 flex-1 overflow-y-auto">
            {isEditing ? (
              <textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                className="w-full h-full min-h-[400px] bg-background text-foreground text-sm focus:outline-none resize-none leading-relaxed"
                placeholder="TYPE MARKDOWN NOTES HERE..."
              />
            ) : (
              <div className="space-y-6 text-sm text-foreground leading-relaxed">
                {selectedNote.content.split("\n\n").map((para, idx) => {
                  if (para.startsWith("# ")) {
                    return <h1 key={idx} className="text-xl font-bold uppercase border-b border-border pb-2">{para.replace("# ", "")}</h1>;
                  }
                  if (para.startsWith("## ")) {
                    return <h2 key={idx} className="text-lg font-bold uppercase mt-4">{para.replace("## ", "")}</h2>;
                  }
                  if (para.startsWith("### ")) {
                    return <h3 key={idx} className="text-base font-bold uppercase mt-2">{para.replace("### ", "")}</h3>;
                  }
                  if (para.startsWith("- ") || para.startsWith("1. ")) {
                    return (
                      <ul key={idx} className="space-y-2 pl-4 border-l border-border">
                        {para.split("\n").map((line, i) => (
                          <li key={i}>{line.replace(/^[-\d.]+\s*/, "• ")}</li>
                        ))}
                      </ul>
                    );
                  }
                  return <p key={idx}>{para}</p>;
                })}
              </div>
            )}
            </div>
          </div>
        ) : null}
        </div>
      </div>
    </div>
  );
};

"use client";

import React, { useState } from "react";
import { 
  FolderGit2, Calendar, Clock, CheckCircle2, FileText, 
  Paperclip, ArrowUpRight, Plus, Sparkles, Target, 
  Layers, ChevronRight, Share2, MoreHorizontal
} from "lucide-react";

// Mock data replaced with React Query hook

import { useProjects, ProjectItem } from "./api/useProjects";

export const ProjectsView: React.FC = () => {
  const { projects: fetchedProjects, isLoading } = useProjects();
  const projects = fetchedProjects || [];
  const [selectedProject, setSelectedProject] = useState<ProjectItem | null>(null);

  React.useEffect(() => {
    if (projects.length > 0 && !selectedProject) {
      setSelectedProject(projects[0]);
    }
  }, [projects, selectedProject]);

  return (
    <div className="p-6 sm:p-8 space-y-8 max-w-7xl mx-auto pb-24 font-mono">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-border pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] uppercase tracking-widest text-foreground/50">Executive Project Hub</span>
            <span className="text-[10px] text-foreground/50 px-2 py-0.5 border border-border">
              [ 3 ACTIVE ROADMAPS ]
            </span>
          </div>
          <h2 className="text-xl font-bold text-foreground tracking-widest uppercase">
            Projects & Resource Management
          </h2>
          <p className="text-[10px] text-foreground/40 mt-1 uppercase tracking-widest">
            Centralize your tasks, timelines, markdown notes, and attached files.
          </p>
        </div>

        <button className="px-4 py-2 border border-foreground text-foreground hover:bg-foreground hover:text-background transition-all uppercase tracking-widest text-[10px]">
          [ NEW PROJECT ROADMAP ]
        </button>
      </div>

      {/* Main Grid: Project Cards (5 cols) vs Project Inspector (7 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left List (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          {projects.map((project) => {
            const isSelected = selectedProject?.id === project.id;
            return (
              <div
                key={project.id}
                onClick={() => setSelectedProject(project)}
                className={`p-6 border transition-all cursor-pointer space-y-4 ${
                  isSelected
                    ? "border-foreground bg-foreground/5"
                    : "border-border hover:border-foreground/50 bg-background"
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] uppercase font-bold px-2 py-0.5 border ${
                      project.status === "ACTIVE" ? "border-foreground text-foreground" : "border-foreground/50 text-foreground/50"
                    }`}>
                      [ {project.status} ]
                    </span>
                    <span className="text-[10px] text-foreground/50 uppercase tracking-widest">DUE: {project.deadline}</span>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-bold text-foreground leading-snug uppercase tracking-widest">{project.name}</h3>
                  <p className="text-[10px] text-foreground/60 mt-2 line-clamp-2 uppercase tracking-widest">{project.description}</p>
                </div>

                {/* Progress Bar */}
                <div className="space-y-2 pt-2 border-t border-border">
                  <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest">
                    <span className="text-foreground/70">COMPLETION</span>
                    <span className="text-foreground">[{project.progress}%]</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 text-[10px] text-foreground/50 uppercase tracking-widest">
                  <span className="flex items-center gap-2 text-foreground/80 font-bold">
                    [ {project.goalName} ]
                  </span>
                  <span>{project.linkedTasksCount} TASKS | {project.linkedNotesCount} NOTES</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right Project Detail Inspector (7 cols) */}
        <div className="lg:col-span-7 space-y-6 sticky top-28">
          {selectedProject ? (
            <div className="bg-background border border-foreground/30 p-6 sm:p-8 space-y-8">
              <div className="border-b border-border pb-6 space-y-4">
                <div className="flex items-center justify-between flex-wrap gap-2 text-[10px] uppercase tracking-widest">
                  <span className="text-foreground/70 border border-border px-2 py-0.5">
                    [ CONNECTED TO: {selectedProject.goalName} ]
                  </span>
                  <span className="font-bold text-foreground border border-foreground px-2 py-0.5">
                    [ DEADLINE: {selectedProject.deadline} ]
                  </span>
                </div>
            <h3 className="text-lg font-bold text-foreground tracking-widest uppercase">{selectedProject.name}</h3>
            <p className="text-[10px] text-foreground/60 leading-relaxed uppercase tracking-widest">{selectedProject.description}</p>
          </div>

          {/* Attached Files & Resources */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-[10px] font-bold text-foreground uppercase tracking-widest">
                [ ATTACHED RESOURCES & SPECS ]
              </h4>
              <button className="text-[10px] text-foreground/70 hover:text-foreground uppercase tracking-widest transition-colors">
                [ + ATTACH FILE ]
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {selectedProject.files.map((file, idx) => (
                <div key={idx} className="p-4 border border-border flex items-center justify-between hover:border-foreground/50 transition-colors group cursor-pointer bg-background">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="text-foreground/50 shrink-0">
                      [F]
                    </div>
                    <div className="min-w-0">
                      <p className="text-[10px] font-bold text-foreground truncate uppercase tracking-widest">{file.name}</p>
                      <p className="text-[10px] text-foreground/40 uppercase tracking-widest">{file.type} | {file.size}</p>
                    </div>
                  </div>
                  <span className="text-[10px] text-foreground/30 group-hover:text-foreground transition-colors shrink-0 ml-2">-&gt;</span>
                </div>
              ))}
            </div>
          </div>

          {/* Linked Tasks Summary */}
          <div className="space-y-4 pt-4 border-t border-border">
            <div className="flex items-center justify-between">
              <h4 className="text-[10px] font-bold text-foreground uppercase tracking-widest">
                [ ACTIVE PROJECT TASKS ({selectedProject.linkedTasksCount}) ]
              </h4>
            </div>

            <div className="space-y-2">
              <div className="p-3 border border-border flex items-center justify-between bg-background">
                <span className="text-[10px] font-bold text-foreground uppercase tracking-widest">DSA: DYNAMIC PROGRAMMING PRACTICE</span>
                <span className="text-[10px] text-foreground border border-foreground px-2">HIGH</span>
              </div>
              <div className="p-3 border border-border flex items-center justify-between bg-background">
                <span className="text-[10px] font-bold text-foreground uppercase tracking-widest">REVIEW RESUME WITH SENIOR MENTOR</span>
                <span className="text-[10px] text-foreground/70 border border-foreground/50 px-2">MEDIUM</span>
              </div>
            </div>
            </div>
          </div>
        ) : null}
        </div>
      </div>
    </div>
  );
};

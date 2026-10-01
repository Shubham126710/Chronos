import { useQuery, useQueryClient } from "@tanstack/react-query";

export interface ProjectItem {
  id: string;
  name: string;
  description: string;
  status: "ACTIVE" | "PLANNING" | "COMPLETED";
  progress: number;
  deadline: string;
  linkedTasksCount: number;
  linkedNotesCount: number;
  files: { name: string; size: string; type: string }[];
  goalName: string;
}

export function useProjects() {
  const queryClient = useQueryClient();

  const { data: projects, isLoading, error } = useQuery<ProjectItem[]>({
    queryKey: ["projects"],
    queryFn: async () => {
      const res = await fetch("/api/projects");
      if (!res.ok) throw new Error("Failed to fetch projects");
      const json = await res.json();
      
      return json.data.map((p: any): ProjectItem => ({
        id: p.id,
        name: p.title,
        description: p.description || "No description provided.",
        status: p.status as any,
        progress: p.progress,
        deadline: p.deadline ? new Date(p.deadline).toLocaleDateString() : "No deadline",
        linkedTasksCount: p._count?.tasks || 0,
        linkedNotesCount: p._count?.notes || 0,
        files: [], // Files not supported yet
        goalName: "Independant Project", // No direct goal mapping yet
      }));
    },
  });

  const createProjectMutation = useMutation({
    mutationFn: async (newProject: Partial<ProjectItem>) => {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newProject.name,
          description: newProject.description,
        }),
      });
      if (!res.ok) throw new Error("Failed to create project");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
    },
  });

  return {
    projects,
    isLoading,
    error,
    createProject: (newProject: Partial<ProjectItem>) => createProjectMutation.mutate(newProject),
  };
}

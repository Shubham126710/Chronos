import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export interface GoalTask {
  id: string;
  title: string;
  isCompleted: boolean;
  priority: string;
  dueDate?: string | null;
}

export interface GoalNode {
  id: string;
  title: string;
  description: string;
  progress: number;
  targetDate: string;
  category: "Career" | "Academic" | "Personal" | "Health";
  linkedTasksCount: number;
  tasks?: GoalTask[];
  children?: GoalNode[];
}

export function useGoals() {
  const queryClient = useQueryClient();

  const { data: goals, isLoading, error } = useQuery<GoalNode[]>({
    queryKey: ["goals"],
    queryFn: async () => {
      const res = await fetch("/api/goals");
      if (!res.ok) throw new Error("Failed to fetch goals");
      const json = await res.json();
      
      const mapGoal = (g: any): GoalNode => ({
        id: g.id,
        title: g.title,
        description: g.description || "No description provided.",
        progress: g.progress || 0,
        targetDate: "Ongoing",
        category: "Career",
        linkedTasksCount: g._count?.tasks || g.tasks?.length || 0,
        tasks: g.tasks || [],
        children: g.children ? g.children.map(mapGoal) : undefined
      });

      return json.data.map(mapGoal);
    },
  });

  const generateRoadmapMutation = useMutation({
    mutationFn: async (goalId: string) => {
      const res = await fetch(`/api/goals/${goalId}/roadmap`, {
        method: "POST",
      });
      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.message || "Failed to generate roadmap");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["goals"] });
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    }
  });

  return {
    goals,
    isLoading,
    error,
    generateRoadmap: (goalId: string) => generateRoadmapMutation.mutateAsync(goalId),
    isGeneratingRoadmap: generateRoadmapMutation.isPending,
  };
}

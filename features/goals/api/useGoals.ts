import { useQuery, useQueryClient } from "@tanstack/react-query";

export interface GoalNode {
  id: string;
  title: string;
  description: string;
  progress: number;
  targetDate: string;
  category: "Career" | "Academic" | "Personal" | "Health";
  linkedTasksCount: number;
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
        targetDate: "Ongoing", // Default as Prisma model lacks this
        category: "Career", // Default as Prisma model lacks this
        linkedTasksCount: g._count?.tasks || 0,
        children: g.children ? g.children.map(mapGoal) : undefined
      });

      return json.data.map(mapGoal);
    },
  });

  return {
    goals,
    isLoading,
    error,
  };
}

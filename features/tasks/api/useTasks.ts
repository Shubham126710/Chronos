import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

interface Task {
  id: string;
  title: string;
  description: string | null;
  isCompleted: boolean;
  priority: string;
  estimatedMinutes: number | null;
  actualMinutes: number | null;
  dueDate: string | null;
  projectId: string | null;
  project: string | null;
  goalId: string | null;
  goal: string | null;
  dependsOn: string | null;
  notesCount: number;
  isRecurring: boolean;
  recurringRule: string | null;
  createdAt: string;
  updatedAt: string;
}

export function useTasks() {
  const queryClient = useQueryClient();

  const { data: tasks, isLoading, error } = useQuery<Task[]>({
    queryKey: ["tasks"],
    queryFn: async () => {
      const res = await fetch("/api/tasks");
      if (!res.ok) throw new Error("Failed to fetch tasks");
      const json = await res.json();
      return json.data.map((t: any) => ({
        id: t.id,
        title: t.title,
        description: t.description,
        isCompleted: t.isCompleted,
        priority: t.priority,
        estimatedMinutes: t.estimatedMinutes,
        actualMinutes: t.actualMinutes,
        dueDate: t.dueDate,
        projectId: t.projectId,
        project: t.project?.title || null,
        goalId: t.goalId,
        goal: t.goal?.title || null,
        dependsOn: t.dependsOn?.title || null,
        notesCount: t.notes?.length || 0,
        isRecurring: t.isRecurring || false,
        recurringRule: t.recurringRule || null,
        createdAt: new Date(t.createdAt).toLocaleString(),
        updatedAt: new Date(t.updatedAt).toLocaleString(),
      }));
    },
  });

  const toggleTaskMutation = useMutation({
    mutationFn: async ({ id, isCompleted }: { id: string; isCompleted: boolean }) => {
      const res = await fetch(`/api/tasks/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isCompleted }),
      });
      if (!res.ok) throw new Error("Failed to update task");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
  });

  const createTaskMutation = useMutation({
    mutationFn: async (newTask: Partial<Task>) => {
      const res = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newTask),
      });
      if (!res.ok) throw new Error("Failed to create task");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
  });

  return {
    tasks,
    isLoading,
    error,
    toggleTask: (id: string, isCompleted: boolean) => toggleTaskMutation.mutate({ id, isCompleted }),
    createTask: (newTask: Partial<Task>) => createTaskMutation.mutate(newTask),
  };
}

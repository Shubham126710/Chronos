import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

interface HabitLog {
  id: string;
  habitId: string;
  date: string;
  completed: boolean;
}

export interface Habit {
  id: string;
  title: string;
  category: string;
  currentStreak: number;
  bestStreak: number;
  completionRate: number;
  targetDays: number;
  logs: HabitLog[];
  isCompletedToday?: boolean;
  history?: boolean[];
}

export function useHabits() {
  const queryClient = useQueryClient();

  const { data: habits, isLoading, error } = useQuery<Habit[]>({
    queryKey: ["habits"],
    queryFn: async () => {
      const res = await fetch("/api/habits");
      if (!res.ok) throw new Error("Failed to fetch habits");
      const json = await res.json();
      
      const todayString = new Date().toISOString().split('T')[0];
      
      return json.data.map((h: Habit) => {
        // Calculate history for the last 14 days (instead of 28 for now, as API returns 14)
        const historyMap = new Map(h.logs.map(log => [log.date, log.completed]));
        const history: boolean[] = [];
        
        for (let i = 13; i >= 0; i--) {
          const d = new Date();
          d.setDate(d.getDate() - i);
          const dateStr = d.toISOString().split('T')[0];
          history.push(!!historyMap.get(dateStr));
        }

        return {
          ...h,
          isCompletedToday: !!historyMap.get(todayString),
          history
        };
      });
    },
  });

  const toggleHabitMutation = useMutation({
    mutationFn: async ({ id, date, completed }: { id: string; date: string; completed: boolean }) => {
      const res = await fetch(`/api/habits/${id}/log`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date, completed }),
      });
      if (!res.ok) throw new Error("Failed to toggle habit log");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["habits"] });
    },
  });

  return {
    habits,
    isLoading,
    error,
    toggleHabit: (id: string, completed: boolean) => {
      const todayString = new Date().toISOString().split('T')[0];
      toggleHabitMutation.mutate({ id, date: todayString, completed });
    }
  };
}

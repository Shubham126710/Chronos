import { useQuery } from "@tanstack/react-query";

interface DashboardStats {
  activeTasks: number;
  completedTasks: number;
  totalGoals: number;
  activeHabits: number;
  longestStreak: number;
  deepWorkHours: number;
}

interface DashboardUser {
  name: string;
  email: string;
  productivityScore: number;
}

export interface DashboardData {
  user: DashboardUser;
  stats: DashboardStats;
  recentTasks: any[];
  upcomingEvents: any[];
}

export function useDashboard() {
  const { data, isLoading, error } = useQuery<DashboardData>({
    queryKey: ["dashboard"],
    queryFn: async () => {
      const res = await fetch("/api/dashboard");
      if (!res.ok) throw new Error("Failed to fetch dashboard data");
      const json = await res.json();
      return json.data;
    },
  });

  return { data, isLoading, error };
}

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export interface TimeBlock {
  id: string;
  title: string;
  startTime: string; // HH:mm format for day view
  endTime: string;
  category: "DeepWork" | "Meeting" | "Buffer" | "Wellness";
  isSynced: boolean;
  alert?: string;
}

export function useCalendar(dateStr?: string, view?: string) {
  const queryClient = useQueryClient();
  const queryParam = new URLSearchParams();
  if (dateStr) queryParam.append("date", dateStr);
  if (view) queryParam.append("view", view);

  const { data: blocks, isLoading, error } = useQuery<TimeBlock[]>({
    queryKey: ["calendar", dateStr, view],
    queryFn: async () => {
      const res = await fetch(`/api/calendar?${queryParam.toString()}`);
      if (!res.ok) throw new Error("Failed to fetch calendar events");
      const json = await res.json();
      
      return json.data.map((event: any): TimeBlock => {
        // Format ISO Date to HH:mm string for the frontend view
        const start = new Date(event.startTime);
        const end = new Date(event.endTime);
        const formatTime = (d: Date) => 
          d.getHours().toString().padStart(2, '0') + ":" + 
          d.getMinutes().toString().padStart(2, '0');

        return {
          id: event.id,
          title: event.title,
          startTime: formatTime(start),
          endTime: formatTime(end),
          category: (event.category === "FOCUS" ? "DeepWork" : 
                    event.category === "MEETING" ? "Meeting" : 
                    event.category === "WELLNESS" ? "Wellness" : "Buffer") as any,
          isSynced: !!event.googleEventId,
        };
      });
    },
  });

  return {
    blocks,
    isLoading,
    error,
  };
}

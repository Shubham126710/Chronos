import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export interface TimeBlock {
  id: string;
  title: string;
  startTime: string; // HH:mm format for day view
  endTime: string;
  category: "DeepWork" | "Meeting" | "Buffer" | "Wellness" | "EXTERNAL";
  isSynced: boolean;
  isGoogleEvent?: boolean;
  color?: string;
  alert?: string;
}

export function useCalendar(dateStr?: string, view?: string) {
  const queryClient = useQueryClient();
  const queryParam = new URLSearchParams();
  if (dateStr) queryParam.append("date", dateStr);
  if (view) queryParam.append("view", view);

  const { data, isLoading, error } = useQuery<{ blocks: TimeBlock[], isGoogleConnected: boolean }>({
    queryKey: ["calendar", dateStr, view],
    queryFn: async () => {
      const res = await fetch(`/api/calendar?${queryParam.toString()}`);
      if (!res.ok) throw new Error("Failed to fetch calendar events");
      const json = await res.json();
      
      const mappedBlocks = json.data.map((event: any): TimeBlock => {
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
                    event.category === "WELLNESS" ? "Wellness" : 
                    event.category === "EXTERNAL" ? "EXTERNAL" : "Buffer") as any,
          isSynced: !!event.googleEventId,
          isGoogleEvent: !!event.isGoogleEvent,
          color: event.color,
        };
      });

      return {
        blocks: mappedBlocks,
        isGoogleConnected: json.isGoogleConnected,
      };
    },
  });

  return {
    blocks: data?.blocks,
    isGoogleConnected: data?.isGoogleConnected,
    isLoading,
    error,
  };
}

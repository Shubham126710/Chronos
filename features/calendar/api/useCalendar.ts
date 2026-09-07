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

  const createEventMutation = useMutation({
    mutationFn: async (newEvent: Partial<TimeBlock> & { date: string }) => {
      // Start time needs to include the selected date
      const startTime = new Date(`${newEvent.date}T${newEvent.startTime}:00`).toISOString();
      const endTime = new Date(`${newEvent.date}T${newEvent.endTime}:00`).toISOString();

      const res = await fetch("/api/calendar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newEvent.title,
          startTime,
          endTime,
          category: newEvent.category === "DeepWork" ? "FOCUS" : newEvent.category,
          isTimeBlock: true,
          color: newEvent.color || "#7B5CFF",
        }),
      });
      if (!res.ok) throw new Error("Failed to create event");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["calendar"] });
    },
  });

  const updateEventMutation = useMutation({
    mutationFn: async ({ id, title, startTime, endTime, category, date }: Partial<TimeBlock> & { id: string, date: string }) => {
      const startIso = startTime ? new Date(`${date}T${startTime}:00`).toISOString() : undefined;
      const endIso = endTime ? new Date(`${date}T${endTime}:00`).toISOString() : undefined;

      const res = await fetch(`/api/calendar/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          startTime: startIso,
          endTime: endIso,
          category: category === "DeepWork" ? "FOCUS" : category,
        }),
      });
      if (!res.ok) throw new Error("Failed to update event");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["calendar"] });
    },
  });

  const deleteEventMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/calendar/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete event");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["calendar"] });
    },
  });

  return {
    blocks: data?.blocks,
    isGoogleConnected: data?.isGoogleConnected,
    isLoading,
    error,
    createEvent: (event: Partial<TimeBlock> & { date: string }) => createEventMutation.mutate(event),
    updateEvent: (event: Partial<TimeBlock> & { id: string, date: string }) => updateEventMutation.mutate(event),
    deleteEvent: (id: string) => deleteEventMutation.mutate(id),
  };
}

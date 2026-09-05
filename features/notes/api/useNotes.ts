import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export interface NoteItem {
  id: string;
  title: string;
  content: string;
  updatedAt: string;
  attachedToType: "Project" | "Task" | "Goal" | "Meeting" | "General";
  attachedToName: string;
  tags: string[];
}

export function useNotes() {
  const queryClient = useQueryClient();

  const { data: notes, isLoading, error } = useQuery<NoteItem[]>({
    queryKey: ["notes"],
    queryFn: async () => {
      const res = await fetch("/api/notes");
      if (!res.ok) throw new Error("Failed to fetch notes");
      const json = await res.json();
      
      return json.data.map((n: any): NoteItem => ({
        id: n.id,
        title: n.title,
        content: n.content || "",
        updatedAt: new Date(n.updatedAt).toLocaleString(),
        attachedToType: n.attachedToType as any,
        attachedToName: n.attachedToName,
        tags: n.tags,
      }));
    },
  });

  const updateNoteMutation = useMutation({
    mutationFn: async ({ id, title, content }: { id: string; title: string; content: string }) => {
      const res = await fetch(`/api/notes/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, content }),
      });
      if (!res.ok) throw new Error("Failed to update note");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notes"] });
    },
  });

  const createNoteMutation = useMutation({
    mutationFn: async (newNote: Partial<NoteItem>) => {
      const res = await fetch("/api/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newNote),
      });
      if (!res.ok) throw new Error("Failed to create note");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notes"] });
    },
  });

  return {
    notes,
    isLoading,
    error,
    updateNote: (id: string, title: string, content: string) => updateNoteMutation.mutate({ id, title, content }),
    createNote: (newNote: Partial<NoteItem>) => createNoteMutation.mutate(newNote),
  };
}

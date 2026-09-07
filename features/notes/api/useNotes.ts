import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export interface NoteItem {
  id: string;
  title: string;
  content: string;
  updatedAt: string;
  attachedToType: "Project" | "Task" | "Goal" | "Meeting" | "General" | "Notion";
  attachedToName: string;
  tags: string[];
  isNotion?: boolean;
}

export function useNotes() {
  const queryClient = useQueryClient();

  const { data: notes, isLoading, error } = useQuery<NoteItem[]>({
    queryKey: ["notes"],
    queryFn: async () => {
      const [localRes, notionRes] = await Promise.all([
        fetch("/api/notes"),
        fetch("/api/integrations/notion/pages").catch(() => null)
      ]);

      if (!localRes.ok) throw new Error("Failed to fetch notes");

      const localJson = await localRes.json();
      const localNotes = localJson.data.map((n: any): NoteItem => ({
        id: n.id,
        title: n.title,
        content: n.content || "",
        updatedAt: new Date(n.updatedAt).toLocaleString(),
        attachedToType: n.attachedToType as any,
        attachedToName: n.attachedToName,
        tags: n.tags,
      }));

      let notionNotes: NoteItem[] = [];
      if (notionRes && notionRes.ok) {
        const notionJson = await notionRes.json();
        if (notionJson.success) {
          notionNotes = notionJson.data;
        }
      }

      return [...localNotes, ...notionNotes].sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
    },
  });

  const getNoteContent = async (id: string) => {
    if (id.startsWith("notion-")) {
      const res = await fetch(`/api/integrations/notion/pages/${id}`);
      if (res.ok) {
        const json = await res.json();
        return json.data.content;
      }
    }
    // Local notes content is already loaded in list
    return null;
  };

  const updateNoteMutation = useMutation({
    mutationFn: async ({ id, title, content }: { id: string; title: string; content: string }) => {
      const endpoint = id.startsWith("notion-") ? `/api/integrations/notion/pages/${id}` : `/api/notes/${id}`;
      const res = await fetch(endpoint, {
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
    mutationFn: async (newNote: Partial<NoteItem> & { isNotion?: boolean }) => {
      const endpoint = newNote.isNotion ? "/api/integrations/notion/pages" : "/api/notes";
      const res = await fetch(endpoint, {
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
    getNoteContent,
    updateNote: (id: string, title: string, content: string) => updateNoteMutation.mutate({ id, title, content }),
    createNote: (newNote: Partial<NoteItem>) => createNoteMutation.mutate(newNote),
  };
}

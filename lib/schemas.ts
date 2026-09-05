import { z } from "zod";

export const taskSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional().nullable(),
  priority: z.enum(["low", "medium", "high", "urgent"]).optional().default("medium"),
  status: z.enum(["todo", "in_progress", "done"]).optional().default("todo"),
  tags: z.string().optional().nullable(),
  dueDate: z.string().optional().nullable(),
  isCompleted: z.boolean().optional().default(false),
});

export const updateTaskSchema = taskSchema.partial();

export const goalSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional().nullable(),
  progress: z.number().min(0).max(100).optional().default(0),
  status: z.string().optional().default("ACTIVE"),
  parentId: z.string().optional().nullable(),
});

export const updateGoalSchema = goalSchema.partial();

export const projectSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional().nullable(),
  status: z.string().optional().default("ACTIVE"),
  progress: z.number().min(0).max(100).optional().default(0),
  deadline: z.string().optional().nullable(),
  color: z.string().optional().default("#5227FF"),
});

export const updateProjectSchema = projectSchema.partial();

export const habitSchema = z.object({
  title: z.string().min(1, "Title is required"),
  category: z.string().optional().default("CODING"),
  targetDays: z.number().int().min(1).optional().default(7),
});

export const updateHabitSchema = habitSchema.partial();

export const noteSchema = z.object({
  title: z.string().min(1, "Title is required"),
  content: z.string().optional().default(""),
  tags: z.string().optional().nullable(),
  projectId: z.string().optional().nullable(),
  taskId: z.string().optional().nullable(),
  goalId: z.string().optional().nullable(),
});

export const updateNoteSchema = noteSchema.partial();

export const calendarEventSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional().nullable(),
  startTime: z.string(),
  endTime: z.string(),
  type: z.enum(["focus", "meeting", "break", "task", "other"]).optional().default("focus"),
});

export const updateCalendarEventSchema = calendarEventSchema.partial();

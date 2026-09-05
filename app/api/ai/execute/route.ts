import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/route";
import { z } from "zod";

const TaskSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]).optional().default("MEDIUM"),
  estimatedMinutes: z.number().optional().default(30),
  dueDate: z.string().optional(),
});

const TaskUpdateSchema = z.object({
  id: z.string(),
  title: z.string().optional(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]).optional(),
  isCompleted: z.boolean().optional(),
  dueDate: z.string().optional(),
});

const EventSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  startTime: z.string(),
  endTime: z.string(),
  category: z.string().optional().default("FOCUS"),
});

const EventUpdateSchema = z.object({
  id: z.string(),
  title: z.string().optional(),
  startTime: z.string().optional(),
  endTime: z.string().optional(),
});

const GoalSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  status: z.string().optional().default("ACTIVE"),
  progress: z.number().optional().default(0),
});

const GoalUpdateSchema = z.object({
  id: z.string(),
  title: z.string().optional(),
  status: z.string().optional(),
  progress: z.number().optional(),
});

const HabitSchema = z.object({
  title: z.string().min(1, "Title is required"),
  category: z.string().optional().default("GENERAL"),
  targetDays: z.number().optional().default(7),
});

const SlackSchema = z.object({
  channel: z.string().optional().default("#general"),
  message: z.string().min(1, "Message is required"),
});

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }
    const userId = (session.user as any).id;
    const body = await req.json();
    const { operations } = body;

    if (!operations || !Array.isArray(operations)) {
      return NextResponse.json({ success: false, message: "Invalid operations payload" }, { status: 400 });
    }

    const results = [];

    // Execute operations sequentially to ensure DB consistency
    for (const op of operations) {
      try {
        if (op.type === "CREATE_TASK") {
          const parsed = TaskSchema.safeParse(op.payload);
          if (!parsed.success) {
            results.push({ type: op.type, status: "error", message: parsed.error.message });
            continue;
          }
          const data = parsed.data;
          const task = await prisma.task.create({
            data: {
              userId,
              title: data.title,
              description: data.description || "",
              priority: data.priority,
              estimatedMinutes: data.estimatedMinutes,
              dueDate: data.dueDate ? new Date(data.dueDate) : null,
            }
          });
          results.push({ type: op.type, status: "success", id: task.id });
        } 
        else if (op.type === "UPDATE_TASK") {
          const parsed = TaskUpdateSchema.safeParse(op.payload);
          if (!parsed.success) {
            results.push({ type: op.type, status: "error", message: parsed.error.message });
            continue;
          }
          const data = parsed.data;
          // Verify ownership first
          const existing = await prisma.task.findUnique({ where: { id: data.id } });
          if (existing && existing.userId === userId) {
            const updateData: any = {};
            if (data.title) updateData.title = data.title;
            if (data.priority) updateData.priority = data.priority;
            if (data.isCompleted !== undefined) updateData.isCompleted = data.isCompleted;
            if (data.dueDate) updateData.dueDate = new Date(data.dueDate);
            
            await prisma.task.update({
              where: { id: data.id },
              data: updateData
            });
            results.push({ type: op.type, status: "success", id: data.id });
          } else {
            results.push({ type: op.type, status: "error", message: "Task not found or unauthorized" });
          }
        }
        else if (op.type === "DELETE_TASK") {
          const parsed = z.object({ id: z.string() }).safeParse(op.payload);
          if (!parsed.success) {
            results.push({ type: op.type, status: "error", message: parsed.error.message });
            continue;
          }
          const data = parsed.data;
          const existing = await prisma.task.findUnique({ where: { id: data.id } });
          if (existing && existing.userId === userId) {
            await prisma.task.delete({ where: { id: data.id } });
            results.push({ type: op.type, status: "success", id: data.id });
          } else {
            results.push({ type: op.type, status: "error", message: "Task not found or unauthorized" });
          }
        }
        else if (op.type === "CREATE_EVENT") {
          const parsed = EventSchema.safeParse(op.payload);
          if (!parsed.success) {
            results.push({ type: op.type, status: "error", message: parsed.error.message });
            continue;
          }
          const data = parsed.data;
          const event = await prisma.calendarEvent.create({
            data: {
              userId,
              title: data.title,
              description: data.description || "",
              startTime: new Date(data.startTime),
              endTime: new Date(data.endTime),
              category: data.category,
            }
          });
          results.push({ type: op.type, status: "success", id: event.id });
        }
        else if (op.type === "UPDATE_EVENT") {
          const parsed = EventUpdateSchema.safeParse(op.payload);
          if (!parsed.success) {
            results.push({ type: op.type, status: "error", message: parsed.error.message });
            continue;
          }
          const data = parsed.data;
          const existing = await prisma.calendarEvent.findUnique({ where: { id: data.id } });
          if (existing && existing.userId === userId) {
            const updateData: any = {};
            if (data.title) updateData.title = data.title;
            if (data.startTime) updateData.startTime = new Date(data.startTime);
            if (data.endTime) updateData.endTime = new Date(data.endTime);
            
            await prisma.calendarEvent.update({
              where: { id: data.id },
              data: updateData
            });
            results.push({ type: op.type, status: "success", id: data.id });
          } else {
            results.push({ type: op.type, status: "error", message: "Event not found or unauthorized" });
          }
        }
        else if (op.type === "DELETE_EVENT") {
          const parsed = z.object({ id: z.string() }).safeParse(op.payload);
          if (!parsed.success) {
            results.push({ type: op.type, status: "error", message: parsed.error.message });
            continue;
          }
          const data = parsed.data;
          const existing = await prisma.calendarEvent.findUnique({ where: { id: data.id } });
          if (existing && existing.userId === userId) {
            await prisma.calendarEvent.delete({ where: { id: data.id } });
            results.push({ type: op.type, status: "success", id: data.id });
          } else {
            results.push({ type: op.type, status: "error", message: "Event not found or unauthorized" });
          }
        }
        else if (op.type === "SEND_SLACK_MESSAGE") {
          const parsed = SlackSchema.safeParse(op.payload);
          if (!parsed.success) {
            results.push({ type: op.type, status: "error", message: parsed.error.message });
            continue;
          }
          const data = parsed.data;
          const slackIntegration = await prisma.integration.findUnique({
            where: { userId_provider: { userId, provider: "slack" } }
          });
          if (slackIntegration && slackIntegration.status === "Connected" && slackIntegration.accessToken) {
            try {
              const { WebClient } = require('@slack/web-api');
              const slack = new WebClient(slackIntegration.accessToken);
              await slack.chat.postMessage({
                channel: data.channel,
                text: data.message
              });
              results.push({ type: op.type, status: "success", message: "Sent to Slack" });
            } catch (err) {
              console.error("Slack postMessage error:", err);
              results.push({ type: op.type, status: "error", message: "Slack API error" });
            }
          } else {
            results.push({ type: op.type, status: "error", message: "Slack not connected" });
          }
        }
        else if (op.type === "CREATE_GOAL") {
          const parsed = GoalSchema.safeParse(op.payload);
          if (!parsed.success) {
            results.push({ type: op.type, status: "error", message: parsed.error.message });
            continue;
          }
          const data = parsed.data;
          const goal = await prisma.goal.create({
            data: {
              userId,
              title: data.title,
              description: data.description || "",
              status: data.status,
              progress: data.progress,
            }
          });
          results.push({ type: op.type, status: "success", id: goal.id });
        }
        else if (op.type === "UPDATE_GOAL") {
          const parsed = GoalUpdateSchema.safeParse(op.payload);
          if (!parsed.success) {
            results.push({ type: op.type, status: "error", message: parsed.error.message });
            continue;
          }
          const data = parsed.data;
          const existing = await prisma.goal.findUnique({ where: { id: data.id } });
          if (existing && existing.userId === userId) {
            const updateData: any = {};
            if (data.title) updateData.title = data.title;
            if (data.progress !== undefined) updateData.progress = data.progress;
            if (data.status) updateData.status = data.status;
            
            await prisma.goal.update({ where: { id: data.id }, data: updateData });
            results.push({ type: op.type, status: "success", id: data.id });
          } else {
            results.push({ type: op.type, status: "error", message: "Goal not found or unauthorized" });
          }
        }
        else if (op.type === "DELETE_GOAL") {
          const parsed = z.object({ id: z.string() }).safeParse(op.payload);
          if (!parsed.success) {
            results.push({ type: op.type, status: "error", message: parsed.error.message });
            continue;
          }
          const data = parsed.data;
          const existing = await prisma.goal.findUnique({ where: { id: data.id } });
          if (existing && existing.userId === userId) {
            await prisma.goal.delete({ where: { id: data.id } });
            results.push({ type: op.type, status: "success", id: data.id });
          } else {
            results.push({ type: op.type, status: "error", message: "Goal not found or unauthorized" });
          }
        }
        else if (op.type === "CREATE_HABIT") {
          const parsed = HabitSchema.safeParse(op.payload);
          if (!parsed.success) {
            results.push({ type: op.type, status: "error", message: parsed.error.message });
            continue;
          }
          const data = parsed.data;
          const habit = await prisma.habit.create({
            data: {
              userId,
              title: data.title,
              category: data.category,
              targetDays: data.targetDays,
            }
          });
          results.push({ type: op.type, status: "success", id: habit.id });
        }
        else if (op.type === "LOG_HABIT") {
          const parsed = z.object({ id: z.string(), date: z.string().optional() }).safeParse(op.payload);
          if (!parsed.success) {
            results.push({ type: op.type, status: "error", message: parsed.error.message });
            continue;
          }
          const data = parsed.data;
          const existing = await prisma.habit.findUnique({ where: { id: data.id } });
          if (existing && existing.userId === userId) {
            const date = data.date || new Date().toISOString().split('T')[0];
            await prisma.habitLog.upsert({
              where: { habitId_date: { habitId: data.id, date } },
              update: { completed: true },
              create: { habitId: data.id, date, completed: true }
            });
            // Just updating streak naively, in reality needs better calculation
            await prisma.habit.update({
              where: { id: data.id },
              data: { currentStreak: { increment: 1 } }
            });
            results.push({ type: op.type, status: "success", id: data.id });
          } else {
            results.push({ type: op.type, status: "error", message: "Habit not found or unauthorized" });
          }
        }
      } catch (opError) {
        console.error("Operation failed:", opError);
        results.push({ type: op.type, status: "error", message: "Server error during execution" });
      }
    }

    return NextResponse.json({ success: true, results });
  } catch (error) {
    console.error("AI Execute Error:", error);
    return NextResponse.json(
      { success: false, message: "Execution processing failed." },
      { status: 500 }
    );
  }
}

import { NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/route";
import { z } from "zod";

const taskSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional().nullable(),
  priority: z.string().optional().default("MEDIUM"),
  estimatedMinutes: z.number().optional().default(30),
  dueDate: z.string().optional().nullable(),
  projectId: z.string().optional().nullable(),
  goalId: z.string().optional().nullable(),
});

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }
    const userId = (session.user as any).id;

    const rawTasks = await prisma.task.findMany({
      where: { userId },
      include: {
        project: { select: { title: true } },
        goal: { select: { title: true } },
        notes: { select: { id: true } },
        dependsOn: { select: { title: true } }
      },
      orderBy: [
        { isCompleted: "asc" },
        { priority: "asc" },
        { createdAt: "desc" }
      ],
    });

    const tasks = rawTasks.map(t => ({
      ...t,
      project: t.project?.title,
      goal: t.goal?.title,
      notesCount: t.notes.length,
      labels: t.labels ? t.labels.split(',') : []
    }));

    return NextResponse.json({ success: true, data: tasks });
  } catch (error) {
    console.error("GET /api/tasks error:", error);
    return NextResponse.json({ success: false, message: "Failed to fetch tasks" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }
    const userId = (session.user as any).id;
    const body = await req.json();

    const validatedData = taskSchema.parse(body);

    const task = await prisma.task.create({
      data: {
        userId,
        title: validatedData.title,
        description: validatedData.description,
        priority: validatedData.priority,
        estimatedMinutes: validatedData.estimatedMinutes,
        dueDate: validatedData.dueDate ? new Date(validatedData.dueDate) : null,
        projectId: validatedData.projectId || null,
        goalId: validatedData.goalId || null,
      },
    });

    return NextResponse.json({ success: true, data: task });
  } catch (error) {
    console.error("POST /api/tasks error:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ success: false, message: "Validation error", errors: error.issues }, { status: 400 });
    }
    return NextResponse.json({ success: false, message: "Failed to create task" }, { status: 500 });
  }
}

import { NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/route";
import { noteSchema } from "../../../lib/schemas";
import { z } from "zod";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }
    const userId = (session.user as any).id;

    const rawNotes = await prisma.note.findMany({
      where: { userId },
      include: {
        project: { select: { title: true } },
        task: { select: { title: true } },
        goal: { select: { title: true } },
      },
      orderBy: { updatedAt: "desc" },
    });

    const notes = rawNotes.map(n => {
      let attachedToType = "General";
      let attachedToName = "Uncategorized";

      if (n.projectId) { attachedToType = "Project"; attachedToName = n.project?.title || "Unknown"; }
      else if (n.taskId) { attachedToType = "Task"; attachedToName = n.task?.title || "Unknown"; }
      else if (n.goalId) { attachedToType = "Goal"; attachedToName = n.goal?.title || "Unknown"; }
      else if (n.meetingId) { attachedToType = "Meeting"; attachedToName = "Meeting"; }

      return {
        ...n,
        attachedToType,
        attachedToName,
        tags: n.tags ? n.tags.split(',') : []
      };
    });

    return NextResponse.json({ success: true, data: notes });
  } catch (error) {
    console.error("GET /api/notes error:", error);
    return NextResponse.json({ success: false, message: "Failed to fetch notes" }, { status: 500 });
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
    const validatedData = noteSchema.parse(body);

    const note = await prisma.note.create({
      data: {
        userId,
        title: validatedData.title,
        content: validatedData.content || "",
        tags: validatedData.tags,
        projectId: validatedData.projectId || null,
        taskId: validatedData.taskId || null,
        goalId: validatedData.goalId || null,
      },
    });

    return NextResponse.json({ success: true, data: note });
  } catch (error) {
    console.error("POST /api/notes error:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ success: false, message: "Validation error", errors: error.issues }, { status: 400 });
    }
    return NextResponse.json({ success: false, message: "Failed to create note" }, { status: 500 });
  }
}

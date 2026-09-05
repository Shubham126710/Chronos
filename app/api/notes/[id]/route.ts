import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/route";
import { updateNoteSchema } from "../../../../lib/schemas";
import { z } from "zod";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }
    const userId = (session.user as any).id;
    const { id } = await params;
    const body = await req.json();

    const validatedData = updateNoteSchema.parse(body);

    const note = await prisma.note.findFirst({ where: { id, userId } });
    if (!note) {
      return NextResponse.json({ success: false, message: "Note not found" }, { status: 404 });
    }

    const updatedNote = await prisma.note.update({
      where: { id },
      data: {
        title: validatedData.title,
        content: validatedData.content,
        tags: validatedData.tags,
        projectId: validatedData.projectId,
        taskId: validatedData.taskId,
        goalId: validatedData.goalId,
      },
    });

    return NextResponse.json({ success: true, data: updatedNote });
  } catch (error) {
    console.error("PATCH /api/notes/[id] error:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ success: false, message: "Validation error", errors: error.issues }, { status: 400 });
    }
    return NextResponse.json({ success: false, message: "Failed to update note" }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }
    const userId = (session.user as any).id;
    const { id } = await params;

    const note = await prisma.note.findFirst({ where: { id, userId } });
    if (!note) {
      return NextResponse.json({ success: false, message: "Note not found" }, { status: 404 });
    }

    await prisma.note.delete({ where: { id } });

    return NextResponse.json({ success: true, message: "Note deleted" });
  } catch (error) {
    console.error("DELETE /api/notes/[id] error:", error);
    return NextResponse.json({ success: false, message: "Failed to delete note" }, { status: 500 });
  }
}

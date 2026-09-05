import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/route";
import { updateGoalSchema } from "../../../../lib/schemas";
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

    const validatedData = updateGoalSchema.parse(body);

    const goal = await prisma.goal.findFirst({ where: { id, userId } });
    if (!goal) {
      return NextResponse.json({ success: false, message: "Goal not found" }, { status: 404 });
    }

    const updatedGoal = await prisma.goal.update({
      where: { id },
      data: {
        title: validatedData.title,
        description: validatedData.description,
        progress: validatedData.progress,
        status: validatedData.status,
        parentId: validatedData.parentId,
      },
    });

    return NextResponse.json({ success: true, data: updatedGoal });
  } catch (error) {
    console.error("PATCH /api/goals/[id] error:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ success: false, message: "Validation error", errors: error.issues }, { status: 400 });
    }
    return NextResponse.json({ success: false, message: "Failed to update goal" }, { status: 500 });
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

    const goal = await prisma.goal.findFirst({ where: { id, userId } });
    if (!goal) {
      return NextResponse.json({ success: false, message: "Goal not found" }, { status: 404 });
    }

    await prisma.goal.delete({ where: { id } });

    return NextResponse.json({ success: true, message: "Goal deleted" });
  } catch (error) {
    console.error("DELETE /api/goals/[id] error:", error);
    return NextResponse.json({ success: false, message: "Failed to delete goal" }, { status: 500 });
  }
}

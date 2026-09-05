import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/route";
import { updateHabitSchema } from "../../../../lib/schemas";
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

    const validatedData = updateHabitSchema.parse(body);

    const habit = await prisma.habit.findFirst({ where: { id, userId } });
    if (!habit) {
      return NextResponse.json({ success: false, message: "Habit not found" }, { status: 404 });
    }

    const updatedHabit = await prisma.habit.update({
      where: { id },
      data: {
        title: validatedData.title,
        category: validatedData.category,
        targetDays: validatedData.targetDays,
      },
    });

    return NextResponse.json({ success: true, data: updatedHabit });
  } catch (error) {
    console.error("PATCH /api/habits/[id] error:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ success: false, message: "Validation error", errors: error.issues }, { status: 400 });
    }
    return NextResponse.json({ success: false, message: "Failed to update habit" }, { status: 500 });
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

    const habit = await prisma.habit.findFirst({ where: { id, userId } });
    if (!habit) {
      return NextResponse.json({ success: false, message: "Habit not found" }, { status: 404 });
    }

    await prisma.habit.delete({ where: { id } });

    return NextResponse.json({ success: true, message: "Habit deleted" });
  } catch (error) {
    console.error("DELETE /api/habits/[id] error:", error);
    return NextResponse.json({ success: false, message: "Failed to delete habit" }, { status: 500 });
  }
}

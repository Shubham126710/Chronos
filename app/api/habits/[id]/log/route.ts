import { NextResponse } from "next/server";
import { prisma } from "../../../../../lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../../auth/[...nextauth]/route";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
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

    const body = await req.json();
    const { date, completed, value } = body; // date should be 'YYYY-MM-DD'

    if (!date) {
      return NextResponse.json({ success: false, message: "Date required" }, { status: 400 });
    }

    // Upsert the log for this date
    const log = await prisma.habitLog.upsert({
      where: {
        habitId_date: {
          habitId: id,
          date,
        },
      },
      update: {
        completed: completed !== undefined ? completed : true,
        value: value !== undefined ? value : null,
      },
      create: {
        habitId: id,
        date,
        completed: completed !== undefined ? completed : true,
        value: value !== undefined ? value : null,
      },
    });

    // TODO: A real implementation would also recalculate currentStreak, bestStreak, completionRate
    // and update the Habit model here based on the logs.

    return NextResponse.json({ success: true, data: log });
  } catch (error) {
    console.error("POST /api/habits/[id]/log error:", error);
    return NextResponse.json({ success: false, message: "Failed to log habit" }, { status: 500 });
  }
}

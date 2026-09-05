import { NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/route";
import { habitSchema } from "../../../lib/schemas";
import { z } from "zod";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }
    const userId = (session.user as any).id;

    const habits = await prisma.habit.findMany({
      where: { userId },
      include: {
        logs: {
          orderBy: { date: "desc" },
          take: 14, // Get last 14 days for the heatmap
        }
      },
      orderBy: { updatedAt: "desc" },
    });

    return NextResponse.json({ success: true, data: habits });
  } catch (error) {
    console.error("GET /api/habits error:", error);
    return NextResponse.json({ success: false, message: "Failed to fetch habits" }, { status: 500 });
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
    const validatedData = habitSchema.parse(body);

    const habit = await prisma.habit.create({
      data: {
        userId,
        title: validatedData.title,
        category: validatedData.category,
        targetDays: validatedData.targetDays,
      },
    });

    return NextResponse.json({ success: true, data: habit });
  } catch (error) {
    console.error("POST /api/habits error:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ success: false, message: "Validation error", errors: error.issues }, { status: 400 });
    }
    return NextResponse.json({ success: false, message: "Failed to create habit" }, { status: 500 });
  }
}

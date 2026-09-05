import { NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/route";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }
    const userId = (session.user as any).id;

    const body = await req.json();
    const { action, durationMinutes, taskName } = body;

    if (action === "complete-session") {
      const focusSession = await prisma.focusSession.create({
        data: {
          userId,
          durationMinutes: durationMinutes || 25,
          taskName: taskName || "Deep Work Session",
          category: "FOCUS",
          completedAt: new Date(),
        },
      });

      return NextResponse.json({ success: true, data: focusSession });
    }

    return NextResponse.json({ success: false, message: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error("POST /api/focus error:", error);
    return NextResponse.json({ success: false, message: "Failed to log focus session" }, { status: 500 });
  }
}

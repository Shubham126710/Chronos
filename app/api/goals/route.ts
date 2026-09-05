import { NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/route";
import { z } from "zod";

const goalSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional().nullable(),
  parentId: z.string().optional().nullable(),
});

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }
    const userId = (session.user as any).id;

    const goals = await prisma.goal.findMany({
      where: { userId, parentId: null },
      include: {
        children: {
          include: {
            _count: { select: { tasks: true } }
          }
        },
        _count: { select: { tasks: true } }
      },
      orderBy: { updatedAt: "desc" },
    });

    return NextResponse.json({ success: true, data: goals });
  } catch (error) {
    console.error("GET /api/goals error:", error);
    return NextResponse.json({ success: false, message: "Failed to fetch goals" }, { status: 500 });
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
    const validatedData = goalSchema.parse(body);

    const goal = await prisma.goal.create({
      data: {
        userId,
        title: validatedData.title,
        description: validatedData.description,
        parentId: validatedData.parentId || null,
      },
    });

    return NextResponse.json({ success: true, data: goal });
  } catch (error) {
    console.error("POST /api/goals error:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ success: false, message: "Validation error", errors: error.issues }, { status: 400 });
    }
    return NextResponse.json({ success: false, message: "Failed to create goal" }, { status: 500 });
  }
}

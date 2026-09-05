import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/route";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }
    const userId = (session.user as any).id;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { hasCompletedOnboarding: true, primaryGoal: true },
    });

    if (!user) {
      return NextResponse.json({ success: false, message: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: user });
  } catch (error) {
    console.error("GET /api/user/onboarding error:", error);
    return NextResponse.json({ success: false, message: "Failed to fetch onboarding state" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }
    const userId = (session.user as any).id;

    const body = await req.json();
    const { primaryGoal } = body;

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        hasCompletedOnboarding: true,
        primaryGoal: primaryGoal || undefined,
      },
      select: { hasCompletedOnboarding: true, primaryGoal: true },
    });

    return NextResponse.json({ success: true, data: updatedUser });
  } catch (error) {
    console.error("PATCH /api/user/onboarding error:", error);
    return NextResponse.json({ success: false, message: "Failed to update onboarding state" }, { status: 500 });
  }
}

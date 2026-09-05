import { NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/route";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }
    const userId = (session.user as any).id;

    const integrations = await prisma.integration.findMany({
      where: { userId },
      select: {
        provider: true,
        status: true,
        lastSynced: true,
      }
    });

    return NextResponse.json({ success: true, data: integrations });
  } catch (error) {
    console.error("GET /api/integrations error:", error);
    return NextResponse.json({ success: false, message: "Failed to fetch integrations" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }
    const userId = (session.user as any).id;

    const { searchParams } = new URL(req.url);
    const provider = searchParams.get("provider");

    if (!provider) {
      return NextResponse.json({ success: false, message: "Provider required" }, { status: 400 });
    }

    await prisma.integration.deleteMany({
      where: { userId, provider }
    });

    return NextResponse.json({ success: true, message: "Disconnected successfully" });
  } catch (error) {
    console.error("DELETE /api/integrations error:", error);
    return NextResponse.json({ success: false, message: "Failed to disconnect integration" }, { status: 500 });
  }
}

import { NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/route";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) return NextResponse.json({ success: false }, { status: 401 });
    const userId = (session.user as any).id;

    const integration = await prisma.integration.findUnique({
      where: { userId_provider: { userId: userId, provider: "GITHUB" } },
    });

    if (!integration) {
      return NextResponse.json({ success: true, data: null });
    }

    const defaultData = {
      username: "Unknown",
      totalCommitsThisYear: 0,
      currentStreak: 0,
      longestStreak: 0,
      topRepo: "None",
      recentCommits: [],
      contributionGraph: Array.from({ length: 52 }, (_, i) => ({
        week: i + 1,
        days: Array.from({ length: 7 }, (_, d) => ({
          count: 0,
          level: 0,
        })),
      })),
      projectsLinked: 0,
    };

    const data = integration.metadata ? { ...defaultData, ...JSON.parse(integration.metadata) } : defaultData;

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("GET /api/github error:", error);
    return NextResponse.json({ success: false, message: "Failed to fetch GitHub data" }, { status: 500 });
  }
}

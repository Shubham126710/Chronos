import { NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";

export async function GET() {
  try {
    const user = await prisma.user.findFirst();
    if (!user) return NextResponse.json({ success: false }, { status: 404 });

    const integration = await prisma.integration.findUnique({
      where: { userId_provider: { userId: user.id, provider: "GITHUB" } },
    });

    const defaultData = {
      username: "alexvance-ai",
      totalCommitsThisYear: 1420,
      currentStreak: 14,
      longestStreak: 32,
      topRepo: "chronos-ai-os",
      recentCommits: [
        { repo: "chronos-ai-os", message: "feat(engine): implement draggable widget canvas grid", sha: "a8f9d21", timestamp: "20 minutes ago" },
        { repo: "chronos-ai-os", message: "refactor(prisma): expand schema with OS canvas models", sha: "c4b1e90", timestamp: "1 hour ago" },
        { repo: "dsa-graph-algorithms", message: "solve(leetcode): dijkstra shortest path & bellman ford", sha: "f712a04", timestamp: "5 hours ago" },
        { repo: "os-exam-prep", message: "docs: add process synchronization RFC and bankers algo", sha: "b3190cc", timestamp: "Yesterday" },
      ],
      contributionGraph: Array.from({ length: 52 }, (_, i) => ({
        week: i + 1,
        days: Array.from({ length: 7 }, (_, d) => ({
          count: Math.floor(Math.random() * 8),
          level: Math.floor(Math.random() * 4), // 0 to 3
        })),
      })),
      projectsLinked: 3,
    };

    const data = integration?.metadata ? { ...defaultData, ...JSON.parse(integration.metadata) } : defaultData;

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("GET /api/github error:", error);
    return NextResponse.json({ success: false, message: "Failed to fetch GitHub data" }, { status: 500 });
  }
}

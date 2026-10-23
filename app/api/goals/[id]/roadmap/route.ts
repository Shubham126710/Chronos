import { NextResponse } from "next/server";
import { prisma } from "../../../../../lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../../auth/[...nextauth]/route";
import { executeStructuredWithFallback } from "../../../../../lib/ai/client";
import { recalculateGoalProgress } from "../../../../../lib/goals/progress";
import { z } from "zod";

const RoadmapSchema = z.object({
  milestones: z.array(z.object({
    title: z.string().describe("Clear milestone name (e.g. Master Memory Management & Deadlocks)"),
    description: z.string().describe("Brief 1-sentence objective for this milestone"),
    tasks: z.array(z.object({
      title: z.string().describe("Actionable task title"),
      priority: z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]).default("MEDIUM"),
      estimatedMinutes: z.number().default(45)
    })).min(2).max(4)
  })).min(2).max(4)
});

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }
    const userId = (session.user as any).id;
    const { id } = await params;

    const goal = await prisma.goal.findFirst({
      where: { id, userId },
      include: { children: { include: { tasks: true } } }
    });

    if (!goal) {
      return NextResponse.json({ success: false, message: "Goal not found" }, { status: 404 });
    }

    // Call AI to generate a contextual, structured roadmap
    const prompt = `Goal: "${goal.title}"
Description: "${goal.description || "No description provided."}"
Break this goal down into 3-4 progressive chronological milestones. For each milestone, provide 2-3 specific, actionable tasks.`;

    const aiRes = await executeStructuredWithFallback({
      system: "You are the Chronos Ambition & Roadmap Engine. Generate realistic, high-impact milestones and tasks.",
      prompt,
      schema: RoadmapSchema
    });

    if (!aiRes.success || !aiRes.data) {
      return NextResponse.json({ success: false, message: aiRes.error || "Failed to generate roadmap" }, { status: 500 });
    }

    const createdMilestones = [];

    for (const m of aiRes.data.milestones) {
      const childGoal = await prisma.goal.create({
        data: {
          userId,
          parentId: goal.id,
          title: m.title,
          description: m.description,
          status: "ACTIVE",
          progress: 0,
        }
      });

      for (const t of m.tasks) {
        await prisma.task.create({
          data: {
            userId,
            goalId: childGoal.id,
            title: t.title,
            priority: t.priority,
            estimatedMinutes: t.estimatedMinutes,
            isCompleted: false,
          }
        });
      }

      createdMilestones.push(childGoal);
    }

    await recalculateGoalProgress(goal.id);

    const updatedGoal = await prisma.goal.findUnique({
      where: { id: goal.id },
      include: {
        children: {
          include: {
            tasks: true,
            _count: { select: { tasks: true } }
          }
        },
        tasks: true,
        _count: { select: { tasks: true } }
      }
    });

    return NextResponse.json({ success: true, data: updatedGoal });
  } catch (error) {
    console.error("POST /api/goals/[id]/roadmap error:", error);
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}

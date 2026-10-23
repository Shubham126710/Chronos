import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "../../../../lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../../../lib/auth";
import { executeStructuredWithFallback } from "../../../../lib/ai/client";

// Structured Schema for the AI Command Response
const AICommandResponseSchema = z.object({
  title: z.string().describe("A concise 3-6 word title of the action proposed."),
  summary: z.string().describe("1-2 sentences summarizing the analysis and plan."),
  actionLabel: z.string().describe("Button label (e.g. 'Apply Plan', 'Schedule Sessions', 'Create Habit')."),
  details: z.array(z.string()).describe("3-4 bullet points explaining the actions, schedule, or strategy."),
  operations: z.array(z.object({
    type: z.enum([
      "CREATE_TASK", "UPDATE_TASK", "DELETE_TASK",
      "CREATE_EVENT", "UPDATE_EVENT", "DELETE_EVENT",
      "CREATE_GOAL", "UPDATE_GOAL", "DELETE_GOAL",
      "CREATE_HABIT", "LOG_HABIT",
      "CREATE_NOTION_PAGE"
    ]),
    title: z.string().optional().describe("Title for task, event, habit, or goal"),
    description: z.string().optional().describe("Description or notes"),
    startTime: z.string().optional().describe("ISO 8601 string for calendar events"),
    endTime: z.string().optional().describe("ISO 8601 string for calendar events"),
    priority: z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]).optional().describe("Priority for tasks"),
    estimatedMinutes: z.number().optional().describe("Estimated minutes for tasks"),
    dueDate: z.string().optional().describe("ISO 8601 string for task due date"),
    category: z.string().optional().describe("Category for habit, event, or task"),
    targetDays: z.number().optional().describe("Target days per week for habit"),
    content: z.string().optional().describe("Markdown content for Notion page or note"),
    parentId: z.string().optional().describe("Parent goal ID for milestones"),
    id: z.string().optional().describe("Entity ID for update or delete operations")
  })).default([])
});

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }
    const userId = (session.user as any).id;
    const body = await req.json();
    const { query } = body;

    if (!query || typeof query !== "string" || !query.trim()) {
      return NextResponse.json({ success: false, message: "Missing command query" }, { status: 400 });
    }

    // Server-side sliding-window Rate Limiting per authenticated user
    const RATE_LIMIT = parseInt(process.env.AI_RATE_LIMIT || "15", 10);
    const RATE_LIMIT_WINDOW_SECONDS = parseInt(process.env.AI_RATE_LIMIT_WINDOW || "60", 10);
    const windowStart = new Date(Date.now() - RATE_LIMIT_WINDOW_SECONDS * 1000);

    try {
      const recentRequests = await prisma.activityLog.count({
        where: {
          userId,
          action: "AI_COMMAND",
          createdAt: { gte: windowStart }
        }
      });

      if (recentRequests >= RATE_LIMIT) {
        return NextResponse.json(
          {
            success: false,
            message: `Rate limit reached (${recentRequests}/${RATE_LIMIT} in ${RATE_LIMIT_WINDOW_SECONDS}s). Please wait a moment.`
          },
          { status: 429 }
        );
      }

      await prisma.activityLog.create({
        data: {
          userId,
          action: "AI_COMMAND",
          module: "AI",
          metadata: JSON.stringify({ query: query.substring(0, 100) })
        }
      });
    } catch (dbError: any) {
      if (dbError?.code === "P2003") {
        return NextResponse.json({ success: false, message: "Session expired. Please log in again." }, { status: 401 });
      }
      console.warn("Non-fatal rate-limit check error:", dbError?.message);
    }

    // Pre-fetch user's contextual data to pass in a single prompt turn
    const now = new Date();
    const nextWeek = new Date(now);
    nextWeek.setDate(nextWeek.getDate() + 7);

    const [tasks, events, goals, habits, integrations] = await Promise.all([
      prisma.task.findMany({
        where: { userId, isCompleted: false },
        take: 15,
        orderBy: [{ priority: "desc" }, { createdAt: "desc" }],
        select: { id: true, title: true, priority: true, dueDate: true }
      }),
      prisma.calendarEvent.findMany({
        where: {
          userId,
          startTime: { gte: new Date(now.setHours(0, 0, 0, 0)), lte: nextWeek }
        },
        take: 15,
        orderBy: { startTime: "asc" },
        select: { id: true, title: true, startTime: true, endTime: true, category: true }
      }),
      prisma.goal.findMany({
        where: { userId, status: "ACTIVE" },
        take: 8,
        select: { id: true, title: true, progress: true }
      }),
      prisma.habit.findMany({
        where: { userId },
        take: 10,
        select: { id: true, title: true, currentStreak: true, category: true }
      }),
      prisma.integration.findMany({
        where: { userId, status: "Connected" },
        select: { provider: true }
      })
    ]);

    const connectedProviders = integrations.map(i => i.provider);
    const systemPrompt = `You are Chronos AI Executive, an integrated productivity operating system.
Current Time: ${new Date().toISOString()}

USER STATE:
- Connected Integrations: ${connectedProviders.length ? connectedProviders.join(", ") : "None"}
- Active Incomplete Tasks (${tasks.length}): ${JSON.stringify(tasks)}
- Upcoming Calendar Events (${events.length}): ${JSON.stringify(events)}
- Active Goals (${goals.length}): ${JSON.stringify(goals)}
- Active Habits (${habits.length}): ${JSON.stringify(habits)}

ORCHESTRATION RULES:
1. Always translate the user's intent into realistic, structured operations.
2. For study plans or goals (e.g. "Prepare for GATE", "Study Operating Systems"):
   - Propose CREATE_GOAL with milestones if it's a major ambition.
   - Propose CREATE_EVENT operations with realistic ISO 8601 start/end times for dedicated focus sessions.
   - Propose CREATE_TASK for specific action items.
3. For habits (e.g. "Create a morning reading habit"):
   - Propose CREATE_HABIT with targetDays (e.g. 7) and title.
   - If the user specifies a time (e.g. 9 PM or morning), also schedule a CREATE_EVENT block.
4. For day planning:
   - Check existing events to avoid scheduling conflicts.
   - Schedule open work blocks around existing events.
5. For Notion requests:
   - If Notion is connected (${connectedProviders.includes("notion") ? "YES" : "NO"}), propose CREATE_NOTION_PAGE with title and markdown content.
6. Provide accurate ISO 8601 timestamps (e.g. "${new Date(Date.now() + 86400000).toISOString().split("T")[0]}T10:00:00.000Z") calculated relative to Current Time.`;

    const aiResult = await executeStructuredWithFallback({
      system: systemPrompt,
      prompt: query,
      schema: AICommandResponseSchema,
    });

    if (!aiResult.success || !aiResult.data) {
      return NextResponse.json({
        success: false,
        message: aiResult.error || "Unable to formulate action plan."
      }, { status: 500 });
    }

    // Normalize operation payloads so they match execute endpoint format
    const normalizedOperations = aiResult.data.operations.map(op => {
      const payload: any = { ...op };
      delete payload.type;
      return {
        type: op.type,
        payload
      };
    });

    const responseData = {
      title: aiResult.data.title,
      summary: aiResult.data.summary,
      actionLabel: aiResult.data.actionLabel,
      details: aiResult.data.details,
      operations: normalizedOperations,
      modelUsed: aiResult.usedModel
    };

    return NextResponse.json({ success: true, data: responseData });
  } catch (error: any) {
    console.error("AI Semantic Command Error:", error);
    return NextResponse.json(
      { success: false, message: `Command processing failed: ${error?.message || "Unknown"}` },
      { status: 500 }
    );
  }
}

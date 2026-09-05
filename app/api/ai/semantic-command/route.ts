import { NextResponse } from "next/server";
import { generateObject } from "ai";
import { google } from "@ai-sdk/google";
import { z } from "zod";
import { prisma } from "../../../../lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/route";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }
    const userId = (session.user as any).id;
    const body = await req.json();
    const { query } = body;

    if (!query) {
      return NextResponse.json({ success: false, message: "Missing query" }, { status: 400 });
    }

    // Fetch user context for the AI
    const tasks = await prisma.task.findMany({ where: { userId, isCompleted: false }, take: 20 });
    const goals = await prisma.goal.findMany({ where: { userId, status: "ACTIVE" }, take: 5 });

    const context = `
      User Tasks: ${JSON.stringify(tasks.map(t => ({ id: t.id, title: t.title, priority: t.priority })))}
      User Goals: ${JSON.stringify(goals.map(g => ({ id: g.id, title: g.title })))}
    `;

    // We will parse the natural language query and decide on an action
    // We expect the AI to return a title, summary, actionLabel, and details (for the Command Palette UI)
    // AND optional DB operations to execute
    
    // Check if GEMINI_API_KEY is available
    if (!process.env.GEMINI_API_KEY) {
      // Fallback response for missing API key
      return NextResponse.json({
        success: true,
        data: {
          title: "AI Analysis (Fallback Mode)",
          summary: "I parsed your query: " + query + ". However, the GEMINI_API_KEY is missing from environment variables, so I cannot perform semantic analysis.",
          actionLabel: "Configure API Key",
          details: ["Please add GEMINI_API_KEY to your .env file to enable semantic AI."],
        }
      });
    }

    const result = await generateObject({
      model: google('gemini-2.5-flash'),
      system: "You are the Chronos AI Executive. You receive a user's natural language command, analyze their current context (tasks, goals), and provide a strategic response, execution roadmap, and any structural operations. Keep summaries sharp, actionable, and slightly technical/premium in tone.",
      prompt: `Context:\n${context}\n\nCommand:\n"${query}"`,
      schema: z.object({
        title: z.string().describe("A short 3-6 word title of the action taken or recommended."),
        summary: z.string().describe("A concise summary (1-2 sentences) of what the AI analyzed or decided."),
        actionLabel: z.string().describe("A short button label (e.g. 'Apply Schedule', 'Create Task')."),
        details: z.array(z.string()).describe("An array of 3-4 bullet points detailing the roadmap, steps, or changes."),
        operations: z.array(z.object({
          type: z.enum(["CREATE_TASK", "CREATE_GOAL", "RESCHEDULE"]),
          payload: z.any()
        })).optional().describe("Any structured database operations to perform.")
      }),
    });

    const aiData = result.object;

    // Optional: Execute DB operations if returned by AI
    if (aiData.operations && aiData.operations.length > 0) {
      for (const op of aiData.operations) {
        if (op.type === "CREATE_TASK") {
          await prisma.task.create({
            data: {
              userId,
              title: op.payload.title || "AI Generated Task",
              description: op.payload.description || "",
              priority: op.payload.priority || "MEDIUM",
            }
          });
        }
        // Additional operations could be handled here
      }
    }

    return NextResponse.json({ success: true, data: aiData });
  } catch (error) {
    console.error("AI Semantic Error:", error);
    return NextResponse.json(
      { success: false, message: "AI processing failed." },
      { status: 500 }
    );
  }
}

import { NextResponse } from "next/server";
import { generateText, tool } from "ai";
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

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json({
        success: true,
        data: {
          title: "AI Analysis (Fallback Mode)",
          summary: "I parsed your query: " + query + ". However, the GEMINI_API_KEY is missing from environment variables, so I cannot perform semantic analysis.",
          actionLabel: "Configure API Key",
          details: ["Please add GEMINI_API_KEY to your .env file to enable semantic AI."],
          operations: []
        }
      });
    }

    // System context injected into prompt
    const now = new Date();
    const systemContext = `
      You are the Chronos AI Executive, an intelligent productivity agent.
      Current Date & Time: ${now.toISOString()}
      Your job is to read the user's data using the provided tools, decide on a course of action, and propose operations if necessary.
      
      RULES:
      1. ONLY retrieve data necessary for the request.
      2. If asked to modify, create, or delete data, use the 'respondToUser' tool to propose the operations. 
      3. The user MUST confirm all operations in the UI. You do not execute mutations yourself, you just propose them.
      4. You MUST end your turn by calling the 'respondToUser' tool. Never respond in plain text to the user.
    `;

    // Define tools
    const tools = {
      getTasks: tool({
        description: "Get the user's tasks. Optionally filter by completion status, priority, or due date.",
        parameters: z.object({
          isCompleted: z.boolean().optional(),
          priority: z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]).optional(),
          overdue: z.boolean().optional().describe("If true, fetches tasks where dueDate is past the current date")
        }),
        // @ts-ignore
        execute: async (args: any) => {
          const { isCompleted, priority, overdue } = args;
          const where: any = { userId };
          if (isCompleted !== undefined) where.isCompleted = isCompleted;
          if (priority !== undefined) where.priority = priority;
          if (overdue === true) {
            where.dueDate = { lt: new Date() };
          }
          const tasks = await prisma.task.findMany({ where, take: 50 });
          return tasks.map(t => ({ id: t.id, title: t.title, priority: t.priority, dueDate: t.dueDate, isCompleted: t.isCompleted }));
        }
      }),
      getCalendarEvents: tool({
        description: "Get the user's calendar events within a date range.",
        parameters: z.object({
          startDate: z.string().describe("ISO date string for start"),
          endDate: z.string().describe("ISO date string for end")
        }),
        // @ts-ignore
        execute: async (args: any) => {
          const { startDate, endDate } = args;
          const events = await prisma.calendarEvent.findMany({
            where: {
              userId,
              startTime: { gte: new Date(startDate) },
              endTime: { lte: new Date(endDate) }
            },
            take: 50
          });
          return events.map(e => ({ id: e.id, title: e.title, startTime: e.startTime, endTime: e.endTime }));
        }
      }),
      getGoals: tool({
        description: "Get the user's active goals.",
        parameters: z.object({}),
        // @ts-ignore
        execute: async (args: any) => {
          const goals = await prisma.goal.findMany({ where: { userId, status: "ACTIVE" }, take: 10 });
          return goals.map(g => ({ id: g.id, title: g.title, progress: g.progress }));
        }
      }),
      respondToUser: tool({
        description: "ALWAYS call this tool to deliver your final response to the user. This tool sends the structured UI and proposed database operations to the user for confirmation.",
        parameters: z.object({
          title: z.string().describe("A short 3-6 word title of the action taken or recommended."),
          summary: z.string().describe("A concise summary (1-2 sentences) of what you analyzed or decided."),
          actionLabel: z.string().describe("A short button label (e.g. 'Apply Schedule', 'Create Task'). Use 'Confirm' if there are destructive operations."),
          details: z.array(z.string()).describe("An array of 3-4 bullet points detailing the roadmap, steps, or changes."),
          operations: z.array(z.object({
            type: z.enum(["CREATE_TASK", "UPDATE_TASK", "DELETE_TASK", "CREATE_EVENT", "UPDATE_EVENT", "DELETE_EVENT"]),
            payload: z.any().describe("The data payload for the operation (e.g. { title, priority } for CREATE_TASK or { id } for DELETE_TASK)")
          })).optional().describe("Array of database operations to propose to the user.")
        }),
        // @ts-ignore
        execute: async (args: any) => {
          // This tells the AI that the response was successfully queued
          return { success: true, message: "Response sent to user. Stop generating." };
        }
      })
    };

    let currentStep = 0;
    let messages: any[] = [{ role: "user", content: query }];
    let aiResponseData = null;

    while (currentStep < 5) {
      const result = await generateText({
        model: google('gemini-2.5-flash'),
        system: systemContext,
        messages,
        tools,
      });

      const toolCalls = result.toolCalls || [];
      const toolResults = [];
      let responded = false;

      for (const call of toolCalls) {
        const callArgs = (call as any).args || (call as any).input;
        if (call.toolName === 'respondToUser') {
          aiResponseData = callArgs;
          responded = true;
          break;
        } else if (tools[call.toolName as keyof typeof tools]) {
          try {
            const toolFn = tools[call.toolName as keyof typeof tools].execute as Function;
            const res = await toolFn(callArgs);
            toolResults.push({ toolCallId: call.toolCallId, result: res });
          } catch (e) {
            toolResults.push({ toolCallId: call.toolCallId, result: "Tool failed." });
          }
        }
      }

      if (responded) break;

      if (toolCalls.length === 0) {
        break; // Model didn't call any tools and didn't respondToUser
      }

      messages.push({
        role: "assistant",
        content: result.text || "",
        toolCalls: toolCalls
      });
      messages.push({
        role: "tool",
        content: toolResults
      });

      currentStep++;
    }

    if (!aiResponseData) {
      aiResponseData = {
        title: "AI Analysis Complete",
        summary: "I analyzed your request but did not formulate a structured UI response.",
        actionLabel: "Dismiss",
        details: ["You can try rephrasing your request."],
        operations: []
      };
    }

    return NextResponse.json({ success: true, data: aiResponseData });
  } catch (error) {
    console.error("AI Semantic Error:", error);
    return NextResponse.json(
      { success: false, message: "AI processing failed." },
      { status: 500 }
    );
  }
}

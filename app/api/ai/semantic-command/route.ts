import { NextResponse } from "next/server";
import { generateText, tool } from "ai";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
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
      5. CONTEXTUAL AWARENESS: If the user asks to plan their day, prepare for tomorrow, or what's important, you must combine data from getTasks, getCalendarEvents, and searchGmail to provide a comprehensive summary and proposed schedule/actions. Connect tasks with relevant emails and calendar availability.
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
          
          let allEvents = events.map(e => ({ id: e.id, title: e.title, startTime: e.startTime, endTime: e.endTime, category: e.category, isGoogleEvent: false }));

          // Try to fetch Google Calendar Events
          const googleIntegration = await prisma.integration.findUnique({
            where: { userId_provider: { userId, provider: "google" } }
          });
          if (googleIntegration && googleIntegration.status === "Connected" && googleIntegration.accessToken) {
            try {
              const { google } = require('googleapis');
              const oauth2Client = new google.auth.OAuth2();
              oauth2Client.setCredentials({ access_token: googleIntegration.accessToken, refresh_token: googleIntegration.refreshToken });
              const calendar = google.calendar({ version: 'v3', auth: oauth2Client });
              
              const gRes = await calendar.events.list({
                calendarId: 'primary',
                timeMin: new Date(startDate).toISOString(),
                timeMax: new Date(endDate).toISOString(),
                maxResults: 50,
                singleEvents: true,
                orderBy: 'startTime',
              });
              
              const gEvents = gRes.data.items?.map((item: any) => ({
                id: `gcal-${item.id}`,
                title: item.summary || "Busy",
                startTime: new Date(item.start?.dateTime || item.start?.date).toISOString(),
                endTime: new Date(item.end?.dateTime || item.end?.date).toISOString(),
                category: "EXTERNAL",
                isGoogleEvent: true
              })) || [];
              
              allEvents = [...allEvents, ...gEvents].sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());
            } catch (err) {
              console.error("Google Calendar AI sync error:", err);
            }
          }
          
          return allEvents;
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
      getHabits: tool({
        description: "Get the user's habits and streaks.",
        parameters: z.object({}),
        // @ts-ignore
        execute: async (args: any) => {
          const habits = await prisma.habit.findMany({ where: { userId }, take: 15 });
          return habits.map(h => ({ id: h.id, title: h.title, currentStreak: h.currentStreak, targetDays: h.targetDays }));
        }
      }),
      getDashboardInsights: tool({
        description: "Get summary stats of the user's productivity (active tasks, total goals, etc.).",
        parameters: z.object({}),
        // @ts-ignore
        execute: async (args: any) => {
          const tasksCount = await prisma.task.count({ where: { userId, isCompleted: false } });
          const goalsCount = await prisma.goal.count({ where: { userId } });
          const habitsCount = await prisma.habit.count({ where: { userId } });
          return { activeTasks: tasksCount, totalGoals: goalsCount, activeHabits: habitsCount };
        }
      }),
      getZoomMeetings: tool({
        description: "Get the user's upcoming Zoom meetings if their account is connected.",
        parameters: z.object({}),
        // @ts-ignore
        execute: async (args: any) => {
          const zoomIntegration = await prisma.integration.findUnique({
            where: { userId_provider: { userId, provider: "zoom" } }
          });
          if (!zoomIntegration || zoomIntegration.status !== "Connected" || !zoomIntegration.accessToken) {
            return { error: "Zoom is not connected. User must connect Zoom first." };
          }
          try {
            const response = await fetch("https://api.zoom.us/v2/users/me/meetings?type=upcoming", {
              headers: { "Authorization": `Bearer ${zoomIntegration.accessToken}` }
            });
            if (!response.ok) return { error: "Failed to fetch from Zoom API" };
            const data = await response.json();
            return data.meetings?.map((m: any) => ({ topic: m.topic, startTime: m.start_time, duration: m.duration, joinUrl: m.join_url })) || [];
          } catch (e) {
            return { error: "Zoom fetch failed" };
          }
        }
      }),
      searchNotion: tool({
        description: "Search the user's connected Notion workspace for pages or databases.",
        parameters: z.object({
          query: z.string().describe("The search query string")
        }),
        // @ts-ignore
        execute: async (args: any) => {
          const { query } = args;
          const notionIntegration = await prisma.integration.findUnique({
            where: { userId_provider: { userId, provider: "notion" } }
          });
          if (!notionIntegration || notionIntegration.status !== "Connected" || !notionIntegration.accessToken) {
            return { error: "Notion is not connected. User must connect Notion first." };
          }
          try {
            const response = await fetch("https://api.notion.com/v1/search", {
              method: "POST",
              headers: { 
                "Authorization": `Bearer ${notionIntegration.accessToken}`,
                "Notion-Version": "2022-06-28",
                "Content-Type": "application/json"
              },
              body: JSON.stringify({ query, page_size: 5 })
            });
            if (!response.ok) return { error: "Failed to fetch from Notion API" };
            const data = await response.json();
            return data.results?.map((r: any) => ({
              id: r.id,
              url: r.url
            })) || [];
          } catch (e) {
            return { error: "Notion search failed" };
          }
        }
      }),
      searchGmail: tool({
        description: "Search the user's Gmail inbox for emails.",
        parameters: z.object({
          query: z.string().describe("The search query (e.g. 'is:unread', 'from:john', 'subject:project')"),
          maxResults: z.number().optional().default(5)
        }),
        // @ts-ignore
        execute: async (args: any) => {
          const { query, maxResults } = args;
          const googleIntegration = await prisma.integration.findUnique({
            where: { userId_provider: { userId, provider: "gmail" } }
          });
          if (!googleIntegration || googleIntegration.status !== "Connected" || !googleIntegration.accessToken) {
            return { error: "Gmail is not connected. User must connect Gmail first." };
          }
          try {
            const { google } = require('googleapis');
            const oauth2Client = new google.auth.OAuth2();
            oauth2Client.setCredentials({ access_token: googleIntegration.accessToken, refresh_token: googleIntegration.refreshToken });
            const gmail = google.gmail({ version: 'v1', auth: oauth2Client });
            
            const res = await gmail.users.messages.list({ userId: 'me', q: query, maxResults });
            const messages = res.data.messages || [];
            
            const detailedMessages = await Promise.all(
              messages.map(async (msg: any) => {
                const msgDetails = await gmail.users.messages.get({
                  userId: 'me', id: msg.id, format: 'metadata', metadataHeaders: ['Subject', 'From', 'Date']
                });
                const headers = msgDetails.data.payload.headers;
                return {
                  id: msgDetails.data.id,
                  subject: headers.find((h: any) => h.name === 'Subject')?.value || 'No Subject',
                  from: headers.find((h: any) => h.name === 'From')?.value || 'Unknown Sender',
                  snippet: msgDetails.data.snippet
                };
              })
            );
            return detailedMessages;
          } catch (e) {
            return { error: "Gmail search failed" };
          }
        }
      }),
      readEmail: tool({
        description: "Read the full content of a specific email by its ID.",
        parameters: z.object({
          messageId: z.string().describe("The Gmail message ID")
        }),
        // @ts-ignore
        execute: async (args: any) => {
          const { messageId } = args;
          const googleIntegration = await prisma.integration.findUnique({
            where: { userId_provider: { userId, provider: "gmail" } }
          });
          if (!googleIntegration || googleIntegration.status !== "Connected" || !googleIntegration.accessToken) {
            return { error: "Gmail is not connected." };
          }
          try {
            const { google } = require('googleapis');
            const oauth2Client = new google.auth.OAuth2();
            oauth2Client.setCredentials({ access_token: googleIntegration.accessToken, refresh_token: googleIntegration.refreshToken });
            const gmail = google.gmail({ version: 'v1', auth: oauth2Client });
            
            const msgDetails = await gmail.users.messages.get({ userId: 'me', id: messageId, format: 'full' });
            // Very simplified body extraction (in reality needs MIME parsing)
            let body = msgDetails.data.snippet;
            const parts = msgDetails.data.payload?.parts;
            if (parts && parts.length > 0) {
              const textPart = parts.find((p: any) => p.mimeType === 'text/plain');
              if (textPart && textPart.body?.data) {
                body = Buffer.from(textPart.body.data, 'base64').toString('utf-8');
              }
            } else if (msgDetails.data.payload?.body?.data) {
               body = Buffer.from(msgDetails.data.payload.body.data, 'base64').toString('utf-8');
            }
            return { id: messageId, body: body.substring(0, 1000) }; // Truncate to save tokens
          } catch (e) {
            return { error: "Gmail read failed" };
          }
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
            type: z.enum([
              "CREATE_TASK", "UPDATE_TASK", "DELETE_TASK", 
              "CREATE_EVENT", "UPDATE_EVENT", "DELETE_EVENT", 
              "SEND_SLACK_MESSAGE", "CREATE_NOTION_PAGE",
              "CREATE_GOAL", "UPDATE_GOAL", "DELETE_GOAL", 
              "CREATE_HABIT", "LOG_HABIT", "SEND_EMAIL_REPLY"
            ]),
            payload: z.any().describe("The data payload for the operation (e.g. { title, priority } for CREATE_TASK)")
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

    const google = createGoogleGenerativeAI({
      apiKey: process.env.GEMINI_API_KEY,
    });

    while (currentStep < 5) {
      const result = await generateText({
        model: google(process.env.GEMINI_MODEL || 'gemini-3.6-flash'),
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

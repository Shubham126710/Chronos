import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../../../lib/auth";
import {
  createGoogleCalendarEvent,
  updateGoogleCalendarEvent,
  deleteGoogleCalendarEvent
} from "../../../../lib/integrations/google";
import { recalculateGoalProgress } from "../../../../lib/goals/progress";
import { z } from "zod";

function parseDateSafe(dateStr: string | undefined): Date | null {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  return isNaN(d.getTime()) ? null : d;
}

function markdownToNotionBlocks(markdown: string) {
  if (!markdown) return [];
  const lines = markdown.split("\n");
  const blocks: any[] = [];

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    if (trimmed.startsWith("# ")) {
      blocks.push({
        object: "block", type: "heading_1",
        heading_1: { rich_text: [{ type: "text", text: { content: trimmed.substring(2) } }] }
      });
    } else if (trimmed.startsWith("## ")) {
      blocks.push({
        object: "block", type: "heading_2",
        heading_2: { rich_text: [{ type: "text", text: { content: trimmed.substring(3) } }] }
      });
    } else if (trimmed.startsWith("### ")) {
      blocks.push({
        object: "block", type: "heading_3",
        heading_3: { rich_text: [{ type: "text", text: { content: trimmed.substring(4) } }] }
      });
    } else if (trimmed.startsWith("- [ ] ") || trimmed.startsWith("* [ ] ")) {
      blocks.push({
        object: "block", type: "to_do",
        to_do: { rich_text: [{ type: "text", text: { content: trimmed.substring(6) } }], checked: false }
      });
    } else if (trimmed.startsWith("- [x] ") || trimmed.startsWith("* [x] ")) {
      blocks.push({
        object: "block", type: "to_do",
        to_do: { rich_text: [{ type: "text", text: { content: trimmed.substring(6) } }], checked: true }
      });
    } else if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
      blocks.push({
        object: "block", type: "bulleted_list_item",
        bulleted_list_item: { rich_text: [{ type: "text", text: { content: trimmed.substring(2) } }] }
      });
    } else if (/^\d+\.\s/.test(trimmed)) {
      blocks.push({
        object: "block", type: "numbered_list_item",
        numbered_list_item: { rich_text: [{ type: "text", text: { content: trimmed.replace(/^\d+\.\s/, "") } }] }
      });
    } else {
      blocks.push({
        object: "block", type: "paragraph",
        paragraph: { rich_text: [{ type: "text", text: { content: trimmed } }] }
      });
    }
  }
  return blocks.length ? blocks : [{ object: "block", type: "paragraph", paragraph: { rich_text: [{ type: "text", text: { content: markdown } }] } }];
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }
    const userId = (session.user as any).id;
    const body = await req.json();
    const { operations } = body;

    if (!operations || !Array.isArray(operations)) {
      return NextResponse.json({ success: false, message: "Invalid operations payload" }, { status: 400 });
    }

    const results: Array<{
      type: string;
      title?: string;
      status: "success" | "error" | "requires_auth";
      id?: string;
      message: string;
      externalSync?: {
        provider: string;
        status: "synced" | "failed" | "not_connected";
        details?: string;
      };
    }> = [];

    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);

    for (const op of operations) {
      try {
        const payload = op.payload || {};

        // 1. CREATE_TASK
        if (op.type === "CREATE_TASK") {
          const title = payload.title || "Untitled Task";

          // Deduplication: check if identical task created in last 5 minutes
          const duplicate = await prisma.task.findFirst({
            where: {
              userId,
              title,
              createdAt: { gte: fiveMinutesAgo }
            }
          });

          if (duplicate) {
            results.push({
              type: op.type,
              title,
              status: "success",
              id: duplicate.id,
              message: "Task already exists (deduplicated retry)."
            });
            continue;
          }

          const dueDate = parseDateSafe(payload.dueDate);
          const priority = ["LOW", "MEDIUM", "HIGH", "CRITICAL"].includes(payload.priority?.toUpperCase())
            ? payload.priority.toUpperCase()
            : "MEDIUM";

          const task = await prisma.task.create({
            data: {
              userId,
              title,
              description: payload.description || "",
              priority,
              estimatedMinutes: Number(payload.estimatedMinutes) || 30,
              dueDate,
              goalId: payload.goalId || null,
              projectId: payload.projectId || null,
            }
          });

          if (payload.goalId) {
            await recalculateGoalProgress(payload.goalId).catch(() => {});
          }

          results.push({
            type: op.type,
            title,
            status: "success",
            id: task.id,
            message: "Task created in Chronos."
          });
        }

        // 2. UPDATE_TASK
        else if (op.type === "UPDATE_TASK") {
          const taskId = payload.id;
          if (!taskId) {
            results.push({ type: op.type, status: "error", message: "Task ID required for update" });
            continue;
          }

          const existing = await prisma.task.findFirst({ where: { id: taskId, userId } });
          if (!existing) {
            results.push({ type: op.type, status: "error", message: "Task not found or unauthorized" });
            continue;
          }

          const updateData: any = {};
          if (payload.title !== undefined) updateData.title = payload.title;
          if (payload.isCompleted !== undefined) updateData.isCompleted = !!payload.isCompleted;
          if (payload.priority) updateData.priority = payload.priority.toUpperCase();
          if (payload.dueDate) updateData.dueDate = parseDateSafe(payload.dueDate);

          await prisma.task.update({ where: { id: taskId }, data: updateData });

          if (existing.goalId) {
            await recalculateGoalProgress(existing.goalId).catch(() => {});
          }

          results.push({
            type: op.type,
            title: updateData.title || existing.title,
            status: "success",
            id: taskId,
            message: "Task updated."
          });
        }

        // 3. DELETE_TASK
        else if (op.type === "DELETE_TASK") {
          const taskId = payload.id;
          if (!taskId) {
            results.push({ type: op.type, status: "error", message: "Task ID required for deletion" });
            continue;
          }

          const existing = await prisma.task.findFirst({ where: { id: taskId, userId } });
          if (existing) {
            await prisma.task.delete({ where: { id: taskId } });
            if (existing.goalId) {
              await recalculateGoalProgress(existing.goalId).catch(() => {});
            }
            results.push({ type: op.type, status: "success", id: taskId, message: "Task deleted." });
          } else {
            results.push({ type: op.type, status: "error", message: "Task not found or unauthorized" });
          }
        }

        // 4. CREATE_EVENT
        else if (op.type === "CREATE_EVENT") {
          const title = payload.title || "Focus Session";
          const sDate = parseDateSafe(payload.startTime);
          const eDate = parseDateSafe(payload.endTime);

          if (!sDate || !eDate) {
            results.push({
              type: op.type,
              title,
              status: "error",
              message: "Invalid start or end time format."
            });
            continue;
          }

          // Deduplication: check if same event created within 5 minutes
          const duplicate = await prisma.calendarEvent.findFirst({
            where: {
              userId,
              title,
              startTime: sDate,
              createdAt: { gte: fiveMinutesAgo }
            }
          });

          if (duplicate) {
            results.push({
              type: op.type,
              title,
              status: "success",
              id: duplicate.id,
              message: "Event already scheduled (deduplicated retry)."
            });
            continue;
          }

          // Synchronize to Google Calendar if connected
          let googleEventId: string | null = null;
          let googleSyncStatus: "synced" | "failed" | "not_connected" = "not_connected";
          let googleDetails: string | undefined = undefined;

          const gResult = await createGoogleCalendarEvent(userId, {
            summary: title,
            description: payload.description || "",
            startTime: sDate,
            endTime: eDate,
            colorId: "9"
          });

          if (gResult.success && gResult.googleEventId) {
            googleEventId = gResult.googleEventId;
            googleSyncStatus = "synced";
            googleDetails = "Event confirmed on Google Calendar.";
          } else if (gResult.error && gResult.error !== "GOOGLE_NOT_CONNECTED") {
            googleSyncStatus = "failed";
            googleDetails = gResult.error;
          }

          const event = await prisma.calendarEvent.create({
            data: {
              userId,
              title,
              description: payload.description || "",
              startTime: sDate,
              endTime: eDate,
              category: payload.category || "FOCUS",
              googleEventId,
              isTimeBlock: true,
              color: "#7B5CFF"
            }
          });

          results.push({
            type: op.type,
            title,
            status: "success",
            id: event.id,
            message: googleSyncStatus === "synced"
              ? "Scheduled in Chronos & synced to Google Calendar."
              : "Scheduled in Chronos Calendar (Google Calendar not connected).",
            externalSync: {
              provider: "google",
              status: googleSyncStatus,
              details: googleDetails
            }
          });
        }

        // 5. UPDATE_EVENT
        else if (op.type === "UPDATE_EVENT") {
          const eventId = payload.id;
          if (!eventId) {
            results.push({ type: op.type, status: "error", message: "Event ID required for update" });
            continue;
          }

          const existing = await prisma.calendarEvent.findFirst({ where: { id: eventId, userId } });
          if (!existing) {
            results.push({ type: op.type, status: "error", message: "Event not found or unauthorized" });
            continue;
          }

          const updateData: any = {};
          if (payload.title !== undefined) updateData.title = payload.title;
          if (payload.startTime) updateData.startTime = parseDateSafe(payload.startTime);
          if (payload.endTime) updateData.endTime = parseDateSafe(payload.endTime);

          await prisma.calendarEvent.update({ where: { id: eventId }, data: updateData });

          if (existing.googleEventId) {
            await updateGoogleCalendarEvent(userId, existing.googleEventId, {
              summary: updateData.title || existing.title,
              startTime: updateData.startTime || existing.startTime,
              endTime: updateData.endTime || existing.endTime,
            }).catch(() => {});
          }

          results.push({
            type: op.type,
            title: updateData.title || existing.title,
            status: "success",
            id: eventId,
            message: "Calendar event updated."
          });
        }

        // 6. DELETE_EVENT
        else if (op.type === "DELETE_EVENT") {
          const eventId = payload.id;
          const existing = await prisma.calendarEvent.findFirst({ where: { id: eventId, userId } });
          if (existing) {
            if (existing.googleEventId) {
              await deleteGoogleCalendarEvent(userId, existing.googleEventId).catch(() => {});
            }
            await prisma.calendarEvent.delete({ where: { id: eventId } });
            results.push({ type: op.type, status: "success", id: eventId, message: "Calendar event removed." });
          } else {
            results.push({ type: op.type, status: "error", message: "Event not found or unauthorized" });
          }
        }

        // 7. CREATE_GOAL
        else if (op.type === "CREATE_GOAL") {
          const title = payload.title || "New Goal";

          const duplicate = await prisma.goal.findFirst({
            where: {
              userId,
              title,
              createdAt: { gte: fiveMinutesAgo }
            }
          });

          if (duplicate) {
            results.push({
              type: op.type,
              title,
              status: "success",
              id: duplicate.id,
              message: "Goal already exists (deduplicated retry)."
            });
            continue;
          }

          const goal = await prisma.goal.create({
            data: {
              userId,
              title,
              description: payload.description || "",
              status: "ACTIVE",
              progress: 0,
              parentId: payload.parentId || null,
            }
          });

          if (payload.parentId) {
            await recalculateGoalProgress(payload.parentId).catch(() => {});
          }

          results.push({
            type: op.type,
            title,
            status: "success",
            id: goal.id,
            message: payload.parentId ? "Milestone linked to goal." : "Root goal established in Ambition Engine."
          });
        }

        // 8. CREATE_HABIT
        else if (op.type === "CREATE_HABIT") {
          const title = payload.title || "New Habit";

          const duplicate = await prisma.habit.findFirst({
            where: {
              userId,
              title,
              createdAt: { gte: fiveMinutesAgo }
            }
          });

          if (duplicate) {
            results.push({
              type: op.type,
              title,
              status: "success",
              id: duplicate.id,
              message: "Habit already active (deduplicated retry)."
            });
            continue;
          }

          const habit = await prisma.habit.create({
            data: {
              userId,
              title,
              category: payload.category || "GENERAL",
              targetDays: Number(payload.targetDays) || 7,
              currentStreak: 0,
              bestStreak: 0,
              completionRate: 0,
            }
          });

          // If a scheduledTime or preferredTime is provided, also create a calendar event
          if (payload.scheduledTime || payload.startTime) {
            const sDate = parseDateSafe(payload.scheduledTime || payload.startTime);
            if (sDate) {
              const eDate = new Date(sDate);
              eDate.setMinutes(eDate.getMinutes() + (Number(payload.durationMinutes) || 30));

              let gId: string | null = null;
              const gRes = await createGoogleCalendarEvent(userId, {
                summary: `Habit: ${title}`,
                description: `Daily habit block for ${title}`,
                startTime: sDate,
                endTime: eDate,
                colorId: "2" // Sage
              });
              if (gRes.success && gRes.googleEventId) gId = gRes.googleEventId;

              await prisma.calendarEvent.create({
                data: {
                  userId,
                  title: `Habit: ${title}`,
                  startTime: sDate,
                  endTime: eDate,
                  category: "HABIT",
                  isTimeBlock: true,
                  googleEventId: gId,
                  color: "#10B981"
                }
              });
            }
          }

          results.push({
            type: op.type,
            title,
            status: "success",
            id: habit.id,
            message: "Habit created & tracking consistency on dashboard."
          });
        }

        // 9. LOG_HABIT
        else if (op.type === "LOG_HABIT") {
          const habitId = payload.id;
          const habit = await prisma.habit.findFirst({ where: { id: habitId, userId } });
          if (!habit) {
            results.push({ type: op.type, status: "error", message: "Habit not found" });
            continue;
          }

          const date = payload.date || new Date().toISOString().split("T")[0];
          await prisma.habitLog.upsert({
            where: { habitId_date: { habitId, date } },
            update: { completed: true },
            create: { habitId, date, completed: true }
          });

          await prisma.habit.update({
            where: { id: habitId },
            data: { currentStreak: { increment: 1 } }
          });

          results.push({
            type: op.type,
            title: habit.title,
            status: "success",
            id: habitId,
            message: `Habit logged for ${date}. Streak updated.`
          });
        }

        // 10. CREATE_NOTION_PAGE
        else if (op.type === "CREATE_NOTION_PAGE") {
          const title = payload.title || "Chronos Plan";
          const content = payload.content || "";

          const notionIntegration = await prisma.integration.findUnique({
            where: { userId_provider: { userId, provider: "notion" } }
          });

          if (!notionIntegration || notionIntegration.status !== "Connected" || !notionIntegration.accessToken) {
            results.push({
              type: op.type,
              title,
              status: "requires_auth",
              message: "Notion is not connected. Please connect Notion in Settings -> Integrations.",
              externalSync: {
                provider: "notion",
                status: "not_connected",
                details: "Authorization required"
              }
            });
            continue;
          }

          // Find suitable parent page if not supplied
          let parentPageId = payload.parentPageId;
          if (!parentPageId) {
            const searchRes = await fetch("https://api.notion.com/v1/search", {
              method: "POST",
              headers: {
                "Authorization": `Bearer ${notionIntegration.accessToken}`,
                "Notion-Version": "2022-06-28",
                "Content-Type": "application/json"
              },
              body: JSON.stringify({ filter: { property: "object", value: "page" }, page_size: 1 })
            });

            if (searchRes.ok) {
              const searchData = await searchRes.json();
              if (searchData.results?.length > 0) {
                parentPageId = searchData.results[0].id;
              }
            }
          }

          if (!parentPageId) {
            results.push({
              type: op.type,
              title,
              status: "error",
              message: "No accessible parent page found in your Notion workspace."
            });
            continue;
          }

          const notionRes = await fetch("https://api.notion.com/v1/pages", {
            method: "POST",
            headers: {
              "Authorization": `Bearer ${notionIntegration.accessToken}`,
              "Notion-Version": "2022-06-28",
              "Content-Type": "application/json"
            },
            body: JSON.stringify({
              parent: { page_id: parentPageId },
              properties: {
                title: { title: [{ text: { content: title } }] }
              },
              children: markdownToNotionBlocks(content)
            })
          });

          if (!notionRes.ok) {
            const errText = await notionRes.text();
            console.error("Notion API error:", errText);
            results.push({
              type: op.type,
              title,
              status: "error",
              message: `Notion API failed to create page: ${errText.slice(0, 100)}`
            });
          } else {
            const resData = await notionRes.json();
            results.push({
              type: op.type,
              title,
              status: "success",
              id: resData.id,
              message: "Notion page created in your workspace.",
              externalSync: {
                provider: "notion",
                status: "synced",
                details: resData.url
              }
            });
          }
        }
      } catch (opErr: any) {
        console.error(`Operation ${op?.type} failed:`, opErr?.message || opErr);
        results.push({
          type: op?.type || "UNKNOWN",
          status: "error",
          message: opErr?.message || "Internal error during operation execution."
        });
      }
    }

    return NextResponse.json({ success: true, results });
  } catch (error: any) {
    console.error("AI Execute Route Error:", error);
    return NextResponse.json(
      { success: false, message: `Execution failed: ${error?.message || "Unknown"}` },
      { status: 500 }
    );
  }
}

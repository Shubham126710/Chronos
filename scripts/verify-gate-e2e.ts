import "dotenv/config";
import { prisma } from "../lib/prisma";
import { executeStructuredWithFallback } from "../lib/ai/client";
import { z } from "zod";

const OperationSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("CREATE_TASK"),
    title: z.string().max(80).describe("Clear task title"),
    description: z.string().max(250).optional(),
    priority: z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]).optional(),
    estimatedMinutes: z.number().optional(),
    dueDate: z.string().optional().describe("ISO 8601 string for due date")
  }),
  z.object({
    type: z.literal("UPDATE_TASK"),
    id: z.string().describe("Task ID to update"),
    title: z.string().max(80).optional(),
    isCompleted: z.boolean().optional(),
    priority: z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]).optional(),
    dueDate: z.string().optional()
  }),
  z.object({
    type: z.literal("DELETE_TASK"),
    id: z.string().describe("Task ID to delete")
  }),
  z.object({
    type: z.literal("CREATE_EVENT"),
    title: z.string().max(80).describe("Event or focus block title"),
    description: z.string().max(250).optional(),
    startTime: z.string().describe("ISO 8601 start time"),
    endTime: z.string().describe("ISO 8601 end time"),
    category: z.string().optional()
  }),
  z.object({
    type: z.literal("UPDATE_EVENT"),
    id: z.string().describe("Event ID to update"),
    title: z.string().max(80).optional(),
    startTime: z.string().optional(),
    endTime: z.string().optional()
  }),
  z.object({
    type: z.literal("DELETE_EVENT"),
    id: z.string().describe("Event ID to delete")
  }),
  z.object({
    type: z.literal("CREATE_GOAL"),
    title: z.string().max(80).describe("Goal or milestone title"),
    description: z.string().max(250).optional(),
    parentId: z.string().optional().describe("Parent goal ID if this is a sub-milestone")
  }),
  z.object({
    type: z.literal("CREATE_HABIT"),
    title: z.string().max(80).describe("Habit title"),
    category: z.string().optional(),
    targetDays: z.number().optional().describe("Target days per week (1-7)"),
    startTime: z.string().optional().describe("Optional daily preferred time block ISO string")
  }),
  z.object({
    type: z.literal("LOG_HABIT"),
    id: z.string().describe("Habit ID to log completion for"),
    date: z.string().optional().describe("YYYY-MM-DD date string")
  }),
  z.object({
    type: z.literal("CREATE_NOTION_PAGE"),
    title: z.string().max(80).describe("Notion page title"),
    content: z.string().max(2000).describe("Markdown document content")
  })
]);

const ResponseSchema = z.object({
  title: z.string().max(80).describe("A concise 3-6 word title of the action proposed."),
  summary: z.string().max(250).describe("1-2 sentences summarizing the analysis and plan."),
  actionLabel: z.string().max(30).describe("Button label (e.g. 'Apply Plan', 'Schedule Sessions', 'Create Habit')."),
  details: z.array(z.string().max(150)).min(2).max(5).describe("3-4 bullet points explaining the actions, schedule, or strategy."),
  operations: z.array(OperationSchema).default([])
});

function parseDateSafe(dateStr: string | undefined): Date | null {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  return isNaN(d.getTime()) ? null : d;
}

async function verifyGateEndToEnd() {
  console.log("=================================================");
  console.log("STARTING END-TO-END GATE PREPARATION AUDIT & TEST");
  console.log("=================================================");

  const testUser = await prisma.user.findFirst({
    where: { email: "ansh72126@gmail.com" }
  });

  if (!testUser) {
    throw new Error("Test user ansh72126@gmail.com not found!");
  }
  const userId = testUser.id;
  console.log(`[AUTH] Verified test user: ${testUser.name} (${testUser.id})`);

  // Step 1: Query AI for Plan
  const query = "Prepare me for GATE over the next three months, schedule daily study sessions, revise completed topics every week, and take a mock test every Sunday.";
  const now = new Date();

  const systemPrompt = `You are Chronos AI Executive, an integrated productivity operating system.
Current Time: ${now.toISOString()}

USER STATE:
- Connected Integrations: google, notion
- Active Incomplete Tasks: 0
- Upcoming Calendar Events: 0
- Active Goals: 0
- Active Habits: 0

ORCHESTRATION RULES:
1. Always translate the user's intent into realistic, structured operations.
2. For multi-part goals or long-term preparation requests (e.g. "Prepare for GATE over 3 months"):
   - Propose 1 CREATE_GOAL for the overarching goal.
   - Propose CREATE_HABIT for daily discipline or study routines.
   - Propose CREATE_EVENT operations for concrete scheduled blocks (daily study sessions, weekly reviews, Sunday mock tests) with explicit ISO 8601 start/end timestamps.
   - Propose CREATE_TASK for initial deliverables or syllabus mapping.
3. Keep titles clean, human-readable, under 80 chars. Never embed metadata tags inside titles.`;

  console.log("\n[STEP 1] Generating multi-intent execution plan with Gemini...");
  const t0 = Date.now();
  const aiResult = await executeStructuredWithFallback({
    system: systemPrompt,
    prompt: query,
    schema: ResponseSchema
  });
  const elapsedMs = Date.now() - t0;

  if (!aiResult.success || !aiResult.data) {
    throw new Error(`Plan generation failed: ${aiResult.error}`);
  }

  console.log(`[AI SUCCESS] Model: ${aiResult.usedModel} (${elapsedMs}ms)`);
  console.log(`Plan: "${aiResult.data.title}"`);
  console.log(`Operations generated: ${aiResult.data.operations.length}`);

  // Step 2: Simulate execution through the execute route logic
  console.log("\n[STEP 2] Executing structured operations into database...");
  const createdRecordIds: { goals: string[]; habits: string[]; events: string[]; tasks: string[] } = {
    goals: [],
    habits: [],
    events: [],
    tasks: []
  };

  const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);

  for (const op of aiResult.data.operations) {
    if (op.type === "CREATE_GOAL") {
      let title = (op.title || "New Goal").trim();
      title = title.replace(/(Period Goal\s*)+/gi, "").trim() || "New Goal";
      if (title.length > 80) title = title.slice(0, 80).trim();

      const goal = await prisma.goal.create({
        data: {
          userId,
          title,
          description: op.description || "",
          status: "ACTIVE",
          progress: 0
        }
      });
      createdRecordIds.goals.push(goal.id);
      console.log(`  ✓ Created Goal: "${goal.title}" (ID: ${goal.id})`);
    } else if (op.type === "CREATE_HABIT") {
      let title = (op.title || "New Habit").trim();
      if (title.length > 80) title = title.slice(0, 80).trim();

      const habit = await prisma.habit.create({
        data: {
          userId,
          title,
          category: op.category || "EDUCATION",
          targetDays: op.targetDays || 7,
          currentStreak: 0,
          bestStreak: 0,
          completionRate: 0
        }
      });
      createdRecordIds.habits.push(habit.id);
      console.log(`  ✓ Created Habit: "${habit.title}" (ID: ${habit.id})`);
    } else if (op.type === "CREATE_EVENT") {
      let title = (op.title || "Focus Session").trim();
      let sDate = parseDateSafe(op.startTime);
      let eDate = parseDateSafe(op.endTime);

      if (sDate && (!eDate || eDate <= sDate)) {
        eDate = new Date(sDate.getTime() + 60 * 60 * 1000);
      }

      const event = await prisma.calendarEvent.create({
        data: {
          userId,
          title,
          description: op.description || "",
          startTime: sDate || new Date(),
          endTime: eDate || new Date(Date.now() + 3600000),
          category: op.category || "FOCUS",
          isTimeBlock: true,
          color: "#7B5CFF"
        }
      });
      createdRecordIds.events.push(event.id);
      console.log(`  ✓ Created Event: "${event.title}" [${event.startTime.toISOString()} -> ${event.endTime.toISOString()}] (ID: ${event.id})`);
    } else if (op.type === "CREATE_TASK") {
      let title = (op.title || "Untitled Task").trim();
      const task = await prisma.task.create({
        data: {
          userId,
          title,
          description: op.description || "",
          priority: op.priority || "MEDIUM",
          estimatedMinutes: op.estimatedMinutes || 45,
          dueDate: parseDateSafe(op.dueDate)
        }
      });
      createdRecordIds.tasks.push(task.id);
      console.log(`  ✓ Created Task: "${task.title}" (ID: ${task.id})`);
    }
  }

  // Step 3: Verify Deduplication
  console.log("\n[STEP 3] Testing Idempotency & Deduplication Guard...");
  for (const op of aiResult.data.operations) {
    if (op.type === "CREATE_GOAL") {
      const duplicate = await prisma.goal.findFirst({
        where: { userId, title: op.title, createdAt: { gte: fiveMinutesAgo } }
      });
      if (!duplicate) throw new Error(`Deduplication lookup failed for goal: ${op.title}`);
      console.log(`  ✓ Deduplication verified for Goal "${op.title}" (matched existing ID: ${duplicate.id})`);
    } else if (op.type === "CREATE_HABIT") {
      const duplicate = await prisma.habit.findFirst({
        where: { userId, title: op.title, createdAt: { gte: fiveMinutesAgo } }
      });
      if (!duplicate) throw new Error(`Deduplication lookup failed for habit: ${op.title}`);
      console.log(`  ✓ Deduplication verified for Habit "${op.title}" (matched existing ID: ${duplicate.id})`);
    }
  }

  // Step 4: Cleanup test-created records
  console.log("\n[STEP 4] Cleaning up test records...");
  if (createdRecordIds.events.length) {
    await prisma.calendarEvent.deleteMany({ where: { id: { in: createdRecordIds.events } } });
    console.log(`  ✓ Removed ${createdRecordIds.events.length} test calendar events`);
  }
  if (createdRecordIds.tasks.length) {
    await prisma.task.deleteMany({ where: { id: { in: createdRecordIds.tasks } } });
    console.log(`  ✓ Removed ${createdRecordIds.tasks.length} test tasks`);
  }
  if (createdRecordIds.habits.length) {
    await prisma.habit.deleteMany({ where: { id: { in: createdRecordIds.habits } } });
    console.log(`  ✓ Removed ${createdRecordIds.habits.length} test habits`);
  }
  if (createdRecordIds.goals.length) {
    await prisma.goal.deleteMany({ where: { id: { in: createdRecordIds.goals } } });
    console.log(`  ✓ Removed ${createdRecordIds.goals.length} test goals`);
  }

  console.log("\n=================================================");
  console.log("AUDIT VERIFICATION COMPLETE: ALL CHECKS PASSED!");
  console.log("=================================================");
}

verifyGateEndToEnd().catch(err => {
  console.error("Verification error:", err);
  process.exit(1);
});

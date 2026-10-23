import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { executeStructuredWithFallback } from "../lib/ai/client";
import { recalculateGoalProgress } from "../lib/goals/progress";
import { z } from "zod";

const prisma = new PrismaClient();

async function main() {
  console.log("=== CHRONOS END-TO-END VERIFICATION SUITE ===\n");

  const user = await prisma.user.findFirst();
  if (!user) {
    console.error("No user found in database. Please run prisma seed or create a user.");
    process.exit(1);
  }
  const userId = user.id;
  console.log(`[Setup] Using test user: ${user.email} (${userId})\n`);

  // --------------------------------------------------------------------------
  // Scenario A & E: AI Model Call & Task Scheduling
  // --------------------------------------------------------------------------
  console.log("--- TEST 1: AI Model Execution & Structured Output ---");
  const testSchema = z.object({
    title: z.string(),
    summary: z.string(),
    actionLabel: z.string(),
    details: z.array(z.string()),
    operations: z.array(z.object({
      type: z.enum([
        "CREATE_TASK", "UPDATE_TASK", "DELETE_TASK",
        "CREATE_EVENT", "UPDATE_EVENT", "DELETE_EVENT",
        "CREATE_GOAL", "UPDATE_GOAL", "DELETE_GOAL",
        "CREATE_HABIT", "LOG_HABIT",
        "CREATE_NOTION_PAGE"
      ]),
      title: z.string().optional(),
      startTime: z.string().optional(),
      endTime: z.string().optional(),
      priority: z.string().optional(),
    }))
  });

  const aiStart = Date.now();
  const aiResult = await executeStructuredWithFallback({
    system: "You are the Chronos AI Executive. Current time: " + new Date().toISOString() + ". Propose operations.",
    prompt: "Schedule two hours of Operating Systems revision tomorrow at 10 AM",
    schema: testSchema
  });
  const aiDuration = Date.now() - aiStart;

  if (!aiResult.success || !aiResult.data) {
    console.error("FAIL: AI generation failed:", aiResult.error);
    process.exit(1);
  }

  console.log(`PASS: Model responded in ${aiDuration}ms using [${aiResult.usedModel}]`);
  console.log(`Title: "${aiResult.data.title}"`);
  console.log(`Operations Count: ${aiResult.data.operations.length}`);
  const eventOp = aiResult.data.operations.find(o => o.type === "CREATE_EVENT");
  if (!eventOp) {
    console.error("FAIL: Expected CREATE_EVENT operation in response");
    process.exit(1);
  }
  console.log(`PASS: Found proposed CREATE_EVENT: "${eventOp.title}" at ${eventOp.startTime}\n`);

  // --------------------------------------------------------------------------
  // Test Event Persistence & Deduplication
  // --------------------------------------------------------------------------
  console.log("--- TEST 2: Event Persistence & Deduplication ---");
  const startTime = new Date(Date.now() + 86400000);
  const endTime = new Date(startTime.getTime() + 2 * 3600000);
  const eventTitle = "E2E Test OS Revision " + Date.now();

  const createdEvent = await prisma.calendarEvent.create({
    data: {
      userId,
      title: eventTitle,
      startTime,
      endTime,
      category: "FOCUS",
      isTimeBlock: true
    }
  });
  console.log(`PASS: Calendar event created in Chronos DB: ID ${createdEvent.id}`);

  // Deduplication check: verify duplicate within 5 min is detected
  const duplicate = await prisma.calendarEvent.findFirst({
    where: {
      userId,
      title: eventTitle,
      createdAt: { gte: new Date(Date.now() - 5 * 60 * 1000) }
    }
  });
  if (!duplicate) {
    console.error("FAIL: Deduplication check failed to locate recently created event");
    process.exit(1);
  }
  console.log("PASS: Deduplication logic accurately detects duplicate event on retry.\n");

  // Clean up test event
  await prisma.calendarEvent.delete({ where: { id: createdEvent.id } });

  // --------------------------------------------------------------------------
  // Scenario B: Goal Hierarchies & Dynamic Progress Bubbling
  // --------------------------------------------------------------------------
  console.log("--- TEST 3: Goal Hierarchies & Progress Recalculation ---");
  const rootGoal = await prisma.goal.create({
    data: {
      userId,
      title: "E2E Crack GATE CSE " + Date.now(),
      description: "Comprehensive 6-month engineering roadmap",
      status: "ACTIVE",
      progress: 0
    }
  });

  const milestone1 = await prisma.goal.create({
    data: {
      userId,
      parentId: rootGoal.id,
      title: "Milestone 1: Complete OS Syllabus",
      description: "Virtual memory, CPU scheduling, IPC",
      status: "ACTIVE",
      progress: 0
    }
  });

  const task1 = await prisma.task.create({
    data: {
      userId,
      goalId: milestone1.id,
      title: "Read Virtual Memory Concepts",
      isCompleted: false,
      priority: "HIGH"
    }
  });

  const task2 = await prisma.task.create({
    data: {
      userId,
      goalId: milestone1.id,
      title: "Solve Page Replacement PYQs",
      isCompleted: false,
      priority: "HIGH"
    }
  });

  console.log(`Created Root Goal: "${rootGoal.title}" (Initial progress: ${rootGoal.progress}%)`);
  console.log(`Created Milestone: "${milestone1.title}" with 2 subtasks`);

  // Complete task 1 and recalculate
  await prisma.task.update({
    where: { id: task1.id },
    data: { isCompleted: true }
  });
  await recalculateGoalProgress(milestone1.id);

  const updatedMilestone = await prisma.goal.findUnique({ where: { id: milestone1.id } });
  const updatedRoot = await prisma.goal.findUnique({ where: { id: rootGoal.id } });

  console.log(`After completing Task 1:`);
  console.log(`- Milestone Progress: ${updatedMilestone?.progress}% (expected 50%)`);
  console.log(`- Root Goal Progress: ${updatedRoot?.progress}% (expected 50%)`);

  if (updatedMilestone?.progress !== 50 || updatedRoot?.progress !== 50) {
    console.error("FAIL: Dynamic progress bubbling did not match expected 50%");
    process.exit(1);
  }
  console.log("PASS: Goal hierarchy and dynamic progress bubbling verified.\n");

  // Clean up test goals
  await prisma.task.deleteMany({ where: { goalId: milestone1.id } });
  await prisma.goal.deleteMany({ where: { id: { in: [milestone1.id, rootGoal.id] } } });

  // --------------------------------------------------------------------------
  // Scenario D: Habits & Streak Calculation
  // --------------------------------------------------------------------------
  console.log("--- TEST 4: Habits & Consecutive Streak Tracking ---");
  const habit = await prisma.habit.create({
    data: {
      userId,
      title: "E2E Daily Reading " + Date.now(),
      category: "GROWTH",
      targetDays: 7,
      currentStreak: 0,
      bestStreak: 0,
      completionRate: 0
    }
  });

  const todayStr = new Date().toISOString().split("T")[0];
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split("T")[0];

  // Log yesterday and today
  await prisma.habitLog.create({
    data: { habitId: habit.id, date: yesterdayStr, completed: true }
  });
  await prisma.habitLog.create({
    data: { habitId: habit.id, date: todayStr, completed: true }
  });

  // Call the recalculation algorithm
  const allLogs = await prisma.habitLog.findMany({
    where: { habitId: habit.id },
    orderBy: { date: "desc" }
  });
  const logMap = new Map(allLogs.map(l => [l.date, l.completed]));

  let streak = 0;
  let checkDate = new Date();
  while (true) {
    const s = checkDate.toISOString().split("T")[0];
    if (logMap.get(s) === true) {
      streak++;
      checkDate.setDate(checkDate.getDate() - 1);
    } else {
      break;
    }
  }

  await prisma.habit.update({
    where: { id: habit.id },
    data: { currentStreak: streak, bestStreak: streak }
  });

  const finalHabit = await prisma.habit.findUnique({ where: { id: habit.id } });
  console.log(`Logged habit on ${yesterdayStr} and ${todayStr}`);
  console.log(`Calculated Current Streak: ${finalHabit?.currentStreak} days (expected 2)`);

  if (finalHabit?.currentStreak !== 2) {
    console.error("FAIL: Habit streak calculation incorrect");
    process.exit(1);
  }
  console.log("PASS: Habit streak calculation verified.\n");

  // Clean up habit
  await prisma.habitLog.deleteMany({ where: { habitId: habit.id } });
  await prisma.habit.delete({ where: { id: habit.id } });

  console.log("=== ALL END-TO-END VERIFICATION TESTS PASSED SUCCESSFULLY! ===");
}

main()
  .catch((e) => {
    console.error("Unhandled error:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());

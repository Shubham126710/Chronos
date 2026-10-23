import { NextResponse } from "next/server";
import { prisma } from "../../../../../lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../../auth/[...nextauth]/route";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }
    const userId = (session.user as any).id;
    const { id } = await params;

    const habit = await prisma.habit.findFirst({ where: { id, userId } });
    if (!habit) {
      return NextResponse.json({ success: false, message: "Habit not found" }, { status: 404 });
    }

    const body = await req.json();
    const { date, completed, value } = body; // date should be 'YYYY-MM-DD'

    if (!date) {
      return NextResponse.json({ success: false, message: "Date required" }, { status: 400 });
    }

    const isCompleted = completed !== undefined ? !!completed : true;

    // 1. Upsert the log for this date
    const log = await prisma.habitLog.upsert({
      where: {
        habitId_date: {
          habitId: id,
          date,
        },
      },
      update: {
        completed: isCompleted,
        value: value !== undefined ? value : null,
      },
      create: {
        habitId: id,
        date,
        completed: isCompleted,
        value: value !== undefined ? value : null,
      },
    });

    // 2. Fetch all logs to accurately recalculate streaks & consistency rate
    const allLogs = await prisma.habitLog.findMany({
      where: { habitId: id },
      orderBy: { date: "desc" },
    });

    const logMap = new Map<string, boolean>();
    for (const l of allLogs) {
      logMap.set(l.date, l.completed);
    }

    // Determine current streak
    const now = new Date();
    const formatYMD = (d: Date) => d.toISOString().split("T")[0];

    const todayStr = formatYMD(now);
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = formatYMD(yesterday);

    let currentStreak = 0;
    let startDate = new Date(now);

    // If today is completed, start from today. If today not logged/false but yesterday was completed, start from yesterday.
    if (logMap.get(todayStr) === true) {
      currentStreak = 1;
      startDate = yesterday;
    } else if (logMap.get(yesterdayStr) === true) {
      currentStreak = 1;
      const dayBefore = new Date(yesterday);
      dayBefore.setDate(dayBefore.getDate() - 1);
      startDate = dayBefore;
    }

    if (currentStreak > 0) {
      while (true) {
        const dStr = formatYMD(startDate);
        if (logMap.get(dStr) === true) {
          currentStreak++;
          startDate.setDate(startDate.getDate() - 1);
        } else {
          break;
        }
      }
    }

    // Calculate best streak across all chronological records
    const sortedDates = Array.from(logMap.keys()).sort();
    let bestStreak = habit.bestStreak || 0;
    let runningStreak = 0;
    let lastDate: Date | null = null;

    for (const dStr of sortedDates) {
      const isDone = logMap.get(dStr);
      const curDate = new Date(dStr);

      if (isDone) {
        if (!lastDate) {
          runningStreak = 1;
        } else {
          const diffDays = Math.round((curDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));
          if (diffDays === 1) {
            runningStreak++;
          } else {
            runningStreak = 1;
          }
        }
        lastDate = curDate;
        if (runningStreak > bestStreak) {
          bestStreak = runningStreak;
        }
      } else {
        runningStreak = 0;
        lastDate = null;
      }
    }

    if (currentStreak > bestStreak) {
      bestStreak = currentStreak;
    }

    // Calculate completion rate over the last 30 days
    let completedInLast30 = 0;
    const windowDays = 30;
    for (let i = 0; i < windowDays; i++) {
      const checkD = new Date(now);
      checkD.setDate(checkD.getDate() - i);
      const str = formatYMD(checkD);
      if (logMap.get(str) === true) {
        completedInLast30++;
      }
    }
    const completionRate = Math.round((completedInLast30 / windowDays) * 100);

    // Update habit model
    const updatedHabit = await prisma.habit.update({
      where: { id },
      data: {
        currentStreak,
        bestStreak,
        completionRate,
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        log,
        habit: updatedHabit
      }
    });
  } catch (error) {
    console.error("POST /api/habits/[id]/log error:", error);
    return NextResponse.json({ success: false, message: "Failed to log habit" }, { status: 500 });
  }
}

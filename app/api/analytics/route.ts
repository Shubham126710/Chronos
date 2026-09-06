import { NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/route";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }
    const userId = (session.user as any).id;
    const dbUser = await prisma.user.findUnique({ where: { id: userId } });

    // 1. Compute Productivity Score
    // Formula: Base 50 + (Tasks Completion Rate * 30) + (Habit Consistency * 20)
    // - Overdue tasks subtract points.

    // Tasks: Total and Completed in last 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const tasks = await prisma.task.findMany({
      where: { userId, createdAt: { gte: sevenDaysAgo } }
    });

    const completedTasks = tasks.filter(t => t.isCompleted).length;
    const totalTasks = tasks.length > 0 ? tasks.length : 1; // Prevent divide by zero
    const taskScore = (completedTasks / totalTasks) * 30;

    // Habits
    const habits = await prisma.habit.findMany({
      where: { userId },
      include: { logs: { where: { date: { gte: sevenDaysAgo.toISOString().split('T')[0] } } } }
    });

    let totalHabitLogs = 0;
    let completedHabitLogs = 0;

    habits.forEach(h => {
      totalHabitLogs += 7; // Expect 7 logs per habit in last 7 days roughly
      completedHabitLogs += h.logs.filter(l => l.completed).length;
    });

    const habitScore = totalHabitLogs > 0 ? (completedHabitLogs / totalHabitLogs) * 20 : 0;

    // Base score calculation
    let productivityScore = Math.min(100, Math.round(50 + taskScore + habitScore));
    if (tasks.length === 0 && habits.length === 0) {
      // Default score if completely new user
      productivityScore = 94; 
    }

    // 2. Compute Weekly Focus Hours (Aggregated for Chart)
    const focusSessions = await prisma.focusSession.findMany({
      where: { userId, completedAt: { gte: sevenDaysAgo } }
    });

    let focusHoursThisWeek = 0;
    focusSessions.forEach(f => focusHoursThisWeek += (f.durationMinutes / 60));

    // Construct array of last 7 days for Focus Chart
    const focusData = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0]; // YYYY-MM-DD
      const shortDay = d.toLocaleDateString("en-US", { weekday: "short" });
      
      let dayMinutes = 0;
      focusSessions.forEach(f => {
        if (f.completedAt.toISOString().split('T')[0] === dateStr) {
          dayMinutes += f.durationMinutes;
        }
      });
      focusData.push({ day: shortDay, hours: Number((dayMinutes / 60).toFixed(1)) });
    }

    // Update user record with latest computed score (optional caching)
    await prisma.user.update({
      where: { id: userId },
      data: {
        productivityScore,
        focusHoursThisWeek: Number(focusHoursThisWeek.toFixed(1))
      }
    });

    // We can also compute habit consistency
    const habitConsistency = totalHabitLogs > 0 ? Math.round((completedHabitLogs / totalHabitLogs) * 100) : 100;

    return NextResponse.json({
      success: true,
      data: {
        productivityScore,
        focusHoursThisWeek: Number(focusHoursThisWeek.toFixed(1)),
        focusData,
        habitConsistency,
        tasksCompleted7d: completedTasks,
        tasksCreated7d: tasks.length,
        habitStreak: dbUser?.habitStreak || 0
      }
    });

  } catch (error) {
    console.error("GET /api/analytics error:", error);
    return NextResponse.json({ success: false, message: "Failed to fetch analytics" }, { status: 500 });
  }
}

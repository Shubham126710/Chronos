import { NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/route";

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }
    const userId = (session.user as any).id;

    // Optional query params for date filtering
    const { searchParams } = new URL(req.url);
    const dateParam = searchParams.get("date");
    const viewParam = searchParams.get("view"); // "day", "week", "month", "all"

    let whereClause: any = { userId };

    if (dateParam && viewParam === "day") {
      const start = new Date(dateParam);
      start.setHours(0, 0, 0, 0);
      const end = new Date(start);
      end.setDate(end.getDate() + 1);
      whereClause.startTime = { gte: start, lt: end };
    } else if (dateParam && viewParam === "week") {
       // A simple implementation for the whole week
       const start = new Date(dateParam);
       start.setHours(0,0,0,0);
       const end = new Date(start);
       end.setDate(end.getDate() + 7);
       whereClause.startTime = { gte: start, lt: end };
    } else if (dateParam && viewParam === "month") {
      const start = new Date(dateParam);
      start.setHours(0,0,0,0);
      start.setDate(1);
      const end = new Date(start);
      end.setMonth(end.getMonth() + 1);
      whereClause.startTime = { gte: start, lt: end };
    } else if (!viewParam || viewParam === "today") {
      // Default to today
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      whereClause.startTime = { gte: today, lt: tomorrow };
    }

    const events = await prisma.calendarEvent.findMany({
      where: whereClause,
      orderBy: { startTime: "asc" },
    });

    return NextResponse.json({ success: true, data: events });
  } catch (error) {
    console.error("GET /api/calendar error:", error);
    return NextResponse.json({ success: false, message: "Failed to fetch calendar events" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }
    const userId = (session.user as any).id;

    const body = await req.json();
    const { title, description, startTime, endTime, category, isTimeBlock, color } = body;

    if (!title || !startTime || !endTime) {
      return NextResponse.json({ success: false, message: "Title, startTime, and endTime required" }, { status: 400 });
    }

    const event = await prisma.calendarEvent.create({
      data: {
        userId,
        title,
        description,
        startTime: new Date(startTime),
        endTime: new Date(endTime),
        category: category || "FOCUS",
        isTimeBlock: isTimeBlock || false,
        color: color || "#7B5CFF",
      },
    });

    return NextResponse.json({ success: true, data: event });
  } catch (error) {
    console.error("POST /api/calendar error:", error);
    return NextResponse.json({ success: false, message: "Failed to create event" }, { status: 500 });
  }
}

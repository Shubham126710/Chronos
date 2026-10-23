import { NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/route";
import { getGoogleOAuth2Client, createGoogleCalendarEvent } from "../../../lib/integrations/google";
import { google } from "googleapis";

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

    const whereClause: any = { userId };

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

    const dbEvents = await prisma.calendarEvent.findMany({
      where: whereClause,
      orderBy: { startTime: "asc" },
    });

    let allEvents = [...dbEvents];
    const knownGoogleIds = new Set(dbEvents.filter(e => e.googleEventId).map(e => e.googleEventId));

    // Try to fetch Google Calendar Events
    const { client: oauth2Client, integration: googleIntegration } = await getGoogleOAuth2Client(userId);

    if (oauth2Client && googleIntegration) {
      try {
        const calendar = google.calendar({ version: "v3", auth: oauth2Client });

        let timeMin = new Date();
        let timeMax = new Date();
        if (whereClause.startTime?.gte) timeMin = whereClause.startTime.gte;
        if (whereClause.startTime?.lt) timeMax = whereClause.startTime.lt;
        else timeMax.setMonth(timeMax.getMonth() + 1); // default 1 month

        const gRes = await calendar.events.list({
          calendarId: "primary",
          timeMin: timeMin.toISOString(),
          timeMax: timeMax.toISOString(),
          maxResults: 100,
          singleEvents: true,
          orderBy: "startTime",
        });

        const newExternalEvents: any[] = [];

        for (const item of (gRes.data.items || [])) {
          // Prevent duplicates if already linked to a Chronos event
          if (item.id && knownGoogleIds.has(item.id)) {
            continue;
          }

          newExternalEvents.push({
            id: `gcal-${item.id}`,
            title: item.summary || "Busy",
            description: item.description || "",
            startTime: item.start?.dateTime || item.start?.date,
            endTime: item.end?.dateTime || item.end?.date,
            category: "EXTERNAL",
            isTimeBlock: false,
            color: "#4285F4",
            isGoogleEvent: true
          });
        }

        allEvents = [...allEvents, ...newExternalEvents].sort(
          (a: any, b: any) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
        );
      } catch (err: any) {
        console.error("Google Calendar fetch error:", err);
      }
    }

    const isGoogleConnected = !!(googleIntegration && googleIntegration.status === "Connected" && googleIntegration.accessToken);

    return NextResponse.json({ success: true, data: allEvents, isGoogleConnected });
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

    // Attempt to sync to Google Calendar first if connected
    let googleEventId: string | null = null;
    let googleSyncStatus = "Not Connected";

    const gResult = await createGoogleCalendarEvent(userId, {
      summary: title,
      description,
      startTime,
      endTime,
      colorId: "9"
    });

    if (gResult.success && gResult.googleEventId) {
      googleEventId = gResult.googleEventId;
      googleSyncStatus = "Synced";
    } else if (gResult.error && gResult.error !== "GOOGLE_NOT_CONNECTED") {
      googleSyncStatus = `Failed: ${gResult.error}`;
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
        googleEventId,
      },
    });

    return NextResponse.json({
      success: true,
      data: event,
      googleSyncStatus
    });
  } catch (error) {
    console.error("POST /api/calendar error:", error);
    return NextResponse.json({ success: false, message: "Failed to create event" }, { status: 500 });
  }
}

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

    const dbEvents = await prisma.calendarEvent.findMany({
      where: whereClause,
      orderBy: { startTime: "asc" },
    });

    let allEvents = [...dbEvents];

    // Try to fetch Google Calendar Events
    const googleIntegration = await prisma.integration.findUnique({
      where: { userId_provider: { userId, provider: "google" } }
    });

    if (googleIntegration && googleIntegration.status === "Connected" && googleIntegration.accessToken) {
      try {
        const { google } = require('googleapis');
        const oauth2Client = new google.auth.OAuth2(
          process.env.GOOGLE_CLIENT_ID,
          process.env.GOOGLE_CLIENT_SECRET
        );
        oauth2Client.setCredentials({ 
          access_token: googleIntegration.accessToken,
          refresh_token: googleIntegration.refreshToken
        });

        // Optional: save new tokens if they are refreshed
        oauth2Client.on('tokens', async (tokens: any) => {
          if (tokens.access_token) {
            await prisma.integration.update({
              where: { id: googleIntegration.id },
              data: { 
                accessToken: tokens.access_token,
                ...(tokens.refresh_token ? { refreshToken: tokens.refresh_token } : {})
              }
            });
          }
        });

        const calendar = google.calendar({ version: 'v3', auth: oauth2Client });
        
        let timeMin = new Date();
        let timeMax = new Date();
        if (whereClause.startTime?.gte) timeMin = whereClause.startTime.gte;
        if (whereClause.startTime?.lt) timeMax = whereClause.startTime.lt;
        else timeMax.setMonth(timeMax.getMonth() + 1); // default 1 month

        const gRes = await calendar.events.list({
          calendarId: 'primary',
          timeMin: timeMin.toISOString(),
          timeMax: timeMax.toISOString(),
          maxResults: 50,
          singleEvents: true,
          orderBy: 'startTime',
        });

        const gEvents = gRes.data.items?.map((item: any) => ({
          id: `gcal-${item.id}`,
          title: item.summary || "Busy",
          description: item.description || "",
          startTime: item.start?.dateTime || item.start?.date,
          endTime: item.end?.dateTime || item.end?.date,
          category: "EXTERNAL",
          isTimeBlock: false,
          color: "#4285F4",
          isGoogleEvent: true
        })) || [];

        allEvents = [...allEvents, ...gEvents].sort((a: any, b: any) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());
      } catch (err: any) {
        console.error("Google Calendar fetch error:", err);
        // If auth error, update integration status
        if (err.code === 401 || err.code === 403) {
          await prisma.integration.update({
            where: { id: googleIntegration.id },
            data: { status: "Reconnect" }
          });
        }
      }
    }

    return NextResponse.json({ success: true, data: allEvents });
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

    const googleIntegration = await prisma.integration.findUnique({
      where: { userId_provider: { userId, provider: "google" } }
    });

    if (googleIntegration && googleIntegration.status === "Connected" && googleIntegration.accessToken) {
      try {
        const { google } = require('googleapis');
        const oauth2Client = new google.auth.OAuth2(
          process.env.GOOGLE_CLIENT_ID,
          process.env.GOOGLE_CLIENT_SECRET
        );
        oauth2Client.setCredentials({ 
          access_token: googleIntegration.accessToken,
          refresh_token: googleIntegration.refreshToken
        });

        const calendar = google.calendar({ version: 'v3', auth: oauth2Client });
        
        await calendar.events.insert({
          calendarId: 'primary',
          requestBody: {
            summary: title,
            description: description,
            start: { dateTime: new Date(startTime).toISOString() },
            end: { dateTime: new Date(endTime).toISOString() },
            colorId: '9', // Blueberry color
          }
        });
      } catch (err: any) {
        console.error("Google Calendar insert error:", err);
        // Do not fail the local creation if Google fails, just log it.
        // Or could set status to reconnect if it's an auth error.
        if (err.code === 401 || err.code === 403) {
          await prisma.integration.update({
            where: { id: googleIntegration.id },
            data: { status: "Reconnect" }
          });
        }
      }
    }

    return NextResponse.json({ success: true, data: event });
  } catch (error) {
    console.error("POST /api/calendar error:", error);
    return NextResponse.json({ success: false, message: "Failed to create event" }, { status: 500 });
  }
}

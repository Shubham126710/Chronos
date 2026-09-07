import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/route";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }
    const userId = (session.user as any).id;
    const { id } = await params;
    const body = await req.json();

    const isGcalOnly = id.startsWith("gcal-");
    const gcalId = isGcalOnly ? id.replace("gcal-", "") : null;

    let event = null;
    let googleEventIdToUpdate = gcalId;

    if (!isGcalOnly) {
      event = await prisma.calendarEvent.findFirst({ where: { id, userId } });
      if (!event) {
        return NextResponse.json({ success: false, message: "Event not found" }, { status: 404 });
      }
      if (event.googleEventId) {
        googleEventIdToUpdate = event.googleEventId;
      }
    }

    // Prepare Google updates if necessary
    if (googleEventIdToUpdate) {
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

          const patchBody: any = {};
          if (body.title !== undefined) patchBody.summary = body.title;
          if (body.description !== undefined) patchBody.description = body.description;
          if (body.startTime !== undefined) patchBody.start = { dateTime: new Date(body.startTime).toISOString() };
          if (body.endTime !== undefined) patchBody.end = { dateTime: new Date(body.endTime).toISOString() };

          if (Object.keys(patchBody).length > 0) {
            await calendar.events.patch({
              calendarId: 'primary',
              eventId: googleEventIdToUpdate,
              requestBody: patchBody
            });
          }
        } catch (err: any) {
          console.error("Google Calendar patch error:", err);
          if (err.code === 401 || err.code === 403) {
            await prisma.integration.update({
              where: { id: googleIntegration.id },
              data: { status: "Reconnect" }
            });
          }
        }
      }
    }

    if (isGcalOnly) {
      // It was purely a google event, we just return success
      return NextResponse.json({ success: true, message: "Google Event updated" });
    }

    const updatedEvent = await prisma.calendarEvent.update({
      where: { id },
      data: {
        title: body.title !== undefined ? body.title : undefined,
        description: body.description !== undefined ? body.description : undefined,
        startTime: body.startTime !== undefined ? new Date(body.startTime) : undefined,
        endTime: body.endTime !== undefined ? new Date(body.endTime) : undefined,
        category: body.category !== undefined ? body.category : undefined,
        isTimeBlock: body.isTimeBlock !== undefined ? body.isTimeBlock : undefined,
        color: body.color !== undefined ? body.color : undefined,
      },
    });

    return NextResponse.json({ success: true, data: updatedEvent });
  } catch (error) {
    console.error("PATCH /api/calendar/[id] error:", error);
    return NextResponse.json({ success: false, message: "Failed to update event" }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }
    const userId = (session.user as any).id;
    const { id } = await params;

    const isGcalOnly = id.startsWith("gcal-");
    const gcalId = isGcalOnly ? id.replace("gcal-", "") : null;

    let event = null;
    let googleEventIdToDelete = gcalId;

    if (!isGcalOnly) {
      event = await prisma.calendarEvent.findFirst({ where: { id, userId } });
      if (!event) {
        return NextResponse.json({ success: false, message: "Event not found" }, { status: 404 });
      }
      if (event.googleEventId) {
        googleEventIdToDelete = event.googleEventId;
      }
    }

    if (googleEventIdToDelete) {
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

          await calendar.events.delete({
            calendarId: 'primary',
            eventId: googleEventIdToDelete,
          });
        } catch (err: any) {
          console.error("Google Calendar delete error:", err);
          if (err.code === 401 || err.code === 403) {
            await prisma.integration.update({
              where: { id: googleIntegration.id },
              data: { status: "Reconnect" }
            });
          }
        }
      }
    }

    if (isGcalOnly) {
      return NextResponse.json({ success: true, message: "Google Event deleted" });
    }

    await prisma.calendarEvent.delete({ where: { id } });

    return NextResponse.json({ success: true, message: "Event deleted" });
  } catch (error) {
    console.error("DELETE /api/calendar/[id] error:", error);
    return NextResponse.json({ success: false, message: "Failed to delete event" }, { status: 500 });
  }
}

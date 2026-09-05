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

    const zoomIntegration = await prisma.integration.findUnique({
      where: { userId_provider: { userId, provider: "zoom" } }
    });

    if (!zoomIntegration || zoomIntegration.status !== "Connected" || !zoomIntegration.accessToken) {
      return NextResponse.json({ success: true, data: { isConnected: false, meetings: [] } });
    }

    try {
      // Zoom API to get upcoming meetings
      const response = await fetch("https://api.zoom.us/v2/users/me/meetings?type=upcoming", {
        headers: {
          "Authorization": `Bearer ${zoomIntegration.accessToken}`
        }
      });

      if (!response.ok) {
        if (response.status === 401) {
          await prisma.integration.update({
            where: { id: zoomIntegration.id },
            data: { status: "Reconnect" }
          });
          return NextResponse.json({ success: true, data: { isConnected: false, meetings: [], error: "Token expired" } });
        }
        throw new Error("Failed to fetch zoom meetings");
      }

      const data = await response.json();
      const meetings = data.meetings?.map((m: any) => ({
        id: m.id,
        topic: m.topic,
        startTime: m.start_time,
        duration: m.duration,
        joinUrl: m.join_url,
        agenda: m.agenda
      })) || [];

      return NextResponse.json({ success: true, data: { isConnected: true, meetings } });
    } catch (err: any) {
      console.error("Zoom fetch error:", err);
      return NextResponse.json({ success: false, message: "Failed to fetch Zoom meetings" }, { status: 500 });
    }
  } catch (error) {
    console.error("GET /api/zoom error:", error);
    return NextResponse.json({ success: false, message: "Server Error" }, { status: 500 });
  }
}

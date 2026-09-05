import { NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/route";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    return new Response("Unauthorized", { status: 401 });
  }
  const userId = (session.user as any).id;

  const encoder = new TextEncoder();

  const customReadable = new ReadableStream({
    async start(controller) {
      // Send initial connection confirmation
      const initMessage = `data: ${JSON.stringify({ type: "CONNECTED", timestamp: new Date().toISOString() })}\n\n`;
      controller.enqueue(encoder.encode(initMessage));

      // Simulate periodic live system heartbeats and real-time intelligence events every 15 seconds
      const interval = setInterval(async () => {
        try {
          const user = await prisma.user.findUnique({ where: { id: userId } });
          if (!user) return;

          // Emit a live heartbeat with updated stats
          const eventPayload = {
            type: "HEARTBEAT",
            timestamp: new Date().toISOString(),
            data: {
              productivityScore: user.productivityScore,
              habitStreak: user.habitStreak,
              focusHoursThisWeek: user.focusHoursThisWeek,
            },
          };

          controller.enqueue(encoder.encode(`data: ${JSON.stringify(eventPayload)}\n\n`));
        } catch (err) {
          console.error("SSE Heartbeat error:", err);
        }
      }, 15000);

      // Clean up on close
      return () => {
        clearInterval(interval);
      };
    },
  });

  return new Response(customReadable, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}

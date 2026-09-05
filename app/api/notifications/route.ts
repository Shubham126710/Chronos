import { NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/route";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) return NextResponse.json({ success: false }, { status: 401 });
    const userId = (session.user as any).id;

    const notifications = await prisma.notification.findMany({
      where: { userId: userId },
      orderBy: { createdAt: "desc" },
      take: 20,
    });

    const unreadCount = notifications.filter((n) => !n.isRead).length;

    return NextResponse.json({
      success: true,
      data: {
        notifications,
        unreadCount,
      },
    });
  } catch (error) {
    console.error("GET /api/notifications error:", error);
    return NextResponse.json({ success: false, message: "Failed to fetch notifications" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) return NextResponse.json({ success: false }, { status: 401 });
    const userId = (session.user as any).id;

    const body = await req.json();
    const { action, notificationId, title, message, type = "INFO" } = body;

    if (action === "mark-read" && notificationId) {
      await prisma.notification.updateMany({
        where: { id: notificationId, userId: userId },
        data: { isRead: true },
      });
      return NextResponse.json({ success: true, message: "Marked as read" });
    }

    if (action === "mark-all-read") {
      await prisma.notification.updateMany({
        where: { userId: userId, isRead: false },
        data: { isRead: true },
      });
      return NextResponse.json({ success: true, message: "All marked as read" });
    }

    if (action === "create" && title && message) {
      const newNotif = await prisma.notification.create({
        data: {
          userId: userId,
          title,
          message,
          type,
        },
      });
      return NextResponse.json({ success: true, data: newNotif });
    }

    return NextResponse.json({ success: false, message: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error("POST /api/notifications error:", error);
    return NextResponse.json({ success: false, message: "Failed to update notification" }, { status: 500 });
  }
}

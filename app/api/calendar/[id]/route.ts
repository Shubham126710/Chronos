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

    const event = await prisma.calendarEvent.findFirst({ where: { id, userId } });
    if (!event) {
      return NextResponse.json({ success: false, message: "Event not found" }, { status: 404 });
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

    const event = await prisma.calendarEvent.findFirst({ where: { id, userId } });
    if (!event) {
      return NextResponse.json({ success: false, message: "Event not found" }, { status: 404 });
    }

    await prisma.calendarEvent.delete({ where: { id } });

    return NextResponse.json({ success: true, message: "Event deleted" });
  } catch (error) {
    console.error("DELETE /api/calendar/[id] error:", error);
    return NextResponse.json({ success: false, message: "Failed to delete event" }, { status: 500 });
  }
}

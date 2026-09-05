import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/route";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }
    const userId = (session.user as any).id;

    const body = await req.json();
    const { layoutId, widgetType, colSpan = 1, rowSpan = 1, theme = "default", customSettings } = body;

    if (!layoutId || !widgetType) {
      return NextResponse.json({ success: false, message: "layoutId and widgetType required" }, { status: 400 });
    }

    // Verify layout ownership
    const layout = await prisma.dashboardLayout.findFirst({
      where: { id: layoutId, userId: userId },
    });
    if (!layout) {
      return NextResponse.json({ success: false, message: "Layout not found or unauthorized" }, { status: 403 });
    }

    // Get highest order in layout
    const existing = await prisma.dashboardWidget.findMany({
      where: { layoutId },
      orderBy: { order: "desc" },
      take: 1,
    });
    const nextOrder = existing.length > 0 ? existing[0].order + 1 : 0;

    const newWidget = await prisma.dashboardWidget.create({
      data: {
        layoutId,
        widgetType,
        order: nextOrder,
        colSpan,
        rowSpan,
        theme,
        customSettings: customSettings ? JSON.stringify(customSettings) : null,
      },
      include: { preferences: true },
    });

    return NextResponse.json({ success: true, data: newWidget });
  } catch (error) {
    console.error("POST /api/dashboard/widgets error:", error);
    return NextResponse.json({ success: false, message: "Failed to add widget" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }
    const userId = (session.user as any).id;

    const { searchParams } = new URL(req.url);
    const widgetId = searchParams.get("id");

    if (!widgetId) {
      return NextResponse.json({ success: false, message: "Widget ID required" }, { status: 400 });
    }

    // Verify ownership
    const widget = await prisma.dashboardWidget.findFirst({
      where: { id: widgetId },
      include: { layout: true },
    });

    if (!widget || widget.layout.userId !== userId) {
      return NextResponse.json({ success: false, message: "Widget not found or unauthorized" }, { status: 403 });
    }

    await prisma.dashboardWidget.delete({
      where: { id: widgetId },
    });

    return NextResponse.json({ success: true, message: "Widget removed successfully" });
  } catch (error) {
    console.error("DELETE /api/dashboard/widgets error:", error);
    return NextResponse.json({ success: false, message: "Failed to delete widget" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }
    const userId = (session.user as any).id;

    const body = await req.json();
    const { id, colSpan, rowSpan, isVisible, isPinned, isCollapsed, theme, refreshInterval, customSettings } = body;

    if (!id) {
      return NextResponse.json({ success: false, message: "Widget ID required" }, { status: 400 });
    }

    // Verify ownership
    const widget = await prisma.dashboardWidget.findFirst({
      where: { id: id },
      include: { layout: true },
    });

    if (!widget || widget.layout.userId !== userId) {
      return NextResponse.json({ success: false, message: "Widget not found or unauthorized" }, { status: 403 });
    }

    const updated = await prisma.dashboardWidget.update({
      where: { id },
      data: {
        colSpan: colSpan !== undefined ? colSpan : undefined,
        rowSpan: rowSpan !== undefined ? rowSpan : undefined,
        isVisible: isVisible !== undefined ? isVisible : undefined,
        isPinned: isPinned !== undefined ? isPinned : undefined,
        isCollapsed: isCollapsed !== undefined ? isCollapsed : undefined,
        theme: theme !== undefined ? theme : undefined,
        refreshInterval: refreshInterval !== undefined ? refreshInterval : undefined,
        customSettings: customSettings !== undefined ? (typeof customSettings === "string" ? customSettings : JSON.stringify(customSettings)) : undefined,
      },
      include: { preferences: true },
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error("PATCH /api/dashboard/widgets error:", error);
    return NextResponse.json({ success: false, message: "Failed to update widget" }, { status: 500 });
  }
}

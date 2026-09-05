import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/route";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as any).id;

    const layouts = await prisma.dashboardLayout.findMany({
      where: { userId: userId },
      include: {
        widgets: {
          orderBy: { order: "asc" },
          include: { preferences: true },
        },
      },
      orderBy: { createdAt: "asc" },
    });

    return NextResponse.json({ success: true, data: layouts });
  } catch (error) {
    console.error("GET /api/dashboard/layout error:", error);
    return NextResponse.json({ success: false, message: "Failed to fetch dashboard layouts" }, { status: 500 });
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
    const { action, layoutId, widgets, name, isDefault } = body;

    if (action === "create" || action === "create-layout") {
      if (isDefault) {
        await prisma.dashboardLayout.updateMany({
          where: { userId: userId },
          data: { isDefault: false },
        });
      }

      const newLayout = await prisma.dashboardLayout.create({
        data: {
          userId: userId,
          name: name || "Custom Workspace",
          isDefault: isDefault || false,
        },
      });

      if (body.copyFromId) {
        const sourceWidgets = await prisma.dashboardWidget.findMany({
          where: { layoutId: body.copyFromId },
        });
        
        for (const w of sourceWidgets) {
          await prisma.dashboardWidget.create({
            data: {
              layoutId: newLayout.id,
              widgetType: w.widgetType,
              order: w.order,
              colSpan: w.colSpan,
              rowSpan: w.rowSpan,
              isVisible: w.isVisible,
              isPinned: w.isPinned,
              isCollapsed: w.isCollapsed,
              theme: w.theme,
              refreshInterval: w.refreshInterval,
              customSettings: w.customSettings,
            },
          });
        }
      }

      return NextResponse.json({ success: true, data: newLayout });
    }

    if (action === "switch-default" && layoutId) {
      await prisma.dashboardLayout.updateMany({
        where: { userId: userId },
        data: { isDefault: false },
      });
      const updated = await prisma.dashboardLayout.update({
        where: { id: layoutId },
        data: { isDefault: true },
        include: {
          widgets: { orderBy: { order: "asc" } },
        },
      });
      return NextResponse.json({ success: true, data: updated });
    }

    if (action === "update-widgets" && Array.isArray(widgets)) {
      for (const w of widgets) {
        if (w.id) {
          await prisma.dashboardWidget.update({
            where: { id: w.id },
            data: {
              order: w.order !== undefined ? w.order : undefined,
              colSpan: w.colSpan !== undefined ? w.colSpan : undefined,
              rowSpan: w.rowSpan !== undefined ? w.rowSpan : undefined,
              isVisible: w.isVisible !== undefined ? w.isVisible : undefined,
              isPinned: w.isPinned !== undefined ? w.isPinned : undefined,
              isCollapsed: w.isCollapsed !== undefined ? w.isCollapsed : undefined,
              theme: w.theme !== undefined ? w.theme : undefined,
            },
          });
        }
      }
      return NextResponse.json({ success: true, message: "Widgets layout updated successfully" });
    }

    return NextResponse.json({ success: false, message: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error("POST /api/dashboard/layout error:", error);
    return NextResponse.json({ success: false, message: "Failed to update layout" }, { status: 500 });
  }
}

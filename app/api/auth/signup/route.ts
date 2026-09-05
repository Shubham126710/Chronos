import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    const { name, email, password } = await req.json();

    if (!name || !email || !password) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    if (password.length < 8) {
      return NextResponse.json({ error: "Password must be at least 8 characters" }, { status: 400 });
    }

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json({ error: "User already exists with this email" }, { status: 400 });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash,
      },
    });

    // Create a default layout for the new user
    const layout = await prisma.dashboardLayout.create({
      data: {
        userId: user.id,
        name: "My Chronos OS",
        isDefault: true,
      },
    });

    // Add some default widgets
    const defaultWidgets = [
      { widgetType: 'FOCUS_TIMER', order: 0, colSpan: 1, rowSpan: 1, theme: 'orange' },
      { widgetType: 'TASKS', order: 1, colSpan: 2, rowSpan: 2, theme: 'default' },
      { widgetType: 'HABITS', order: 2, colSpan: 2, rowSpan: 1, theme: 'purple' },
    ];

    for (const w of defaultWidgets) {
      await prisma.dashboardWidget.create({
        data: {
          layoutId: layout.id,
          widgetType: w.widgetType,
          order: w.order,
          colSpan: w.colSpan,
          rowSpan: w.rowSpan,
          theme: w.theme,
        },
      });
    }

    return NextResponse.json({ success: true, user: { id: user.id, email: user.email } }, { status: 201 });
  } catch (error) {
    console.error("Signup error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

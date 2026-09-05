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
    const { operations } = body;

    if (!operations || !Array.isArray(operations)) {
      return NextResponse.json({ success: false, message: "Invalid operations payload" }, { status: 400 });
    }

    const results = [];

    // Execute operations sequentially to ensure DB consistency
    for (const op of operations) {
      try {
        if (op.type === "CREATE_TASK") {
          const task = await prisma.task.create({
            data: {
              userId,
              title: op.payload.title || "AI Generated Task",
              description: op.payload.description || "",
              priority: op.payload.priority || "MEDIUM",
              estimatedMinutes: op.payload.estimatedMinutes || 30,
              dueDate: op.payload.dueDate ? new Date(op.payload.dueDate) : null,
            }
          });
          results.push({ type: op.type, status: "success", id: task.id });
        } 
        else if (op.type === "UPDATE_TASK") {
          // Verify ownership first
          const existing = await prisma.task.findUnique({ where: { id: op.payload.id } });
          if (existing && existing.userId === userId) {
            const updateData: any = {};
            if (op.payload.title) updateData.title = op.payload.title;
            if (op.payload.priority) updateData.priority = op.payload.priority;
            if (op.payload.isCompleted !== undefined) updateData.isCompleted = op.payload.isCompleted;
            if (op.payload.dueDate) updateData.dueDate = new Date(op.payload.dueDate);
            
            await prisma.task.update({
              where: { id: op.payload.id },
              data: updateData
            });
            results.push({ type: op.type, status: "success", id: op.payload.id });
          } else {
            results.push({ type: op.type, status: "error", message: "Task not found or unauthorized" });
          }
        }
        else if (op.type === "DELETE_TASK") {
          const existing = await prisma.task.findUnique({ where: { id: op.payload.id } });
          if (existing && existing.userId === userId) {
            await prisma.task.delete({ where: { id: op.payload.id } });
            results.push({ type: op.type, status: "success", id: op.payload.id });
          } else {
            results.push({ type: op.type, status: "error", message: "Task not found or unauthorized" });
          }
        }
        else if (op.type === "CREATE_EVENT") {
          const event = await prisma.calendarEvent.create({
            data: {
              userId,
              title: op.payload.title || "AI Scheduled Block",
              description: op.payload.description || "",
              startTime: new Date(op.payload.startTime),
              endTime: new Date(op.payload.endTime),
              category: op.payload.category || "FOCUS",
            }
          });
          results.push({ type: op.type, status: "success", id: event.id });
        }
        else if (op.type === "UPDATE_EVENT") {
          const existing = await prisma.calendarEvent.findUnique({ where: { id: op.payload.id } });
          if (existing && existing.userId === userId) {
            const updateData: any = {};
            if (op.payload.title) updateData.title = op.payload.title;
            if (op.payload.startTime) updateData.startTime = new Date(op.payload.startTime);
            if (op.payload.endTime) updateData.endTime = new Date(op.payload.endTime);
            
            await prisma.calendarEvent.update({
              where: { id: op.payload.id },
              data: updateData
            });
            results.push({ type: op.type, status: "success", id: op.payload.id });
          } else {
            results.push({ type: op.type, status: "error", message: "Event not found or unauthorized" });
          }
        }
        else if (op.type === "DELETE_EVENT") {
          const existing = await prisma.calendarEvent.findUnique({ where: { id: op.payload.id } });
          if (existing && existing.userId === userId) {
            await prisma.calendarEvent.delete({ where: { id: op.payload.id } });
            results.push({ type: op.type, status: "success", id: op.payload.id });
          } else {
            results.push({ type: op.type, status: "error", message: "Event not found or unauthorized" });
          }
        }
      } catch (opError) {
        console.error("Operation failed:", opError);
        results.push({ type: op.type, status: "error", message: "Server error during execution" });
      }
    }

    return NextResponse.json({ success: true, results });
  } catch (error) {
    console.error("AI Execute Error:", error);
    return NextResponse.json(
      { success: false, message: "Execution processing failed." },
      { status: 500 }
    );
  }
}

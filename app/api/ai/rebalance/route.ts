import { NextResponse } from "next/server";
import { executeAIService } from "../../../../lib/aiService";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const result = await executeAIService({ action: "rebalance", payload: body });
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ success: false, message: "AI error" }, { status: 500 });
  }
}

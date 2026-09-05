import { NextResponse } from "next/server";
import { executeAIService, AIActionRequest } from "../../../lib/aiService";

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as AIActionRequest;
    const result = await executeAIService(body);
    return NextResponse.json(result);
  } catch (error) {
    console.error("AI API Route Error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error during AI processing." },
      { status: 500 }
    );
  }
}

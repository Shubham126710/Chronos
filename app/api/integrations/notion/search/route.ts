import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../../auth/[...nextauth]/route";
import { prisma } from "../../../../../lib/prisma";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }
    const userId = (session.user as any).id;
    const body = await req.json();
    const query = body.query || "";

    const notionIntegration = await prisma.integration.findUnique({
      where: { userId_provider: { userId, provider: "notion" } }
    });

    if (!notionIntegration || notionIntegration.status !== "Connected" || !notionIntegration.accessToken) {
      return NextResponse.json({ success: false, message: "Notion is not connected" }, { status: 400 });
    }

    const response = await fetch("https://api.notion.com/v1/search", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${notionIntegration.accessToken}`,
        "Notion-Version": "2022-06-28",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        query: query,
        filter: { property: "object", value: "page" },
        page_size: 10
      })
    });

    if (!response.ok) {
      console.error("Notion API Error:", await response.text());
      return NextResponse.json({ success: false, message: "Notion API failed" }, { status: 500 });
    }

    const data = await response.json();
    const results = data.results?.map((r: any) => {
      // Extract title based on standard Notion structures
      let title = "Untitled";
      if (r.properties) {
        for (const key in r.properties) {
          if (r.properties[key].type === "title" && r.properties[key].title?.length > 0) {
            title = r.properties[key].title[0].plain_text;
            break;
          }
        }
      }
      return {
        id: r.id,
        title,
        url: r.url,
        lastEdited: r.last_edited_time
      };
    }) || [];

    return NextResponse.json({ success: true, data: results });
  } catch (error) {
    console.error("Notion Search Endpoint Error:", error);
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}

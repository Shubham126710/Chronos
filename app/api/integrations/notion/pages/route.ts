import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../../auth/[...nextauth]/route";
import { prisma } from "../../../../../lib/prisma";

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }
    const userId = (session.user as any).id;

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
        filter: { property: "object", value: "page" },
        sort: { direction: "descending", timestamp: "last_edited_time" },
        page_size: 15
      })
    });

    if (!response.ok) {
      return NextResponse.json({ success: false, message: "Notion API failed" }, { status: 500 });
    }

    const data = await response.json();
    const results = data.results?.map((r: any) => {
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
        id: `notion-${r.id}`,
        title,
        url: r.url,
        updatedAt: new Date(r.last_edited_time).toLocaleString(),
        attachedToType: "Notion",
        attachedToName: "Notion Workspace",
        tags: ["Notion"],
        content: "Loading content...", // We don't fetch content in list view for performance
        isNotion: true
      };
    }) || [];

    return NextResponse.json({ success: true, data: results });
  } catch (error) {
    console.error("Notion GET Pages Error:", error);
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
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
    const { title, content } = body;

    const notionIntegration = await prisma.integration.findUnique({
      where: { userId_provider: { userId, provider: "notion" } }
    });

    if (!notionIntegration || notionIntegration.status !== "Connected" || !notionIntegration.accessToken) {
      return NextResponse.json({ success: false, message: "Notion is not connected" }, { status: 400 });
    }

    // Default to the first page/database we can find for parent if not specified
    // In a real app we'd let user select, here we search for a suitable parent
    const searchRes = await fetch("https://api.notion.com/v1/search", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${notionIntegration.accessToken}`,
        "Notion-Version": "2022-06-28",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ filter: { property: "object", value: "page" }, page_size: 1 })
    });
    const searchData = await searchRes.json();
    if (!searchData.results || searchData.results.length === 0) {
      return NextResponse.json({ success: false, message: "No Notion workspace found to attach to." }, { status: 400 });
    }
    const parentId = searchData.results[0].id;

    const response = await fetch("https://api.notion.com/v1/pages", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${notionIntegration.accessToken}`,
        "Notion-Version": "2022-06-28",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        parent: { page_id: parentId },
        properties: {
          title: {
            title: [{ text: { content: title || "New Note" } }]
          }
        },
        children: [
          {
            object: "paragraph",
            paragraph: {
              rich_text: [{ type: "text", text: { content: content || "Created from Chronos." } }]
            }
          }
        ]
      })
    });

    if (!response.ok) {
      console.error("Notion create error:", await response.text());
      return NextResponse.json({ success: false, message: "Notion API failed to create page" }, { status: 500 });
    }

    const newPage = await response.json();
    return NextResponse.json({ 
      success: true, 
      data: {
        id: `notion-${newPage.id}`,
        title: title || "New Note",
        content: content || "Created from Chronos.",
        updatedAt: new Date(newPage.last_edited_time).toLocaleString(),
        attachedToType: "Notion",
        attachedToName: "Notion Workspace",
        tags: ["Notion"],
        isNotion: true
      } 
    });
  } catch (error) {
    console.error("Notion POST Page Error:", error);
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../../../auth/[...nextauth]/route";
import { prisma } from "../../../../../../lib/prisma";

// Utility to convert Notion blocks to Markdown
function blocksToMarkdown(blocks: any[]): string {
  let md = "";
  for (const block of blocks) {
    if (block.type === "paragraph") {
      const text = block.paragraph.rich_text.map((t: any) => t.plain_text).join("");
      md += text + "\n\n";
    } else if (block.type === "heading_1") {
      const text = block.heading_1.rich_text.map((t: any) => t.plain_text).join("");
      md += "# " + text + "\n\n";
    } else if (block.type === "heading_2") {
      const text = block.heading_2.rich_text.map((t: any) => t.plain_text).join("");
      md += "## " + text + "\n\n";
    } else if (block.type === "heading_3") {
      const text = block.heading_3.rich_text.map((t: any) => t.plain_text).join("");
      md += "### " + text + "\n\n";
    } else if (block.type === "bulleted_list_item") {
      const text = block.bulleted_list_item.rich_text.map((t: any) => t.plain_text).join("");
      md += "- " + text + "\n";
    } else if (block.type === "numbered_list_item") {
      const text = block.numbered_list_item.rich_text.map((t: any) => t.plain_text).join("");
      md += "1. " + text + "\n";
    } else if (block.type === "to_do") {
      const text = block.to_do.rich_text.map((t: any) => t.plain_text).join("");
      const checked = block.to_do.checked ? "[x]" : "[ ]";
      md += "- " + checked + " " + text + "\n";
    } else if (block.type === "quote") {
      const text = block.quote.rich_text.map((t: any) => t.plain_text).join("");
      md += "> " + text + "\n\n";
    } else if (block.type === "divider") {
      md += "---\n\n";
    }
  }
  return md.trim();
}

// Utility to convert Markdown text to Notion blocks
function markdownToBlocks(md: string): any[] {
  const blocks: any[] = [];
  const lines = md.split("\n");
  let currentList = false;

  for (let line of lines) {
    if (line.trim() === "") continue;

    if (line.startsWith("# ")) {
      blocks.push({
        object: "block",
        type: "heading_1",
        heading_1: { rich_text: [{ type: "text", text: { content: line.replace("# ", "") } }] }
      });
    } else if (line.startsWith("## ")) {
      blocks.push({
        object: "block",
        type: "heading_2",
        heading_2: { rich_text: [{ type: "text", text: { content: line.replace("## ", "") } }] }
      });
    } else if (line.startsWith("### ")) {
      blocks.push({
        object: "block",
        type: "heading_3",
        heading_3: { rich_text: [{ type: "text", text: { content: line.replace("### ", "") } }] }
      });
    } else if (line.startsWith("- [ ] ") || line.startsWith("- [x] ")) {
      const checked = line.startsWith("- [x] ");
      blocks.push({
        object: "block",
        type: "to_do",
        to_do: {
          rich_text: [{ type: "text", text: { content: line.substring(6) } }],
          checked
        }
      });
    } else if (line.startsWith("- ")) {
      blocks.push({
        object: "block",
        type: "bulleted_list_item",
        bulleted_list_item: { rich_text: [{ type: "text", text: { content: line.replace("- ", "") } }] }
      });
    } else if (line.match(/^\d+\.\s/)) {
      blocks.push({
        object: "block",
        type: "numbered_list_item",
        numbered_list_item: { rich_text: [{ type: "text", text: { content: line.replace(/^\d+\.\s/, "") } }] }
      });
    } else if (line.startsWith("> ")) {
      blocks.push({
        object: "block",
        type: "quote",
        quote: { rich_text: [{ type: "text", text: { content: line.replace("> ", "") } }] }
      });
    } else if (line.startsWith("---")) {
      blocks.push({ object: "block", type: "divider", divider: {} });
    } else {
      blocks.push({
        object: "block",
        type: "paragraph",
        paragraph: { rich_text: [{ type: "text", text: { content: line } }] }
      });
    }
  }
  return blocks;
}

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }
    const userId = (session.user as any).id;
    const { id: rawId } = await params;
    const pageId = rawId.replace("notion-", "");

    const notionIntegration = await prisma.integration.findUnique({
      where: { userId_provider: { userId, provider: "notion" } }
    });

    if (!notionIntegration || notionIntegration.status !== "Connected" || !notionIntegration.accessToken) {
      return NextResponse.json({ success: false, message: "Notion is not connected" }, { status: 400 });
    }

    // Fetch page metadata
    const pageRes = await fetch(`https://api.notion.com/v1/pages/${pageId}`, {
      headers: {
        "Authorization": `Bearer ${notionIntegration.accessToken}`,
        "Notion-Version": "2022-06-28",
      }
    });

    if (!pageRes.ok) {
      return NextResponse.json({ success: false, message: "Failed to fetch Notion page" }, { status: 404 });
    }
    const pageData = await pageRes.json();
    let title = "Untitled";
    if (pageData.properties) {
      for (const key in pageData.properties) {
        if (pageData.properties[key].type === "title" && pageData.properties[key].title?.length > 0) {
          title = pageData.properties[key].title[0].plain_text;
          break;
        }
      }
    }

    // Fetch blocks
    const blocksRes = await fetch(`https://api.notion.com/v1/blocks/${pageId}/children`, {
      headers: {
        "Authorization": `Bearer ${notionIntegration.accessToken}`,
        "Notion-Version": "2022-06-28",
      }
    });
    
    let mdContent = "";
    if (blocksRes.ok) {
      const blocksData = await blocksRes.json();
      mdContent = blocksToMarkdown(blocksData.results || []);
    }

    return NextResponse.json({
      success: true,
      data: {
        id: rawId,
        title,
        content: mdContent,
        updatedAt: new Date(pageData.last_edited_time).toLocaleString(),
        attachedToType: "Notion",
        attachedToName: "Notion Workspace",
        tags: ["Notion"],
        isNotion: true
      }
    });
  } catch (error) {
    console.error("GET /api/integrations/notion/pages/[id] error:", error);
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }
    const userId = (session.user as any).id;
    const { id: rawId } = await params;
    const pageId = rawId.replace("notion-", "");
    const body = await req.json();

    const notionIntegration = await prisma.integration.findUnique({
      where: { userId_provider: { userId, provider: "notion" } }
    });

    if (!notionIntegration || notionIntegration.status !== "Connected" || !notionIntegration.accessToken) {
      return NextResponse.json({ success: false, message: "Notion is not connected" }, { status: 400 });
    }

    // 1. Update Title if provided
    if (body.title) {
      await fetch(`https://api.notion.com/v1/pages/${pageId}`, {
        method: "PATCH",
        headers: {
          "Authorization": `Bearer ${notionIntegration.accessToken}`,
          "Notion-Version": "2022-06-28",
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          properties: {
            title: { title: [{ text: { content: body.title } }] }
          }
        })
      });
    }

    // 2. Update Content if provided
    if (body.content !== undefined) {
      // a. Fetch current blocks
      const blocksRes = await fetch(`https://api.notion.com/v1/blocks/${pageId}/children`, {
        headers: {
          "Authorization": `Bearer ${notionIntegration.accessToken}`,
          "Notion-Version": "2022-06-28",
        }
      });
      
      if (blocksRes.ok) {
        const blocksData = await blocksRes.json();
        const currentBlocks = blocksData.results || [];
        
        // b. Archive existing blocks
        for (const block of currentBlocks) {
          await fetch(`https://api.notion.com/v1/blocks/${block.id}`, {
            method: "DELETE",
            headers: {
              "Authorization": `Bearer ${notionIntegration.accessToken}`,
              "Notion-Version": "2022-06-28",
            }
          });
        }
      }

      // c. Append new blocks
      const newBlocks = markdownToBlocks(body.content);
      if (newBlocks.length > 0) {
        // Notion allows appending max 100 blocks at a time, we'll assume less than 100 for now.
        const chunkedBlocks = newBlocks.slice(0, 99); 
        await fetch(`https://api.notion.com/v1/blocks/${pageId}/children`, {
          method: "PATCH",
          headers: {
            "Authorization": `Bearer ${notionIntegration.accessToken}`,
            "Notion-Version": "2022-06-28",
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ children: chunkedBlocks })
        });
      }
    }

    return NextResponse.json({ success: true, message: "Notion page updated successfully" });
  } catch (error) {
    console.error("PATCH /api/integrations/notion/pages/[id] error:", error);
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}

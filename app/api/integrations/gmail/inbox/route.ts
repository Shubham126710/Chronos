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

    const googleIntegration = await prisma.integration.findUnique({
      where: { userId_provider: { userId, provider: "google" } }
    });

    if (!googleIntegration || googleIntegration.status !== "Connected" || !googleIntegration.accessToken) {
      return NextResponse.json({ success: false, message: "Google is not connected" }, { status: 400 });
    }

    const { google } = require('googleapis');
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET
    );
    oauth2Client.setCredentials({ 
      access_token: googleIntegration.accessToken,
      refresh_token: googleIntegration.refreshToken
    });

    const gmail = google.gmail({ version: 'v1', auth: oauth2Client });
    
    // Fetch top 5 important unread emails or just recent emails
    const res = await gmail.users.messages.list({
      userId: 'me',
      q: 'in:inbox',
      maxResults: 5
    });

    const messages = res.data.messages || [];
    const detailedMessages = await Promise.all(
      messages.map(async (msg: any) => {
        const msgDetails = await gmail.users.messages.get({
          userId: 'me',
          id: msg.id,
          format: 'metadata',
          metadataHeaders: ['Subject', 'From', 'Date']
        });
        const headers = msgDetails.data.payload.headers;
        const subject = headers.find((h: any) => h.name === 'Subject')?.value || 'No Subject';
        const from = headers.find((h: any) => h.name === 'From')?.value || 'Unknown Sender';
        const date = headers.find((h: any) => h.name === 'Date')?.value;
        const snippet = msgDetails.data.snippet;

        return {
          id: msgDetails.data.id,
          threadId: msgDetails.data.threadId,
          subject,
          from,
          date,
          snippet,
          isUnread: msgDetails.data.labelIds?.includes('UNREAD')
        };
      })
    );

    return NextResponse.json({ success: true, data: detailedMessages });
  } catch (error) {
    console.error("Gmail Inbox Endpoint Error:", error);
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}

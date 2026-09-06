import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../../auth/[...nextauth]/route";
import { prisma } from "../../../../../lib/prisma";

import { getIntegrationConfig } from "../../../../../lib/integrations/config";

export async function GET(req: Request, { params }: { params: Promise<{ provider: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const { provider: providerParam } = await params;
    const provider = providerParam.toLowerCase();
    const config = getIntegrationConfig(provider);

    if (!config) {
      return NextResponse.json({ success: false, message: `Unsupported provider: ${provider}` }, { status: 400 });
    }

    const userId = (session.user as any).id;
    const redirectUri = `${process.env.NEXTAUTH_URL}/api/integrations/${provider}/callback`;

    // Update state in DB to Connecting
    await prisma.integration.upsert({
      where: {
        userId_provider: {
          userId,
          provider
        }
      },
      update: {
        status: "Connecting"
      },
      create: {
        userId,
        provider,
        status: "Connecting"
      }
    });

    const state = Buffer.from(JSON.stringify({ userId, provider, timestamp: Date.now() })).toString("base64");

    const authParams = new URLSearchParams({
      client_id: process.env[config.clientIdEnv] || "",
      redirect_uri: redirectUri,
      response_type: "code",
      scope: config.scopes.join(" "),
      state,
      access_type: "offline", // specific to google, doesn't hurt others if ignored
      prompt: "consent",      // ensure we get refresh token
    });

    return NextResponse.redirect(`${config.authUrl}?${authParams.toString()}`);
  } catch (error) {
    console.error(`Auth initialization error:`, error);
    return NextResponse.json({ success: false, message: "Internal Server Error" }, { status: 500 });
  }
}

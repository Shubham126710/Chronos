import { NextResponse } from "next/server";
import { prisma } from "../../../../../lib/prisma";

import { getIntegrationConfig } from "../../../../../lib/integrations/config";

export async function GET(req: Request, { params }: { params: Promise<{ provider: string }> }) {
  try {
    const { searchParams } = new URL(req.url);
    const code = searchParams.get("code");
    const state = searchParams.get("state");
    const error = searchParams.get("error");
    
    const { provider: providerParam } = await params;
    const provider = providerParam.toLowerCase();
    const config = getIntegrationConfig(provider);

    if (!config) {
      return NextResponse.json({ success: false, message: `Unsupported provider: ${provider}` }, { status: 400 });
    }

    if (error) {
      console.error(`OAuth Error for ${provider}:`, error);
      // We'd parse state here to get userId, but for now just redirect
      return NextResponse.redirect(`${process.env.NEXTAUTH_URL}/?error=integration_failed`);
    }

    if (!code || !state) {
      return NextResponse.json({ success: false, message: "Missing code or state" }, { status: 400 });
    }

    let parsedState;
    try {
      parsedState = JSON.parse(Buffer.from(state, "base64").toString("utf8"));
    } catch (e) {
      return NextResponse.json({ success: false, message: "Invalid state parameter" }, { status: 400 });
    }

    const { userId } = parsedState;

    if (!userId) {
      return NextResponse.json({ success: false, message: "User ID missing in state" }, { status: 400 });
    }

    const redirectUri = `${process.env.NEXTAUTH_URL}/api/integrations/${provider}/callback`;
    const tokenUrl = config.tokenUrl;
    
    // Default structure for token exchange
    const tokenParams = new URLSearchParams({
      grant_type: "authorization_code",
      code,
      redirect_uri: redirectUri,
      client_id: process.env[config.clientIdEnv] || "",
      client_secret: process.env[config.clientSecretEnv] || "",
    });

    let headers: Record<string, string> = {
      "Content-Type": "application/x-www-form-urlencoded",
    };

    if (config.requiresBasicAuth) {
      const clientId = process.env[config.clientIdEnv] || "";
      const clientSecret = process.env[config.clientSecretEnv] || "";
      headers["Authorization"] = `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString("base64")}`;
    }

    if (!process.env[config.clientIdEnv] || !process.env[config.clientSecretEnv]) {
      console.error(`Missing OAuth credentials for ${provider} in environment variables.`);
      return NextResponse.redirect(`${process.env.NEXTAUTH_URL}/?error=missing_credentials`);
    }

    let tokenData = null;
    let newStatus = "Connected";

    const tokenRes = await fetch(tokenUrl, {
      method: "POST",
      headers,
      body: tokenParams.toString(),
    });

    if (!tokenRes.ok) {
      console.error(`Failed to exchange token for ${provider}:`, await tokenRes.text());
      newStatus = "Error";
    } else {
      tokenData = await tokenRes.json();
    }

    await prisma.integration.upsert({
      where: {
        userId_provider: {
          userId,
          provider
        }
      },
      update: {
        accessToken: tokenData?.access_token || null,
        refreshToken: tokenData?.refresh_token || null,
        status: newStatus,
        updatedAt: new Date()
      },
      create: {
        userId,
        provider,
        accessToken: tokenData?.access_token || null,
        refreshToken: tokenData?.refresh_token || null,
        status: newStatus,
      }
    });

    return NextResponse.redirect(`${process.env.NEXTAUTH_URL}/`);
  } catch (error) {
    console.error(`Callback error:`, error);
    return NextResponse.redirect(`${process.env.NEXTAUTH_URL}/?error=integration_server_error`);
  }
}

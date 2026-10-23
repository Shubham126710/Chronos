import { google } from "googleapis";
import { prisma } from "../prisma";

export interface GoogleEventPayload {
  summary: string;
  description?: string;
  startTime: Date | string;
  endTime: Date | string;
  colorId?: string;
}

/**
 * Returns an authenticated Google OAuth2 client for a given user.
 * Automatically handles token refresh and persists updated tokens to the database.
 */
export async function getGoogleOAuth2Client(userId: string) {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const redirectUri = `${process.env.NEXTAUTH_URL}/api/integrations/google/callback`;

  if (!clientId || !clientSecret) {
    return { client: null, error: "GOOGLE_CREDENTIALS_MISSING" };
  }

  const integration = await prisma.integration.findUnique({
    where: { userId_provider: { userId, provider: "google" } }
  });

  if (!integration || !integration.accessToken) {
    return { client: null, error: "GOOGLE_NOT_CONNECTED" };
  }

  const oauth2Client = new google.auth.OAuth2(clientId, clientSecret, redirectUri);
  oauth2Client.setCredentials({
    access_token: integration.accessToken,
    refresh_token: integration.refreshToken || undefined,
  });

  // Automatically persist refreshed tokens to database
  oauth2Client.on("tokens", async (tokens) => {
    try {
      if (tokens.access_token) {
        await prisma.integration.update({
          where: { id: integration.id },
          data: {
            accessToken: tokens.access_token,
            ...(tokens.refresh_token ? { refreshToken: tokens.refresh_token } : {}),
            status: "Connected",
            updatedAt: new Date()
          }
        });
      }
    } catch (e) {
      console.error("[Google OAuth] Failed to save refreshed token:", e);
    }
  });

  return { client: oauth2Client, integration, error: null };
}

/**
 * Inserts an event into the user's primary Google Calendar.
 * Returns the Google Event ID if successful.
 */
export async function createGoogleCalendarEvent(userId: string, payload: GoogleEventPayload) {
  const { client, integration, error } = await getGoogleOAuth2Client(userId);
  if (!client || !integration) {
    return { success: false, error: error || "CLIENT_UNAVAILABLE" };
  }

  try {
    const calendar = google.calendar({ version: "v3", auth: client });
    const sDate = new Date(payload.startTime);
    const eDate = new Date(payload.endTime);

    const response = await calendar.events.insert({
      calendarId: "primary",
      requestBody: {
        summary: payload.summary,
        description: payload.description,
        start: { dateTime: sDate.toISOString() },
        end: { dateTime: eDate.toISOString() },
        colorId: payload.colorId || "9", // Default blueberry
      }
    });

    return { success: true, googleEventId: response.data.id };
  } catch (err: any) {
    console.error("[Google Calendar] Insert error:", err?.message || err);
    if (err?.code === 401 || err?.code === 403) {
      await prisma.integration.update({
        where: { id: integration.id },
        data: { status: "Reconnect" }
      }).catch(() => {});
    }
    return { success: false, error: err?.message || "INSERT_FAILED" };
  }
}

/**
 * Updates an existing event in the user's primary Google Calendar.
 */
export async function updateGoogleCalendarEvent(
  userId: string,
  googleEventId: string,
  payload: Partial<GoogleEventPayload>
) {
  const { client, integration, error } = await getGoogleOAuth2Client(userId);
  if (!client || !integration) {
    return { success: false, error: error || "CLIENT_UNAVAILABLE" };
  }

  try {
    const calendar = google.calendar({ version: "v3", auth: client });
    const patchBody: any = {};
    if (payload.summary !== undefined) patchBody.summary = payload.summary;
    if (payload.description !== undefined) patchBody.description = payload.description;
    if (payload.startTime !== undefined) patchBody.start = { dateTime: new Date(payload.startTime).toISOString() };
    if (payload.endTime !== undefined) patchBody.end = { dateTime: new Date(payload.endTime).toISOString() };

    await calendar.events.patch({
      calendarId: "primary",
      eventId: googleEventId,
      requestBody: patchBody
    });

    return { success: true };
  } catch (err: any) {
    console.error("[Google Calendar] Update error:", err?.message || err);
    if (err?.code === 401 || err?.code === 403) {
      await prisma.integration.update({
        where: { id: integration.id },
        data: { status: "Reconnect" }
      }).catch(() => {});
    }
    return { success: false, error: err?.message || "UPDATE_FAILED" };
  }
}

/**
 * Deletes an event from the user's primary Google Calendar.
 */
export async function deleteGoogleCalendarEvent(userId: string, googleEventId: string) {
  const { client, integration, error } = await getGoogleOAuth2Client(userId);
  if (!client || !integration) {
    return { success: false, error: error || "CLIENT_UNAVAILABLE" };
  }

  try {
    const calendar = google.calendar({ version: "v3", auth: client });
    await calendar.events.delete({
      calendarId: "primary",
      eventId: googleEventId,
    });
    return { success: true };
  } catch (err: any) {
    console.error("[Google Calendar] Delete error:", err?.message || err);
    if (err?.code === 401 || err?.code === 403) {
      await prisma.integration.update({
        where: { id: integration.id },
        data: { status: "Reconnect" }
      }).catch(() => {});
    }
    return { success: false, error: err?.message || "DELETE_FAILED" };
  }
}

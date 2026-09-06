export type IntegrationProvider = {
  id: string;
  name: string;
  description: string;
  icon: string;
  authUrl: string;
  tokenUrl: string;
  scopes: string[];
  clientIdEnv: string;
  clientSecretEnv: string;
  requiresBasicAuth?: boolean;
};

export const INTEGRATION_PROVIDERS: Record<string, IntegrationProvider> = {
  google: {
    id: "google",
    name: "Google Calendar",
    description: "Sync events and AI scheduled blocks.",
    icon: "https://cdn.simpleicons.org/googlecalendar/white",
    authUrl: "https://accounts.google.com/o/oauth2/v2/auth",
    tokenUrl: "https://oauth2.googleapis.com/token",
    scopes: [
      "https://www.googleapis.com/auth/calendar.events",
      "https://www.googleapis.com/auth/calendar.readonly"
    ],
    clientIdEnv: "GOOGLE_CLIENT_ID",
    clientSecretEnv: "GOOGLE_CLIENT_SECRET",
  },
  gmail: {
    id: "gmail",
    name: "Gmail",
    description: "Read, search, and draft email replies using AI.",
    icon: "https://cdn.simpleicons.org/gmail/white",
    authUrl: "https://accounts.google.com/o/oauth2/v2/auth",
    tokenUrl: "https://oauth2.googleapis.com/token",
    scopes: [
      "https://www.googleapis.com/auth/userinfo.email",
      "https://www.googleapis.com/auth/userinfo.profile",
      "https://www.googleapis.com/auth/gmail.readonly",
      "https://www.googleapis.com/auth/gmail.modify",
      "https://www.googleapis.com/auth/gmail.compose"
    ],
    clientIdEnv: "GOOGLE_CLIENT_ID",
    clientSecretEnv: "GOOGLE_CLIENT_SECRET",
  },
  slack: {
    id: "slack",
    name: "Slack",
    description: "Send status updates and receive task notifications.",
    icon: "https://cdn.simpleicons.org/slack/white",
    authUrl: "https://slack.com/oauth/v2/authorize",
    tokenUrl: "https://slack.com/api/oauth.v2.access",
    scopes: ["users:read", "channels:read", "chat:write"],
    clientIdEnv: "SLACK_CLIENT_ID",
    clientSecretEnv: "SLACK_CLIENT_SECRET",
  },
  spotify: {
    id: "spotify",
    name: "Spotify",
    description: "Control playback and link focus sessions.",
    icon: "https://cdn.simpleicons.org/spotify/white",
    authUrl: "https://accounts.spotify.com/authorize",
    tokenUrl: "https://accounts.spotify.com/api/token",
    scopes: [
      "user-read-currently-playing",
      "user-read-playback-state",
      "user-modify-playback-state"
    ],
    clientIdEnv: "SPOTIFY_CLIENT_ID",
    clientSecretEnv: "SPOTIFY_CLIENT_SECRET",
    requiresBasicAuth: true,
  },
  zoom: {
    id: "zoom",
    name: "Zoom",
    description: "Fetch upcoming meetings for your dashboard.",
    icon: "https://cdn.simpleicons.org/zoom/white",
    authUrl: "https://zoom.us/oauth/authorize",
    tokenUrl: "https://zoom.us/oauth/token",
    scopes: ["meeting:read"],
    clientIdEnv: "ZOOM_CLIENT_ID",
    clientSecretEnv: "ZOOM_CLIENT_SECRET",
    requiresBasicAuth: true,
  },
  notion: {
    id: "notion",
    name: "Notion",
    description: "Connect to Notion to query your pages and databases.",
    icon: "https://cdn.simpleicons.org/notion/white",
    authUrl: "https://api.notion.com/v1/oauth/authorize",
    tokenUrl: "https://api.notion.com/v1/oauth/token",
    scopes: [],
    clientIdEnv: "NOTION_CLIENT_ID",
    clientSecretEnv: "NOTION_CLIENT_SECRET",
    requiresBasicAuth: true,
  },
};

export const getIntegrationConfig = (provider: string) => {
  return INTEGRATION_PROVIDERS[provider.toLowerCase()];
};

export const getAllIntegrations = () => {
  return Object.values(INTEGRATION_PROVIDERS);
};

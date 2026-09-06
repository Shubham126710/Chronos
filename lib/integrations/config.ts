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
      "https://www.googleapis.com/auth/calendar.readonly",
      "https://www.googleapis.com/auth/userinfo.email",
      "https://www.googleapis.com/auth/userinfo.profile",
      "https://www.googleapis.com/auth/gmail.readonly",
      "https://www.googleapis.com/auth/gmail.modify",
      "https://www.googleapis.com/auth/gmail.compose"
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
      "https://www.googleapis.com/auth/calendar.events",
      "https://www.googleapis.com/auth/calendar.readonly",
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
    icon: "data:image/svg+xml;utf8,%3Csvg%20role%3D%22img%22%20viewBox%3D%220%200%2024%2024%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20fill%3D%22white%22%3E%3Ctitle%3ESlack%3C%2Ftitle%3E%3Cpath%20d%3D%22M5.042%2015.165a2.528%202.528%200%200%201-2.52%202.523A2.528%202.528%200%200%201%200%2015.165a2.527%202.527%200%200%201%202.522-2.52h2.52v2.52zM6.313%2015.165a2.527%202.527%200%200%201%202.521-2.52%202.527%202.527%200%200%201%202.521%202.52v6.313A2.528%202.528%200%200%201%208.834%2024a2.528%202.528%200%200%201-2.521-2.522v-6.313zM8.834%205.042a2.528%202.528%200%200%201-2.521-2.52A2.528%202.528%200%200%201%208.834%200a2.528%202.528%200%200%201%202.521%202.522v2.52H8.834zM8.834%206.313a2.528%202.528%200%200%201%202.521%202.521%202.528%202.528%200%200%201-2.521%202.521H2.522A2.528%202.528%200%200%201%200%208.834a2.528%202.528%200%200%201%202.522-2.521h6.312zM18.956%208.834a2.528%202.528%200%200%201%202.522-2.521A2.528%202.528%200%200%201%2024%208.834a2.528%202.528%200%200%201-2.522%202.521h-2.522V8.834zM17.688%208.834a2.528%202.528%200%200%201-2.523%202.521%202.527%202.527%200%200%201-2.52-2.521V2.522A2.527%202.527%200%200%201%2015.165%200a2.528%202.528%200%200%201%202.523%202.522v6.312zM15.165%2018.956a2.528%202.528%200%200%201%202.523%202.522A2.528%202.528%200%200%201%2015.165%2024a2.527%202.527%200%200%201-2.52-2.522v-2.522h2.52zM15.165%2017.688a2.527%202.527%200%200%201-2.52-2.523%202.526%202.526%200%200%201%202.52-2.52h6.313A2.527%202.527%200%200%201%2024%2015.165a2.528%202.528%200%200%201-2.522%202.523h-6.313z%22%2F%3E%3C%2Fsvg%3E",
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

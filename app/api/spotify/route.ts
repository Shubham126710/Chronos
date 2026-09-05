import { NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";

export async function GET() {
  try {
    const user = await prisma.user.findFirst();
    if (!user) return NextResponse.json({ success: false }, { status: 404 });

    const integration = await prisma.integration.findUnique({
      where: { userId_provider: { userId: user.id, provider: "SPOTIFY" } },
    });

    const defaultData = {
      isPlaying: true,
      currentTrack: {
        title: "Resonance",
        artist: "Home",
        album: "Odyssey",
        durationMs: 212000,
        progressMs: 94000,
        coverUrl: "https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=300&auto=format&fit=crop&q=80",
      },
      activePlaylist: "Synthwave / Cyberpunk Focus 2026",
      playlists: [
        "Synthwave / Cyberpunk Focus 2026",
        "Deep Work Classical & Ambient",
        "Lo-Fi Beats to Code/Study To",
        "High Energy Gym HIIT",
      ],
      sessionStats: {
        focusAudioHours: 14.2,
        topGenre: "Synthwave / Ambient",
        audioFocusScoreBoost: "+18%",
      },
    };

    const data = integration?.metadata ? { ...defaultData, ...JSON.parse(integration.metadata) } : defaultData;

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("GET /api/spotify error:", error);
    return NextResponse.json({ success: false, message: "Failed to fetch Spotify data" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { action, playlist, track } = body;
    const user = await prisma.user.findFirst();
    if (!user) return NextResponse.json({ success: false }, { status: 404 });

    let integration = await prisma.integration.findUnique({
      where: { userId_provider: { userId: user.id, provider: "SPOTIFY" } },
    });

    const currentMeta = integration?.metadata ? JSON.parse(integration.metadata) : {};

    if (action === "toggle-play") {
      currentMeta.isPlaying = !currentMeta.isPlaying;
    } else if (action === "switch-playlist" && playlist) {
      currentMeta.activePlaylist = playlist;
    } else if (action === "change-track" && track) {
      currentMeta.currentTrack = track;
    }

    if (integration) {
      await prisma.integration.update({
        where: { id: integration.id },
        data: { metadata: JSON.stringify(currentMeta), lastSynced: new Date() },
      });
    } else {
      await prisma.integration.create({
        data: {
          userId: user.id,
          provider: "SPOTIFY",
          status: "CONNECTED",
          metadata: JSON.stringify(currentMeta),
          lastSynced: new Date(),
        },
      });
    }

    return NextResponse.json({ success: true, data: currentMeta });
  } catch (error) {
    console.error("POST /api/spotify error:", error);
    return NextResponse.json({ success: false, message: "Failed to update Spotify state" }, { status: 500 });
  }
}

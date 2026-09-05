import { NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/route";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }
    const userId = (session.user as any).id;

    const integration = await prisma.integration.findUnique({
      where: { userId_provider: { userId, provider: "spotify" } },
    });

    if (!integration || integration.status !== "Connected" || !integration.accessToken) {
      return NextResponse.json({ 
        success: true, 
        data: { 
          isConnected: false, 
          status: integration?.status || "Not Connected" 
        } 
      });
    }

    try {
      const spotifyRes = await fetch("https://api.spotify.com/v1/me/player/currently-playing", {
        headers: { "Authorization": `Bearer ${integration.accessToken}` }
      });

      if (spotifyRes.status === 204 || spotifyRes.status === 202) {
        // No track currently playing
        return NextResponse.json({
          success: true,
          data: {
            isConnected: true,
            isPlaying: false,
            currentTrack: null
          }
        });
      }

      if (spotifyRes.status === 401) {
        // Token expired, set to Reconnect
        await prisma.integration.update({
          where: { id: integration.id },
          data: { status: "Reconnect" }
        });
        return NextResponse.json({ success: true, data: { isConnected: false, status: "Reconnect" } });
      }

      const spotifyData = await spotifyRes.json();

      const currentTrack = {
        title: spotifyData.item?.name || "Unknown Track",
        artist: spotifyData.item?.artists?.map((a: any) => a.name).join(", ") || "Unknown Artist",
        album: spotifyData.item?.album?.name || "Unknown Album",
        durationMs: spotifyData.item?.duration_ms || 0,
        progressMs: spotifyData.progress_ms || 0,
        coverUrl: spotifyData.item?.album?.images?.[0]?.url || "",
      };

      return NextResponse.json({
        success: true,
        data: {
          isConnected: true,
          isPlaying: spotifyData.is_playing,
          currentTrack
        }
      });
    } catch (apiError) {
      console.error("Spotify API call error:", apiError);
      return NextResponse.json({ success: true, data: { isConnected: false, status: "Error" } });
    }
  } catch (error) {
    console.error("GET /api/spotify error:", error);
    return NextResponse.json({ success: false, message: "Failed to fetch Spotify data" }, { status: 500 });
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
    const { action } = body;

    const integration = await prisma.integration.findUnique({
      where: { userId_provider: { userId, provider: "spotify" } },
    });

    if (!integration || integration.status !== "Connected" || !integration.accessToken) {
       return NextResponse.json({ success: false, message: "Spotify not connected" }, { status: 400 });
    }

    let url = "";
    let method = "PUT";

    if (action === "toggle-play") {
      // Need to fetch current playback state first to determine play or pause
      const stateRes = await fetch("https://api.spotify.com/v1/me/player", {
        headers: { "Authorization": `Bearer ${integration.accessToken}` }
      });
      if (stateRes.ok) {
        const state = await stateRes.json();
        url = state.is_playing ? "https://api.spotify.com/v1/me/player/pause" : "https://api.spotify.com/v1/me/player/play";
      } else {
        url = "https://api.spotify.com/v1/me/player/play"; // fallback
      }
    } else if (action === "next") {
      url = "https://api.spotify.com/v1/me/player/next";
      method = "POST";
    } else if (action === "prev") {
      url = "https://api.spotify.com/v1/me/player/previous";
      method = "POST";
    }

    if (url) {
      await fetch(url, {
        method,
        headers: { "Authorization": `Bearer ${integration.accessToken}` }
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("POST /api/spotify error:", error);
    return NextResponse.json({ success: false, message: "Failed to update Spotify state" }, { status: 500 });
  }
}

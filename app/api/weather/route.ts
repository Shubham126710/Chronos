import { NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";

export async function GET() {
  try {
    const location = "San Francisco, CA / Campus Tech Hub";
    
    // Check cache first
    let cached = await prisma.weatherCache.findUnique({ where: { location } });
    const now = new Date();
    
    // If cache is older than 1 hour or missing, update it
    if (!cached || now.getTime() - cached.updatedAt.getTime() > 3600000) {
      const weatherData = {
        location,
        temp: 68,
        condition: "Partly Cloudy",
        icon: "cloud-sun",
        humidity: 62,
        wind: "12 mph",
        forecast: [
          { time: "12 PM", temp: 68, rain: "0%" },
          { time: "02 PM", temp: 71, rain: "10%" },
          { time: "04 PM", temp: 65, rain: "80%" }, // Rain expected
          { time: "06 PM", temp: 61, rain: "60%" },
        ],
        aiScheduleAdaptation: "Rain expected at 4:00 PM (80% probability). Your scheduled outdoor evening walk has been automatically shifted to tomorrow morning at 8:00 AM buffer block.",
      };

      if (cached) {
        cached = await prisma.weatherCache.update({
          where: { location },
          data: { data: JSON.stringify(weatherData) },
        });
      } else {
        cached = await prisma.weatherCache.create({
          data: { location, data: JSON.stringify(weatherData) },
        });
      }
    }

    const parsedData = JSON.parse(cached.data);
    return NextResponse.json({ success: true, data: parsedData });
  } catch (error) {
    console.error("GET /api/weather error:", error);
    return NextResponse.json({ success: false, message: "Failed to fetch weather data" }, { status: 500 });
  }
}

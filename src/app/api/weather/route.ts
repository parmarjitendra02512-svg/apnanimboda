export const dynamic = 'force-dynamic';
import { NextResponse } from "next/server";
import { getServerDb } from "@/lib/firebase-server";
import { verifyAuth, getRequestIp, checkServerRateLimit } from "@/lib/auth";

export async function GET(request: Request) {
  // 1. SECURITY: Authentication Check
  const { error: authError } = await verifyAuth();
  if (authError) return authError;

  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q") || "Jalore";

  // 2. SECURITY: Rate Limiting (Firebase-backed)
  const ip = getRequestIp(request);
  const allowed = await checkServerRateLimit(ip, "weather", 10, 60000);
  if (!allowed) {
    return NextResponse.json(
      {
        status: "error",
        message: "Too many requests. Please try again later.",
      },
      { status: 429 },
    );
  }

  try {
    // USE FREE LIFETIME API (wttr.in)
    const cityQuery = q.includes("Nimboda") ? "Jalore" : q;
    const url = `https://wttr.in/${encodeURIComponent(cityQuery)}?format=j1`;

    const res = await fetch(url, {
      headers: { "User-Agent": "Apna-Nimboda/1.0" },
    });
    const wttrData = await res.json();

    const current = wttrData.current_condition[0];

    // MAP DATA TO OPENWEATHER FORMAT SO UI DOESN'T BREAK
    const mappedData = {
      main: {
        temp: parseFloat(current.temp_C),
        feels_like: parseFloat(current.FeelsLikeC),
        humidity: parseInt(current.humidity),
      },
      weather: [
        {
          description: current.weatherDesc[0].value,
          icon: "02d",
        },
      ],
      wind: {
        speed: parseFloat(current.windspeedKmph) * 0.27778, // kmh to m/s
      },
      name: cityQuery,
      cod: 200,
    };

    return NextResponse.json({ status: "ok", data: mappedData });
  } catch (error) {
    // Log unexpected errors
    try {
      const db = await getServerDb();
      await db.ref("system_logs").push({
        type: "error",
        message: `Weather API Error: ${(error as Error).message}`,
        url: request.url,
        timestamp: Date.now(),
      });
    } catch (e) {}

    return NextResponse.json(
      { status: "error", message: "An error occurred while fetching weather." },
      { status: 500 },
    );
  }
}

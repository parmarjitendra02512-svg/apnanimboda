import { NextResponse } from "next/server";
import { getServerDb } from "@/lib/firebase-server";
import { verifyAuth, getRequestIp, checkServerRateLimit } from "@/lib/auth";

export async function GET(request: Request) {
  // 1. SECURITY: Authentication Check
  const { error: authError } = await verifyAuth();
  if (authError) return authError;

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json(
      { status: "error", message: "Video ID is required." },
      { status: 400 },
    );
  }

  // 2. SECURITY: Rate Limiting (Firebase-backed)
  const ip = getRequestIp(request);
  const allowed = await checkServerRateLimit(ip, "youtube", 15, 60000);
  if (!allowed) {
    return NextResponse.json(
      { status: "error", message: "Too many requests." },
      { status: 429 },
    );
  }

  try {
    const key = process.env.YOUTUBE_API_KEY;
    if (!key) {
      return NextResponse.json(
        {
          status: "error",
          message:
            "YouTube Service is inactive. Please contact Admin to configure API Key.",
        },
        { status: 400 },
      );
    }

    const url = `https://www.googleapis.com/youtube/v3/videos?part=snippet,statistics&id=${encodeURIComponent(id)}&key=${key}`;
    const res = await fetch(url, {
      headers: { "User-Agent": "Apna-Nimboda/1.0" },
    });
    const data = await res.json();

    if (data.items && data.items.length > 0) {
      return NextResponse.json({ status: "ok", data: data.items[0] });
    } else {
      return NextResponse.json(
        {
          status: "error",
          message: data.error?.message || "Video not found or API error.",
        },
        { status: 400 },
      );
    }
  } catch (error) {
    try {
      const db = await getServerDb();
      await db.ref("system_logs").push({
        type: "error",
        message: `YouTube API Error: ${(error as Error).message}`,
        url: request.url,
        timestamp: Date.now(),
      });
    } catch (e) {}
    return NextResponse.json(
      {
        status: "error",
        message: "An error occurred while connecting to YouTube API.",
      },
      { status: 500 },
    );
  }
}

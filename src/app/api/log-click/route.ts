export const dynamic = 'force-dynamic';
import { NextResponse } from "next/server";
import { getServerDb } from "@/lib/firebase-server";
import { getRequestIp, checkServerRateLimit } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    // 1. Security: Rate Limiting
    const ip = getRequestIp(req);
    const allowed = await checkServerRateLimit(ip, "log_click", 15, 60000);
    if (!allowed) {
      return NextResponse.json({ error: "Too many requests" }, { status: 429 });
    }

    const {
      url,
      title,
      type = "link",
      userId = "anonymous",
      userName = "Unknown",
    } = await req.json();

    if (!url) {
      return NextResponse.json({ error: "URL is required" }, { status: 400 });
    }

    const db = await getServerDb();
    await db.ref("click_logs").push({
      url,
      title: title || "Unknown Title",
      type, // 'link', 'video', 'image', etc.
      userId,
      userName,
      timestamp: Date.now(),
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Click Log API Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}

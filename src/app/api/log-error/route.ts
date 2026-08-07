import { NextResponse } from "next/server";
import { getServerDb } from "@/lib/firebase-server";
import { getRequestIp, checkServerRateLimit } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    // 1. Security: Rate Limiting (no full auth since errors may occur before login)
    const ip = getRequestIp(req);
    const allowed = await checkServerRateLimit(ip, "log_error", 10, 60000);
    if (!allowed) {
      return NextResponse.json({ error: "Too many requests" }, { status: 429 });
    }

    const data = await req.json();

    // Validate basic structure
    if (!data.message || !data.type) {
      return NextResponse.json(
        { error: "Invalid log format" },
        { status: 400 },
      );
    }

    // Push to Realtime Database system_logs (Admin SDK)
    const db = await getServerDb();
    await db.ref("system_logs").push({
      timestamp: Date.now(),
      type: data.type, // 'error', 'security', 'info'
      message: data.message,
      stack: data.stack || "",
      url: data.url || "",
      userAgent: req.headers.get("user-agent") || "Unknown",
      userId: data.userId || "Guest",
      userMobile: data.userMobile || "Unknown",
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Failed to log error:", err);
    return NextResponse.json({ error: "Failed to log error" }, { status: 500 });
  }
}

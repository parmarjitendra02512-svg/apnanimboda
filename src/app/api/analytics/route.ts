export const dynamic = 'force-dynamic';
import { NextResponse } from "next/server";
import { getServerDb } from "@/lib/firebase-server";
import { getRequestIp, checkServerRateLimit } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    // 1. Security: Rate Limiting
    const ip = getRequestIp(req);
    const allowed = await checkServerRateLimit(ip, "analytics", 5, 60000);
    if (!allowed) {
      return NextResponse.json({ error: "Too many requests" }, { status: 429 });
    }

    const { action } = await req.json(); // "pageView" or "install"
    const db = await getServerDb();
    
    // Use transaction to safely increment counter
    const path = action === "pageView" ? "pageViews" : "appInstalls";
    await db.ref(`analytics/${path}`).transaction((currentValue: any) => {
      return (currentValue || 0) + 1;
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false, error: "Failed" }, { status: 500 });
  }
}

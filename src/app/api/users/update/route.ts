export const dynamic = 'force-dynamic';
import { NextResponse } from "next/server";
import { getServerDb } from "@/lib/firebase-server";
import { verifyAuth, getRequestIp, checkServerRateLimit } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    // 1. Security: Authentication
    const { error, user } = await verifyAuth();
    if (error) return error;

    // 2. Security: Payload Size Limit
    if (Number(req.headers.get("content-length")) > 10000) {
      return NextResponse.json({ error: "Payload too large" }, { status: 413 });
    }

    // 3. Security: Rate Limiting
    const ip = getRequestIp(req);
    const allowed = await checkServerRateLimit(ip, "user_update", 20, 60000);
    if (!allowed) {
      return NextResponse.json({ error: "Too many requests" }, { status: 429 });
    }

    const { userId, type, data } = await req.json();

    if (!userId || !type || !data) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // 4. Security: Users can only update their own data (unless admin)
    if (user && user.role !== "admin" && user.uid !== userId && user.mobile !== userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const db = await getServerDb();
    
    if (type === "liveLocation") {
      await db.ref(`approved_users/${userId}/liveLocation`).update(data);
      return NextResponse.json({ success: true });
    }
    
    if (type === "permissions") {
      await db.ref(`approved_users/${userId}/permissions`).update(data);
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "Invalid update type" }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

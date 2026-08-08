export const dynamic = 'force-dynamic';
import { NextResponse } from "next/server";
import { getServerDb } from "@/lib/firebase-server";
import { verifyAuth, getRequestIp, checkServerRateLimit } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    // 1. Security: Authentication
    const { error: authError } = await verifyAuth();
    if (authError) return authError;

    // 2. Security: Rate Limiting (Firebase-backed, works on serverless)
    const ip = getRequestIp(req);
    const allowed = await checkServerRateLimit(ip, "report", 5, 3600000); // 5 per hour
    if (!allowed) {
      return NextResponse.json(
        { error: "Too many reports submitted. Please try again later." },
        { status: 429 },
      );
    }

    const {
      reporterId,
      reporterName,
      reportedEntityId,
      reportedEntityName,
      entityType,
      reason,
      description,
    } = await req.json();

    if (!reporterId || !reportedEntityId || !reason) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    // Write Report (Admin SDK)
    const db = await getServerDb();
    await db.ref("reports").push({
      reporterId,
      reporterName: reporterName || "Unknown",
      reportedEntityId,
      reportedEntityName: reportedEntityName || "Unknown",
      entityType: entityType || "user", // user, post, chat
      reason,
      description: description || "",
      status: "pending",
      timestamp: Date.now(),
    });

    return NextResponse.json({
      success: true,
      message: "Report submitted successfully",
    });
  } catch (error: any) {
    console.error("Report API Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}

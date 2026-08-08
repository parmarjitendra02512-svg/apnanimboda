export const dynamic = 'force-dynamic';
import { NextResponse } from "next/server";
import { verifyAuth, getRequestIp, checkServerRateLimit } from "@/lib/auth";
import { getServerDb } from "@/lib/firebase-server";

export async function POST(req: Request) {
  try {
    // 1. Authentication
    const { error, user } = await verifyAuth();
    if (error) return error;
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2. Rate Limiting (Max 2 mobile change requests per day)
    const ip = getRequestIp(req);
    const allowed = await checkServerRateLimit(ip, "mobile_change", 2, 86400000); // 24 hours
    if (!allowed) {
      return NextResponse.json({ error: "Too many requests. Please try again later." }, { status: 429 });
    }

    const { newMobile } = await req.json();

    // 3. Validation
    if (!newMobile || !/^[0-9]{10}$/.test(newMobile.trim())) {
      return NextResponse.json({ error: "Invalid mobile number. Must be 10 digits." }, { status: 400 });
    }

    const cleanNewMobile = newMobile.trim();
    const oldMobile = user.mobile;

    if (cleanNewMobile === oldMobile) {
      return NextResponse.json({ error: "New mobile number must be different from current." }, { status: 400 });
    }

    const db = await getServerDb();

    // 4. Check if new mobile number is already taken in users
    const existingSnap = await db.ref(`approved_users/${cleanNewMobile}`).get();

    if (existingSnap.exists()) {
      return NextResponse.json({ error: "This mobile number is already registered to another account." }, { status: 400 });
    }

    // 5. Check if a pending request already exists for this user
    const pendingSnap = await db.ref(`pending_mobile_updates/${oldMobile}`).get();

    if (pendingSnap.exists()) {
      return NextResponse.json({ error: "You already have a pending mobile number update request." }, { status: 400 });
    }

    // 6. Check if anyone else has a pending request to claim this new mobile number
    // We would need to query all pending_mobile_updates, but Firebase Realtime Database makes complex queries hard.
    // For now, we will fetch all pending updates and check manually.
    const allPendingSnap = await db.ref("pending_mobile_updates").orderByChild("newMobile").equalTo(cleanNewMobile).get();
    
    if (allPendingSnap.exists()) {
      return NextResponse.json({ error: "This mobile number is currently involved in another pending request." }, { status: 400 });
    }

    // 7. Insert into Firebase for Realtime Admin Panel
    await db.ref(`pending_mobile_updates/${oldMobile}`).set({
      oldMobile: oldMobile,
      newMobile: cleanNewMobile,
      name: user.name,
      timestamp: Date.now()
    });

    return NextResponse.json({ success: true, message: "Mobile number update request submitted successfully. Waiting for admin approval." });
  } catch (error: any) {
    console.error("Mobile change request error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

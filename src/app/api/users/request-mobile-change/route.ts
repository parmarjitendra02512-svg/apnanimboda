import { NextResponse } from "next/server";
import { getServerSupabase } from "@/lib/supabase-server";
import { verifyAuth, getRequestIp, checkServerRateLimit } from "@/lib/auth";

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

    const supabase = getServerSupabase();

    // 4. Check if new mobile number is already taken in users
    const { data: existingUser } = await supabase
      .from("users")
      .select("id")
      .eq("mobile", cleanNewMobile)
      .single();

    if (existingUser) {
      return NextResponse.json({ error: "This mobile number is already registered to another account." }, { status: 400 });
    }

    // 5. Check if a pending request already exists for this user
    const { data: pendingRequest } = await supabase
      .from("auth_requests")
      .select("id")
      .eq("mobile", oldMobile)
      .eq("request_type", "mobile_update")
      .eq("status", "pending")
      .single();

    if (pendingRequest) {
      return NextResponse.json({ error: "You already have a pending mobile number update request." }, { status: 400 });
    }

    // 6. Check if anyone else has a pending request to claim this new mobile number
    const { data: claimingRequest } = await supabase
      .from("auth_requests")
      .select("id")
      .eq("request_type", "mobile_update")
      .eq("status", "pending")
      .contains("data", { new_mobile: cleanNewMobile });

    if (claimingRequest && claimingRequest.length > 0) {
      return NextResponse.json({ error: "This mobile number is currently involved in another pending request." }, { status: 400 });
    }

    // 7. Insert the request into Supabase (for persistent record)
    const { error: insertError } = await supabase
      .from("auth_requests")
      .insert({
        mobile: oldMobile,
        request_type: "mobile_update",
        status: "pending",
        data: {
          name: user.name,
          new_mobile: cleanNewMobile,
        }
      });

    if (insertError) {
      console.error("Insert mobile update error:", insertError);
      return NextResponse.json({ error: "Failed to submit request" }, { status: 500 });
    }

    // 8. Insert into Firebase for Realtime Admin Panel
    const { getServerDb } = await import("@/lib/firebase-server");
    const db = await getServerDb();
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

export const dynamic = 'force-dynamic';
import { NextResponse } from "next/server";
import { getServerDb } from "@/lib/firebase-server";

import bcrypt from "bcryptjs";
import { z } from "zod";
import { checkRateLimit, getIp } from "@/lib/rate-limit";

export async function POST(req: Request) {
  try {
    const ip = getIp(req);
    // Limit to 2 reset requests per minute
    const isAllowed = await checkRateLimit(ip, "reset", 2, 60000);
    if (!isAllowed) {
      return NextResponse.json(
        { error: "Too many reset attempts. Please try again after 1 minute." },
        { status: 429 },
      );
    }

    const rawData = await req.json();
    
    const resetSchema = z.object({
      mobile: z.string().trim().regex(/^[0-9]{10}$/, "Invalid mobile number"),
      fatherName: z.string().trim().min(1, "Father name required").max(50),
      newPassword: z.string().min(6, "Password must be at least 6 characters").max(100),
    });
    
    const validated = resetSchema.safeParse(rawData);
    if (!validated.success) {
      return NextResponse.json({ error: validated.error.issues[0]?.message || "Invalid input" }, { status: 400 });
    }
    
    const { mobile, fatherName, newPassword } = validated.data;
    const cleanMobile = mobile;

    const db = await getServerDb();
    
    // Get user using Firebase
    const userSnap = await db.ref(`approved_users/${cleanMobile}`).get();
    const userData = userSnap.val();

    if (!userData) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Security check: verify father's name matches (case insensitive)
    if (
      !userData.father ||
      userData.father.toLowerCase().trim() !==
        fatherName.toLowerCase().trim()
    ) {
      return NextResponse.json(
        { error: "Father's name verification failed" },
        { status: 403 },
      );
    }

    const salt = bcrypt.genSaltSync(10);
    const passwordHash = bcrypt.hashSync(newPassword, salt);

    // Instead of updating immediately, send to pending_resets for admin approval
    // Check if reset request already exists
    const existingResetSnap = await db.ref(`pending_resets/${cleanMobile}`).get();

    if (existingResetSnap.exists()) {
         return NextResponse.json(
          { error: "A pending password reset request already exists for this mobile number." },
          { status: 400 },
        );
    }
        
    try {
      await db.ref(`pending_resets/${cleanMobile}`).set({
          mobile: cleanMobile,
          name: userData.name,
          newPasswordHash: passwordHash,
          requestedAt: Date.now()
      });
    } catch (insertError: any) {
         console.error("Firebase insert reset error:", insertError);
         return NextResponse.json(
          { error: "Failed to submit reset request" },
          { status: 500 },
        );
    }

    return NextResponse.json({
      success: true,
      message:
        "Password reset request submitted successfully. Waiting for admin approval.",
    });
  } catch (error: any) {
    console.error("Reset error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}

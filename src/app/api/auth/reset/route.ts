import { NextResponse } from "next/server";
import { getServerSupabase } from "@/lib/supabase-server";

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

    const supabase = getServerSupabase();
    
    // Get user using Supabase
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("id, name, father_name")
      .eq("mobile", cleanMobile)
      .single();

    if (userError || !userData) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Security check: verify father's name matches (case insensitive)
    if (
      !userData.father_name ||
      userData.father_name.toLowerCase().trim() !==
        fatherName.toLowerCase().trim()
    ) {
      return NextResponse.json(
        { error: "Father's name verification failed" },
        { status: 403 },
      );
    }

    const salt = bcrypt.genSaltSync(10);
    const passwordHash = bcrypt.hashSync(newPassword, salt);

    // Instead of updating immediately, send to auth_requests for admin approval
    // Check if reset request already exists
    const { data: existingReset } = await supabase
        .from("auth_requests")
        .select("id")
        .eq("mobile", cleanMobile)
        .eq("request_type", "password_reset")
        .eq("status", "pending")
        .single();

    if (existingReset) {
         return NextResponse.json(
          { error: "A pending password reset request already exists for this mobile number." },
          { status: 400 },
        );
    }
        
    const { error: insertError } = await supabase
      .from("auth_requests")
      .insert({
          mobile: cleanMobile,
          request_type: "password_reset",
          status: "pending",
          data: {
            name: userData.name,
            requested_password_hash: passwordHash,
          }
      });

    if (insertError) {
         console.error("Supabase insert reset error:", insertError);
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

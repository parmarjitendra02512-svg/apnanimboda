import { NextResponse } from "next/server";
import { getServerSupabase } from "@/lib/supabase-server";
import bcrypt from "bcryptjs";
import { checkRateLimit, getIp } from "@/lib/rate-limit";
import { z } from "zod";

// Strict Input Validation Schema (Anti-Injection / Anti-DDoS)
const registerSchema = z.object({
  mobile: z
    .string()
    .trim()
    .regex(/^[0-9]{10}$/, "Mobile number must be exactly 10 digits"),
  name: z
    .string()
    .trim()
    .min(2, "Name must be at least 2 characters")
    .max(50)
    .regex(/^[^<>]*$/, "No HTML allowed"),
  father: z
    .string()
    .trim()
    .min(2, "Father's name must be at least 2 characters")
    .max(50)
    .regex(/^[^<>]*$/, "No HTML allowed"),
  email: z.string().optional(),
  password: z
    .string()
    .min(6, "Password must be at least 6 characters")
    .max(100),
  location: z.string().max(100).optional(),
  profession: z.string().max(50).optional(),
  photoUrl: z.string().max(500).optional(),
});

export async function POST(req: Request) {
  try {
    // 1. Payload Size Limit (Next.js Edge already limits to 4MB, but we can check Content-Length for strictness)
    if (Number(req.headers.get("content-length")) > 100000) {
      return NextResponse.json({ error: "Payload too large" }, { status: 413 });
    }

    // 2. Rate Limiting (Anti-Bot: Max 5 registrations per IP per minute)
    const ip = getIp(req);
    const isAllowed = await checkRateLimit(ip, "register", 5, 60000);
    if (!isAllowed) {
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        { status: 429 },
      );
    }

    // 3. Data Parsing & Strict Validation
    const rawData = await req.json();
    const validatedData = registerSchema.safeParse(rawData);

    if (!validatedData.success) {
      const errMsg =
        validatedData.error.issues[0]?.message || "Invalid input data";
      return NextResponse.json({ error: errMsg }, { status: 400 });
    }

    const data = validatedData.data;
    const cleanMobile = data.mobile;

    const supabase = getServerSupabase();

    // Check if user already exists
    const { data: existingUser } = await supabase
      .from("users")
      .select("id")
      .eq("mobile", cleanMobile)
      .single();

    const { data: pendingUser } = await supabase
      .from("auth_requests")
      .select("id")
      .eq("mobile", cleanMobile)
      .single();

    if (existingUser || pendingUser) {
      return NextResponse.json(
        { error: "Mobile number already registered" },
        { status: 400 },
      );
    }

    // Hash password securely
    const salt = bcrypt.genSaltSync(10);
    const passwordHash = bcrypt.hashSync(data.password, salt);

    const { password, ...restData } = data;

    // Create user directly (auto-approved) in Supabase
    const { error: insertError, data: newUserData } = await supabase
      .from("users")
      .insert({
        mobile: cleanMobile,
        name: restData.name,
        father_name: restData.father,
        email: restData.email || null,
        password_hash: passwordHash,
        role: "user",
        is_approved: true
      })
      .select()
      .single();

    if (insertError) {
      console.error("Supabase insert error:", insertError);
      return NextResponse.json(
        { error: "Failed to create account (SB): " + (insertError.message || JSON.stringify(insertError)) },
        { status: 500 },
      );
    }

    // Create user directly in Firebase (so frontend AuthContext works)
    try {
      const { getServerDb } = await import("@/lib/firebase-server");
      const db = await getServerDb();
      await db.ref(`approved_users/${cleanMobile}`).set({
        id: newUserData?.id || cleanMobile,
        uid: newUserData?.id || cleanMobile,
        mobile: cleanMobile,
        name: restData.name,
        father: restData.father,
        email: restData.email || null,
        location: restData.location || null,
        profession: restData.profession || null,
        photoUrl: restData.photoUrl || null,
        role: "user",
        status: "approved",
        is_approved: true,
        approvedAt: Date.now(),
      });
    } catch (firebaseErr: any) {
      console.error("Firebase insert error:", firebaseErr);
      return NextResponse.json(
        { error: "Failed to create account (FB): " + firebaseErr.message },
        { status: 500 },
      );
    }

    return NextResponse.json({
      success: true,
      message: "Registration successful",
    });
  } catch (error: any) {
    console.error("Register error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}

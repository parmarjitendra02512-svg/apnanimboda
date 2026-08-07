import { NextResponse } from "next/server";
import { getServerSupabase } from "@/lib/supabase-server";
import bcrypt from "bcryptjs";
import { SignJWT } from "jose";
import { cookies } from "next/headers";

import { z } from "zod";
import { checkRateLimit, getIp } from "@/lib/rate-limit";
import { JWT_SECRET, ADMIN_MOBILE } from "@/lib/auth";

const loginSchema = z.object({
  mobile: z
    .string()
    .trim()
    .regex(/^[0-9]{10}$/, "Invalid mobile number"),
  password: z.string().min(1, "Password is required").max(100),
  isSecretDoor: z.boolean().optional(),
});

export async function POST(req: Request) {
  try {
    if (Number(req.headers.get("content-length")) > 50000) {
      return NextResponse.json({ error: "Payload too large" }, { status: 413 });
    }

    const ip = getIp(req);
    const isAllowed = await checkRateLimit(ip, "login", 10, 60000); // 10 attempts per minute
    if (!isAllowed) {
      return NextResponse.json(
        { error: "Too many login attempts. Please try again later." },
        { status: 429 },
      );
    }

    const rawData = await req.json();
    const validatedData = loginSchema.safeParse(rawData);

    if (!validatedData.success) {
      const errMsg =
        validatedData.error.issues[0]?.message || "Invalid input data";
      return NextResponse.json({ error: errMsg }, { status: 400 });
    }

    const { mobile, password, isSecretDoor } = validatedData.data;
    const cleanMobile = mobile;

    // Admin Login via env-based credentials (no hardcoded password)
    const adminMobile = ADMIN_MOBILE;
    const adminPasswordHash = process.env.ADMIN_PASSWORD_HASH || "$2b$10$1asfn6EVLUOHkOHNI59quOqFQdAVCGnWqrGU72Aal2KY/GD.CWKAe";

    if (cleanMobile === adminMobile && adminPasswordHash) {
      const isAdminValid = bcrypt.compareSync(password, adminPasswordHash);
      if (isAdminValid) {
        if (!isSecretDoor) {
          return NextResponse.json(
            { error: "Admin login is strictly restricted to the Secret Admin Door." },
            { status: 403 }
          );
        }
        const token = await new SignJWT({ mobile: cleanMobile, role: "admin" })
          .setProtectedHeader({ alg: "HS256" })
          .setExpirationTime("24h")
          .sign(JWT_SECRET);

        const cookieStore = await cookies();
        cookieStore.set("auth_token", token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "strict",
          maxAge: 60 * 60 * 24,
        });

        return NextResponse.json(
          { 
            success: true, 
            redirect: "/admin",
            user: {
              id: cleanMobile,
              uid: cleanMobile,
              mobile: cleanMobile,
              role: "admin",
              name: "Admin"
            }
          },
          { status: 200 },
        );
      }
    }

    const supabase = getServerSupabase();
    
    // Check if approved user
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("id, mobile, name, role, is_approved, password_hash, father_name, created_at")
      .eq("mobile", cleanMobile)
      .single();

    if (!userData) {
      // Check if they are pending
      const { data: pendingData } = await supabase
        .from("auth_requests")
        .select("*")
        .eq("mobile", cleanMobile)
        .eq("status", "pending")
        .single();
        
      if (pendingData) {
        return NextResponse.json(
          { error: "Your account is waiting for admin approval." },
          { status: 403 },
        );
      }
      return NextResponse.json(
        { error: "Account not found. Please register first." },
        { status: 401 },
      );
    }

    if (!userData.is_approved && userData.role !== 'admin') {
       return NextResponse.json(
          { error: "Your account is waiting for admin approval." },
          { status: 403 },
        );
    }

    let isValid = false;

    // Only bcrypt hash comparison (plaintext removed for security)
    if (userData.password_hash) {
      isValid = bcrypt.compareSync(password, userData.password_hash);
    }

    if (!isValid) {
      return NextResponse.json({ error: "Invalid password" }, { status: 401 });
    }

    // Generate secure JWT
    const token = await new SignJWT({
      uid: cleanMobile,
      mobile: cleanMobile,
      role: userData.role || "user",
    })
      .setProtectedHeader({ alg: "HS256" })
      .setExpirationTime("24h")
      .sign(JWT_SECRET);

    // Set HTTP-Only Cookie
    const cookieStore = await cookies();
    cookieStore.set("auth_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 24 * 60 * 60,
    });

    // Remove sensitive data before sending to client
    const safeData: any = { ...userData };
    delete safeData.password_hash;

    return NextResponse.json({ user: safeData, success: true });
  } catch (error: any) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}

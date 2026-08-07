import { NextResponse } from "next/server";
import { getServerDb } from "@/lib/firebase-server";
import { verifyAuth, getRequestIp, checkServerRateLimit } from "@/lib/auth";
import bcrypt from "bcryptjs";
import { z } from "zod";

const profileSchema = z.object({
  name: z.string().trim().min(1).max(50).regex(/^[^<>]*$/, "No HTML allowed"),
  father: z.string().trim().max(50).regex(/^[^<>]*$/, "No HTML allowed").optional(),
  location: z.string().max(100).optional(),
  profession: z.string().max(50).optional(),
  password: z.string().min(6).max(100).optional().or(z.literal("")),
  is_private: z.boolean().optional(),
  is_public: z.boolean().optional(),
  photoUrl: z.string().max(500000).optional(), // base64 photos can be large
  instagram: z.string().max(100).optional(),
  facebook: z.string().max(100).optional(),
  twitter: z.string().max(100).optional(),
});

export async function POST(req: Request) {
  try {
    const { error, user } = await verifyAuth();
    if (error) return error;
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (Number(req.headers.get("content-length")) > 600000) {
      return NextResponse.json({ error: "Payload too large" }, { status: 413 });
    }

    const ip = getRequestIp(req);
    const allowed = await checkServerRateLimit(ip, "profile_update", 5, 60000);
    if (!allowed) {
      return NextResponse.json({ error: "Too many requests" }, { status: 429 });
    }

    const rawData = await req.json();
    const validated = profileSchema.safeParse(rawData);
    if (!validated.success) {
      return NextResponse.json({ error: validated.error.issues[0]?.message || "Invalid data" }, { status: 400 });
    }

    const data = validated.data;
    const userId = user.uid || user.mobile;

    const db = await getServerDb();

    // Build the update object (only non-empty fields)
    const updateData: any = {
      name: data.name,
      father: data.father || "",
      location: data.location || "",
      profession: data.profession || "",
      is_private: data.is_private || false,
      is_public: data.is_public || false,
      photoUrl: data.photoUrl || "",
      instagram: data.instagram || "",
      facebook: data.facebook || "",
      twitter: data.twitter || "",
      timestamp: Date.now(),
    };

    // SECURITY: Hash password before storing (fixes C2)
    if (data.password && data.password.trim() !== "") {
      const salt = bcrypt.genSaltSync(10);
      updateData.passwordHash = bcrypt.hashSync(data.password, salt);
      // Never store plain text password
    }

    // SECURITY: Prevent privilege escalation - never allow these fields
    delete updateData.role;
    delete updateData.status;
    delete updateData.mobile;
    delete updateData.id;

    await db.ref(`approved_users/${userId}`).update(updateData);

    return NextResponse.json({ success: true, message: "Profile updated successfully" });
  } catch (error: any) {
    console.error("Profile update error:", error.message);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

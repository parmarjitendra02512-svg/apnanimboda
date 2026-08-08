import { jwtVerify } from "jose";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

// ─── Centralized Admin Config ───
if (!process.env.ADMIN_MOBILE) {
  if (process.env.NODE_ENV === "production") {
    throw new Error("ADMIN_MOBILE environment variable is not set!");
  } else {
    console.warn("ADMIN_MOBILE environment variable is not set, using fallback for dev only.");
  }
}
export const ADMIN_MOBILE = (process.env.ADMIN_MOBILE || "8890870421").trim();

// ─── JWT Secret (REQUIRED - no fallback) ───
const jwtSecretStr = process.env.JWT_SECRET;
if (!jwtSecretStr) {
  throw new Error("JWT_SECRET environment variable is required!");
}
export const JWT_SECRET = new TextEncoder().encode(jwtSecretStr);

// ─── Verify JWT and return decoded payload ───
export async function verifyAuth(requireAdmin = false) {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth_token")?.value;

  if (!token) {
    return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }), user: null };
  }

  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);

    if (requireAdmin) {
      if (payload.role !== "admin" && payload.mobile !== ADMIN_MOBILE) {
        return { error: NextResponse.json({ error: "Forbidden" }, { status: 403 }), user: null };
      }
    }

    return { error: null, user: payload };
  } catch (e) {
    return { error: NextResponse.json({ error: "Invalid token" }, { status: 401 }), user: null };
  }
}

// ─── Simple rate limiter for serverless (Firebase-backed) ───
import { getServerDb } from "./firebase-server";

export async function checkServerRateLimit(
  identifier: string,
  action: string,
  maxRequests: number,
  windowMs: number
): Promise<boolean> {
  try {
    const db = await getServerDb();
    const sanitizedId = (identifier || "unknown").replace(/[.#$[\]]/g, "_");
    const ref = db.ref(`rate_limits/${sanitizedId}_${action}`);

    const snapshot = await ref.get();
    const now = Date.now();

    if (snapshot.exists()) {
      const data = snapshot.val();
      
      if (now - parseInt(data.start_time) > windowMs) {
        await ref.update({ count: 1, start_time: now.toString() });
        return true;
      }
      if (data.count >= maxRequests) {
        return false;
      }
      await ref.update({ count: data.count + 1 });
      return true;
    } else {
      await ref.set({
        count: 1,
        start_time: now.toString(),
      });
      return true;
    }
  } catch (error) {
    console.error("Rate limit error:", error);
    return false; // Fail closed
  }
}

// ─── Get IP from request ───
export function getRequestIp(req: Request): string {
  const forwardedFor = req.headers.get("x-forwarded-for");
  if (forwardedFor) {
    return forwardedFor.split(",")[0].trim();
  }
  return req.headers.get("x-real-ip") || "unknown";
}

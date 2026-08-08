import { getServerDb } from "./firebase-server";

export async function checkRateLimit(
  ip: string,
  action: string,
  maxRequests: number,
  windowMs: number,
): Promise<boolean> {
  try {
    const db = await getServerDb();
    const sanitizedIp = ip.replace(/[.#$[\]]/g, "_") || "unknown";
    const ref = db.ref(`rate_limits/${sanitizedIp}_${action}`);

    const snapshot = await ref.get();
    const now = Date.now();

    if (snapshot.exists()) {
      const data = snapshot.val();
      
      // If window has passed, reset
      if (now - parseInt(data.start_time) > windowMs) {
        await ref.update({ count: 1, start_time: now.toString() });
        return true;
      }

      // If within window and over limit
      if (data.count >= maxRequests) {
        return false;
      }

      // Increment count
      await ref.update({ count: data.count + 1 });
      return true;
    } else {
      // First request - create new record
      await ref.set({
        count: 1,
        start_time: now.toString(),
      });
      return true;
    }
  } catch (error) {
    console.error("Rate limit error:", error);
    return false; // Fail closed - deny if rate limiting fails
  }
}

export function getIp(req: Request): string {
  const forwardedFor = req.headers.get("x-forwarded-for");
  if (forwardedFor) {
    return forwardedFor.split(",")[0].trim();
  }
  return req.headers.get("x-real-ip") || "unknown";
}

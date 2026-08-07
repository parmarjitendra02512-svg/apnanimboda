import { getServerSupabase } from "./supabase-server";

export async function checkRateLimit(
  ip: string,
  action: string,
  maxRequests: number,
  windowMs: number,
): Promise<boolean> {
  try {
    const supabase = getServerSupabase();
    // We can use the raw IP in Supabase, no need to sanitize dots
    const sanitizedIp = ip || "unknown"; 

    // Fetch existing rate limit record
    const { data, error } = await supabase
      .from("rate_limits")
      .select("*")
      .eq("ip", sanitizedIp)
      .eq("action", action)
      .single();

    const now = Date.now();

    if (data) {
      // If window has passed, reset
      if (now - parseInt(data.start_time) > windowMs) {
        await supabase
          .from("rate_limits")
          .update({ count: 1, start_time: now.toString() })
          .eq("id", data.id);
        return true;
      }

      // If within window and over limit
      if (data.count >= maxRequests) {
        return false;
      }

      // Increment count
      await supabase
        .from("rate_limits")
        .update({ count: data.count + 1 })
        .eq("id", data.id);
      return true;
    } else {
      // First request - create new record
      await supabase
        .from("rate_limits")
        .insert({
          ip: sanitizedIp,
          action: action,
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

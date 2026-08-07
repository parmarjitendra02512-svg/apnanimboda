import { NextResponse } from "next/server";
import { getServerDb } from "@/lib/firebase-server";
import { verifyAuth, getRequestIp, checkServerRateLimit } from "@/lib/auth";

export async function GET(request: Request) {
  // 1. SECURITY: Authentication Check
  const { error: authError } = await verifyAuth();
  if (authError) return authError;

  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q") || "राजस्थान";
  const searchQuery = encodeURIComponent(q);

  // 2. SECURITY: Rate Limiting (Firebase-backed)
  const ip = getRequestIp(request);
  const allowed = await checkServerRateLimit(ip, "news", 15, 60000);
  if (!allowed) {
    return NextResponse.json(
      { status: "error", message: "Too many requests." },
      { status: 429 },
    );
  }

  try {
    // USE FREE LIFETIME API (Saurav Tech NewsAPI mirror)
    let url =
      "https://saurav.tech/NewsAPI/top-headlines/category/general/in.json";

    const res = await fetch(url, {
      headers: { "User-Agent": "Apna-Nimboda/1.0" },
    });

    if (!res.ok) {
      throw new Error(`NewsAPI failed: ${res.status}`);
    }

    const data = await res.json();
    let articles = data.articles || [];

    // Local search filter if user provided a query
    if (q && q !== "राजस्थान") {
      const lowerQ = q.toLowerCase();
      articles = articles.filter(
        (a: any) =>
          (a.title && a.title.toLowerCase().includes(lowerQ)) ||
          (a.description && a.description.toLowerCase().includes(lowerQ)),
      );
    }

    // Only return top 20
    return NextResponse.json({
      status: "success",
      articles: articles.slice(0, 20),
    });
  } catch (error) {
    try {
      const db = await getServerDb();
      await db.ref("system_logs").push({
        type: "error",
        message: `News API Error: ${(error as Error).message}`,
        url: request.url,
        timestamp: Date.now(),
      });
    } catch (e) {}

    return NextResponse.json(
      { status: "error", message: "An error occurred while fetching news." },
      { status: 500 },
    );
  }
}

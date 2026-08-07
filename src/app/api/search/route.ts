import { NextResponse } from "next/server";
import { getServerDb } from "@/lib/firebase-server";
import { verifyAuth, getRequestIp, checkServerRateLimit } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    // 1. Security: Authentication
    const { error: authError } = await verifyAuth();
    if (authError) return authError;

    // 2. Security: Rate Limiting
    const ip = getRequestIp(req);
    const allowed = await checkServerRateLimit(ip, "search", 15, 60000);
    if (!allowed) {
      return NextResponse.json({ error: "Too many requests" }, { status: 429 });
    }

    const {
      query,
      language = "en",
      userId = "anonymous",
      userName = "Unknown",
    } = await req.json();

    if (!query) {
      return NextResponse.json({ error: "Query is required" }, { status: 400 });
    }

    // 3. Log the search query in Firebase (Admin SDK)
    try {
      const db = await getServerDb();
      await db.ref("search_logs").push({
        query,
        language,
        userId,
        userName,
        timestamp: Date.now(),
      });
    } catch (dbError) {
      console.error("Failed to log search:", dbError);
    }

    // 4. Build URLSearchParams for application/x-www-form-urlencoded
    const formData = new URLSearchParams();
    formData.append("q", query);

    // 5. Fetch from DuckDuckGo Lite API via POST
    const response = await fetch("https://lite.duckduckgo.com/lite/", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      },
      body: formData.toString(),
    });

    if (!response.ok) {
      throw new Error(`DuckDuckGo responded with status: ${response.status}`);
    }

    const html = await response.text();

    // 6. Parse the HTML using precise Regex to extract Snippets properly
    const results = [];
    const rowRegex =
      /<a [^>]*?href="([^"]+)"[^>]*?class=['"]result-link['"][^>]*?>([\s\S]*?)<\/a>[\s\S]*?<td class=['"]result-snippet['"]>([\s\S]*?)<\/td>/g;

    let match;
    while ((match = rowRegex.exec(html)) !== null) {
      const url = match[1];
      const titleRaw = match[2];
      const snippetRaw = match[3];

      // Clean up HTML tags from title and snippet
      const title = titleRaw.replace(/<[^>]+>/g, "").trim();
      const snippet = snippetRaw.replace(/<[^>]+>/g, "").trim();

      // Basic categorization logic
      let category = "link";
      if (url.includes("youtube.com") || url.includes("vimeo.com")) {
        category = "videos";
      } else if (url.match(/\.(jpeg|jpg|gif|png|webp)$/i)) {
        category = "images";
      } else if (url.includes("news")) {
        category = "news";
      }

      results.push({
        title: title,
        url: url,
        content: snippet,
        category: category,
        engine: "duckduckgo",
      });
    }

    return NextResponse.json({
      results: results,
      provider: "Nimboda Smart Search (DDG)",
    });
  } catch (error: any) {
    console.error("Search API Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}

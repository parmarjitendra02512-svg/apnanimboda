import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { getServerDb } from "@/lib/firebase-server";
import { verifyAuth, getRequestIp, checkServerRateLimit } from "@/lib/auth";

export async function POST(req: Request) {
  // 1. SECURITY: Authentication Check
  const { error: authError } = await verifyAuth();
  if (authError) return authError;

  // 2. SECURITY: Rate Limiting (Firebase-backed)
  const ip = getRequestIp(req);
  const allowed = await checkServerRateLimit(ip, "chat", 10, 60000);
  if (!allowed) {
    try {
      const db = await getServerDb();
      await db.ref("system_logs").push({
        type: "security",
        message: "Gemini AI API spam detected. Possible hack attempt.",
        url: req.url,
        ip: ip,
        timestamp: Date.now(),
      });
    } catch (e) {}
    return NextResponse.json({
      role: "model",
      content: "Too many requests. Please wait a minute.",
    });
  }

  try {
    const { messages } = await req.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: "Invalid messages array" },
        { status: 400 },
      );
    }

    // 1. Fetch Gemini API Key from Environment Variables (Secure)
    const apiKey = process.env.GEMINI_API_KEY?.trim();

    if (!apiKey) {
      return NextResponse.json({
        role: "model",
        content:
          "Server is currently down for maintenance. Please try again later. (सर्वर अभी मेंटेनेंस पर है, कृपया थोड़ी देर बाद प्रयास करें)",
      });
    }

    // 2. Initialize Gemini
    const genAI = new GoogleGenerativeAI(apiKey);

    // 3. RAG: Fetch Live Weather Context
    let weatherContext = "Weather data unavailable.";
    try {
      const weatherRes = await fetch("https://wttr.in/Jalore?format=j1");
      const weatherData = await weatherRes.json();
      const current = weatherData.current_condition[0];
      weatherContext = `Current weather in Nimboda/Jalore: ${current.temp_C}°C, ${current.weatherDesc[0].value}, Humidity: ${current.humidity}%, Wind: ${current.windspeedKmph}km/h.`;
    } catch (e) {
      console.error("Weather fetch failed");
    }

    const villageContext = `Nimboda is a beautiful village in Bhinmal tehsil, Jalore district, Rajasthan, India. Pincode is 343029.`;

    // 4. Define the System Prompt
    const systemPrompt = `You are AINimboda, an exceptionally advanced, premium AI assistant created exclusively by the Administrator of Nimboda. You are highly intelligent, polite, helpful, and speak fluently in English and Hindi (Hinglish). 
    CRITICAL INSTRUCTIONS: 
    - NEVER refer to yourself as Gemini, Google, ChatGPT, or OpenAI. 
    - If asked who created you, say you were created by the Admin of Nimboda.
    - Your name is AINimboda. Keep responses concise, friendly, and professional.
    
    LIVE CONTEXT FOR THIS CHAT:
    ${weatherContext}
    ${villageContext}`;

    // 5. Format messages for Gemini
    let history = messages.slice(0, -1).map((msg: any) => ({
      role: msg.role === "user" ? "user" : "model",
      parts: [{ text: msg.content }],
    }));

    // Gemini requires the first history item to be 'user'
    while (history.length > 0 && history[0].role !== "user") {
      history.shift();
    }

    // Initialize model with System Prompt
    const geminiModel = genAI.getGenerativeModel({
      model: "gemini-3.6-flash",
      systemInstruction: systemPrompt,
    });

    const chat = geminiModel.startChat({ history });

    const latestMessage = messages[messages.length - 1];

    // Prepare the parts for the latest message
    const parts: any[] = [
      { text: latestMessage.content || "Analyze this image" },
    ];

    // If the latest message has an image (base64 string sent from frontend)
    if (latestMessage.image) {
      const match = latestMessage.image.match(
        /^data:(image\/[a-zA-Z+.-]+);base64,(.+)$/,
      );
      if (match) {
        parts.push({
          inlineData: {
            mimeType: match[1],
            data: match[2],
          },
        });
      }
    }

    // Stream the response manually using ReadableStream
    const result = await chat.sendMessageStream(parts);

    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of result.stream) {
            const chunkText = chunk.text();
            if (chunkText) {
              controller.enqueue(new TextEncoder().encode(chunkText));
            }
          }
          controller.close();
        } catch (e) {
          controller.error(e);
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache",
      },
    });
  } catch (error: any) {
    console.error("AINimboda Gemini API Error:", error);

    // Log error to Firebase for admin (Admin SDK)
    try {
      const db = await getServerDb();
      await db.ref("admin_settings/system_errors").push({
        time: Date.now(),
        location: "chat_api",
        message: error.message || "Unknown error",
        // stack removed for security - don't expose internal code paths
      });
    } catch (e) {}

    return NextResponse.json(
      {
        error:
          "Server is currently busy, please try again later. (सर्वर अभी व्यस्त है, कृपया थोड़ी देर बाद प्रयास करें) - Error: " + (error.message || JSON.stringify(error)),
      },
      { status: 500 },
    );
  }
}

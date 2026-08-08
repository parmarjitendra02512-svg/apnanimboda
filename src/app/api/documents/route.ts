export const dynamic = 'force-dynamic';
import { NextResponse } from "next/server";
import { verifyAuth } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    // 1. Security: Authentication
    const { error: authError } = await verifyAuth();
    if (authError) return authError;

    const body = await request.json();

    const apiUrl = process.env.DIGILOCKER_API_URL;
    const apiKey = process.env.DIGILOCKER_API_KEY;
    const clientId = process.env.DIGILOCKER_CLIENT_ID;

    if (!apiUrl || !apiKey) {
      return NextResponse.json(
        {
          status: "error",
          message:
            "Server is currently undergoing maintenance. Please try again later.",
        },
        { status: 400 },
      );
    }

    // Call the external DigiLocker / e-Document API
    const res = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
        "x-api-key": apiKey,
        "X-APISETU-CLIENTID": clientId || "",
        "X-APISETU-APIKEY": apiKey,
        client_id: clientId || "",
        client_secret: apiKey,
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const errorData = await res.text();
      throw new Error(`API Error: ${res.status} ${errorData}`);
    }

    const data = await res.json();
    return NextResponse.json({ status: "ok", data });
  } catch (error: any) {
    console.error("e-Documents Proxy Error:", error);
    return NextResponse.json(
      {
        status: "error",
        message: "An error occurred while fetching the document.",
      },
      { status: 500 },
    );
  }
}

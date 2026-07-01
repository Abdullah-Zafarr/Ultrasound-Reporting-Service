import { NextResponse } from "next/server";
import { DeepgramClient } from "@deepgram/sdk";
import dns from "node:dns";

// Force Node.js to prefer IPv4
dns.setDefaultResultOrder("ipv4first");

export const dynamic = "force-dynamic";

export async function GET() {
  const apiKey = process.env.DEEPGRAM_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      { error: "Missing DEEPGRAM_API_KEY" },
      { status: 500 }
    );
  }

  try {
    // Correct way to initialize DeepgramClient in v5 is with an options object
    const client = new DeepgramClient({ apiKey });
    
    // Attempt to create a secure, short-lived token first
    try {
      // In v5, grant() returns the result directly
      const result = await client.auth.v1.tokens.grant();
      if (result?.access_token) {
        return NextResponse.json({ key: result.access_token });
      }
    } catch (e) {
      console.warn("Scoped token grant failed, falling back to master key for local testing.");
    }
    
    // Fallback for local testing
    if (process.env.NODE_ENV === 'development') {
      return NextResponse.json({ key: apiKey });
    }
    
    return NextResponse.json({ error: "Insufficient permissions to create temporary token" }, { status: 403 });
  } catch (error) {
    console.error("Deepgram token error:", error);
    return NextResponse.json({ error: "Failed to authenticate with Deepgram" }, { status: 500 });
  }
}

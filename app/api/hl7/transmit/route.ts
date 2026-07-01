import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    console.log("[HL7-MOCK] Received HL7 Transmission Request:", {
      messageType: body.messageType,
      patientId: body.patientId,
      accessionNumber: body.accessionNumber,
      payloadSize: body.payload?.length ?? 0
    });

    // In a real scenario, this would send to a MLLP gateway or another API.
    // For local development, we'll just acknowledge receipt.
    
    return NextResponse.json({
      status: "success",
      messageId: `MOCK-${Date.now()}`,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error("[HL7-MOCK] Failed to process request:", error);
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}

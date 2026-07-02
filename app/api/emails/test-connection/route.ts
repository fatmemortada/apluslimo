import { NextResponse } from "next/server";
import { ensureSeed } from "@/lib/api/helpers";
import { testIMAPConnection } from "@/lib/email/sync";

// POST /api/emails/test-connection
// Body: { inboxId: string }
// Tests IMAP connection with the inbox's stored credentials
export async function POST(request: Request) {
  ensureSeed();

  try {
    const body = await request.json();
    if (!body?.inboxId) {
      return NextResponse.json(
        { success: false, error: "inboxId is required" },
        { status: 400 }
      );
    }

    const result = await testIMAPConnection(body.inboxId);

    return NextResponse.json({
      success: result.success,
      data: result,
    });
  } catch (err) {
    return NextResponse.json(
      {
        success: false,
        error: err instanceof Error ? err.message : "Connection test failed",
      },
      { status: 500 }
    );
  }
}

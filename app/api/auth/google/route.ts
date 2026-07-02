import { NextResponse } from "next/server";
import { getGoogleAuthUrl } from "@/lib/email/oauth";

// GET /api/auth/google?inboxId=xxx
// Initiates Google OAuth flow for a specific inbox
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const inboxId = searchParams.get("inboxId");

  if (!inboxId) {
    return NextResponse.json(
      { success: false, error: "inboxId is required" },
      { status: 400 }
    );
  }

  const clientId = process.env.GOOGLE_CLIENT_ID;
  if (!clientId) {
    return NextResponse.json(
      {
        success: false,
        error: "Google OAuth not configured. Set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET environment variables.",
      },
      { status: 501 }
    );
  }

  const redirectUri =
    process.env.GOOGLE_REDIRECT_URI ||
    `${process.env.NEXT_PUBLIC_APP_URL || "https://chauffeuros.ca"}/api/auth/callback/google`;

  const urls = getGoogleAuthUrl({
    clientId,
    redirectUri,
    state: inboxId, // pass inbox ID as state for callback
  });

  return NextResponse.redirect(urls.authorizationUrl);
}

import { NextResponse } from "next/server";
import { db } from "@/lib/db/store";
import { exchangeGoogleCode } from "@/lib/email/oauth";

// GET /api/auth/callback/google?code=xxx&state=inboxId
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const state = searchParams.get("state"); // inboxId
  const error = searchParams.get("error");

  if (error) {
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL || "https://chauffeuros.ca"}/settings?email=oauth_error&provider=google`
    );
  }

  if (!code || !state) {
    return NextResponse.json(
      { success: false, error: "Missing code or state parameter" },
      { status: 400 }
    );
  }

  const inbox = db.emailInboxes.get(state);
  if (!inbox) {
    return NextResponse.json(
      { success: false, error: "Inbox not found" },
      { status: 404 }
    );
  }

  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    return NextResponse.json(
      { success: false, error: "Google OAuth not configured" },
      { status: 501 }
    );
  }

  const redirectUri =
    process.env.GOOGLE_REDIRECT_URI ||
    `${process.env.NEXT_PUBLIC_APP_URL || "https://chauffeuros.ca"}/api/auth/callback/google`;

  try {
    const token = await exchangeGoogleCode(code, clientId, clientSecret, redirectUri);

    // Store token on the inbox
    inbox.oauthToken = token;
    inbox.oauthConnected = true;
    inbox.oauthProvider = "google";
    inbox.syncStatus = "connected";
    inbox.updatedAt = new Date().toISOString();

    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL || "https://chauffeuros.ca"}/settings?email=oauth_success`
    );
  } catch (err) {
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL || "https://chauffeuros.ca"}/settings?email=oauth_error&provider=google`
    );
  }
}

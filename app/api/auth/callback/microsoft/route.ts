import { NextResponse } from "next/server";
import { db } from "@/lib/db/store";
import { exchangeMicrosoftCode } from "@/lib/email/oauth";

// GET /api/auth/callback/microsoft?code=xxx&state=inboxId
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const state = searchParams.get("state"); // inboxId
  const error = searchParams.get("error");

  if (error) {
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL || "https://chauffeuros.ca"}/settings?email=oauth_error&provider=microsoft`
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

  const clientId = process.env.MICROSOFT_CLIENT_ID;
  const clientSecret = process.env.MICROSOFT_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    return NextResponse.json(
      { success: false, error: "Microsoft OAuth not configured" },
      { status: 501 }
    );
  }

  const redirectUri =
    process.env.MICROSOFT_REDIRECT_URI ||
    `${process.env.NEXT_PUBLIC_APP_URL || "https://chauffeuros.ca"}/api/auth/callback/microsoft`;

  const tenantId = process.env.MICROSOFT_TENANT_ID || "common";

  try {
    const token = await exchangeMicrosoftCode(
      code, clientId, clientSecret, redirectUri, tenantId
    );

    inbox.oauthToken = token;
    inbox.oauthConnected = true;
    inbox.oauthProvider = "microsoft";
    inbox.syncStatus = "connected";
    inbox.updatedAt = new Date().toISOString();

    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL || "https://chauffeuros.ca"}/settings?email=oauth_success`
    );
  } catch (err) {
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL || "https://chauffeuros.ca"}/settings?email=oauth_error&provider=microsoft`
    );
  }
}

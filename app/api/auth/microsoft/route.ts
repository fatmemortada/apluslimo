import { NextResponse } from "next/server";
import { getMicrosoftAuthUrl } from "@/lib/email/oauth";

// GET /api/auth/microsoft?inboxId=xxx
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const inboxId = searchParams.get("inboxId");

  if (!inboxId) {
    return NextResponse.json(
      { success: false, error: "inboxId is required" },
      { status: 400 }
    );
  }

  const clientId = process.env.MICROSOFT_CLIENT_ID;
  if (!clientId) {
    return NextResponse.json(
      {
        success: false,
        error: "Microsoft OAuth not configured. Set MICROSOFT_CLIENT_ID and MICROSOFT_CLIENT_SECRET environment variables.",
      },
      { status: 501 }
    );
  }

  const redirectUri =
    process.env.MICROSOFT_REDIRECT_URI ||
    `${process.env.NEXT_PUBLIC_APP_URL || "https://chauffeuros.ca"}/api/auth/callback/microsoft`;

  const urls = getMicrosoftAuthUrl({
    clientId,
    redirectUri,
    state: inboxId,
    tenantId: process.env.MICROSOFT_TENANT_ID || "common",
  });

  return NextResponse.redirect(urls.authorizationUrl);
}

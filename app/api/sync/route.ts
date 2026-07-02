import { NextResponse } from "next/server";
import { ensureSeed } from "@/lib/api/helpers";
import { syncAllInboxes, syncInbox } from "@/lib/email/sync";

// POST /api/sync — sync all inboxes
// GET /api/sync?inboxId=xxx — sync a specific inbox
// This endpoint is designed to be called by Vercel Cron Jobs

export async function GET(request: Request) {
  ensureSeed();

  const { searchParams } = new URL(request.url);
  const inboxId = searchParams.get("inboxId");
  const authKey = searchParams.get("key");

  // Simple auth for cron-triggered sync
  const cronKey = process.env.SYNC_CRON_KEY;
  if (cronKey && authKey !== cronKey) {
    return NextResponse.json(
      { success: false, error: "Invalid or missing sync key" },
      { status: 401 }
    );
  }

  try {
    let results;

    if (inboxId) {
      const result = await syncInbox(inboxId);
      results = [result];
    } else {
      results = await syncAllInboxes();
    }

    const successCount = results.filter((r) => r.status === "success").length;
    const errorCount = results.filter((r) => r.status === "error").length;

    return NextResponse.json({
      success: true,
      data: {
        results,
        summary: {
          total: results.length,
          success: successCount,
          errors: errorCount,
          skipped: results.filter((r) => r.status === "skipped" || r.status === "no_credentials").length,
          newEmails: results.reduce((sum, r) => sum + r.newEmails, 0),
        },
      },
    });
  } catch (err) {
    return NextResponse.json(
      {
        success: false,
        error: err instanceof Error ? err.message : "Sync failed",
      },
      { status: 500 }
    );
  }
}

// POST /api/sync — same as GET but allows triggering from webhooks
export const POST = GET;

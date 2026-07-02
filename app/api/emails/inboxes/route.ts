import { type NextRequest } from "next/server";
import { ensureSeed, getOrgContext, ok, err, notFound } from "@/lib/api/helpers";
import { db } from "@/lib/db/store";

// ── GET /api/emails/inboxes ─────────────────────────────────
export async function GET() {
  ensureSeed();
  const inboxes = db.emailInboxes
    ? Array.from(db.emailInboxes.values())
    : [];

  return ok(inboxes);
}

// ── PATCH /api/emails/inboxes ───────────────────────────────
// Update inbox settings (enable/disable, company info, etc.)
export async function PATCH(request: NextRequest) {
  ensureSeed();
  const body = await request.json().catch(() => null);

  if (!body?.id) {
    return err("inbox id is required");
  }

  const inbox = db.emailInboxes.get(body.id);
  if (!inbox) {
    return notFound("Inbox");
  }

  // Allowed fields to update
  const allowedFields = [
    "displayName",
    "companyName",
    "syncStatus",
    "oauthConnected",
    "imapHost",
    "imapPort",
    "imapSecure",
    "smtpHost",
    "smtpPort",
    "smtpSecure",
    "encryptedPassword",
  ] as const;

  for (const field of allowedFields) {
    if (body[field] !== undefined) {
      (inbox as any)[field] = body[field];
    }
  }

  inbox.updatedAt = new Date().toISOString();
  return ok(inbox);
}

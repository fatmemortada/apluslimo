import { type NextRequest } from "next/server";
import { ensureSeed, getOrgContext, ok, err, notFound } from "@/lib/api/helpers";
import { db, paginate } from "@/lib/db/store";

// ── GET /api/emails ─────────────────────────────────────────
// Query params: inboxId, status, search, page, pageSize, label
export async function GET(request: NextRequest) {
  ensureSeed();
  const { organizationId } = getOrgContext(request);
  const { searchParams } = request.nextUrl;
  const page = parseInt(searchParams.get("page") || "1");
  const pageSize = parseInt(searchParams.get("pageSize") || "50");
  const inboxId = searchParams.get("inboxId");
  const status = searchParams.get("status");
  const label = searchParams.get("label");
  const category = searchParams.get("category");
  const search = searchParams.get("search");

  let messages = db.emailMessages
    ? Array.from(db.emailMessages.values()).filter(
        (m) => m.organizationId === organizationId
      )
    : [];

  if (inboxId && inboxId !== "all") {
    messages = messages.filter((m) => m.inboxId === inboxId);
  }

  if (status) {
    messages = messages.filter((m) => m.status === status);
  }

  if (category) {
    messages = messages.filter((m) => m.category === category);
  }

  if (label) {
    messages = messages.filter((m) => m.labels.includes(label));
  }

  if (search) {
    const s = search.toLowerCase();
    messages = messages.filter(
      (m) =>
        m.subject.toLowerCase().includes(s) ||
        m.from.name.toLowerCase().includes(s) ||
        m.from.email.toLowerCase().includes(s) ||
        m.bodyPreview.toLowerCase().includes(s)
    );
  }

  // Sort newest first
  messages.sort(
    (a, b) => new Date(b.receivedAt).getTime() - new Date(a.receivedAt).getTime()
  );

  return ok(paginate(messages, page, pageSize));
}

// ── PATCH /api/emails ───────────────────────────────────────
export async function PATCH(request: NextRequest) {
  ensureSeed();
  const { organizationId } = getOrgContext(request);
  const body = await request.json().catch(() => null);

  if (!body?.id || !body?.action) {
    return err("id and action are required");
  }

  const email = db.emailMessages.get(body.id);
  if (!email || email.organizationId !== organizationId) {
    return notFound("Email");
  }

  switch (body.action) {
    case "read":
      email.status = "read";
      email.updatedAt = new Date().toISOString();
      const inbox = db.emailInboxes.get(email.inboxId);
      if (inbox && inbox.unreadCount > 0) {
        inbox.unreadCount--;
      }
      return ok(email);

    case "convert_to_booking":
      email.status = "converted_to_booking";
      email.convertedToBookingId = body.bookingId || "pending";
      email.updatedAt = new Date().toISOString();
      return ok(email);

    case "archive":
      db.emailMessages.delete(body.id);
      return ok({ archived: true });

    case "label":
      if (body.labels && Array.isArray(body.labels)) {
        email.labels = body.labels;
        email.updatedAt = new Date().toISOString();
      }
      return ok(email);

    default:
      return err("Unknown action");
  }
}

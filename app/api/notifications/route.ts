import { type NextRequest } from "next/server";
import { ensureSeed, getOrgContext, ok, err } from "@/lib/api/helpers";
import { db, queryAll, paginate } from "@/lib/db/store";

export async function GET(request: NextRequest) {
  ensureSeed();
  const { organizationId, userId } = getOrgContext(request);
  const { searchParams } = request.nextUrl;
  const page = parseInt(searchParams.get("page") || "1");
  const pageSize = parseInt(searchParams.get("pageSize") || "50");
  const unreadOnly = searchParams.get("unread") === "true";

  let items = queryAll(db.notifications, organizationId).filter(
    (n) => n.userId === userId
  );

  if (unreadOnly) items = items.filter((n) => !n.read);

  // Sort newest first
  items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return ok(paginate(items, page, pageSize));
}

export async function PATCH(request: NextRequest) {
  ensureSeed();
  const { organizationId, userId } = getOrgContext(request);
  const { searchParams } = request.nextUrl;
  const id = searchParams.get("id");
  const markAllRead = searchParams.get("markAllRead") === "true";

  if (markAllRead) {
    for (const [, n] of db.notifications) {
      if (n.organizationId === organizationId && n.userId === userId && !n.read) {
        n.read = true;
        n.readAt = new Date().toISOString();
      }
    }
    return ok({ markedRead: true });
  }

  if (id) {
    const notif = db.notifications.get(id);
    if (!notif) return err("Notification not found", 404);
    notif.read = true;
    notif.readAt = new Date().toISOString();
    return ok(notif);
  }

  return err("id or markAllRead parameter required");
}

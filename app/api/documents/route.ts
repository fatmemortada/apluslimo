import { type NextRequest } from "next/server";
import { ensureSeed, getOrgContext, ok, err, parseBody } from "@/lib/api/helpers";
import { db, queryAll, paginate, generateId } from "@/lib/db/store";
import type { Document } from "@/lib/types";

export async function GET(request: NextRequest) {
  ensureSeed();
  const { organizationId } = getOrgContext(request);
  const { searchParams } = request.nextUrl;
  const page = parseInt(searchParams.get("page") || "1");
  const pageSize = parseInt(searchParams.get("pageSize") || "20");
  const search = searchParams.get("search") || undefined;
  const category = searchParams.get("category") || undefined;

  let items = queryAll(db.documents, organizationId, { search });
  if (category) items = items.filter((d) => d.category === category);

  return ok(paginate(items, page, pageSize));
}

export async function POST(request: NextRequest) {
  ensureSeed();
  const { organizationId, userId } = getOrgContext(request);
  const body = await parseBody<Partial<Document>>(request);
  if (!body) return err("Invalid request body");
  if (!body.name) return err("name is required");

  const now = new Date().toISOString();
  const doc: Document = {
    id: generateId("doc"),
    organizationId,
    name: body.name,
    type: body.type || "pdf",
    category: body.category || "other",
    mimeType: body.mimeType || "application/pdf",
    size: body.size || 0,
    url: body.url || "",
    entityType: body.entityType,
    entityId: body.entityId,
    uploadedById: userId,
    tags: body.tags || [],
    createdAt: now,
    updatedAt: now,
  };

  db.documents.set(doc.id, doc);
  return ok(doc, 201);
}

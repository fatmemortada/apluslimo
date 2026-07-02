import { type NextRequest } from "next/server";
import { ensureSeed, getOrgContext, ok, err, notFound, parseBody } from "@/lib/api/helpers";
import { db, queryAll, paginate, generateId } from "@/lib/db/store";
import type { Customer } from "@/lib/types";

export async function GET(request: NextRequest) {
  ensureSeed();
  const { organizationId } = getOrgContext(request);
  const { searchParams } = request.nextUrl;
  const page = parseInt(searchParams.get("page") || "1");
  const pageSize = parseInt(searchParams.get("pageSize") || "20");
  const search = searchParams.get("search") || undefined;
  const status = searchParams.get("status") || undefined;
  const type = searchParams.get("type") || undefined;

  let items = queryAll(db.customers, organizationId, { search, status });
  if (type) items = items.filter((c) => c.type === type);

  const result = paginate(items, page, pageSize);
  return ok(result);
}

export async function POST(request: NextRequest) {
  ensureSeed();
  const { organizationId, userId } = getOrgContext(request);
  const body = await parseBody<Partial<Customer>>(request);
  if (!body) return err("Invalid request body");

  const now = new Date().toISOString();
  const customer: Customer = {
    id: generateId("cust"),
    organizationId,
    type: body.type || "individual",
    status: "active",
    firstName: body.firstName || "",
    lastName: body.lastName || "",
    fullName: `${body.firstName || ""} ${body.lastName || ""}`.trim(),
    email: body.email || "",
    phone: body.phone || "",
    preferences: body.preferences || { preferredPaymentMethod: "credit_card", notifySms: false, notifyEmail: true },
    tags: body.tags || [],
    totalTrips: 0,
    totalRevenue: 0,
    lifetimeValue: 0,
    averageRating: 0,
    createdAt: now,
    updatedAt: now,
  };

  db.customers.set(customer.id, customer);
  return ok(customer, 201);
}

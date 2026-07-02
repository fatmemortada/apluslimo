import { type NextRequest } from "next/server";
import { ensureSeed, getOrgContext, ok, err, parseBody } from "@/lib/api/helpers";
import { db, queryAll, paginate, generateId, generateInvoiceNumber } from "@/lib/db/store";
import type { Invoice, InvoiceWithRelations } from "@/lib/types";

export async function GET(request: NextRequest) {
  ensureSeed();
  const { organizationId } = getOrgContext(request);
  const { searchParams } = request.nextUrl;
  const page = parseInt(searchParams.get("page") || "1");
  const pageSize = parseInt(searchParams.get("pageSize") || "20");
  const status = searchParams.get("status") || undefined;

  let items = queryAll(db.invoices, organizationId, { status });

  const enriched: InvoiceWithRelations[] = items.map((inv) => ({
    ...inv,
    customer: db.customers.get(inv.customerId),
    booking: inv.bookingId ? db.bookings.get(inv.bookingId) : undefined,
    payments: Array.from(db.payments.values()).filter((p) => p.invoiceId === inv.id),
  }));

  const result = paginate(enriched, page, pageSize);
  return ok(result);
}

export async function POST(request: NextRequest) {
  ensureSeed();
  const { organizationId } = getOrgContext(request);
  const body = await parseBody<Partial<Invoice>>(request);
  if (!body) return err("Invalid request body");

  if (!body.customerId) return err("customerId is required");

  const now = new Date().toISOString();
  const invoice: Invoice = {
    id: generateId("inv"),
    organizationId,
    invoiceNumber: generateInvoiceNumber(),
    customerId: body.customerId,
    bookingId: body.bookingId,
    status: "draft",
    issueDate: now,
    dueDate: body.dueDate || new Date(Date.now() + 14 * 86400000).toISOString(),
    lineItems: body.lineItems || [],
    subtotal: body.subtotal || 0,
    taxRate: body.taxRate || 0.15,
    taxAmount: body.taxAmount || 0,
    discountAmount: body.discountAmount || 0,
    totalAmount: body.totalAmount || 0,
    amountPaid: 0,
    balanceDue: body.totalAmount || 0,
    createdAt: now,
    updatedAt: now,
  };

  db.invoices.set(invoice.id, invoice);
  return ok(invoice, 201);
}

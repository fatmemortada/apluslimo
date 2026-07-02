import { type NextRequest } from "next/server";
import { ensureSeed, getOrgContext, ok, err, parseBody } from "@/lib/api/helpers";
import { db, queryAll, paginate, generateId } from "@/lib/db/store";
import type { MaintenanceRecord } from "@/lib/types";

export async function GET(request: NextRequest) {
  ensureSeed();
  const { organizationId } = getOrgContext(request);
  const { searchParams } = request.nextUrl;
  const page = parseInt(searchParams.get("page") || "1");
  const pageSize = parseInt(searchParams.get("pageSize") || "20");
  const status = searchParams.get("status") || undefined;
  const vehicleId = searchParams.get("vehicleId") || undefined;

  let items = queryAll(db.maintenanceRecords, organizationId, { status });
  if (vehicleId) items = items.filter((m) => m.vehicleId === vehicleId);

  const enriched = items.map((m) => ({
    ...m,
    vehicle: db.vehicles.get(m.vehicleId),
  }));

  return ok(paginate(enriched, page, pageSize));
}

export async function POST(request: NextRequest) {
  ensureSeed();
  const { organizationId } = getOrgContext(request);
  const body = await parseBody<Partial<MaintenanceRecord>>(request);
  if (!body) return err("Invalid request body");
  if (!body.vehicleId || !body.type) return err("vehicleId and type are required");

  const now = new Date().toISOString();
  const record: MaintenanceRecord = {
    id: generateId("maint"),
    organizationId,
    vehicleId: body.vehicleId,
    type: body.type,
    status: "scheduled",
    priority: body.priority || "medium",
    description: body.description || "",
    scheduledDate: body.scheduledDate || now,
    cost: body.cost || 0,
    vendor: body.vendor,
    vendorPhone: body.vendorPhone,
    parts: body.parts || [],
    createdAt: now,
    updatedAt: now,
  };

  db.maintenanceRecords.set(record.id, record);
  return ok(record, 201);
}

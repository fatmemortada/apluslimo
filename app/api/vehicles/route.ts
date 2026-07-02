import { type NextRequest } from "next/server";
import { ensureSeed, getOrgContext, ok, err, parseBody } from "@/lib/api/helpers";
import { db, queryAll, paginate, generateId } from "@/lib/db/store";
import type { Vehicle, VehicleWithRelations } from "@/lib/types";

export async function GET(request: NextRequest) {
  ensureSeed();
  const { organizationId } = getOrgContext(request);
  const { searchParams } = request.nextUrl;
  const page = parseInt(searchParams.get("page") || "1");
  const pageSize = parseInt(searchParams.get("pageSize") || "20");
  const search = searchParams.get("search") || undefined;
  const status = searchParams.get("status") || undefined;

  let items = queryAll(db.vehicles, organizationId, { search, status });

  const enriched: VehicleWithRelations[] = items.map((v) => ({
    ...v,
    assignedDriver: db.drivers.get(v.assignedDriverId || ""),
  }));

  const result = paginate(enriched, page, pageSize);
  return ok(result);
}

export async function POST(request: NextRequest) {
  ensureSeed();
  const { organizationId } = getOrgContext(request);
  const body = await parseBody<Partial<Vehicle>>(request);
  if (!body) return err("Invalid request body");

  if (!body.name || !body.plate || !body.vin) {
    return err("name, plate, and vin are required");
  }

  const now = new Date().toISOString();
  const vehicle: Vehicle = {
    id: generateId("veh"),
    organizationId,
    name: body.name,
    type: body.type || "luxury_sedan",
    status: "available",
    year: body.year || new Date().getFullYear(),
    make: body.make || "",
    model: body.model || "",
    color: body.color || "",
    plate: body.plate,
    vin: body.vin,
    seats: body.seats || 4,
    luggageCapacity: body.luggageCapacity || 2,
    fuelType: body.fuelType || "gasoline",
    fuelLevel: body.fuelLevel || 100,
    mileage: body.mileage || 0,
    amenities: body.amenities || [],
    registrationExpiry: body.registrationExpiry || "",
    insuranceExpiry: body.insuranceExpiry || "",
    purchaseDate: body.purchaseDate || now,
    purchasePrice: body.purchasePrice || 0,
    currentValue: body.purchasePrice || 0,
    depreciationRate: body.depreciationRate || 0.15,
    photos: [],
    createdAt: now,
    updatedAt: now,
  };

  db.vehicles.set(vehicle.id, vehicle);
  return ok(vehicle, 201);
}

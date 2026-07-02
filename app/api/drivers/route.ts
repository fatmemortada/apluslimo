import { type NextRequest } from "next/server";
import { ensureSeed, getOrgContext, ok, err, parseBody } from "@/lib/api/helpers";
import { db, queryAll, paginate, generateId } from "@/lib/db/store";
import type { Driver, DriverWithRelations } from "@/lib/types";

export async function GET(request: NextRequest) {
  ensureSeed();
  const { organizationId } = getOrgContext(request);
  const { searchParams } = request.nextUrl;
  const page = parseInt(searchParams.get("page") || "1");
  const pageSize = parseInt(searchParams.get("pageSize") || "20");
  const search = searchParams.get("search") || undefined;
  const status = searchParams.get("status") || undefined;

  let items = queryAll(db.drivers, organizationId, { search, status });

  // Enrich with relations
  const enriched: DriverWithRelations[] = items.map((d) => ({
    ...d,
    assignedVehicle: db.vehicles.get(d.assignedVehicleId || ""),
  }));

  const result = paginate(enriched, page, pageSize);
  return ok(result);
}

export async function POST(request: NextRequest) {
  ensureSeed();
  const { organizationId } = getOrgContext(request);
  const body = await parseBody<Partial<Driver>>(request);
  if (!body) return err("Invalid request body");

  if (!body.firstName || !body.lastName || !body.licenseNumber) {
    return err("firstName, lastName, and licenseNumber are required");
  }

  const now = new Date().toISOString();
  const driver: Driver = {
    id: generateId("drv"),
    organizationId,
    firstName: body.firstName,
    lastName: body.lastName,
    fullName: `${body.firstName} ${body.lastName}`.trim(),
    email: body.email || "",
    phone: body.phone || "",
    status: "available",
    licenseNumber: body.licenseNumber,
    licenseClass: body.licenseClass || "Class 4B",
    licenseExpiry: body.licenseExpiry || "",
    rating: 0,
    totalTrips: 0,
    totalRevenue: 0,
    completionRate: 1,
    onTimeRate: 1,
    yearsOfExperience: body.yearsOfExperience || 0,
    languages: body.languages || ["English", "French"],
    certifications: body.certifications || [],
    emergencyContact: body.emergencyContact || { name: "", phone: "", relationship: "" },
    schedule: body.schedule || {},
    metrics: {
      tripsThisMonth: 0, tripsThisWeek: 0, revenueThisMonth: 0,
      hoursWorkedThisWeek: 0, customerRating: 0, complaints: 0, compliments: 0, accidents: 0,
    },
    hiredAt: now,
    createdAt: now,
    updatedAt: now,
  };

  db.drivers.set(driver.id, driver);
  return ok(driver, 201);
}

import { type NextRequest } from "next/server";
import { ensureSeed, getOrgContext, ok, err, parseBody } from "@/lib/api/helpers";
import { db, queryAll, paginate, generateId, generateBookingNumber } from "@/lib/db/store";
import type { Booking, BookingWithRelations } from "@/lib/types";

export async function GET(request: NextRequest) {
  ensureSeed();
  const { organizationId } = getOrgContext(request);
  const { searchParams } = request.nextUrl;
  const page = parseInt(searchParams.get("page") || "1");
  const pageSize = parseInt(searchParams.get("pageSize") || "20");
  const search = searchParams.get("search") || undefined;
  const status = searchParams.get("status") || undefined;
  const driverId = searchParams.get("driverId") || undefined;
  const customerId = searchParams.get("customerId") || undefined;

  let items = queryAll(db.bookings, organizationId, { search, status });
  if (driverId) items = items.filter((b) => b.assignedDriverId === driverId);
  if (customerId) items = items.filter((b) => b.customerId === customerId);

  const enriched: BookingWithRelations[] = items.map((b) => ({
    ...b,
    customer: db.customers.get(b.customerId),
    driver: b.assignedDriverId ? db.drivers.get(b.assignedDriverId) : undefined,
    vehicle: b.assignedVehicleId ? db.vehicles.get(b.assignedVehicleId) : undefined,
    invoice: b.invoiceId ? db.invoices.get(b.invoiceId) : undefined,
  }));

  const result = paginate(enriched, page, pageSize);
  return ok(result);
}

export async function POST(request: NextRequest) {
  ensureSeed();
  const { organizationId, userId } = getOrgContext(request);
  const body = await parseBody<Partial<Booking>>(request);
  if (!body) return err("Invalid request body");

  if (!body.customerId || !body.pickup || !body.dropoff) {
    return err("customerId, pickup, and dropoff are required");
  }

  const now = new Date().toISOString();
  const booking: Booking = {
    id: generateId("bkg"),
    organizationId,
    bookingNumber: generateBookingNumber(),
    type: body.type || "point_to_point",
    tripType: body.tripType || "one_way",
    status: "pending_confirmation",
    customerId: body.customerId,
    corporateAccountId: body.corporateAccountId,
    passengerCount: body.passengerCount || 1,
    luggageCount: body.luggageCount || 0,
    pickup: body.pickup,
    dropoff: body.dropoff,
    stops: body.stops || [],
    scheduledPickupAt: body.scheduledPickupAt || now,
    baseFare: body.baseFare || 0,
    taxAmount: body.taxAmount || 0,
    gratuity: body.gratuity || 0,
    tolls: body.tolls || 0,
    surcharges: body.surcharges || [],
    totalAmount: body.totalAmount || 0,
    paymentMethod: body.paymentMethod || "credit_card",
    paymentStatus: "pending",
    flightTracking: body.flightTracking || false,
    notes: body.notes,
    specialInstructions: body.specialInstructions,
    createdById: userId,
    createdAt: now,
    updatedAt: now,
  };

  db.bookings.set(booking.id, booking);
  return ok(booking, 201);
}

import { type NextRequest } from "next/server";
import { ensureSeed, getOrgContext, ok, err, parseBody } from "@/lib/api/helpers";
import { calculatePrice, VEHICLE_RATES, EXTRA_SERVICES, SURCHARGE_RULES, DISCOUNT_CODES } from "@/lib/pricing/engine";
import type { PricingContext } from "@/lib/pricing/engine";

export async function POST(request: NextRequest) {
  ensureSeed();
  const body = await parseBody<Partial<PricingContext>>(request);
  if (!body) return err("Invalid request body");
  if (!body.vehicleType || !body.bookingType) return err("vehicleType and bookingType are required");

  const context: PricingContext = {
    bookingType: body.bookingType || "point_to_point",
    vehicleType: body.vehicleType || "luxury_sedan",
    distanceKm: body.distanceKm || 20,
    durationMinutes: body.durationMinutes || 40,
    passengerCount: body.passengerCount || 1,
    luggageCount: body.luggageCount || 0,
    pickupDateTime: body.pickupDateTime ? new Date(body.pickupDateTime) : new Date(),
    isAirport: body.isAirport || false,
    flightNumber: body.flightNumber,
    stops: body.stops || 0,
    extras: body.extras || [],
    discountCode: body.discountCode,
    discountPercent: body.discountPercent || 0,
    gratuityPercent: body.gratuityPercent || 18,
    tollsEstimated: body.tollsEstimated || 0,
  };

  const breakdown = calculatePrice(context);
  return ok({ breakdown, context });
}

export async function GET() {
  ensureSeed();
  return ok({
    vehicles: VEHICLE_RATES,
    extras: EXTRA_SERVICES,
    surcharges: SURCHARGE_RULES.map((r) => ({ id: r.id, name: r.name, description: r.description })),
    discountCodes: DISCOUNT_CODES,
  });
}

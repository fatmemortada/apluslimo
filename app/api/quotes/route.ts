import { type NextRequest } from "next/server";
import { ensureSeed, getOrgContext, ok, err, parseBody } from "@/lib/api/helpers";
import { db, queryAll, paginate, generateId } from "@/lib/db/store";
import { calculatePrice } from "@/lib/pricing/engine";
import type { PricingContext } from "@/lib/pricing/engine";

// Quote type (lightweight — extends booking concept)
interface Quote {
  id: string; organizationId: string; quoteNumber: string;
  customerName: string; customerEmail: string; customerPhone: string;
  bookingType: string; vehicleType: string;
  pickupAddress: string; dropoffAddress: string;
  pickupDate: string; pickupTime: string;
  passengerCount: number; luggageCount: number;
  flightNumber?: string; isAirport: boolean;
  childSeat: boolean; meetGreet: boolean; champagne: boolean;
  specialRequests: string; notes: string;
  status: "new" | "pending" | "accepted" | "declined" | "converted";
  priceEstimate: number; priceBreakdown?: Record<string, unknown>;
  convertedBookingId?: string;
  createdById: string;
  validUntil: string;
  createdAt: string; updatedAt: string;
}

declare global { var __royalos_quotes: Map<string, Quote> | undefined; }
const quoteStore: Map<string, Quote> = globalThis.__royalos_quotes ?? new Map();
if (!globalThis.__royalos_quotes) globalThis.__royalos_quotes = quoteStore;

function generateQuoteNumber(): string { return `QTE-${Math.floor(Math.random() * 9000) + 1000}`; }

// Seed some quotes
function seedQuotes(orgId: string) {
  if (quoteStore.size > 0) return;
  const now = new Date().toISOString();
  const nextWeek = new Date(Date.now() + 7 * 86400000).toISOString();
  const quotes: Quote[] = [
    { id: "qte_001", organizationId: orgId, quoteNumber: "QTE-1001", customerName: "Amanda Jones", customerEmail: "amanda@email.com", customerPhone: "+1 (514) 555-3001", bookingType: "airport_transfer", vehicleType: "luxury_suv", pickupAddress: "YUL Airport", dropoffAddress: "Hotel Bonaventure, Montreal", pickupDate: "2026-07-15", pickupTime: "14:00", passengerCount: 2, luggageCount: 3, flightNumber: "AC894", isAirport: true, childSeat: false, meetGreet: true, champagne: false, specialRequests: "Meet at international arrivals", notes: "New client inquiry via website", status: "new", priceEstimate: 420, createdById: "user_fatme", validUntil: nextWeek, createdAt: now, updatedAt: now },
    { id: "qte_002", organizationId: orgId, quoteNumber: "QTE-1002", customerName: "EventPlanner Pro", customerEmail: "events@eventplanner.com", customerPhone: "+1 (514) 555-3002", bookingType: "wedding", vehicleType: "stretch_limo", pickupAddress: "Notre-Dame Basilica", dropoffAddress: "Ritz Carlton Montreal", pickupDate: "2026-08-22", pickupTime: "15:30", passengerCount: 6, luggageCount: 0, flightNumber: undefined, isAirport: false, childSeat: false, meetGreet: false, champagne: true, specialRequests: "White limousine if available, champagne for 6", notes: "Wedding booking — Sophie & Marc", status: "pending", priceEstimate: 1850, createdById: "user_fatme", validUntil: new Date(Date.now() + 14 * 86400000).toISOString(), createdAt: now, updatedAt: now },
    { id: "qte_003", organizationId: orgId, quoteNumber: "QTE-1003", customerName: "TechCorp Inc.", customerEmail: "travel@techcorp.com", customerPhone: "+1 (514) 555-3003", bookingType: "corporate", vehicleType: "executive_sedan", pickupAddress: "2000 Rue University, Montreal", dropoffAddress: "Mirabel Airport", pickupDate: "2026-07-10", pickupTime: "07:00", passengerCount: 1, luggageCount: 1, flightNumber: undefined, isAirport: true, childSeat: false, meetGreet: false, champagne: false, specialRequests: "", notes: "Recurring client — weekly airport runs", status: "accepted", priceEstimate: 380, createdById: "user_sarah", validUntil: new Date(Date.now() + 3 * 86400000).toISOString(), createdAt: now, updatedAt: now },
    { id: "qte_004", organizationId: orgId, quoteNumber: "QTE-1004", customerName: "Private Client", customerEmail: "private@email.com", customerPhone: "+1 (514) 555-3004", bookingType: "hourly", vehicleType: "luxury_sedan", pickupAddress: "Four Seasons Montreal", dropoffAddress: "Various — city tour", pickupDate: "2026-07-08", pickupTime: "18:00", passengerCount: 2, luggageCount: 0, flightNumber: undefined, isAirport: false, childSeat: false, meetGreet: false, champagne: true, specialRequests: "Evening city tour, dinner at Toqué, then casino", notes: "High-value prospect", status: "declined", priceEstimate: 960, createdById: "user_fatme", validUntil: now, createdAt: now, updatedAt: now },
  ];
  quotes.forEach((q) => quoteStore.set(q.id, q as Quote));
}

export async function GET(request: NextRequest) {
  ensureSeed();
  const { organizationId } = getOrgContext(request);
  seedQuotes(organizationId);
  const { searchParams } = request.nextUrl;
  const page = parseInt(searchParams.get("page") || "1");
  const pageSize = parseInt(searchParams.get("pageSize") || "20");
  const status = searchParams.get("status") || undefined;

  let items = Array.from(quoteStore.values()).filter((q) => q.organizationId === organizationId);
  if (status) items = items.filter((q) => q.status === status);
  items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return ok(paginate(items, page, pageSize));
}

export async function POST(request: NextRequest) {
  ensureSeed();
  const { organizationId, userId } = getOrgContext(request);
  const body = await parseBody<Record<string, unknown>>(request);
  if (!body) return err("Invalid request body");

  const now = new Date().toISOString();
  const quote: Quote = {
    id: generateId("qte"), organizationId, quoteNumber: generateQuoteNumber(),
    customerName: String(body.customerName || ""), customerEmail: String(body.customerEmail || ""),
    customerPhone: String(body.customerPhone || ""), bookingType: String(body.bookingType || "point_to_point"),
    vehicleType: String(body.vehicleType || "luxury_sedan"),
    pickupAddress: String(body.pickupAddress || ""), dropoffAddress: String(body.dropoffAddress || ""),
    pickupDate: String(body.pickupDate || ""), pickupTime: String(body.pickupTime || ""),
    passengerCount: Number(body.passengerCount) || 1, luggageCount: Number(body.luggageCount) || 0,
    flightNumber: body.flightNumber as string | undefined, isAirport: Boolean(body.isAirport),
    childSeat: Boolean(body.childSeat), meetGreet: Boolean(body.meetGreet),
    champagne: Boolean(body.champagne),
    specialRequests: String(body.specialRequests || ""), notes: String(body.notes || ""),
    status: "new", priceEstimate: Number(body.priceEstimate) || 0,
    createdById: userId,
    validUntil: new Date(Date.now() + 14 * 86400000).toISOString(),
    createdAt: now, updatedAt: now,
  };

  quoteStore.set(quote.id, quote);
  return ok(quote, 201);
}

export async function PATCH(request: NextRequest) {
  const { organizationId } = getOrgContext(request);
  const { searchParams } = request.nextUrl;
  const id = searchParams.get("id");
  const action = searchParams.get("action");

  if (!id) return err("Quote ID required");

  const quote = quoteStore.get(id);
  if (!quote || quote.organizationId !== organizationId) return err("Quote not found", 404);

  if (action === "accept") quote.status = "accepted";
  else if (action === "decline") quote.status = "declined";
  else if (action === "convert") {
    // Convert quote to booking
    const bookingId = generateId("bkg");
    const bookingNumber = `MRL-${Math.floor(Math.random() * 9000) + 1000}`;
    const now = new Date().toISOString();
    const pickupDateTime = `${quote.pickupDate}T${quote.pickupTime}:00`;

    // Create pricing context
    const priceCtx: PricingContext = {
      bookingType: quote.bookingType as PricingContext["bookingType"],
      vehicleType: quote.vehicleType as PricingContext["vehicleType"],
      distanceKm: 25, durationMinutes: 40,
      passengerCount: quote.passengerCount, luggageCount: quote.luggageCount,
      pickupDateTime: new Date(pickupDateTime), isAirport: quote.isAirport,
      flightNumber: quote.flightNumber, stops: 0, extras: [], discountPercent: 0,
      gratuityPercent: 18, tollsEstimated: 0,
    };
    if (quote.meetGreet) priceCtx.extras.push({ extraId: "meet_greet", quantity: 1 });
    if (quote.childSeat) priceCtx.extras.push({ extraId: "child_seat", quantity: 1 });
    if (quote.champagne) priceCtx.extras.push({ extraId: "champagne", quantity: 1 });

    const breakdown = calculatePrice(priceCtx);

    const booking = {
      id: bookingId, organizationId, bookingNumber, type: quote.bookingType,
      tripType: "one_way", status: "confirmed",
      customerId: "cust_new", passengerCount: quote.passengerCount, luggageCount: quote.luggageCount,
      pickup: { id: "p1", type: "pickup", address: { street: quote.pickupAddress, city: "Montreal", province: "Quebec", postalCode: "", country: "Canada" }, scheduledAt: pickupDateTime, sequence: 1 },
      dropoff: { id: "d1", type: "dropoff", address: { street: quote.dropoffAddress, city: "Montreal", province: "Quebec", postalCode: "", country: "Canada" }, scheduledAt: new Date(new Date(pickupDateTime).getTime() + 40 * 60000).toISOString(), sequence: 2 },
      stops: [],
      scheduledPickupAt: pickupDateTime, estimatedDropoffAt: new Date(new Date(pickupDateTime).getTime() + 40 * 60000).toISOString(),
      baseFare: breakdown.baseFare, taxAmount: breakdown.taxAmount,
      gratuity: breakdown.gratuityAmount, tolls: breakdown.tolls,
      surcharges: breakdown.surcharges.map((s) => ({ name: s.name, amount: s.amount, taxable: s.taxable })),
      totalAmount: breakdown.totalAmount,
      paymentMethod: "credit_card", paymentStatus: "pending",
      flightNumber: quote.flightNumber,
      flightTracking: !!quote.flightNumber,
      specialInstructions: [quote.specialRequests, quote.notes].filter(Boolean).join(" | "),
      createdById: quote.createdById,
      createdAt: now, updatedAt: now,
    };

    db.bookings.set(bookingId, booking as any);
    quote.status = "converted";
    quote.convertedBookingId = bookingId;
    quote.priceBreakdown = breakdown as unknown as Record<string, unknown>;

    quoteStore.set(id, quote);
    return ok({ quote, booking, breakdown });
  }

  quote.updatedAt = new Date().toISOString();
  quoteStore.set(id, quote);
  return ok(quote);
}

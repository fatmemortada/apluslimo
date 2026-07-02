// ============================================================
// RoyalOS — Pricing Engine
// Modular calculation system for limousine booking fares
// Swap real distance/time APIs and rate cards in production
// ============================================================

import type { VehicleType, BookingType } from "@/lib/types";

// ── Configuration ──────────────────────────────────────────

export interface PricingConfig {
  currency: string;
  taxRate: number; // e.g. 0.15 = 15%
  gratuityRates: { suggested: number[]; default: number }; // percentages
  currencySymbol: string;
}

export interface VehicleRate {
  vehicleType: VehicleType;
  baseFare: number;
  pricePerKm: number;
  pricePerMinute: number;
  hourlyRate: number; // for hourly bookings
  minimumFare: number;
  airportFee: number;
  name: string; // display name
  seats: number;
  luggage: number;
}

export interface SurchargeRule {
  id: string;
  name: string;
  description: string;
  applies: (context: PricingContext) => boolean;
  calculate: (context: PricingContext) => number;
  taxable: boolean;
}

export interface ExtraService {
  id: string;
  name: string;
  description: string;
  price: number;
  perUnit: boolean; // true = price x quantity, false = flat
  taxable: boolean;
}

export interface PricingContext {
  bookingType: BookingType;
  vehicleType: VehicleType;
  distanceKm: number;
  durationMinutes: number;
  passengerCount: number;
  luggageCount: number;
  pickupDateTime: Date;
  isAirport: boolean;
  flightNumber?: string;
  stops: number; // extra stops beyond pickup/dropoff
  extras: SelectedExtra[];
  discountCode?: string;
  discountPercent: number; // 0-100
  gratuityPercent: number; // 0-100
  tollsEstimated: number;
}

export interface SelectedExtra {
  extraId: string;
  quantity: number;
}

export interface PriceBreakdown {
  baseFare: number;
  distanceCharge: number;
  durationCharge: number;
  vehicleSurcharge: number;
  airportFee: number;
  surcharges: AppliedSurcharge[];
  extras: AppliedExtra[];
  tolls: number;
  subtotal: number;
  discountAmount: number;
  taxableAmount: number;
  taxAmount: number;
  gratuityAmount: number;
  totalAmount: number;
  currency: string;
  summary: string;
}

export interface AppliedSurcharge {
  ruleId: string;
  name: string;
  amount: number;
  taxable: boolean;
}

export interface AppliedExtra {
  extraId: string;
  name: string;
  quantity: number;
  unitPrice: number;
  amount: number;
}

// ── Default Config ─────────────────────────────────────────

export const DEFAULT_CONFIG: PricingConfig = {
  currency: "CAD",
  taxRate: 0.15,
  gratuityRates: { suggested: [15, 18, 20, 25], default: 18 },
  currencySymbol: "$",
};

// ── Vehicle Rate Card ──────────────────────────────────────

export const VEHICLE_RATES: VehicleRate[] = [
  { vehicleType: "luxury_sedan", baseFare: 80, pricePerKm: 2.50, pricePerMinute: 0.75, hourlyRate: 120, minimumFare: 100, airportFee: 15, name: "Luxury Sedan", seats: 4, luggage: 2 },
  { vehicleType: "executive_sedan", baseFare: 100, pricePerKm: 3.00, pricePerMinute: 0.90, hourlyRate: 150, minimumFare: 130, airportFee: 15, name: "Executive Sedan", seats: 4, luggage: 2 },
  { vehicleType: "luxury_suv", baseFare: 120, pricePerKm: 3.50, pricePerMinute: 1.00, hourlyRate: 180, minimumFare: 150, airportFee: 20, name: "Luxury SUV", seats: 6, luggage: 4 },
  { vehicleType: "full_size_suv", baseFare: 110, pricePerKm: 3.00, pricePerMinute: 0.90, hourlyRate: 160, minimumFare: 140, airportFee: 20, name: "Full-Size SUV", seats: 7, luggage: 5 },
  { vehicleType: "passenger_van", baseFare: 150, pricePerKm: 4.00, pricePerMinute: 1.20, hourlyRate: 200, minimumFare: 180, airportFee: 25, name: "Passenger Van", seats: 12, luggage: 8 },
  { vehicleType: "stretch_limo", baseFare: 300, pricePerKm: 6.00, pricePerMinute: 2.00, hourlyRate: 350, minimumFare: 400, airportFee: 35, name: "Stretch Limousine", seats: 10, luggage: 4 },
];

// ── Surcharge Rules ────────────────────────────────────────

export const SURCHARGE_RULES: SurchargeRule[] = [
  {
    id: "airport_fee",
    name: "Airport Fee",
    description: "Airport access and waiting area fee",
    applies: (ctx) => ctx.isAirport,
    calculate: (ctx) => {
      const rate = VEHICLE_RATES.find((r) => r.vehicleType === ctx.vehicleType);
      return rate?.airportFee || 15;
    },
    taxable: true,
  },
  {
    id: "night_surcharge",
    name: "Night Surcharge",
    description: "Additional charge for trips between 10 PM and 6 AM",
    applies: (ctx) => {
      const hour = ctx.pickupDateTime.getHours();
      return hour >= 22 || hour < 6;
    },
    calculate: (ctx) => {
      const rate = VEHICLE_RATES.find((r) => r.vehicleType === ctx.vehicleType);
      return (rate?.baseFare || 80) * 0.25; // 25% surcharge
    },
    taxable: true,
  },
  {
    id: "weekend_surcharge",
    name: "Weekend Surcharge",
    description: "Premium pricing for Saturday and Sunday trips",
    applies: (ctx) => {
      const day = ctx.pickupDateTime.getDay();
      return day === 0 || day === 6;
    },
    calculate: (ctx) => {
      const rate = VEHICLE_RATES.find((r) => r.vehicleType === ctx.vehicleType);
      return (rate?.baseFare || 80) * 0.15; // 15% surcharge
    },
    taxable: true,
  },
  {
    id: "holiday_surcharge",
    name: "Holiday Surcharge",
    description: "Premium pricing for statutory holidays",
    applies: (ctx) => {
      const holidays = ["2026-07-01", "2026-12-25", "2026-12-31", "2026-01-01"];
      const ds = ctx.pickupDateTime.toISOString().slice(0, 10);
      return holidays.includes(ds);
    },
    calculate: (ctx) => {
      const rate = VEHICLE_RATES.find((r) => r.vehicleType === ctx.vehicleType);
      return (rate?.baseFare || 80) * 0.30; // 30% surcharge
    },
    taxable: true,
  },
  {
    id: "extra_stops",
    name: "Extra Stops",
    description: "Charge for each additional stop beyond pickup/dropoff",
    applies: (ctx) => ctx.stops > 0,
    calculate: (ctx) => ctx.stops * 25,
    taxable: true,
  },
  {
    id: "waiting_time",
    name: "Waiting Time",
    description: "Charge for wait time beyond grace period ($1.50/min after 15 min free)",
    applies: (ctx) => ctx.durationMinutes > 15,
    calculate: (ctx) => {
      const waitMin = Math.max(0, ctx.durationMinutes - 15);
      return waitMin * 1.50;
    },
    taxable: false,
  },
  {
    id: "excess_luggage",
    name: "Excess Luggage",
    description: "Charge for more than 2 large bags",
    applies: (ctx) => ctx.luggageCount > 2,
    calculate: (ctx) => (ctx.luggageCount - 2) * 10,
    taxable: true,
  },
];

// ── Extra Services ─────────────────────────────────────────

export const EXTRA_SERVICES: ExtraService[] = [
  { id: "meet_greet", name: "Meet & Greet", description: "Chauffeur meets you inside the terminal with a name sign", price: 50, perUnit: false, taxable: true },
  { id: "child_seat", name: "Child Safety Seat", description: "DOT-approved child safety seat (per seat)", price: 25, perUnit: true, taxable: true },
  { id: "booster_seat", name: "Booster Seat", description: "Booster seat for older children (per seat)", price: 15, perUnit: true, taxable: true },
  { id: "champagne", name: "Champagne Service", description: "Premium champagne served on ice", price: 85, perUnit: false, taxable: true },
  { id: "wifi_hotspot", name: "WiFi Hotspot", description: "Dedicated 4G WiFi hotspot for the trip", price: 15, perUnit: false, taxable: false },
  { id: "red_carpet", name: "Red Carpet Service", description: "Red carpet rollout at pickup location", price: 100, perUnit: false, taxable: true },
  { id: "newspaper", name: "Newspaper Service", description: "Selection of daily newspapers", price: 10, perUnit: false, taxable: false },
  { id: "phone_charger", name: "Multi-Device Charger", description: "Universal charging cables for all devices", price: 5, perUnit: false, taxable: false },
];

// ── Discount Codes ─────────────────────────────────────────

export const DISCOUNT_CODES: Record<string, { name: string; percent: number; description: string }> = {
  CORP10: { name: "Corporate 10%", percent: 10, description: "Standard corporate discount" },
  CORP15: { name: "Corporate 15%", percent: 15, description: "Premium corporate discount" },
  VIP20: { name: "VIP 20%", percent: 20, description: "VIP client discount" },
  FIRST50: { name: "First Ride $50 Off", percent: 0, description: "Flat $50 off first booking" },
  WELCOME25: { name: "Welcome 25%", percent: 25, description: "New client welcome discount" },
  EVENT10: { name: "Event 10%", percent: 10, description: "Event and wedding discount" },
};

// ── Core Calculation Engine ────────────────────────────────

export function getVehicleRate(vehicleType: VehicleType): VehicleRate {
  return VEHICLE_RATES.find((r) => r.vehicleType === vehicleType) || VEHICLE_RATES[0];
}

export function calculatePrice(context: PricingContext): PriceBreakdown {
  const config = DEFAULT_CONFIG;
  const rate = getVehicleRate(context.vehicleType);

  // Base components
  let baseFare = rate.baseFare;
  let distanceCharge = 0;
  let durationCharge = 0;

  if (context.bookingType === "hourly") {
    // Hourly: rate x hours (minimum 3 hours)
    const hours = Math.max(3, Math.ceil(context.durationMinutes / 60));
    baseFare = rate.hourlyRate * hours;
    distanceCharge = 0;
    durationCharge = 0;
  } else {
    // Distance + time
    distanceCharge = Math.round(context.distanceKm * rate.pricePerKm * 100) / 100;
    durationCharge = Math.round(context.durationMinutes * rate.pricePerMinute * 100) / 100;
  }

  const vehicleMinimum = rate.minimumFare;
  let subtotalBeforeSurcharges = baseFare + distanceCharge + durationCharge;
  if (subtotalBeforeSurcharges < vehicleMinimum) {
    subtotalBeforeSurcharges = vehicleMinimum;
  }

  // Airport fee
  let airportFee = 0;
  if (context.isAirport) {
    airportFee = rate.airportFee;
  }

  // Apply surcharge rules
  const appliedSurcharges: AppliedSurcharge[] = [];
  for (const rule of SURCHARGE_RULES) {
    if (rule.id === "airport_fee") continue; // handled separately
    if (rule.applies(context)) {
      appliedSurcharges.push({
        ruleId: rule.id,
        name: rule.name,
        amount: Math.round(rule.calculate(context) * 100) / 100,
        taxable: rule.taxable,
      });
    }
  }

  // Apply extras
  const appliedExtras: AppliedExtra[] = [];
  for (const extra of context.extras) {
    const svc = EXTRA_SERVICES.find((e) => e.id === extra.extraId);
    if (svc) {
      appliedExtras.push({
        extraId: svc.id,
        name: svc.name,
        quantity: extra.quantity,
        unitPrice: svc.price,
        amount: svc.perUnit ? svc.price * extra.quantity : svc.price,
      });
    }
  }

  const extrasTotal = appliedExtras.reduce((s, e) => s + e.amount, 0);
  const surchargesTotal = appliedSurcharges.reduce((s, sc) => s + sc.amount, 0);

  // Subtotal
  const subtotal = Math.round(
    (subtotalBeforeSurcharges + airportFee + surchargesTotal + extrasTotal + context.tollsEstimated) * 100
  ) / 100;

  // Discount
  let discountAmount = 0;
  if (context.discountCode && DISCOUNT_CODES[context.discountCode]) {
    const dc = DISCOUNT_CODES[context.discountCode];
    if (dc.percent > 0) {
      discountAmount = Math.round(subtotal * (dc.percent / 100) * 100) / 100;
    } else if (context.discountCode === "FIRST50") {
      discountAmount = 50;
    }
  } else if (context.discountPercent > 0) {
    discountAmount = Math.round(subtotal * (context.discountPercent / 100) * 100) / 100;
  }

  const afterDiscount = subtotal - discountAmount;

  // Taxable amount (only items marked taxable)
  const taxableBase =
    subtotalBeforeSurcharges +
    airportFee +
    appliedSurcharges.filter((s) => s.taxable).reduce((s, sc) => s + sc.amount, 0) +
    appliedExtras.filter((e) => EXTRA_SERVICES.find((es) => es.id === e.extraId)?.taxable).reduce((s, e) => s + e.amount, 0);

  const taxAmount = Math.round(taxableBase * config.taxRate * 100) / 100;

  // Gratuity
  const gratuityRate = context.gratuityPercent > 0
    ? context.gratuityPercent
    : config.gratuityRates.default;
  const gratuityAmount = Math.round(afterDiscount * (gratuityRate / 100) * 100) / 100;

  // Total
  const totalAmount = Math.round((afterDiscount + taxAmount + gratuityAmount) * 100) / 100;

  return {
    baseFare: subtotalBeforeSurcharges,
    distanceCharge,
    durationCharge,
    vehicleSurcharge: 0,
    airportFee,
    surcharges: appliedSurcharges,
    extras: appliedExtras,
    tolls: context.tollsEstimated,
    subtotal,
    discountAmount,
    taxableAmount: taxableBase,
    taxAmount,
    gratuityAmount,
    totalAmount,
    currency: config.currency,
    summary: generateSummary(context),
  };
}

function generateSummary(ctx: PricingContext): string {
  const rate = getVehicleRate(ctx.vehicleType);
  const parts = [
    `${rate.name}`,
    ctx.isAirport ? "Airport" : "",
    ctx.bookingType.replace(/_/g, " "),
    `${ctx.passengerCount}pax`,
  ];
  return parts.filter(Boolean).join(" • ");
}

// ── Quick Estimate ─────────────────────────────────────────

export function quickEstimate(
  vehicleType: VehicleType,
  distanceKm: number,
  durationMinutes: number,
  isAirport = false
): number {
  const ctx: PricingContext = {
    bookingType: "point_to_point",
    vehicleType,
    distanceKm,
    durationMinutes,
    passengerCount: 1,
    luggageCount: 0,
    pickupDateTime: new Date(),
    isAirport,
    stops: 0,
    extras: [],
    discountPercent: 0,
    gratuityPercent: 0,
    tollsEstimated: 0,
  };
  const result = calculatePrice(ctx);
  return result.totalAmount;
}

// ── Formatting Helpers ─────────────────────────────────────

export function formatCurrency(amount: number, currency = "CAD"): string {
  return new Intl.NumberFormat("en-CA", { style: "currency", currency }).format(amount);
}

export function formatBreakdownText(breakdown: PriceBreakdown): string {
  const lines = [
    `${breakdown.summary}`,
    `Base: ${formatCurrency(breakdown.baseFare)}`,
  ];
  if (breakdown.distanceCharge > 0) lines.push(`Distance: ${formatCurrency(breakdown.distanceCharge)}`);
  if (breakdown.durationCharge > 0) lines.push(`Duration: ${formatCurrency(breakdown.durationCharge)}`);
  if (breakdown.airportFee > 0) lines.push(`Airport Fee: ${formatCurrency(breakdown.airportFee)}`);
  breakdown.surcharges.forEach((s) => lines.push(`${s.name}: ${formatCurrency(s.amount)}`));
  breakdown.extras.forEach((e) => lines.push(`${e.name} x${e.quantity}: ${formatCurrency(e.amount)}`));
  if (breakdown.discountAmount > 0) lines.push(`Discount: -${formatCurrency(breakdown.discountAmount)}`);
  lines.push(`Tax: ${formatCurrency(breakdown.taxAmount)}`);
  if (breakdown.gratuityAmount > 0) lines.push(`Gratuity: ${formatCurrency(breakdown.gratuityAmount)}`);
  lines.push(`Total: ${formatCurrency(breakdown.totalAmount)}`);
  return lines.join("\n");
}

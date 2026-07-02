"use client";

import { useState, useMemo } from "react";
import {
  User, MapPin, CalendarDays, Clock, Car, Gift, FileText, Check,
  ChevronLeft, ChevronRight, Plane, Users, Briefcase, Baby, Star,
  CreditCard, Calculator, Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  calculatePrice, VEHICLE_RATES, EXTRA_SERVICES, SURCHARGE_RULES, DISCOUNT_CODES,
  type PricingContext, type PriceBreakdown, type VehicleRate, type SelectedExtra,
} from "@/lib/pricing/engine";
import type { BookingType, VehicleType } from "@/lib/types";

interface BookingFormData {
  customerName: string; customerEmail: string; customerPhone: string;
  bookingType: BookingType;
  vehicleType: VehicleType;
  pickupAddress: string; dropoffAddress: string;
  pickupDate: string; pickupTime: string;
  passengerCount: number; luggageCount: number;
  flightNumber: string; isAirport: boolean;
  childSeat: boolean; childSeatCount: number;
  meetGreet: boolean; champagne: boolean;
  specialRequests: string; notes: string;
  discountCode: string; gratuityPercent: number;
}

const defaultForm: BookingFormData = {
  customerName: "", customerEmail: "", customerPhone: "",
  bookingType: "point_to_point", vehicleType: "luxury_sedan",
  pickupAddress: "", dropoffAddress: "",
  pickupDate: new Date().toISOString().slice(0, 10), pickupTime: "12:00",
  passengerCount: 1, luggageCount: 0,
  flightNumber: "", isAirport: false,
  childSeat: false, childSeatCount: 0,
  meetGreet: false, champagne: false,
  specialRequests: "", notes: "",
  discountCode: "", gratuityPercent: 18,
};

const STEPS = [
  { id: "passenger", label: "Passenger", icon: User },
  { id: "trip", label: "Trip Details", icon: MapPin },
  { id: "vehicle", label: "Vehicle", icon: Car },
  { id: "extras", label: "Extras", icon: Gift },
  { id: "review", label: "Review & Price", icon: Calculator },
];

interface MultiStepBookingFormProps {
  onComplete?: (data: BookingFormData, price: PriceBreakdown) => void;
  onCancel?: () => void;
  initialData?: Partial<BookingFormData>;
}

export function MultiStepBookingForm({ onComplete, onCancel, initialData }: MultiStepBookingFormProps) {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<BookingFormData>({ ...defaultForm, ...initialData });

  const update = (partial: Partial<BookingFormData>) => setForm((f) => ({ ...f, ...partial }));

  // Calculate pricing on step 4
  const pricingContext = useMemo((): PricingContext => {
    const extras: SelectedExtra[] = [];
    if (form.meetGreet) extras.push({ extraId: "meet_greet", quantity: 1 });
    if (form.childSeat) extras.push({ extraId: "child_seat", quantity: form.childSeatCount || 1 });
    if (form.champagne) extras.push({ extraId: "champagne", quantity: 1 });

    const isAirportType = form.bookingType === "airport_pickup" || form.bookingType === "airport_dropoff";
    const dist = isAirportType ? 25 : form.bookingType === "hourly" ? 0 : 15;
    const dur = form.bookingType === "hourly" ? 180 : 40;

    return {
      bookingType: form.bookingType, vehicleType: form.vehicleType,
      distanceKm: dist, durationMinutes: dur,
      passengerCount: form.passengerCount, luggageCount: form.luggageCount,
      pickupDateTime: new Date(`${form.pickupDate}T${form.pickupTime}:00`),
      isAirport: form.isAirport || isAirportType,
      flightNumber: form.flightNumber || undefined,
      stops: 0, extras, discountCode: form.discountCode || undefined,
      discountPercent: 0, gratuityPercent: form.gratuityPercent,
      tollsEstimated: isAirportType ? 5 : 0,
    };
  }, [form]);

  const price = useMemo(() => calculatePrice(pricingContext), [pricingContext]);

  const canNext = () => {
    if (step === 0) return form.customerName && form.customerEmail;
    if (step === 1) return form.pickupAddress && form.dropoffAddress;
    return true;
  };

  const handleSubmit = () => {
    onComplete?.(form, price);
  };

  const isAirport = form.isAirport || form.bookingType === "airport_pickup" || form.bookingType === "airport_dropoff";
  const selectedRate = VEHICLE_RATES.find((r) => r.vehicleType === form.vehicleType);

  return (
    <div className="flex flex-col h-full">
      {/* Step Indicators */}
      <div className="flex items-center gap-1 mb-8">
        {STEPS.map((s, i) => {
          const Icon = s.icon;
          const isActive = i === step;
          const isDone = i < step;
          return (
            <div key={s.id} className="flex items-center flex-1 last:flex-none">
              <div className={["flex items-center gap-2 rounded-lg px-3 py-2 transition-all", isActive ? "bg-brand-50 text-brand-700 ring-1 ring-brand-200" : isDone ? "text-success-600" : "text-neutral-400"].join(" ")}>
                <div className={["flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold", isActive ? "bg-brand-600 text-white" : isDone ? "bg-success-100 text-success-600" : "bg-neutral-100 text-neutral-400"].join(" ")}>
                  {isDone ? <Check className="h-3.5 w-3.5" /> : i + 1}
                </div>
                <span className="hidden sm:inline text-xs font-semibold">{s.label}</span>
              </div>
              {i < STEPS.length - 1 && <div className={["h-px flex-1 mx-1", i < step ? "bg-success-300" : "bg-neutral-200"].join(" ")} />}
            </div>
          );
        })}
      </div>

      {/* Step Content */}
      <div className="flex-1 overflow-y-auto">
        {/* STEP 0: Passenger */}
        {step === 0 && (
          <div className="space-y-5 animate-fade-in-up">
            <div className="flex items-center gap-2 mb-2"><User className="h-5 w-5 text-brand-600" /><h3 className="text-lg font-bold text-neutral-800">Passenger Information</h3></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2 sm:col-span-1"><label className="block text-xs font-semibold text-neutral-500 mb-1">Full Name *</label><input value={form.customerName} onChange={(e) => update({ customerName: e.target.value })} placeholder="John Smith" className="w-full rounded-lg border border-neutral-200 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500" /></div>
              <div className="col-span-2 sm:col-span-1"><label className="block text-xs font-semibold text-neutral-500 mb-1">Email *</label><input type="email" value={form.customerEmail} onChange={(e) => update({ customerEmail: e.target.value })} placeholder="john@email.com" className="w-full rounded-lg border border-neutral-200 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500" /></div>
              <div className="col-span-2 sm:col-span-1"><label className="block text-xs font-semibold text-neutral-500 mb-1">Phone</label><input value={form.customerPhone} onChange={(e) => update({ customerPhone: e.target.value })} placeholder="+1 (514) 555-0000" className="w-full rounded-lg border border-neutral-200 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500" /></div>
            </div>
          </div>
        )}

        {/* STEP 1: Trip Details */}
        {step === 1 && (
          <div className="space-y-5 animate-fade-in-up">
            <div className="flex items-center gap-2 mb-2"><MapPin className="h-5 w-5 text-brand-600" /><h3 className="text-lg font-bold text-neutral-800">Trip Details</h3></div>
            <div>
              <label className="block text-xs font-semibold text-neutral-500 mb-1">Booking Type</label>
              <div className="grid grid-cols-3 gap-2">
                {(["point_to_point", "airport_pickup", "airport_dropoff", "hourly", "corporate_roadshow", "wedding_event", "round_trip"] as BookingType[]).map((t) => (
                  <button key={t} type="button" onClick={() => update({ bookingType: t, isAirport: t === "airport_pickup" || t === "airport_dropoff" })} className={["rounded-lg border px-3 py-2.5 text-xs font-semibold text-left transition-all", form.bookingType === t ? "border-brand-500 bg-brand-50 text-brand-700 ring-1 ring-brand-200" : "border-neutral-200 text-neutral-600 hover:border-neutral-300"].join(" ")}>
                    {(t === "airport_pickup" || t === "airport_dropoff") && <Plane className="h-3.5 w-3.5 inline mr-1" />}
                    {t.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2 sm:col-span-1"><label className="block text-xs font-semibold text-neutral-500 mb-1">Pickup Address *</label><input value={form.pickupAddress} onChange={(e) => update({ pickupAddress: e.target.value })} placeholder="Enter pickup location..." className="w-full rounded-lg border border-neutral-200 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500" /></div>
              <div className="col-span-2 sm:col-span-1"><label className="block text-xs font-semibold text-neutral-500 mb-1">Drop-off Address *</label><input value={form.dropoffAddress} onChange={(e) => update({ dropoffAddress: e.target.value })} placeholder="Enter destination..." className="w-full rounded-lg border border-neutral-200 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500" /></div>
              <div><label className="block text-xs font-semibold text-neutral-500 mb-1">Date</label><input type="date" value={form.pickupDate} onChange={(e) => update({ pickupDate: e.target.value })} className="w-full rounded-lg border border-neutral-200 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500" /></div>
              <div><label className="block text-xs font-semibold text-neutral-500 mb-1">Time</label><input type="time" value={form.pickupTime} onChange={(e) => update({ pickupTime: e.target.value })} className="w-full rounded-lg border border-neutral-200 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500" /></div>
              <div><label className="block text-xs font-semibold text-neutral-500 mb-1">Passengers</label><input type="number" min={1} value={form.passengerCount} onChange={(e) => update({ passengerCount: parseInt(e.target.value) || 1 })} className="w-full rounded-lg border border-neutral-200 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500" /></div>
              <div><label className="block text-xs font-semibold text-neutral-500 mb-1">Luggage</label><input type="number" min={0} value={form.luggageCount} onChange={(e) => update({ luggageCount: parseInt(e.target.value) || 0 })} className="w-full rounded-lg border border-neutral-200 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500" /></div>
            </div>

            {/* Airport Fields */}
            {isAirport && (
              <div className="p-4 rounded-xl bg-gold-50 border border-gold-200 space-y-3">
                <p className="text-xs font-bold text-gold-800 flex items-center gap-1"><Plane className="h-3.5 w-3.5" />Airport Transfer Options</p>
                <div><label className="block text-xs font-semibold text-neutral-500 mb-1">Flight Number</label><input value={form.flightNumber} onChange={(e) => update({ flightNumber: e.target.value })} placeholder="e.g. AC842" className="w-full rounded-lg border border-neutral-200 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500" /></div>
              </div>
            )}
          </div>
        )}

        {/* STEP 2: Vehicle */}
        {step === 2 && (
          <div className="space-y-4 animate-fade-in-up">
            <div className="flex items-center gap-2 mb-2"><Car className="h-5 w-5 text-brand-600" /><h3 className="text-lg font-bold text-neutral-800">Select Vehicle</h3></div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {VEHICLE_RATES.map((v) => (
                <button key={v.vehicleType} type="button" onClick={() => update({ vehicleType: v.vehicleType })} className={["rounded-xl border p-4 text-left transition-all hover:shadow-md", form.vehicleType === v.vehicleType ? "border-brand-500 bg-brand-50 ring-2 ring-brand-200" : "border-neutral-200 bg-white"].join(" ")}>
                  <div className="flex items-center justify-between"><span className="text-sm font-bold text-neutral-800">{v.name}</span>{form.vehicleType === v.vehicleType && <Badge variant="brand">Selected</Badge>}</div>
                  <p className="text-xs text-neutral-400 mt-0.5">{v.seats || 4} seats</p>
                  <div className="mt-2 space-y-0.5 text-xs">
                    <div className="flex justify-between"><span className="text-neutral-500">Base fare</span><span className="font-semibold">${v.baseFare}</span></div>
                    <div className="flex justify-between"><span className="text-neutral-500">Per km</span><span className="font-semibold">${v.pricePerKm.toFixed(2)}</span></div>
                    <div className="flex justify-between"><span className="text-neutral-500">Hourly</span><span className="font-semibold">${v.hourlyRate}/hr</span></div>
                    <div className="flex justify-between"><span className="text-neutral-500">Min. fare</span><span className="font-semibold">${v.minimumFare}</span></div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* STEP 3: Extras */}
        {step === 3 && (
          <div className="space-y-5 animate-fade-in-up">
            <div className="flex items-center gap-2 mb-2"><Gift className="h-5 w-5 text-brand-600" /><h3 className="text-lg font-bold text-neutral-800">Extras & Special Requests</h3></div>

            <div className="space-y-3">
              {EXTRA_SERVICES.map((svc) => {
                let isSelected = false;
                if (svc.id === "meet_greet") isSelected = form.meetGreet;
                else if (svc.id === "child_seat") isSelected = form.childSeat;
                else if (svc.id === "champagne") isSelected = form.champagne;

                return (
                  <div key={svc.id} className={["flex items-center justify-between rounded-xl border p-4 transition-all cursor-pointer", isSelected ? "border-brand-500 bg-brand-50 ring-1 ring-brand-200" : "border-neutral-200 hover:border-neutral-300"].join(" ")} onClick={() => {
                    if (svc.id === "meet_greet") update({ meetGreet: !form.meetGreet });
                    else if (svc.id === "child_seat") update({ childSeat: !form.childSeat, childSeatCount: !form.childSeat ? 1 : 0 });
                    else if (svc.id === "champagne") update({ champagne: !form.champagne });
                  }}>
                    <div>
                      <p className="text-sm font-semibold text-neutral-800">{svc.name}</p>
                      <p className="text-xs text-neutral-400">{svc.description}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-bold text-neutral-700">${svc.price}{svc.perUnit ? "/ea" : ""}</span>
                      <div className={["h-5 w-5 rounded border-2 flex items-center justify-center transition-colors", isSelected ? "bg-brand-600 border-brand-600" : "border-neutral-300"].join(" ")}>
                        {isSelected && <Check className="h-3 w-3 text-white" />}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Child Seat Count */}
            {form.childSeat && (
              <div className="p-4 rounded-xl bg-info-50 border border-info-200"><label className="text-xs font-semibold text-neutral-700">Number of Child Seats</label><input type="number" min={1} max={3} value={form.childSeatCount} onChange={(e) => update({ childSeatCount: parseInt(e.target.value) || 1 })} className="mt-1 w-24 rounded-lg border border-neutral-200 px-3 py-2 text-sm" /></div>
            )}

            <div><label className="block text-xs font-semibold text-neutral-500 mb-1">Special Requests</label><textarea value={form.specialRequests} onChange={(e) => update({ specialRequests: e.target.value })} placeholder="e.g. Red carpet service, specific music, water preference..." rows={3} className="w-full rounded-lg border border-neutral-200 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 resize-none" /></div>

            <div><label className="block text-xs font-semibold text-neutral-500 mb-1">Notes for Dispatcher</label><textarea value={form.notes} onChange={(e) => update({ notes: e.target.value })} placeholder="Internal notes, not visible to customer..." rows={2} className="w-full rounded-lg border border-neutral-200 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 resize-none" /></div>
          </div>
        )}

        {/* STEP 4: Review & Price */}
        {step === 4 && (
          <div className="space-y-5 animate-fade-in-up">
            <div className="flex items-center gap-2 mb-2"><Calculator className="h-5 w-5 text-brand-600" /><h3 className="text-lg font-bold text-neutral-800">Review & Price Summary</h3></div>

            {/* Trip Summary */}
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="p-3 rounded-lg bg-neutral-25"><p className="text-xs text-neutral-400">Passenger</p><p className="font-semibold text-neutral-800">{form.customerName || "—"}</p><p className="text-xs text-neutral-500">{form.customerEmail}</p></div>
              <div className="p-3 rounded-lg bg-neutral-25"><p className="text-xs text-neutral-400">Trip Type</p><p className="font-semibold text-neutral-800 capitalize">{form.bookingType.replace(/_/g, " ")}</p><p className="text-xs text-neutral-500">{form.passengerCount} pax · {form.luggageCount} bags</p></div>
              <div className="p-3 rounded-lg bg-success-50 border border-success-100"><p className="text-xs text-neutral-400">Pickup</p><p className="font-semibold text-neutral-800">{form.pickupAddress || "—"}</p><p className="text-xs text-neutral-500">{form.pickupDate} at {form.pickupTime}</p></div>
              <div className="p-3 rounded-lg bg-danger-50 border border-danger-100"><p className="text-xs text-neutral-400">Drop-off</p><p className="font-semibold text-neutral-800">{form.dropoffAddress || "—"}</p></div>
            </div>

            {selectedRate && <p className="text-sm text-neutral-600"><span className="font-semibold">Vehicle:</span> {selectedRate.name} {form.flightNumber && <span className="text-gold-600">✈ {form.flightNumber}</span>}</p>}
            {form.meetGreet && <Badge variant="gold">Meet & Greet</Badge>} {form.childSeat && <Badge variant="info">{form.childSeatCount}x Child Seat</Badge>} {form.champagne && <Badge variant="gold">Champagne</Badge>}

            {/* Price Breakdown Card */}
            <Card padding="md" className="bg-brand-25/50 border-brand-200">
              <h4 className="text-sm font-bold text-neutral-800 mb-4 flex items-center gap-1.5"><Calculator className="h-4 w-4 text-brand-600" />Price Breakdown</h4>
              <div className="space-y-1.5 text-sm">
                <PriceLine label="Base Fare ({selectedRate?.name})" amount={price.baseFare} />
                {price.distanceCharge > 0 && <PriceLine label="Distance Charge" amount={price.distanceCharge} />}
                {price.durationCharge > 0 && <PriceLine label="Duration Charge" amount={price.durationCharge} />}
                {price.airportFee > 0 && <PriceLine label="Airport Fee" amount={price.airportFee} />}
                {price.surcharges.map((s) => <PriceLine key={s.ruleId} label={s.name} amount={s.amount} />)}
                {price.extras.map((e) => <PriceLine key={e.extraId} label={`${e.name} x${e.quantity}`} amount={e.amount} />)}
                {price.tolls > 0 && <PriceLine label="Tolls (est.)" amount={price.tolls} />}
                <div className="border-t border-neutral-200 pt-1.5 mt-1.5"><PriceLine label="Subtotal" amount={price.subtotal} bold /></div>
                {price.discountAmount > 0 && <PriceLine label="Discount" amount={-price.discountAmount} negative />}
                <PriceLine label={`Tax (15%)`} amount={price.taxAmount} />
                <PriceLine label={`Gratuity (${form.gratuityPercent}%)`} amount={price.gratuityAmount} />
                <div className="border-t border-neutral-300 pt-2 mt-2 flex items-center justify-between">
                  <span className="text-base font-black text-neutral-800">Total</span>
                  <span className="text-lg font-black text-brand-700">${price.totalAmount.toFixed(2)} <span className="text-xs font-normal text-neutral-400">CAD</span></span>
                </div>
              </div>
            </Card>

            {/* Discount Code */}
            <div className="flex items-center gap-3">
              <div className="flex-1"><label className="block text-xs font-semibold text-neutral-500 mb-1">Discount Code</label><input value={form.discountCode} onChange={(e) => update({ discountCode: e.target.value.toUpperCase() })} placeholder="Enter code..." className="w-full rounded-lg border border-neutral-200 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 font-mono" /></div>
              <div className="w-32"><label className="block text-xs font-semibold text-neutral-500 mb-1">Gratuity %</label>
                <select value={form.gratuityPercent} onChange={(e) => update({ gratuityPercent: parseInt(e.target.value) })} className="w-full rounded-lg border border-neutral-200 px-3 py-2.5 text-sm bg-white">
                  {[0, 15, 18, 20, 25].map((g) => <option key={g} value={g}>{g}%</option>)}
                </select>
              </div>
            </div>
            {form.discountCode && DISCOUNT_CODES[form.discountCode] && (
              <div className="p-3 rounded-lg bg-success-50 border border-success-200 text-sm"><span className="font-semibold text-success-700">{DISCOUNT_CODES[form.discountCode].name}</span><p className="text-xs text-success-600">{DISCOUNT_CODES[form.discountCode].description}</p></div>
            )}
          </div>
        )}
      </div>

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between pt-6 border-t border-neutral-100 mt-6">
        <Button variant="ghost" onClick={step === 0 ? onCancel : () => setStep(step - 1)} icon={step > 0 ? <ChevronLeft className="h-4 w-4" /> : undefined}>
          {step === 0 ? "Cancel" : "Back"}
        </Button>
        <div className="flex items-center gap-2">
          <span className="text-xs text-neutral-400">Step {step + 1} of {STEPS.length}</span>
          {step < STEPS.length - 1 ? (
            <Button variant="primary" onClick={() => setStep(step + 1)} disabled={!canNext()} icon={<ChevronRight className="h-4 w-4" />}>
              Continue
            </Button>
          ) : (
            <Button variant="primary" onClick={handleSubmit} icon={<Sparkles className="h-4 w-4" />}>
              Create Booking — ${price.totalAmount.toFixed(2)}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

function PriceLine({ label, amount, bold, negative }: { label: string; amount: number; bold?: boolean; negative?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <span className={["text-neutral-600", bold && "font-semibold text-neutral-700"].join(" ")}>{label}</span>
      <span className={["tabular-nums", bold && "font-bold", negative && "text-success-600"].join(" ")}>
        {negative ? "-" : ""}${Math.abs(amount).toFixed(2)}
      </span>
    </div>
  );
}

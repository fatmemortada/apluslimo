"use client";
import { useState } from "react";
import { Car, MapPin, Clock, Plane, Check, ChevronLeft, ChevronRight, Gift } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const VEHICLES = [
  { id: "luxury_sedan", name: "Luxury Sedan", desc: "BMW 7 Series", seats: 4, luggage: 2, price: "from $80", icon: "🚗" },
  { id: "luxury_suv", name: "Luxury SUV", desc: "Cadillac Escalade", seats: 6, luggage: 4, price: "from $120", icon: "🚙" },
  { id: "full_size_suv", name: "Full-Size SUV", desc: "Chevrolet Suburban", seats: 7, luggage: 5, price: "from $110", icon: "🚐" },
  { id: "passenger_van", name: "Passenger Van", desc: "Mercedes Sprinter", seats: 12, luggage: 8, price: "from $150", icon: "🚌" },
];
const SAVED = ["YUL Airport", "456 Rue Peel, Montreal", "Ritz Carlton", "Downtown Office"];

export default function BookRidePage() {
  const [step, setStep] = useState(0);
  const [type, setType] = useState("point_to_point");
  const [pickup, setPickup] = useState(""); const [dropoff, setDropoff] = useState("");
  const [date, setDate] = useState(""); const [time, setTime] = useState("12:00");
  const [passengers, setPassengers] = useState(1); const [luggage, setLuggage] = useState(0);
  const [vehicle, setVehicle] = useState("luxury_suv");
  const [flight, setFlight] = useState(""); const [meetGreet, setMeetGreet] = useState(false);
  const [childSeat, setChildSeat] = useState(false); const [requests, setRequests] = useState("");
  const [showConfirm, setShowConfirm] = useState(false);
  const isAirport = type === "airport_pickup" || type === "airport_dropoff";
  const estimate = vehicle === "passenger_van" ? 150 : vehicle === "luxury_suv" ? 120 : vehicle === "full_size_suv" ? 110 : 80;
  const extras = (meetGreet ? 50 : 0) + (childSeat ? 25 : 0);

  if (showConfirm) return (
    <div className="max-w-lg mx-auto text-center py-12 animate-scale-in">
      <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-success-100 mb-6"><Check className="h-10 w-10 text-success-600" /></div>
      <h2 className="text-2xl font-bold text-neutral-800">Booking Confirmed!</h2>
      <p className="text-sm text-neutral-500 mt-2">Your ride has been booked. A confirmation email has been sent.</p>
      <Card padding="md" className="mt-6 text-left"><div className="space-y-2 text-sm">
        <Info label="Booking #" value="MRL-1060" /><Info label="Pickup" value={pickup || "—"} /><Info label="Drop-off" value={dropoff || "—"} />
        <Info label="Date & Time" value={`${date} at ${time}`} /><Info label="Vehicle" value={VEHICLES.find((v) => v.id === vehicle)?.name || "—"} />
        <Info label="Estimated Total" value={`$${(estimate + extras + (estimate + extras) * 0.15).toFixed(2)}`} />
      </div></Card>
      <div className="flex gap-3 mt-6 justify-center"><Button variant="outline" onClick={() => setShowConfirm(false)}>Book Another</Button><Button variant="primary" onClick={() => window.location.href = "/portal/rides"}>View My Rides</Button></div>
    </div>
  );

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div><h1 className="text-2xl font-bold text-neutral-800">Book a Ride</h1><p className="text-sm text-neutral-400">Luxury chauffeur service at your fingertips</p></div>
      <div className="flex items-center gap-1 mb-2">{["Type", "Details", "Vehicle", "Review"].map((s, i) => (
        <div key={s} className="flex items-center flex-1 last:flex-none"><div className={["flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold transition-all", i === step ? "bg-brand-50 text-brand-700 ring-1 ring-brand-200" : i < step ? "text-success-600" : "text-neutral-400"].join(" ")}><div className={["flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-bold", i === step ? "bg-brand-600 text-white" : i < step ? "bg-success-100 text-success-600" : "bg-neutral-100 text-neutral-400"].join(" ")}>{i < step ? <Check className="h-3 w-3" /> : i + 1}</div><span className="hidden sm:inline">{s}</span></div>{i < 3 && <div className={["h-px flex-1 mx-1", i < step ? "bg-success-300" : "bg-neutral-200"].join(" ")} />}</div>
      ))}</div>
      <Card padding="lg">
        {step === 0 && <div className="space-y-4 animate-fade-in-up"><h3 className="text-lg font-bold text-neutral-800">What type of ride?</h3>
          <div className="grid grid-cols-2 gap-3">{[
            { id: "point_to_point", label: "Point to Point", icon: MapPin },
            { id: "airport_pickup", label: "Airport Pickup", icon: Plane },
            { id: "airport_dropoff", label: "Airport Drop-off", icon: Plane },
            { id: "hourly", label: "Hourly Service", icon: Clock },
          ].map((opt) => { const Icon = opt.icon; return (
            <button key={opt.id} onClick={() => setType(opt.id)} className={["rounded-xl border-2 p-4 text-left transition-all", type === opt.id ? "border-brand-500 bg-brand-50" : "border-neutral-100"].join(" ")}><Icon className={["h-5 w-5 mb-2", type === opt.id ? "text-brand-600" : "text-neutral-400"].join(" ")} /><p className="text-sm font-bold">{opt.label}</p></button>
          );})}</div></div>}

        {step === 1 && <div className="space-y-4 animate-fade-in-up"><h3 className="text-lg font-bold text-neutral-800">Trip Details</h3>
          <div><label className="block text-xs font-semibold text-neutral-500 mb-1">Pickup Location</label><input value={pickup} onChange={(e) => setPickup(e.target.value)} placeholder="Enter pickup address..." className="w-full rounded-lg border border-neutral-200 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20" /><div className="flex flex-wrap gap-1.5 mt-1.5">{SAVED.map((p) => <button key={p} onClick={() => setPickup(p)} className="text-[10px] bg-neutral-50 hover:bg-neutral-100 px-2 py-1 rounded-md text-neutral-500">{p}</button>)}</div></div>
          <div><label className="block text-xs font-semibold text-neutral-500 mb-1">Drop-off Location</label><input value={dropoff} onChange={(e) => setDropoff(e.target.value)} placeholder="Enter destination..." className="w-full rounded-lg border border-neutral-200 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20" /></div>
          <div className="grid grid-cols-3 gap-3"><div><label className="block text-xs font-semibold text-neutral-500 mb-1">Date</label><input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm" /></div><div><label className="block text-xs font-semibold text-neutral-500 mb-1">Time</label><input type="time" value={time} onChange={(e) => setTime(e.target.value)} className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm" /></div><div><label className="block text-xs font-semibold text-neutral-500 mb-1">Passengers</label><select value={passengers} onChange={(e) => setPassengers(parseInt(e.target.value))} className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm bg-white">{Array.from({ length: 12 }, (_, i) => <option key={i + 1}>{i + 1}</option>)}</select></div></div>
          <div><label className="block text-xs font-semibold text-neutral-500 mb-1">Luggage</label><select value={luggage} onChange={(e) => setLuggage(parseInt(e.target.value))} className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm bg-white max-w-[120px]">{Array.from({ length: 8 }, (_, i) => <option key={i}>{i}</option>)}</select></div>
          {isAirport && <div><label className="block text-xs font-semibold text-neutral-500 mb-1">Flight Number</label><input value={flight} onChange={(e) => setFlight(e.target.value)} placeholder="e.g. AC842" className="w-full rounded-lg border border-neutral-200 px-3.5 py-2.5 text-sm max-w-[200px] focus:outline-none focus:ring-2 focus:ring-brand-500/20" /></div>}
        </div>}

        {step === 2 && <div className="space-y-4 animate-fade-in-up"><h3 className="text-lg font-bold text-neutral-800">Select Vehicle</h3>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">{VEHICLES.map((v) => (
            <button key={v.id} onClick={() => setVehicle(v.id)} className={["rounded-xl border-2 p-4 text-left transition-all", vehicle === v.id ? "border-brand-500 bg-brand-50" : "border-neutral-100"].join(" ")}><div className="flex items-center justify-between"><span className="text-2xl">{v.icon}</span>{vehicle === v.id && <Badge variant="brand">Selected</Badge>}</div><p className="text-sm font-bold mt-2">{v.name}</p><p className="text-xs text-neutral-400">{v.desc}</p><div className="flex gap-3 mt-2 text-xs"><span>{v.seats} seats</span><span>{v.luggage} bags</span><span className="font-bold ml-auto">{v.price}</span></div></button>
          ))}</div>
          <div className="space-y-3 pt-4 border-t border-neutral-100"><h4 className="text-sm font-bold">Add-ons</h4>
            <label className={["flex items-center justify-between rounded-xl border-2 p-3 cursor-pointer", meetGreet ? "border-brand-500 bg-brand-50" : "border-neutral-100"].join(" ")} onClick={() => setMeetGreet(!meetGreet)}><div><p className="text-sm font-semibold">Meet & Greet</p><p className="text-xs text-neutral-400">Chauffeur meets you inside with name sign</p></div><div className="flex items-center gap-3"><span className="text-sm font-bold">$50</span><div className={["h-5 w-5 rounded border-2 flex items-center justify-center", meetGreet ? "bg-brand-600 border-brand-600" : "border-neutral-300"].join(" ")}>{meetGreet && <Check className="h-3 w-3 text-white" />}</div></div></label>
            <label className={["flex items-center justify-between rounded-xl border-2 p-3 cursor-pointer", childSeat ? "border-brand-500 bg-brand-50" : "border-neutral-100"].join(" ")} onClick={() => setChildSeat(!childSeat)}><div><p className="text-sm font-semibold">Child Safety Seat</p><p className="text-xs text-neutral-400">DOT-approved child seat</p></div><div className="flex items-center gap-3"><span className="text-sm font-bold">$25</span><div className={["h-5 w-5 rounded border-2 flex items-center justify-center", childSeat ? "bg-brand-600 border-brand-600" : "border-neutral-300"].join(" ")}>{childSeat && <Check className="h-3 w-3 text-white" />}</div></div></label>
          </div>
          <div><label className="block text-xs font-semibold text-neutral-500 mb-1">Special Requests</label><textarea value={requests} onChange={(e) => setRequests(e.target.value)} rows={2} className="w-full rounded-lg border border-neutral-200 px-3.5 py-2.5 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-brand-500/20" /></div>
        </div>}

        {step === 3 && <div className="space-y-4 animate-fade-in-up"><h3 className="text-lg font-bold text-neutral-800">Review & Confirm</h3>
          <div className="grid grid-cols-2 gap-3"><div className="p-3 rounded-lg bg-success-50"><p className="text-xs text-neutral-400">Pickup</p><p className="font-semibold">{pickup || "—"}</p></div><div className="p-3 rounded-lg bg-danger-50"><p className="text-xs text-neutral-400">Drop-off</p><p className="font-semibold">{dropoff || "—"}</p></div></div>
          <div className="grid grid-cols-2 gap-3 text-xs"><div className="p-2 rounded-lg bg-neutral-50"><span className="text-neutral-400">Date:</span> <span className="font-semibold">{date || "—"}</span></div><div className="p-2 rounded-lg bg-neutral-50"><span className="text-neutral-400">Time:</span> <span className="font-semibold">{time}</span></div><div className="p-2 rounded-lg bg-neutral-50"><span className="text-neutral-400">Passengers:</span> <span className="font-semibold">{passengers}</span></div><div className="p-2 rounded-lg bg-neutral-50"><span className="text-neutral-400">Luggage:</span> <span className="font-semibold">{luggage}</span></div></div>
          {(meetGreet || childSeat) && <div className="flex gap-1.5">{meetGreet && <Badge variant="gold">Meet & Greet</Badge>}{childSeat && <Badge variant="info">Child Seat</Badge>}</div>}
          <Card padding="md" className="bg-brand-25/50 border-brand-200"><h4 className="text-sm font-bold mb-3">Price Estimate</h4>
            <div className="space-y-1.5 text-sm"><div className="flex justify-between"><span className="text-neutral-500">Base fare</span><span className="font-semibold">${estimate}</span></div>{meetGreet && <div className="flex justify-between"><span className="text-neutral-500">Meet & Greet</span><span className="font-semibold">$50</span></div>}{childSeat && <div className="flex justify-between"><span className="text-neutral-500">Child Seat</span><span className="font-semibold">$25</span></div>}<div className="flex justify-between"><span className="text-neutral-500">Tax (15%)</span><span className="font-semibold">${((estimate + extras) * 0.15).toFixed(2)}</span></div><div className="border-t border-neutral-200 pt-2 flex justify-between"><span className="font-bold">Total</span><span className="text-lg font-black text-brand-700">${(estimate + extras + (estimate + extras) * 0.15).toFixed(2)}</span></div></div></Card>
        </div>}

        <div className="flex justify-between mt-6 pt-6 border-t border-neutral-100">
          <Button variant="ghost" onClick={() => setStep(Math.max(0, step - 1))} disabled={step === 0} icon={<ChevronLeft className="h-4 w-4" />}>Back</Button>
          {step < 3 ? <Button variant="primary" onClick={() => setStep(step + 1)} icon={<ChevronRight className="h-4 w-4" />}>Continue</Button> : <Button variant="primary" onClick={() => setShowConfirm(true)} icon={<Check className="h-4 w-4" />}>Confirm Booking</Button>}
        </div>
      </Card>
    </div>
  );
}
function Info({ label, value }: { label: string; value: string }) { return <div className="flex justify-between"><span className="text-neutral-400">{label}</span><span className="font-semibold text-neutral-700">{value}</span></div>; }

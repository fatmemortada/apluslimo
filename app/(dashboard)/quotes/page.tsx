"use client";

import { useState } from "react";
import { Plus, FileText, Check, X, ArrowRightLeft, Clock, MapPin, Plane, Phone, Mail, CalendarDays, Calculator, Download } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge, StatusChip } from "@/components/ui/badge";
import { StatCard } from "@/components/ui/stat-card";
import { Tabs } from "@/components/ui/tabs";
import { SlideOver } from "@/components/ui/slide-over";
import { useApi } from "@/lib/hooks/use-api";
import type { PaginatedResponse } from "@/lib/types";

const ORG = "org_demo001";

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
  validUntil: string;
  createdAt: string;
}

const STATUS_CONFIG: Record<string, { color: string; label: string }> = {
  new: { color: "bg-info-100 text-info-700", label: "New" },
  pending: { color: "bg-warning-100 text-warning-700", label: "Pending" },
  accepted: { color: "bg-success-100 text-success-700", label: "Accepted" },
  declined: { color: "bg-danger-100 text-danger-700", label: "Declined" },
  converted: { color: "bg-brand-100 text-brand-700", label: "Converted" },
};

function fmt$(n: number) { return `$${n.toLocaleString(undefined, { minimumFractionDigits: 2 })}`; }

export default function QuotesPage() {
  const [activeTab, setActiveTab] = useState("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [converting, setConverting] = useState(false);
  const [convertResult, setConvertResult] = useState<any>(null);

  const { data, isLoading, refetch } = useApi<PaginatedResponse<Quote>>(`/api/quotes?pageSize=50`);
  const quotes = data?.data || [];

  const filtered = activeTab === "all" ? quotes : quotes.filter((q) => q.status === activeTab);
  const selected = quotes.find((q) => q.id === selectedId) || null;

  const newQuotes = quotes.filter((q) => q.status === "new").length;
  const pending = quotes.filter((q) => q.status === "pending").length;
  const totalValue = quotes.filter((q) => q.status !== "declined").reduce((s, q) => s + q.priceEstimate, 0);

  async function handleAction(id: string, action: string) {
    await fetch(`/api/quotes?id=${id}&action=${action}`, { method: "PATCH" });
    refetch();
  }

  async function handleConvert(id: string) {
    setConverting(true);
    const res = await fetch(`/api/quotes?id=${id}&action=convert`, { method: "PATCH" });
    const json = await res.json();
    setConvertResult(json.data);
    setConverting(false);
    refetch();
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div><h1 className="text-2xl font-bold text-neutral-800">Quotes</h1><p className="text-sm text-neutral-400">{quotes.length} quotes — Pricing & proposal management</p></div>
        <Button variant="primary" size="md" icon={<Plus className="h-4 w-4" />}>New Quote</Button>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Total Quotes" value={String(quotes.length)} color="brand" />
        <StatCard label="New / Pending" value={String(newQuotes + pending)} color="warning" />
        <StatCard label="Converted" value={String(quotes.filter((q) => q.status === "converted").length)} color="success" />
        <StatCard label="Pipeline Value" value={fmt$(totalValue)} color="gold" />
      </div>

      <Tabs tabs={[
        { id: "all", label: "All", count: quotes.length },
        { id: "new", label: "New", count: newQuotes },
        { id: "pending", label: "Pending", count: pending },
        { id: "accepted", label: "Accepted" },
        { id: "converted", label: "Converted" },
      ]} onChange={setActiveTab} />

      {/* Quote Cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filtered.map((q) => (
          <Card key={q.id} hover padding="md" onClick={() => setSelectedId(q.id)} className="cursor-pointer">
            <div className="flex items-center justify-between mb-3">
              <span className="font-mono text-sm font-bold text-brand-700">{q.quoteNumber}</span>
              <span className={["rounded-full px-2.5 py-0.5 text-xs font-bold", STATUS_CONFIG[q.status]?.color || ""].join(" ")}>
                {STATUS_CONFIG[q.status]?.label || q.status}
              </span>
            </div>
            <h3 className="text-base font-bold text-neutral-800">{q.customerName}</h3>
            <div className="mt-2 space-y-1 text-xs text-neutral-500">
              <div className="flex items-center gap-1"><MapPin className="h-3 w-3" />{q.pickupAddress} → {q.dropoffAddress}</div>
              <div className="flex items-center gap-1"><CalendarDays className="h-3 w-3" />{q.pickupDate} at {q.pickupTime} · {q.passengerCount} pax</div>
              {q.flightNumber && <div className="flex items-center gap-1 text-gold-600"><Plane className="h-3 w-3" />{q.flightNumber}</div>}
            </div>
            <div className="mt-3 pt-3 border-t border-neutral-100 flex items-center justify-between">
              <div className="flex gap-1">
                {q.meetGreet && <Badge variant="gold">Meet & Greet</Badge>}
                {q.childSeat && <Badge variant="info">Child Seat</Badge>}
              </div>
              <span className="text-lg font-bold text-neutral-800">{fmt$(q.priceEstimate)}</span>
            </div>
          </Card>
        ))}
        {filtered.length === 0 && <div className="col-span-full text-center py-12"><p className="text-sm text-neutral-400">No quotes found</p></div>}
      </div>

      {/* ── Quote Detail Slide-Over ── */}
      <SlideOver open={!!selected} onClose={() => { setSelectedId(null); setConvertResult(null); }} title={selected ? `Quote ${selected.quoteNumber}` : ""} subtitle={selected ? selected.customerName : ""} width="lg"
        footer={selected && selected.status !== "converted" && selected.status !== "declined" ? (
          <div className="flex gap-2 flex-wrap justify-end w-full">
            {selected.status === "new" || selected.status === "pending" ? (
              <>
                <Button variant="destructive" size="sm" onClick={() => handleAction(selected.id, "decline")} icon={<X className="h-4 w-4" />}>Decline</Button>
                <Button variant="primary" size="sm" onClick={() => handleAction(selected.id, "accept")} icon={<Check className="h-4 w-4" />}>Accept</Button>
              </>
            ) : null}
            {selected.status === "accepted" && (
              <Button variant="primary" size="sm" onClick={() => handleConvert(selected.id)} loading={converting} icon={<ArrowRightLeft className="h-4 w-4" />}>Convert to Booking</Button>
            )}
          </div>
        ) : undefined}>
        {selected && (
          <div className="space-y-6">
            {/* Status Banner */}
            <div className={["rounded-xl p-4 border", selected.status === "new" ? "bg-info-50 border-info-200" : selected.status === "pending" ? "bg-warning-50 border-warning-200" : selected.status === "accepted" ? "bg-success-50 border-success-200" : selected.status === "declined" ? "bg-danger-50 border-danger-200" : "bg-brand-50 border-brand-200"].join(" ")}>
              <div className="flex items-center justify-between">
                <span className={["text-sm font-bold", selected.status === "new" ? "text-info-700" : selected.status === "pending" ? "text-warning-700" : selected.status === "accepted" ? "text-success-700" : selected.status === "declined" ? "text-danger-700" : "text-brand-700"].join(" ")}>
                  Quote {STATUS_CONFIG[selected.status]?.label || selected.status}
                </span>
                <span className="text-xs text-neutral-500">Valid until {new Date(selected.validUntil).toLocaleDateString()}</span>
              </div>
              {selected.status === "converted" && selected.convertedBookingId && (
                <p className="mt-2 text-sm text-brand-700">Converted to booking #{selected.convertedBookingId.slice(-6)}</p>
              )}
            </div>

            {/* Customer Info */}
            <div className="p-4 rounded-xl bg-neutral-25 border border-neutral-100">
              <h4 className="text-xs font-bold text-neutral-500 uppercase mb-2">Customer</h4>
              <p className="text-base font-bold text-neutral-800">{selected.customerName}</p>
              <div className="flex gap-3 mt-1 text-xs text-neutral-500">
                <span className="flex items-center gap-1"><Mail className="h-3 w-3" />{selected.customerEmail}</span>
                <span className="flex items-center gap-1"><Phone className="h-3 w-3" />{selected.customerPhone}</span>
              </div>
            </div>

            {/* Trip Details */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-lg bg-success-50 border border-success-100">
                <p className="text-xs text-neutral-500">Pickup</p><p className="text-sm font-semibold text-neutral-800">{selected.pickupAddress}</p>
              </div>
              <div className="p-3 rounded-lg bg-danger-50 border border-danger-100">
                <p className="text-xs text-neutral-500">Drop-off</p><p className="text-sm font-semibold text-neutral-800">{selected.dropoffAddress}</p>
              </div>
              <div className="p-3 rounded-lg bg-neutral-50"><p className="text-xs text-neutral-500">Date & Time</p><p className="text-sm font-semibold">{selected.pickupDate} at {selected.pickupTime}</p></div>
              <div className="p-3 rounded-lg bg-neutral-50"><p className="text-xs text-neutral-500">Details</p><p className="text-sm font-semibold">{selected.passengerCount} pax · {selected.luggageCount} bags · {selected.bookingType.replace(/_/g, " ")}</p></div>
            </div>

            {/* Extras */}
            <div className="flex flex-wrap gap-1.5">
              {selected.meetGreet && <Badge variant="gold">Meet & Greet</Badge>}
              {selected.childSeat && <Badge variant="info">Child Seat</Badge>}
              {selected.champagne && <Badge variant="gold">Champagne Service</Badge>}
              {selected.flightNumber && <Badge variant="warning">✈ {selected.flightNumber}</Badge>}
            </div>

            {/* Price */}
            <Card padding="md">
              <h4 className="text-sm font-bold text-neutral-700 mb-2 flex items-center gap-1.5"><Calculator className="h-4 w-4 text-brand-600" />Price Estimate</h4>
              <p className="text-2xl font-black text-neutral-800">{fmt$(selected.priceEstimate)}</p>
              {selected.priceBreakdown && (
                <div className="mt-3 space-y-1 text-xs">
                  {Object.entries(selected.priceBreakdown).map(([k, v]) => (
                    <div key={k} className="flex justify-between"><span className="text-neutral-400 capitalize">{k.replace(/([A-Z])/g, " $1")}</span><span className="font-semibold">${typeof v === "number" ? v.toFixed(2) : String(v)}</span></div>
                  ))}
                </div>
              )}
            </Card>

            {/* Notes */}
            {(selected.specialRequests || selected.notes) && (
              <div className="space-y-2">
                {selected.specialRequests && <Card padding="md"><h4 className="text-xs font-bold text-neutral-500 uppercase mb-1">Special Requests</h4><p className="text-sm text-neutral-700">{selected.specialRequests}</p></Card>}
                {selected.notes && <Card padding="md"><h4 className="text-xs font-bold text-neutral-500 uppercase mb-1">Internal Notes</h4><p className="text-sm text-neutral-700">{selected.notes}</p></Card>}
              </div>
            )}

            {/* Convert Result */}
            {convertResult && (
              <Card padding="md" className="bg-success-50 border-success-200">
                <h4 className="text-sm font-bold text-success-700 mb-2">Booking Created!</h4>
                <p className="text-sm text-success-600">Quote converted to booking {convertResult.booking.bookingNumber}</p>
                <div className="mt-2 space-y-1 text-xs">
                  <div className="flex justify-between"><span className="text-neutral-500">Total</span><span className="font-bold">${convertResult.breakdown?.totalAmount?.toFixed(2)}</span></div>
                </div>
              </Card>
            )}
          </div>
        )}
      </SlideOver>
    </div>
  );
}

"use client";

import { useState } from "react";
import {
  Plus, Download, CalendarDays, MapPin, Clock, Search, Plane,
  Users, Car, CreditCard, FileText, Edit, Trash2, User, Navigation,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge, StatusChip } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { StatCard } from "@/components/ui/stat-card";
import { SearchInput } from "@/components/ui/search-input";
import { Tabs } from "@/components/ui/tabs";
import { SlideOver } from "@/components/ui/slide-over";
import { Table, TableHead, TableBody, TableRow, TableHeaderCell, TableCell } from "@/components/ui/table";
import { TableRowSkeleton } from "@/components/ui/skeleton";
import { usePaginatedApi } from "@/lib/hooks/use-api";
import { db, queryAll } from "@/lib/db/store";
import { statusLabel, typeLabel } from "@/lib/utils/status";
import { BookingTimeline, BookingTimelineCompact } from "@/components/booking/timeline";
import { MultiStepBookingForm } from "@/components/booking/multi-step-form";
import type { Booking, PaginatedResponse as PR, BookingStatus, BookingType } from "@/lib/types";
import type { PriceBreakdown } from "@/lib/pricing/engine";

const ORG = "org_demo001";
function fmt$(n: number) { return `$${n.toLocaleString(undefined, { minimumFractionDigits: 2 })}`; }

export default function BookingsPage() {
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [page, setPage] = useState(1);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [detailTab, setDetailTab] = useState("details");

  const filters: Record<string, string | undefined> = { search: search || undefined };
  if (activeTab !== "all") filters.status = activeTab;

  const { data, isLoading, refetch } = usePaginatedApi<Booking>("/api/bookings", page, 20, filters);
  const bookings = data?.data || [];
  const total = data?.total || 0;

  const selected = bookings.find((b) => b.id === selectedId) || null;

  const customers = Object.fromEntries(queryAll(db.customers, ORG).map((c) => [c.id, c]));
  const drivers = Object.fromEntries(queryAll(db.drivers, ORG).map((d) => [d.id, d]));
  const vehicles = Object.fromEntries(queryAll(db.vehicles, ORG).map((v) => [v.id, v]));

  const pCount = bookings.filter((b) => b.status === "pending_confirmation" || b.status === "draft").length;
  const inProgress = bookings.filter((b) => ["chauffeur_en_route", "passenger_picked_up", "in_progress"].includes(b.status)).length;
  const completed = bookings.filter((b) => b.status === "completed").length;
  const cancelled = bookings.filter((b) => b.status === "cancelled" || b.status === "no_show").length;

  function handleCreateComplete(data: any, price: PriceBreakdown) {
    setShowCreate(false);
    refetch();
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div><h1 className="text-2xl font-bold text-neutral-800">Bookings</h1><p className="text-sm text-neutral-400">{total} bookings — Trip reservation management</p></div>
        <div className="flex gap-2">
          <Button variant="outline" size="md" icon={<Download className="h-4 w-4" />}>Export</Button>
          <Button variant="primary" size="md" icon={<Plus className="h-4 w-4" />} onClick={() => { setShowCreate(true); setSelectedId(null); }}>New Booking</Button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
        <StatCard label="Total" value={String(total)} icon={<CalendarDays className="h-5 w-5" />} color="brand" />
        <StatCard label="Pending" value={String(pCount)} color="warning" />
        <StatCard label="On Road" value={String(inProgress)} color="info" />
        <StatCard label="Completed" value={String(completed)} color="success" />
        <StatCard label="Cancelled" value={String(cancelled)} color="danger" />
      </div>

      <Tabs tabs={[
        { id: "all", label: "All", count: total },
        { id: "pending_confirmation", label: "Pending", count: pCount },
        { id: "confirmed", label: "Confirmed" },
        { id: "assigned", label: "Assigned" },
        { id: "in_progress", label: "In Progress" },
        { id: "completed", label: "Completed" },
      ]} onChange={(t) => { setActiveTab(t); setPage(1); }} />

      {/* Table */}
      <Card padding="none">
        <div className="flex items-center gap-3 border-b border-neutral-100 p-4">
          <SearchInput placeholder="Search by booking #, customer, or route..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} onClear={() => { setSearch(""); setPage(1); }} containerClassName="flex-1 max-w-sm" />
        </div>
        <Table>
          <TableHead><TableRow>
            <TableHeaderCell>Booking</TableHeaderCell><TableHeaderCell>Customer</TableHeaderCell><TableHeaderCell>Type</TableHeaderCell><TableHeaderCell>Route</TableHeaderCell><TableHeaderCell>Date/Time</TableHeaderCell><TableHeaderCell>Vehicle</TableHeaderCell><TableHeaderCell>Driver</TableHeaderCell><TableHeaderCell>Amount</TableHeaderCell><TableHeaderCell>Status</TableHeaderCell>
          </TableRow></TableHead>
          <TableBody>
            {isLoading ? Array.from({ length: 6 }).map((_, i) => <TableRowSkeleton key={i} cols={9} />) : bookings.length === 0 ? (
              <TableRow><td colSpan={9}><p className="text-center text-sm text-neutral-400 py-10">No bookings found</p></td></TableRow>
            ) : bookings.map((b) => {
              const isAirport = b.type === "airport_pickup" || b.type === "airport_dropoff";
              return (
                <TableRow key={b.id} clickable onClick={() => { setSelectedId(b.id); setShowCreate(false); }}>
                  <TableCell><span className="font-mono text-sm font-bold text-brand-700">{b.bookingNumber}</span>{isAirport && <Plane className="h-3 w-3 inline ml-1 text-gold-500" />}</TableCell>
                  <TableCell><span className="font-semibold text-neutral-800">{customers[b.customerId]?.fullName || b.customerId}</span><p className="text-xs text-neutral-400">{b.passengerCount} pax</p></TableCell>
                  <TableCell><Badge variant={isAirport ? "info" : b.type === "corporate_roadshow" ? "brand" : "neutral"}>{typeLabel(b.type)}</Badge></TableCell>
                  <TableCell className="text-neutral-600 max-w-[160px] truncate text-xs"><MapPin className="h-3 w-3 inline mr-1 text-neutral-400" />{b.pickup.address.city} → {b.dropoff.address.city}</TableCell>
                  <TableCell className="text-neutral-500 text-xs">{new Date(b.scheduledPickupAt).toLocaleDateString()} {new Date(b.scheduledPickupAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</TableCell>
                  <TableCell className="text-neutral-600 text-xs">{b.assignedVehicleId ? vehicles[b.assignedVehicleId]?.name || b.assignedVehicleId : "—"}</TableCell>
                  <TableCell className="text-neutral-600 text-xs">{b.assignedDriverId ? drivers[b.assignedDriverId]?.fullName || b.assignedDriverId : "—"}</TableCell>
                  <TableCell className="font-semibold text-neutral-700 text-sm">{fmt$(b.totalAmount)}</TableCell>
                  <TableCell><StatusChip status={statusLabel(b.status)} /></TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </Card>

      {/* ── Create Booking Slide-Over ── */}
      <SlideOver open={showCreate} onClose={() => setShowCreate(false)} title="New Booking" subtitle="Fill in the trip details" width="xl">
        <MultiStepBookingForm onComplete={handleCreateComplete} onCancel={() => setShowCreate(false)} />
      </SlideOver>

      {/* ── Booking Detail Slide-Over ── */}
      <SlideOver open={!!selected && !showCreate} onClose={() => setSelectedId(null)}
        title={selected ? `${selected.bookingNumber} — ${statusLabel(selected.status)}` : ""}
        subtitle={selected ? typeLabel(selected.type) : ""} width="xl"
        footer={
          <div className="flex gap-2 w-full justify-between">
            <div className="flex gap-2">
              <Button variant="destructive" size="sm" icon={<Trash2 className="h-4 w-4" />}>Cancel Booking</Button>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => setSelectedId(null)}>Close</Button>
              <Button variant="primary" size="sm" icon={<Edit className="h-4 w-4" />}>Edit Booking</Button>
            </div>
          </div>
        }>
        {selected && (() => {
          const customer = customers[selected.customerId];
          const driver = selected.assignedDriverId ? drivers[selected.assignedDriverId] : null;
          const vehicle = selected.assignedVehicleId ? vehicles[selected.assignedVehicleId] : null;
          const isTerminal = selected.status === "completed" || selected.status === "cancelled" || selected.status === "no_show";

          return (
            <div className="space-y-6">
              {/* Identity Card */}
              <div className="flex items-start gap-4 p-4 rounded-xl bg-neutral-25 border border-neutral-100">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-brand-100 text-brand-700"><CalendarDays className="h-6 w-6" /></div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-lg font-bold text-neutral-800">{selected.bookingNumber}</h3>
                    <StatusChip status={statusLabel(selected.status)} />
                    {(selected.type === "airport_pickup" || selected.type === "airport_dropoff") && selected.flightNumber && <Badge variant="gold"><Plane className="h-3 w-3 mr-0.5" />{selected.flightNumber}</Badge>}
                  </div>
                  <p className="text-xs text-neutral-500 mt-1">{new Date(selected.scheduledPickupAt).toLocaleString()}</p>
                  <div className="flex gap-3 mt-1.5 text-xs"><span className="font-semibold">{fmt$(selected.totalAmount)}</span><span className="text-neutral-400">· {selected.passengerCount} pax · {selected.luggageCount} bags · {typeLabel(selected.type)}</span></div>
                </div>
              </div>

              {/* Compact progress bar */}
              <BookingTimelineCompact currentStatus={selected.status as BookingStatus} />

              <Tabs tabs={[
                { id: "details", label: "Trip", icon: <Navigation className="h-4 w-4" /> },
                { id: "timeline", label: "Timeline", icon: <Clock className="h-4 w-4" /> },
                { id: "assignment", label: "Assignment", icon: <Car className="h-4 w-4" /> },
                { id: "customer", label: "Customer", icon: <User className="h-4 w-4" /> },
                { id: "financial", label: "Price", icon: <CreditCard className="h-4 w-4" /> },
              ]} onChange={setDetailTab} />

              <div className="min-h-[300px]">
                {detailTab === "details" && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-3 rounded-lg bg-success-50 border border-success-100">
                        <p className="text-xs font-semibold text-success-700 uppercase mb-1">Pickup</p>
                        <p className="text-sm font-bold text-neutral-800">{selected.pickup.address.street}</p>
                        <p className="text-xs text-neutral-500">{selected.pickup.address.city}, {selected.pickup.address.province}</p>
                        <p className="text-xs font-semibold text-neutral-600 mt-1">{new Date(selected.pickup.scheduledAt).toLocaleString()}</p>
                      </div>
                      <div className="p-3 rounded-lg bg-danger-50 border border-danger-100">
                        <p className="text-xs font-semibold text-danger-700 uppercase mb-1">Drop-off</p>
                        <p className="text-sm font-bold text-neutral-800">{selected.dropoff.address.street}</p>
                        <p className="text-xs text-neutral-500">{selected.dropoff.address.city}, {selected.dropoff.address.province}</p>
                        <p className="text-xs font-semibold text-neutral-600 mt-1">{new Date(selected.dropoff.scheduledAt).toLocaleString()}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                      <div className="p-2 rounded-lg bg-neutral-50 text-center"><p className="text-[10px] text-neutral-400 uppercase">Passengers</p><p className="text-sm font-bold">{selected.passengerCount}</p></div>
                      <div className="p-2 rounded-lg bg-neutral-50 text-center"><p className="text-[10px] text-neutral-400 uppercase">Luggage</p><p className="text-sm font-bold">{selected.luggageCount}</p></div>
                      <div className="p-2 rounded-lg bg-neutral-50 text-center"><p className="text-[10px] text-neutral-400 uppercase">Trip Type</p><p className="text-sm font-bold capitalize">{selected.tripType.replace(/_/g, " ")}</p></div>
                    </div>
                    {selected.specialInstructions && <Card padding="md"><h4 className="text-xs font-bold text-neutral-500 uppercase mb-1">Special Instructions</h4><p className="text-sm text-neutral-700">{selected.specialInstructions}</p></Card>}
                    {selected.cancellationReason && <Card padding="md" className="bg-danger-50 border-danger-200"><h4 className="text-xs font-bold text-danger-600 uppercase mb-1">Cancellation Reason</h4><p className="text-sm text-danger-700">{selected.cancellationReason}</p></Card>}
                  </div>
                )}

                {detailTab === "timeline" && (
                  <BookingTimeline
                    currentStatus={selected.status as BookingStatus}
                    cancelledReason={selected.cancellationReason}
                    statusHistory={[
                      { status: "draft", timestamp: selected.createdAt },
                      { status: "pending_confirmation", timestamp: selected.createdAt },
                      ...(selected.status !== "draft" && selected.status !== "pending_confirmation" ? [{ status: "confirmed" as BookingStatus, timestamp: selected.createdAt }] : []),
                      ...(selected.assignedDriverId ? [{ status: "assigned" as BookingStatus, timestamp: selected.updatedAt }] : []),
                    ]}
                  />
                )}

                {detailTab === "assignment" && (
                  <div className="space-y-4">
                    <Card padding="md">
                      <h4 className="text-xs font-bold text-neutral-500 uppercase mb-3">Assigned Driver</h4>
                      {driver ? (
                        <div className="flex items-center gap-3"><Avatar name={driver.fullName} size="md" /><div><p className="text-sm font-bold text-neutral-800">{driver.fullName}</p><p className="text-xs text-neutral-400">{driver.phone} · ⭐ {driver.rating} · {driver.totalTrips} trips</p></div></div>
                      ) : <p className="text-sm text-warning-600">Unassigned — needs dispatch</p>}
                      <div className="mt-3 flex gap-2"><Button variant="outline" size="sm" icon={<User className="h-3.5 w-3.5" />}>{driver ? "Change" : "Assign Driver"}</Button></div>
                    </Card>
                    <Card padding="md">
                      <h4 className="text-xs font-bold text-neutral-500 uppercase mb-3">Assigned Vehicle</h4>
                      {vehicle ? (
                        <div><p className="text-sm font-bold text-neutral-800">{vehicle.name}</p><p className="text-xs text-neutral-400">{vehicle.year} {vehicle.make} · {vehicle.plate} · {vehicle.seats} seats · {vehicle.color}</p></div>
                      ) : <p className="text-sm text-warning-600">Unassigned</p>}
                      <div className="mt-3 flex gap-2"><Button variant="outline" size="sm" icon={<Car className="h-3.5 w-3.5" />}>{vehicle ? "Change" : "Assign Vehicle"}</Button></div>
                    </Card>
                  </div>
                )}

                {detailTab === "customer" && customer && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-neutral-25"><Avatar name={customer.fullName} size="lg" /><div><p className="font-bold text-neutral-800">{customer.fullName}</p><p className="text-xs text-neutral-400">{customer.email} · {customer.phone}</p><p className="text-xs text-neutral-400">{customer.address?.city} · {customer.totalTrips} trips · ⭐{customer.averageRating}</p></div></div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-2 rounded-lg bg-neutral-50 text-center"><p className="text-[10px] text-neutral-400 uppercase">Total Revenue</p><p className="text-sm font-bold">{fmt$(customer.totalRevenue)}</p></div>
                      <div className="p-2 rounded-lg bg-neutral-50 text-center"><p className="text-[10px] text-neutral-400 uppercase">Customer Since</p><p className="text-sm font-bold">{new Date(customer.createdAt).toLocaleDateString()}</p></div>
                    </div>
                  </div>
                )}

                {detailTab === "financial" && (
                  <div className="space-y-4">
                    <Card padding="md">
                      <h4 className="text-sm font-bold text-neutral-800 mb-4">Price Breakdown</h4>
                      <div className="space-y-1.5 text-sm">
                        <PriceLine label="Base Fare" amount={selected.baseFare} />
                        <PriceLine label="Tax (15%)" amount={selected.taxAmount} />
                        {selected.gratuity > 0 && <PriceLine label="Gratuity" amount={selected.gratuity} />}
                        {selected.tolls > 0 && <PriceLine label="Tolls" amount={selected.tolls} />}
                        {selected.surcharges.map((s, i) => <PriceLine key={i} label={s.name} amount={s.amount} />)}
                        <div className="border-t border-neutral-200 pt-1.5 mt-1.5 flex justify-between"><span className="font-bold text-neutral-800">Total</span><span className="text-lg font-black text-brand-700">{fmt$(selected.totalAmount)}</span></div>
                      </div>
                    </Card>
                    <InfoRow label="Payment Method" value={selected.paymentMethod.replace(/_/g, " ")} />
                    <InfoRow label="Payment Status" value={<StatusChip status={selected.paymentStatus} />} />
                  </div>
                )}
              </div>
            </div>
          );
        })()}
      </SlideOver>
    </div>
  );
}

function PriceLine({ label, amount }: { label: string; amount: number }) {
  return <div className="flex justify-between"><span className="text-neutral-500">{label}</span><span className="font-semibold text-neutral-700">${amount.toFixed(2)}</span></div>;
}
function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return <div className="flex items-start justify-between py-2 border-b border-neutral-50 last:border-0 gap-4"><span className="text-xs font-medium text-neutral-400 shrink-0">{label}</span><span className="text-sm text-right text-neutral-700 font-medium">{value}</span></div>;
}

"use client";

import { useState, useMemo } from "react";
import {
  AlertTriangle, Navigation, Clock, MapPin, Car, User, Plane, Phone, Mail,
  Filter, ChevronDown, GripVertical, ArrowRightLeft, X, Check,
  Bell, CalendarDays, DollarSign, FileText, Plus, Search,
  Shield, Wrench, Star, Users, type LucideIcon,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge, StatusChip } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { StatCard } from "@/components/ui/stat-card";
import { SlideOver } from "@/components/ui/slide-over";
import { Tabs } from "@/components/ui/tabs";
import { usePaginatedApi } from "@/lib/hooks/use-api";
import { db, queryAll } from "@/lib/db/store";
import { statusLabel, typeLabel } from "@/lib/utils/status";
import { DispatchTimeline, type DispatchTimelineEvent, type DispatchTimelineEventType } from "@/components/dispatch/dispatch-timeline";
import type { Booking, PaginatedResponse, BookingStatus } from "@/lib/types";

const ORG = "org_demo001";
const fmt$ = (n: number) => `$${n.toLocaleString(undefined, { minimumFractionDigits: 2 })}`;

type Alert = { id: string; type: "driver_late" | "vehicle_unavailable" | "double_booking" | "flight_delayed" | "missing_driver" | "missing_vehicle" | "vip_client" | "expired_doc"; title: string; message: string; bookingId?: string; severity: "high" | "medium" | "low" };

const COLUMN_DEF: { id: BookingStatus | "unassigned_all"; label: string; color: string; headerBg: string; icon: string }[] = [
  { id: "unassigned_all", label: "Unassigned", color: "bg-neutral-50 border-neutral-200", headerBg: "bg-neutral-100", icon: "📋" },
  { id: "pending_confirmation", label: "Pending", color: "bg-warning-50 border-warning-200", headerBg: "bg-warning-100", icon: "⏳" },
  { id: "confirmed", label: "Confirmed", color: "bg-info-50 border-info-200", headerBg: "bg-info-100", icon: "✅" },
  { id: "assigned", label: "Assigned", color: "bg-brand-50 border-brand-200", headerBg: "bg-brand-100", icon: "👤" },
  { id: "chauffeur_en_route", label: "En Route", color: "bg-blue-50 border-blue-200", headerBg: "bg-blue-100", icon: "🚗" },
  { id: "passenger_picked_up", label: "Picked Up", color: "bg-indigo-50 border-indigo-200", headerBg: "bg-indigo-100", icon: "🟢" },
  { id: "in_progress", label: "In Progress", color: "bg-success-50 border-success-200", headerBg: "bg-success-100", icon: "🔄" },
  { id: "completed", label: "Completed", color: "bg-emerald-50 border-emerald-200", headerBg: "bg-emerald-100", icon: "✓" },
];

export default function DispatchCommandCenter() {
  const [view, setView] = useState("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [assignMode, setAssignMode] = useState<string | null>(null); // booking ID being assigned
  const [detailTab, setDetailTab] = useState("details");

  const { data, isLoading } = usePaginatedApi<Booking>("/api/bookings", 1, 200);
  const allBookings = data?.data || [];

  const customers = Object.fromEntries(queryAll(db.customers, ORG).map((c) => [c.id, c]));
  const drivers = Object.fromEntries(queryAll(db.drivers, ORG).map((d) => [d.id, d]));
  const vehicles = Object.fromEntries(queryAll(db.vehicles, ORG).map((v) => [v.id, v]));
  const driversList = Object.values(drivers);
  const vehiclesList = Object.values(vehicles);

  // Active statuses
  const activeStatuses: BookingStatus[] = ["pending_confirmation", "confirmed", "assigned", "chauffeur_en_route", "passenger_picked_up", "in_progress"];

  // Filter based on view
  let displayBookings = allBookings;
  const today = new Date().toISOString().slice(0, 10);

  if (view === "today") displayBookings = displayBookings.filter((b) => b.scheduledPickupAt.slice(0, 10) === today);
  else if (view === "airport") displayBookings = displayBookings.filter((b) => b.type === "airport_pickup" || b.type === "airport_dropoff");
  else if (view === "vip") displayBookings = displayBookings.filter((b) => customers[b.customerId]?.tags.includes("vip"));
  else if (view === "unassigned") displayBookings = displayBookings.filter((b) => !b.assignedDriverId || !b.assignedVehicleId);
  else if (view === "delayed") displayBookings = displayBookings.filter((b) => activeStatuses.includes(b.status as BookingStatus) && new Date(b.scheduledPickupAt) < new Date());
  else if (view === "urgent") displayBookings = displayBookings.filter((b) => activeStatuses.includes(b.status as BookingStatus) && b.scheduledPickupAt.slice(0, 10) === today);
  else displayBookings = displayBookings.filter((b) => activeStatuses.includes(b.status as BookingStatus) || b.status === "completed");

  // Stats
  const unassigned = displayBookings.filter((b) => b.status === "pending_confirmation" && (!b.assignedDriverId || !b.assignedVehicleId)).length;
  const enRoute = displayBookings.filter((b) => b.status === "chauffeur_en_route").length;
  const inProgress = displayBookings.filter((b) => b.status === "passenger_picked_up" || b.status === "in_progress").length;
  const completedToday = allBookings.filter((b) => b.status === "completed" && b.scheduledPickupAt.slice(0, 10) === today).length;
  const airportCount = displayBookings.filter((b) => b.type === "airport_pickup" || b.type === "airport_dropoff").length;
  const availableDrivers = driversList.filter((d) => d.status === "available").length;
  const availableVehicles = vehiclesList.filter((v) => v.status === "available").length;

  // Alerts
  const alerts: Alert[] = useMemo(() => {
    const a: Alert[] = [];
    displayBookings.forEach((b) => {
      const isToday = b.scheduledPickupAt.slice(0, 10) === today;
      const isPast = new Date(b.scheduledPickupAt) < new Date();
      const isActive = activeStatuses.includes(b.status as BookingStatus);
      const isVIP = customers[b.customerId]?.tags.includes("vip");
      if (isActive && isPast && b.status !== "chauffeur_en_route" && b.status !== "passenger_picked_up" && b.status !== "in_progress") {
        a.push({ id: `late_${b.id}`, type: "driver_late", title: "Trip Past Scheduled Time", message: `${b.bookingNumber} — ${customers[b.customerId]?.fullName || b.customerId} was scheduled at ${new Date(b.scheduledPickupAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`, bookingId: b.id, severity: "high" });
      }
      if (isActive && !b.assignedDriverId) a.push({ id: `nodrv_${b.id}`, type: "missing_driver", title: "Missing Driver", message: `${b.bookingNumber} has no driver assigned`, bookingId: b.id, severity: "high" });
      if (isActive && !b.assignedVehicleId) a.push({ id: `noveh_${b.id}`, type: "missing_vehicle", title: "Missing Vehicle", message: `${b.bookingNumber} has no vehicle assigned`, bookingId: b.id, severity: "medium" });
      if (isVIP && isActive) a.push({ id: `vip_${b.id}`, type: "vip_client", title: "VIP Client", message: `${customers[b.customerId]?.fullName || b.customerId} — ${b.bookingNumber}`, bookingId: b.id, severity: "low" });
    });
    return a;
  }, [displayBookings]);

  const highAlerts = alerts.filter((a) => a.severity === "high").length;

  // Selected booking
  const selected = allBookings.find((b) => b.id === selectedId) || null;
  const selCustomer = selected ? customers[selected.customerId] : null;
  const selDriver = selected?.assignedDriverId ? drivers[selected.assignedDriverId] : null;
  const selVehicle = selected?.assignedVehicleId ? vehicles[selected.assignedVehicleId] : null;

  // Timeline for selected booking
  const selTimeline: DispatchTimelineEvent[] = selected ? [
    { id: "ev_1", type: "booking_created" as DispatchTimelineEventType, title: "Booking Created", description: `Booking ${selected.bookingNumber} created`, timestamp: selected.createdAt, actor: selected.createdById },
    ...(selected.status !== "pending_confirmation" ? [{ id: "ev_2", type: "booking_confirmed" as DispatchTimelineEventType, title: "Booking Confirmed", description: "Status changed to confirmed", timestamp: selected.createdAt }] : []),
    ...(selected.assignedDriverId ? [{ id: "ev_3", type: "driver_assigned" as DispatchTimelineEventType, title: "Driver Assigned", description: `${selDriver?.fullName || selected.assignedDriverId} assigned to trip`, timestamp: selected.updatedAt, actor: "Dispatcher", metadata: { vehicle: selVehicle?.name || "N/A" } }] : []),
    ...(selected.assignedVehicleId ? [{ id: "ev_4", type: "vehicle_assigned" as DispatchTimelineEventType, title: "Vehicle Assigned", description: `${selVehicle?.name || selected.assignedVehicleId} assigned`, timestamp: selected.updatedAt }] : []),
    ...(["chauffeur_en_route", "passenger_picked_up", "in_progress", "completed"].includes(selected.status as string) ? [{ id: "ev_5", type: "chauffeur_en_route" as DispatchTimelineEventType, title: "Chauffeur En Route", description: "Driver heading to pickup location", timestamp: selected.scheduledPickupAt }] : []),
    ...(["passenger_picked_up", "in_progress", "completed"].includes(selected.status as string) ? [{ id: "ev_6", type: "passenger_picked_up" as DispatchTimelineEventType, title: "Passenger Picked Up", description: "Client onboard, trip started", timestamp: selected.scheduledPickupAt }] : []),
    ...((selected.status as string) === "completed" ? [{ id: "ev_7", type: "trip_completed" as DispatchTimelineEventType, title: "Trip Completed", description: `Trip completed successfully. Revenue: ${fmt$(selected.totalAmount)}`, timestamp: selected.updatedAt }] : []),
    ...((selected.status as string) === "cancelled" ? [{ id: "ev_c", type: "cancelled" as DispatchTimelineEventType, title: "Booking Cancelled", description: selected.cancellationReason || "Cancelled by dispatcher", timestamp: selected.cancelledAt || selected.updatedAt }] : []),
  ] : [];

  // Drag state
  const [dragOverCol, setDragOverCol] = useState<string | null>(null);

  return (
    <div className="space-y-4">
      {/* ── Header ── */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-800 flex items-center gap-2">
            Dispatch Command Center
            <span className="flex h-2.5 w-2.5 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-success-500" />
            </span>
          </h1>
          <p className="text-sm text-neutral-400">{displayBookings.length} active jobs · {availableDrivers} drivers · {availableVehicles} vehicles</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" icon={<Bell className="h-4 w-4" />}>
            Alerts {highAlerts > 0 && <span className="ml-1 rounded-full bg-danger-500 text-white text-[10px] px-1.5 py-0.5">{highAlerts}</span>}
          </Button>
          <Button variant="primary" size="md" icon={<Plus className="h-4 w-4" />}>New Booking</Button>
        </div>
      </div>

      {/* ── Stats Bar ── */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-8">
        <StatCard label="Active Jobs" value={String(displayBookings.length)} color="brand" />
        <StatCard label="Unassigned" value={String(unassigned)} color="warning" />
        <StatCard label="En Route" value={String(enRoute)} color="info" />
        <StatCard label="On Board" value={String(inProgress)} color="success" />
        <StatCard label="Completed" value={String(completedToday)} color="gold" />
        <StatCard label="Airport" value={String(airportCount)} color="info" />
        <StatCard label="Drivers" value={`${availableDrivers}/${driversList.length}`} color="success" />
        <StatCard label="Vehicles" value={`${availableVehicles}/${vehiclesList.length}`} color="brand" />
      </div>

      {/* ── Alert Banners ── */}
      {alerts.filter((a) => a.severity === "high").slice(0, 3).map((a) => (
        <div key={a.id} className="flex items-center gap-3 rounded-xl border border-danger-200 bg-danger-50 px-4 py-3 animate-fade-in-down">
          <AlertTriangle className="h-5 w-5 text-danger-500 shrink-0" />
          <div className="flex-1 min-w-0"><p className="text-sm font-bold text-danger-700">{a.title}</p><p className="text-xs text-danger-600">{a.message}</p></div>
          <Button variant="ghost" size="sm" onClick={() => a.bookingId && setSelectedId(a.bookingId)}>View Trip</Button>
        </div>
      ))}

      {/* ── Quick View Tabs ── */}
      <div className="flex flex-wrap items-center gap-1.5">
        {[
          { id: "all", label: "All Active", icon: Navigation },
          { id: "today", label: "Today", icon: CalendarDays },
          { id: "airport", label: "Airport", icon: Plane },
          { id: "vip", label: "VIP", icon: Star },
          { id: "unassigned", label: "Unassigned", icon: AlertTriangle },
          { id: "delayed", label: "Delayed", icon: Clock },
          { id: "urgent", label: "Urgent", icon: Bell },
        ].map((v) => {
          const Icon = v.icon;
          return (
            <Button key={v.id} variant={view === v.id ? "primary" : "outline"} size="sm" onClick={() => setView(v.id)} icon={<Icon className="h-3.5 w-3.5" />}>
              {v.label}
            </Button>
          );
        })}
      </div>

      {/* ── Driver & Vehicle Quick Panels ── */}
      <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
        <div className="flex items-center gap-2 overflow-x-auto p-2 rounded-xl bg-neutral-25 border border-neutral-100">
          <span className="text-[10px] font-bold text-neutral-400 uppercase shrink-0 px-1">Drivers:</span>
          {driversList.filter((d) => d.status === "available").slice(0, 8).map((d) => (
            <div key={d.id} className="flex items-center gap-1.5 shrink-0 rounded-full bg-white border border-neutral-200 px-2 py-1 cursor-pointer hover:border-brand-300 hover:shadow-sm transition-all" title={d.fullName}>
              <span className="h-1.5 w-1.5 rounded-full bg-success-500" />
              <span className="text-[11px] font-semibold text-neutral-700">{d.fullName.split(" ")[0]}</span>
            </div>
          ))}
          <span className="text-[10px] text-neutral-400 ml-auto shrink-0">{availableDrivers} available</span>
        </div>
        <div className="flex items-center gap-2 overflow-x-auto p-2 rounded-xl bg-neutral-25 border border-neutral-100">
          <span className="text-[10px] font-bold text-neutral-400 uppercase shrink-0 px-1">Vehicles:</span>
          {vehiclesList.filter((v) => v.status === "available").slice(0, 8).map((v) => (
            <div key={v.id} className="flex items-center gap-1.5 shrink-0 rounded-full bg-white border border-neutral-200 px-2 py-1 cursor-pointer hover:border-brand-300 hover:shadow-sm transition-all" title={v.name}>
              <span className="h-1.5 w-1.5 rounded-full bg-success-500" />
              <span className="text-[11px] font-semibold text-neutral-700">{v.name}</span>
            </div>
          ))}
          <span className="text-[10px] text-neutral-400 ml-auto shrink-0">{availableVehicles} available</span>
        </div>
      </div>

      {/* ── Kanban Board ── */}
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-8">
        {COLUMN_DEF.map((col) => {
          const isUnassignedCol = col.id === "unassigned_all";
          const items = isUnassignedCol
            ? displayBookings.filter((b) => (b.status === "draft" || b.status === "pending_confirmation") && (!b.assignedDriverId || !b.assignedVehicleId))
            : displayBookings.filter((b) => b.status === col.id);

          return (
            <div
              key={col.id}
              className={["rounded-xl border min-h-[250px] flex flex-col transition-all", col.color, dragOverCol === col.id ? "ring-2 ring-brand-400 scale-[1.02]" : ""].join(" ")}
              onDragOver={(e) => { e.preventDefault(); setDragOverCol(col.id); }}
              onDragLeave={() => setDragOverCol(null)}
              onDrop={(e) => { e.preventDefault(); setDragOverCol(null); const bid = e.dataTransfer.getData("bookingId"); if (bid) { /* Status change logic */ } }}
            >
              <div className={["flex items-center justify-between px-3 py-2 rounded-t-xl border-b", col.headerBg].join(" ")}>
                <span className="text-[11px] font-bold text-neutral-700">{col.icon} {col.label}</span>
                <Badge variant="neutral">{items.length}</Badge>
              </div>
              <div className="flex-1 space-y-1.5 p-1.5 overflow-y-auto max-h-[450px]">
                {items.map((b) => {
                  const cust = customers[b.customerId];
                  const drv = b.assignedDriverId ? drivers[b.assignedDriverId] : null;
                  const veh = b.assignedVehicleId ? vehicles[b.assignedVehicleId] : null;
                  const isAirport = b.type === "airport_pickup" || b.type === "airport_dropoff";
                  const isVIP = cust?.tags.includes("vip");
                  const isLate = new Date(b.scheduledPickupAt) < new Date() && b.status !== "completed" && b.status !== "cancelled";

                  return (
                    <div
                      key={b.id}
                      draggable
                      onDragStart={(e) => { e.dataTransfer.setData("bookingId", b.id); }}
                      className={[
                        "rounded-lg bg-white border p-2.5 shadow-sm hover:shadow-md transition-all cursor-pointer group",
                        isAirport && b.flightTracking ? "ring-2 ring-gold-400" : "border-neutral-100",
                        isVIP && !isAirport ? "ring-1 ring-purple-300" : "",
                        isLate ? "border-l-[3px] border-l-danger-500" : "",
                      ].join(" ")}
                      onClick={() => setSelectedId(b.id)}
                    >
                      {/* Top row */}
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="font-mono text-[11px] font-bold text-brand-700">{b.bookingNumber}</span>
                        <div className="flex items-center gap-1">
                          {isAirport && <Plane className="h-2.5 w-2.5 text-gold-500" />}
                          {isVIP && <Star className="h-2.5 w-2.5 text-purple-500 fill-purple-500" />}
                          {isLate && <Clock className="h-2.5 w-2.5 text-danger-500" />}
                        </div>
                      </div>

                      {/* Customer */}
                      <p className="text-xs font-semibold text-neutral-800 truncate">{cust?.fullName || b.customerId}</p>

                      {/* Route */}
                      <div className="mt-1 space-y-0.5 text-[10px] text-neutral-500">
                        <div className="flex items-center gap-1"><MapPin className="h-2.5 w-2.5 shrink-0" /><span className="truncate">{b.pickup.address.city} → {b.dropoff.address.city}</span></div>
                        <div className="flex items-center gap-2">
                          <Clock className="h-2.5 w-2.5 shrink-0" />
                          <span>{new Date(b.scheduledPickupAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                          <span>·</span>
                          <span>{b.passengerCount}p</span>
                          <span>·</span>
                          <span>{typeLabel(b.type)}</span>
                        </div>
                      </div>

                      {/* Assignment row */}
                      <div className="mt-2 flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          {drv ? <div className="flex items-center gap-1 text-[10px] font-medium text-neutral-600"><Avatar name={drv.fullName} size="xs" />{drv.fullName.split(" ")[0]}</div> : <span className="text-[10px] text-warning-600 font-semibold">No driver</span>}
                          {veh ? <span className="text-[10px] text-neutral-400">· {veh.plate}</span> : <span className="text-[10px] text-warning-600 font-semibold">· No vehicle</span>}
                        </div>
                        <span className="text-[11px] font-bold text-neutral-700">{fmt$(b.totalAmount)}</span>
                      </div>

                      {/* Quick assign button */}
                      {(!drv || !veh) && (
                        <div className="mt-1.5 flex gap-1">
                          {!drv && <Button variant="ghost" size="sm" icon={<User className="h-2.5 w-2.5" />} className="text-[9px] h-5 px-1.5">Driver</Button>}
                          {!veh && <Button variant="ghost" size="sm" icon={<Car className="h-2.5 w-2.5" />} className="text-[9px] h-5 px-1.5">Vehicle</Button>}
                        </div>
                      )}
                    </div>
                  );
                })}
                {items.length === 0 && <p className="text-[10px] text-neutral-300 text-center py-8">—</p>}
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Trip Detail Slide-Over ── */}
      <SlideOver
        open={!!selected} onClose={() => setSelectedId(null)}
        title={selected ? `${selected.bookingNumber}` : ""}
        subtitle={selected ? `${statusLabel(selected.status)} · ${typeLabel(selected.type)}` : ""}
        width="xl"
        footer={
          <div className="flex flex-wrap gap-2 w-full justify-between">
            <div className="flex gap-2">
              {selected && (selected.status as string) !== "completed" && (selected.status as string) !== "cancelled" && (
                <Button variant="destructive" size="sm">Cancel Trip</Button>
              )}
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => setSelectedId(null)}>Close</Button>
              <Button variant="primary" size="sm">Update Status</Button>
            </div>
          </div>
        }>
        {selected && selCustomer && (
          <div className="space-y-6">
            {/* Status & Alert Banner */}
            <div className={["rounded-xl p-4 border", (selected.status as string) === "completed" ? "bg-success-50 border-success-200" : (selected.status as string) === "cancelled" ? "bg-danger-50 border-danger-200" : new Date(selected.scheduledPickupAt) < new Date() && (selected.status as string) !== "completed" ? "bg-warning-50 border-warning-200" : "bg-brand-50 border-brand-100"].join(" ")}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <StatusChip status={statusLabel(selected.status)} />
                  {selCustomer.tags.includes("vip") && <Badge variant="gold">VIP</Badge>}
                  {(selected.type === "airport_pickup" || selected.type === "airport_dropoff") && <Badge variant="info"><Plane className="h-3 w-3 mr-0.5" />{selected.flightNumber || "Airport"}</Badge>}
                </div>
                <span className="text-xs font-bold text-neutral-700">{fmt$(selected.totalAmount)}</span>
              </div>
            </div>

            {/* Customer + Trip Card */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-neutral-25 border border-neutral-100">
                <h4 className="text-[10px] font-bold text-neutral-400 uppercase mb-2">Customer</h4>
                <div className="flex items-center gap-3"><Avatar name={selCustomer.fullName} size="md" /><div><p className="text-sm font-bold text-neutral-800">{selCustomer.fullName}</p><p className="text-xs text-neutral-400">{selCustomer.phone}</p></div></div>
                <div className="mt-2 text-xs text-neutral-500"><span>{selCustomer.totalTrips} trips</span><span className="mx-1">·</span><span>⭐{selCustomer.averageRating}</span></div>
              </div>
              <div className="p-4 rounded-xl bg-neutral-25 border border-neutral-100">
                <h4 className="text-[10px] font-bold text-neutral-400 uppercase mb-2">Trip</h4>
                <p className="text-xs font-semibold text-neutral-700">{selected.passengerCount} passengers · {selected.luggageCount} luggage</p>
                <p className="text-xs text-neutral-500 mt-1">{new Date(selected.scheduledPickupAt).toLocaleString()}</p>
                {selected.specialInstructions && <p className="text-xs text-neutral-500 mt-1 italic">{selected.specialInstructions}</p>}
              </div>
            </div>

            {/* Assignment Cards */}
            <div className="grid grid-cols-2 gap-4">
              <Card padding="md">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-[10px] font-bold text-neutral-400 uppercase">Assigned Driver</h4>
                  <Button variant="ghost" size="sm" icon={<ArrowRightLeft className="h-3 w-3" />} className="text-[10px]">Change</Button>
                </div>
                {selDriver ? (
                  <div className="flex items-center gap-3"><Avatar name={selDriver.fullName} size="md" /><div><p className="text-sm font-bold text-neutral-800">{selDriver.fullName}</p><p className="text-xs text-neutral-400">{selDriver.phone} · ⭐{selDriver.rating}</p></div></div>
                ) : (
                  <div className="p-3 rounded-lg bg-warning-50 border border-warning-200 text-center">
                    <p className="text-xs font-semibold text-warning-700">⚠ No driver assigned</p>
                    <Button variant="primary" size="sm" className="mt-1" icon={<User className="h-3 w-3" />}>Assign Now</Button>
                  </div>
                )}
              </Card>
              <Card padding="md">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-[10px] font-bold text-neutral-400 uppercase">Assigned Vehicle</h4>
                  <Button variant="ghost" size="sm" icon={<ArrowRightLeft className="h-3 w-3" />} className="text-[10px]">Change</Button>
                </div>
                {selVehicle ? (
                  <div><p className="text-sm font-bold text-neutral-800">{selVehicle.name}</p><p className="text-xs text-neutral-400">{selVehicle.year} {selVehicle.make} · {selVehicle.plate} · {selVehicle.seats} seats</p></div>
                ) : (
                  <div className="p-3 rounded-lg bg-warning-50 border border-warning-200 text-center">
                    <p className="text-xs font-semibold text-warning-700">⚠ No vehicle assigned</p>
                    <Button variant="primary" size="sm" className="mt-1" icon={<Car className="h-3 w-3" />}>Assign Now</Button>
                  </div>
                )}
              </Card>
            </div>

            {/* Pickup/Dropoff */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-lg bg-success-50 border border-success-100">
                <p className="text-[10px] font-bold text-success-600 uppercase">Pickup</p>
                <p className="text-sm font-semibold text-neutral-800">{selected.pickup.address.street}</p>
                <p className="text-xs text-neutral-500">{selected.pickup.address.city}, {selected.pickup.address.province}</p>
                <p className="text-xs font-semibold mt-1">{new Date(selected.pickup.scheduledAt).toLocaleString()}</p>
              </div>
              <div className="p-3 rounded-lg bg-danger-50 border border-danger-100">
                <p className="text-[10px] font-bold text-danger-600 uppercase">Drop-off</p>
                <p className="text-sm font-semibold text-neutral-800">{selected.dropoff.address.street}</p>
                <p className="text-xs text-neutral-500">{selected.dropoff.address.city}, {selected.dropoff.address.province}</p>
                <p className="text-xs font-semibold mt-1">{new Date(selected.dropoff.scheduledAt).toLocaleString()}</p>
              </div>
            </div>

            {/* Dispatcher Notes */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <h4 className="text-[10px] font-bold text-neutral-400 uppercase">Dispatcher Notes</h4>
                <Button variant="ghost" size="sm" icon={<Plus className="h-3 w-3" />} className="text-[10px]">Add Note</Button>
              </div>
              <textarea placeholder="Internal notes visible to dispatchers only..." rows={2} className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-xs bg-neutral-25 resize-none focus:outline-none focus:ring-2 focus:ring-brand-500/20" />
            </div>

            {/* Dispatch Timeline */}
            <div>
              <h4 className="text-[10px] font-bold text-neutral-400 uppercase mb-3">Dispatch Timeline</h4>
              <DispatchTimeline events={selTimeline} />
            </div>
          </div>
        )}
      </SlideOver>
    </div>
  );
}

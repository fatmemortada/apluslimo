"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight, Plus, Clock, MapPin, Plane, Filter, Car, User } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge, StatusChip } from "@/components/ui/badge";
import { StatCard } from "@/components/ui/stat-card";
import { useApi } from "@/lib/hooks/use-api";
import { db, queryAll } from "@/lib/db/store";
import type { Booking, PaginatedResponse } from "@/lib/types";

const ORG = "org_demo001";
type ViewMode = "day" | "week" | "month";

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-warning-100 border-warning-300 text-warning-800",
  confirmed: "bg-brand-100 border-brand-300 text-brand-800",
  assigned: "bg-info-100 border-info-300 text-info-800",
  driver_en_route: "bg-blue-100 border-blue-300 text-blue-800",
  passenger_on_board: "bg-success-100 border-success-300 text-success-800",
  completed: "bg-neutral-100 border-neutral-300 text-neutral-600",
};

export default function CalendarPage() {
  const [view, setView] = useState<ViewMode>("week");
  const [currentDate, setCurrentDate] = useState(new Date(2026, 6, 2)); // July 2, 2026
  const [driverFilter, setDriverFilter] = useState("all");
  const [vehicleFilter, setVehicleFilter] = useState("all");

  const { data } = useApi<PaginatedResponse<Booking>>("/api/bookings?pageSize=100");
  const allBookings = data?.data || [];

  const customers = Object.fromEntries(queryAll(db.customers, ORG).map((c) => [c.id, c]));
  const drivers = Object.fromEntries(queryAll(db.drivers, ORG).map((d) => [d.id, d]));
  const vehicles = Object.fromEntries(queryAll(db.vehicles, ORG).map((v) => [v.id, v]));

  // Apply filters
  let filtered = [...allBookings];
  if (driverFilter !== "all") filtered = filtered.filter((b) => b.assignedDriverId === driverFilter);
  if (vehicleFilter !== "all") filtered = filtered.filter((b) => b.assignedVehicleId === vehicleFilter);

  // Day view: show today's bookings
  const todayStr = currentDate.toISOString().slice(0, 10);
  const dayBookings = filtered.filter((b) => b.scheduledPickupAt.slice(0, 10) === todayStr).sort((a, b) => new Date(a.scheduledPickupAt).getTime() - new Date(b.scheduledPickupAt).getTime());

  // Week view: get week range
  const getWeekRange = (d: Date) => {
    const start = new Date(d); start.setDate(d.getDate() - d.getDay());
    const end = new Date(start); end.setDate(start.getDate() + 6);
    return { start, end };
  };
  const week = getWeekRange(currentDate);
  const weekDays = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date(week.start); d.setDate(week.start.getDate() + i);
    return d;
  });

  const weekBookings = filtered.filter((b) => {
    const d = b.scheduledPickupAt.slice(0, 10);
    return weekDays.some((wd) => wd.toISOString().slice(0, 10) === d);
  });

  // Month view
  const monthStart = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
  const monthEnd = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
  const monthBookings = filtered.filter((b) => {
    const d = b.scheduledPickupAt.slice(0, 10);
    return d >= monthStart.toISOString().slice(0, 10) && d <= monthEnd.toISOString().slice(0, 10);
  });

  const navigate = (dir: number) => {
    const d = new Date(currentDate);
    if (view === "day") d.setDate(d.getDate() + dir);
    else if (view === "week") d.setDate(d.getDate() + dir * 7);
    else d.setMonth(d.getMonth() + dir);
    setCurrentDate(d);
  };

  const headerLabel = view === "day"
    ? currentDate.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })
    : view === "week"
    ? `Week of ${week.start.toLocaleDateString("en-US", { month: "short", day: "numeric" })} – ${week.end.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`
    : currentDate.toLocaleDateString("en-US", { month: "long", year: "numeric" });

  const today = dayBookings.length;
  const thisWeek = weekBookings.length;
  const airport = filtered.filter((b) => b.type === "airport_pickup").length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div><h1 className="text-2xl font-bold text-neutral-800">Calendar</h1><p className="text-sm text-neutral-400">{filtered.length} bookings — Schedule & reservations</p></div>
        <div className="flex items-center gap-1">
          <Button variant="outline" size="sm" onClick={() => navigate(-1)} icon={<ChevronLeft className="h-4 w-4" />} />
          <Button variant="outline" size="sm" onClick={() => { setCurrentDate(new Date()); }}>Today</Button>
          <Button variant="outline" size="sm" onClick={() => navigate(1)} icon={<ChevronRight className="h-4 w-4" />} />
          <div className="h-6 w-px bg-neutral-200 mx-1" />
          {(["day", "week", "month"] as ViewMode[]).map((v) => (
            <Button key={v} variant={view === v ? "primary" : "outline"} size="sm" onClick={() => setView(v)} className="capitalize">{v}</Button>
          ))}
          <div className="h-6 w-px bg-neutral-200 mx-1" />
          <Button variant="primary" size="sm" icon={<Plus className="h-4 w-4" />}>New Booking</Button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Today" value={String(today)} color="brand" />
        <StatCard label="This Week" value={String(thisWeek)} color="info" />
        <StatCard label="Airport Pickups" value={String(airport)} color="gold" />
        <StatCard label="Total Bookings" value={String(filtered.length)} color="success" />
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <span className="text-xs font-semibold text-neutral-500 flex items-center gap-1"><Filter className="h-3.5 w-3.5" />Filters:</span>
        <select value={driverFilter} onChange={(e) => setDriverFilter(e.target.value)} className="rounded-lg border border-neutral-200 px-3 py-1.5 text-xs bg-white">
          <option value="all">All Drivers</option>
          {Object.values(drivers).map((d) => <option key={d.id} value={d.id}>{d.fullName}</option>)}
        </select>
        <select value={vehicleFilter} onChange={(e) => setVehicleFilter(e.target.value)} className="rounded-lg border border-neutral-200 px-3 py-1.5 text-xs bg-white">
          <option value="all">All Vehicles</option>
          {Object.values(vehicles).map((v) => <option key={v.id} value={v.id}>{v.name}</option>)}
        </select>
      </div>

      {/* Calendar View */}
      <Card padding="md">
        <h3 className="text-base font-bold text-neutral-800 mb-4">{headerLabel}</h3>

        {/* DAY VIEW */}
        {view === "day" && (
          <div className="space-y-2">
            {dayBookings.length === 0 ? (
              <p className="text-sm text-neutral-400 text-center py-10">No bookings for this day</p>
            ) : dayBookings.map((b) => (
              <BookingEvent key={b.id} booking={b} customerName={customers[b.customerId]?.fullName || b.customerId} driverName={b.assignedDriverId ? drivers[b.assignedDriverId]?.fullName : null} vehicleName={b.assignedVehicleId ? vehicles[b.assignedVehicleId]?.name : null} />
            ))}
          </div>
        )}

        {/* WEEK VIEW */}
        {view === "week" && (
          <div className="grid grid-cols-7 gap-2">
            {weekDays.map((day, idx) => {
              const ds = day.toISOString().slice(0, 10);
              const dayBks = weekBookings.filter((b) => b.scheduledPickupAt.slice(0, 10) === ds).sort((a, b) => new Date(a.scheduledPickupAt).getTime() - new Date(b.scheduledPickupAt).getTime());
              const isToday = ds === new Date().toISOString().slice(0, 10);
              return (
                <div key={idx} className={["rounded-lg border p-2 min-h-[180px]", isToday ? "border-brand-300 bg-brand-50/50 ring-2 ring-brand-200" : "border-neutral-100"].join(" ")}>
                  <div className="text-center mb-2">
                    <p className="text-[10px] font-semibold text-neutral-400 uppercase">{day.toLocaleDateString("en-US", { weekday: "short" })}</p>
                    <p className={["text-sm font-bold", isToday ? "text-brand-700" : "text-neutral-700"].join(" ")}>{day.getDate()}</p>
                  </div>
                  <div className="space-y-1">
                    {dayBks.slice(0, 3).map((b) => (
                      <div key={b.id} className={["rounded-md border px-1.5 py-1 text-[10px] leading-tight cursor-pointer hover:shadow-sm transition-shadow", STATUS_COLORS[b.status] || STATUS_COLORS.pending].join(" ")}>
                        <p className="font-bold">{new Date(b.scheduledPickupAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</p>
                        <p className="truncate">{customers[b.customerId]?.fullName?.split(" ")[0] || b.customerId}</p>
                        {b.type === "airport_pickup" && <Plane className="h-2.5 w-2.5 inline text-gold-600" />}
                      </div>
                    ))}
                    {dayBks.length > 3 && <p className="text-[10px] text-neutral-400 text-center">+{dayBks.length - 3} more</p>}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* MONTH VIEW */}
        {view === "month" && (
          <div>
            <div className="grid grid-cols-7 gap-px bg-neutral-100 rounded-lg overflow-hidden text-center">
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
                <div key={d} className="bg-neutral-50 py-2 text-[10px] font-bold text-neutral-500 uppercase">{d}</div>
              ))}
              {/* Build month grid */}
              {(() => {
                const firstDay = monthStart.getDay();
                const daysInMonth = monthEnd.getDate();
                const cells: React.ReactNode[] = [];
                // Empty cells before month start
                for (let i = 0; i < firstDay; i++) cells.push(<div key={`e${i}`} className="bg-white p-2 min-h-[80px]" />);
                // Day cells
                for (let d = 1; d <= daysInMonth; d++) {
                  const ds = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
                  const dayBks = monthBookings.filter((b) => b.scheduledPickupAt.slice(0, 10) === ds);
                  const isToday = ds === new Date().toISOString().slice(0, 10);
                  cells.push(
                    <div key={d} className={["bg-white p-1.5 min-h-[80px] text-left border-t border-neutral-50", isToday && "ring-2 ring-brand-400 bg-brand-50/40 relative z-10 rounded-sm"].join(" ")}>
                      <span className={["text-xs font-bold", isToday ? "text-brand-700" : "text-neutral-600"].join(" ")}>{d}</span>
                      <div className="mt-0.5 space-y-0.5">
                        {dayBks.slice(0, 3).map((b) => (
                          <div key={b.id} className={["rounded px-1 py-0.5 text-[9px] leading-tight truncate cursor-pointer", STATUS_COLORS[b.status] || STATUS_COLORS.pending].join(" ")}>
                            {new Date(b.scheduledPickupAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} {customers[b.customerId]?.fullName?.split(" ")[0] || b.customerId}
                            {b.type === "airport_pickup" && " ✈"}
                          </div>
                        ))}
                        {dayBks.length > 3 && <p className="text-[9px] text-neutral-400">+{dayBks.length - 3}</p>}
                      </div>
                    </div>
                  );
                }
                return cells;
              })()}
            </div>
          </div>
        )}
      </Card>

      {/* Today's Detailed List */}
      <Card padding="md">
        <h2 className="text-base font-bold text-neutral-800 mb-4">Today&apos;s Schedule — {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}</h2>
        <div className="space-y-1">
          {dayBookings.map((b) => (
            <BookingEvent key={b.id} booking={b} customerName={customers[b.customerId]?.fullName || b.customerId} driverName={b.assignedDriverId ? drivers[b.assignedDriverId]?.fullName : null} vehicleName={b.assignedVehicleId ? vehicles[b.assignedVehicleId]?.name : null} />
          ))}
        </div>
      </Card>
    </div>
  );
}

function BookingEvent({ booking: b, customerName, driverName, vehicleName }: { booking: Booking; customerName: string; driverName: string | null; vehicleName: string | null }) {
  return (
    <div className={["flex items-start gap-4 rounded-xl border-l-4 p-4 transition-colors hover:bg-neutral-25 cursor-pointer", STATUS_COLORS[b.status] || STATUS_COLORS.pending].join(" ")}>
      <div className="shrink-0 text-center min-w-[50px]">
        <p className="text-sm font-bold text-neutral-700">{new Date(b.scheduledPickupAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</p>
        <p className="text-[10px] font-semibold text-neutral-400 uppercase">{b.type.replace(/_/g, " ")}</p>
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <p className="text-sm font-semibold text-neutral-800">{customerName}</p>
          <span className="font-mono text-xs text-brand-600 font-bold">{b.bookingNumber}</span>
          <StatusChip status={b.status.replace(/_/g, " ")} />
        </div>
        <div className="mt-1 flex items-center gap-3 text-xs text-neutral-500">
          <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{b.pickup.address.city} → {b.dropoff.address.city}</span>
          <span>{b.passengerCount} pax</span>
          {b.flightNumber && <span className="flex items-center gap-1 text-gold-600"><Plane className="h-3 w-3" />{b.flightNumber}</span>}
        </div>
        <div className="mt-1 flex items-center gap-3 text-xs text-neutral-400">
          {driverName && <span className="flex items-center gap-1"><User className="h-3 w-3" />{driverName}</span>}
          {vehicleName && <span className="flex items-center gap-1"><Car className="h-3 w-3" />{vehicleName}</span>}
          <span>${b.totalAmount.toFixed(2)}</span>
        </div>
      </div>
    </div>
  );
}

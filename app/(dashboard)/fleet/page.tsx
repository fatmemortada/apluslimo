"use client";

import { useState, useMemo } from "react";
import {
  Plus, Search, Filter, Download, Car, Gauge, MapPin, Fuel, Wrench,
  CalendarDays, Shield, FileText, AlertTriangle, TrendingUp, TrendingDown,
  Activity, DollarSign, Clock, CheckCircle2, XCircle, Camera, ChevronRight,
  Users, BarChart3, type LucideIcon,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge, StatusChip } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { StatCard } from "@/components/ui/stat-card";
import { SearchInput } from "@/components/ui/search-input";
import { Tabs } from "@/components/ui/tabs";
import { SlideOver } from "@/components/ui/slide-over";
import { CardSkeleton } from "@/components/ui/skeleton";
import { useApi } from "@/lib/hooks/use-api";
import { db, queryAll } from "@/lib/db/store";
import { VehicleTimeline, type TimelineEvent, type TimelineEventType } from "@/components/fleet/vehicle-timeline";
import type { VehicleWithRelations, MaintenanceRecord, Booking, PaginatedResponse, VehicleStatus } from "@/lib/types";
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";

const ORG = "org_demo001";
const chartTooltip = { contentStyle: { borderRadius: "12px", border: "1px solid #e2e8f0", boxShadow: "0 10px 25px rgba(0,0,0,0.08)", background: "#fff", padding: "10px 14px", fontSize: "13px" } };
const VEHICLE_STATUS_LABEL: Record<string, string> = {
  available: "Available", reserved: "Reserved", assigned: "Assigned", on_trip: "On Trip",
  cleaning: "Cleaning", maintenance: "Maintenance", out_of_service: "Out of Service", inactive: "Inactive",
};
const STATUS_COLORS: Record<string, string> = {
  available: "#10b981", on_trip: "#3b82f6", maintenance: "#f59e0b", cleaning: "#8b5cf6",
  reserved: "#6366f1", assigned: "#06b6d4", out_of_service: "#ef4444", inactive: "#94a3b8",
};
function fmt$(n: number) { return `$${n.toLocaleString(undefined, { minimumFractionDigits: 2 })}`; }

export default function FleetDashboard() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [detailTab, setDetailTab] = useState("overview");

  const { data, isLoading } = useApi<PaginatedResponse<VehicleWithRelations>>("/api/vehicles?pageSize=100");
  const vehicles = data?.data || [];
  const drivers = Object.fromEntries(queryAll(db.drivers, ORG).map((d) => [d.id, d]));
  const allBookings = queryAll(db.bookings, ORG);
  const maintRecords = queryAll(db.maintenanceRecords, ORG);

  // Filters
  let filtered = vehicles;
  if (search) {
    const s = search.toLowerCase();
    filtered = filtered.filter((v) => v.name.toLowerCase().includes(s) || v.plate.toLowerCase().includes(s) || v.vin.toLowerCase().includes(s) || v.make.toLowerCase().includes(s) || v.model.toLowerCase().includes(s));
  }
  if (statusFilter !== "all") filtered = filtered.filter((v) => v.status === statusFilter);
  if (categoryFilter !== "all") {
    if (categoryFilter === "suv") filtered = filtered.filter((v) => v.type.includes("suv"));
    else if (categoryFilter === "sedan") filtered = filtered.filter((v) => v.type.includes("sedan"));
    else if (categoryFilter === "van") filtered = filtered.filter((v) => v.type.includes("van"));
    else if (categoryFilter === "limo") filtered = filtered.filter((v) => v.type.includes("limo"));
  }

  // Fleet KPIs
  const total = vehicles.length;
  const available = vehicles.filter((v) => v.status === "available").length;
  const onTrip = vehicles.filter((v) => v.status === "on_trip").length;
  const inMaint = vehicles.filter((v) => v.status === "maintenance").length;
  const outOfService = vehicles.filter((v) => ["out_of_service", "inactive"].includes(v.status)).length;
  const utilization = total > 0 ? Math.round(((available + onTrip) / total) * 100) : 0;

  // Revenue per vehicle
  const vehRevenue = vehicles.map((v) => {
    const bookings = allBookings.filter((b) => b.assignedVehicleId === v.id);
    const revenue = bookings.reduce((s, b) => s + b.totalAmount, 0);
    return { id: v.id, name: v.name, revenue, trips: bookings.length };
  }).sort((a, b) => b.revenue - a.revenue);
  const mostUsed = vehRevenue[0];
  const leastUsed = vehRevenue[vehRevenue.length - 1];
  const avgRevenue = vehRevenue.length > 0 ? vehRevenue.reduce((s, v) => s + v.revenue, 0) / vehRevenue.length : 0;

  // Expiring soon (within 30 days)
  const thirtyDays = new Date(Date.now() + 30 * 86400000).toISOString();
  const expiringInsurance = vehicles.filter((v) => v.insuranceExpiry < thirtyDays && v.insuranceExpiry > new Date().toISOString());
  const expiringRegistration = vehicles.filter((v) => v.registrationExpiry < thirtyDays && v.registrationExpiry > new Date().toISOString());
  const dueForMaintenance = vehicles.filter((v) => v.nextServiceDue && v.nextServiceDue < thirtyDays && v.nextServiceDue > new Date().toISOString());

  // Status distribution for pie chart
  const statusDist = Object.entries(
    vehicles.reduce<Record<string, number>>((acc, v) => { acc[v.status] = (acc[v.status] || 0) + 1; return acc; }, {})
  ).map(([name, value]) => ({ name: VEHICLE_STATUS_LABEL[name] || name, value, color: STATUS_COLORS[name] || "#94a3b8" }));

  // Monthly mileage (mock)
  const mileageData = [
    { month: "Jan", mileage: 8500 }, { month: "Feb", mileage: 9200 }, { month: "Mar", mileage: 7800 },
    { month: "Apr", mileage: 10500 }, { month: "May", mileage: 8900 }, { month: "Jun", mileage: 11200 },
  ];

  // Maintenance costs (mock)
  const maintCostData = [
    { month: "Jan", cost: 3200 }, { month: "Feb", cost: 1800 }, { month: "Mar", cost: 4500 },
    { month: "Apr", cost: 2100 }, { month: "May", cost: 3800 }, { month: "Jun", cost: 5200 },
  ];

  // Selected vehicle
  const selected = vehicles.find((v) => v.id === selectedId) || null;
  const vehBookings = selectedId ? allBookings.filter((b) => b.assignedVehicleId === selectedId) : [];
  const vehMaint = selectedId ? maintRecords.filter((m) => m.vehicleId === selectedId) : [];
  const vehRevenueTotal = vehBookings.reduce((s, b) => s + b.totalAmount, 0);

  // Vehicle timeline events
  const vehTimeline: TimelineEvent[] = selectedId ? [
    ...vehBookings.slice(0, 5).map((b): TimelineEvent => ({
      id: `tl_b_${b.id}`, type: "trip_completed" as TimelineEventType, title: `Trip ${b.bookingNumber}`,
      description: `${b.pickup.address.city} → ${b.dropoff.address.city}`,
      timestamp: b.scheduledPickupAt,
      metadata: { revenue: fmt$(b.totalAmount), passenger: b.customerId, status: b.status },
    })),
    ...vehMaint.slice(0, 5).map((m): TimelineEvent => ({
      id: `tl_m_${m.id}`, type: m.status === "completed" ? "maintenance_completed" : "maintenance",
      title: m.type.replace(/_/g, " "), description: m.description,
      timestamp: m.scheduledDate,
      metadata: { cost: fmt$(m.cost), vendor: m.vendor || "N/A", mileage: m.mileageAtService ? `${m.mileageAtService.toLocaleString()} km` : "N/A" },
    })),
    ...(selected ? [{
      id: `tl_reg`, type: "registration_renewed" as TimelineEventType, title: "Registration Renewed",
      description: `Expires ${new Date(selected.registrationExpiry).toLocaleDateString()}`,
      timestamp: selected.registrationExpiry,
    }] : []),
    ...(selected && selected.assignedDriverId ? [{
      id: `tl_drv`, type: "driver_assigned" as TimelineEventType, title: `Driver Assigned: ${drivers[selected.assignedDriverId]?.fullName || "Driver"}`,
      description: "Primary chauffeur assignment", timestamp: selected.updatedAt,
    }] : []),
  ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()) : [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div><h1 className="text-2xl font-bold text-neutral-800">Fleet Management</h1><p className="text-sm text-neutral-400">{total} vehicles · {available} available · {onTrip} on trip</p></div>
        <div className="flex gap-2"><Button variant="outline" size="md" icon={<Download className="h-4 w-4" />}>Export</Button><Button variant="primary" size="md" icon={<Plus className="h-4 w-4" />}>Add Vehicle</Button></div>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
        <StatCard label="Total Vehicles" value={String(total)} icon={<Car className="h-5 w-5" />} color="brand" />
        <StatCard label="Available" value={String(available)} color="success" />
        <StatCard label="On Trip" value={String(onTrip)} color="info" />
        <StatCard label="Utilization" value={`${utilization}%`} trend={utilization > 70 ? "up" : "down"} trendValue="vs last month" color="gold" />
        <StatCard label="Maintenance" value={String(inMaint)} color="warning" />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card padding="md" className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div><h2 className="text-base font-bold text-neutral-800">Fleet Mileage</h2><p className="text-xs text-neutral-400">Total monthly distance across fleet</p></div>
            <Badge variant="info">Last 6 months</Badge>
          </div>
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={mileageData}>
              <defs><linearGradient id="mileG" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#4263eb" stopOpacity={0.12} /><stop offset="100%" stopColor="#4263eb" stopOpacity={0} /></linearGradient></defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" /><XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#94a3b8" }} /><YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#94a3b8" }} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
              <Tooltip {...chartTooltip} /><Area type="monotone" dataKey="mileage" stroke="#4263eb" strokeWidth={2.5} fill="url(#mileG)" dot={{ fill: "#4263eb", r: 3 }} />
            </AreaChart>
          </ResponsiveContainer>
        </Card>

        <Card padding="md">
          <h2 className="text-base font-bold text-neutral-800 mb-4">Status Distribution</h2>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart><Pie data={statusDist} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={2} dataKey="value">{statusDist.map((s, i) => <Cell key={i} fill={s.color} />)}</Pie></PieChart>
          </ResponsiveContainer>
          <div className="space-y-1.5 mt-2">{statusDist.map((s) => <div key={s.name} className="flex items-center justify-between text-xs"><div className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full" style={{ background: s.color }} /><span className="text-neutral-600">{s.name}</span></div><span className="font-semibold text-neutral-700">{s.value}</span></div>)}</div>
        </Card>
      </div>

      {/* Second Charts Row */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card padding="md">
          <div className="flex items-center justify-between mb-4"><div><h2 className="text-base font-bold text-neutral-800">Maintenance Costs</h2><p className="text-xs text-neutral-400">Monthly fleet maintenance spend</p></div><Badge variant="warning">Total: ${maintCostData.reduce((s, m) => s + m.cost, 0).toLocaleString()}</Badge></div>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={maintCostData}><CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" /><XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#94a3b8" }} /><YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#94a3b8" }} tickFormatter={(v) => `$${(v / 1000).toFixed(1)}k`} /><Tooltip {...chartTooltip} /><Bar dataKey="cost" fill="#f59e0b" radius={[6, 6, 0, 0]} barSize={28} /></BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Revenue per Vehicle */}
        <Card padding="md">
          <div className="flex items-center justify-between mb-4"><div><h2 className="text-base font-bold text-neutral-800">Revenue Per Vehicle</h2><p className="text-xs text-neutral-400">Avg ${Math.round(avgRevenue).toLocaleString()}/vehicle</p></div></div>
          <div className="space-y-2">
            {vehRevenue.slice(0, 6).map((v, i) => (
              <div key={v.id} className="flex items-center gap-3 rounded-lg p-2 hover:bg-neutral-25 transition-colors cursor-pointer" onClick={() => setSelectedId(v.id)}>
                <span className={["text-xs font-bold w-5", i === 0 ? "text-gold-500" : i === 1 ? "text-neutral-400" : "text-neutral-300"].join(" ")}>#{i + 1}</span>
                <div className="flex-1 min-w-0"><p className="text-sm font-semibold text-neutral-800 truncate">{v.name}</p><p className="text-xs text-neutral-400">{v.trips} trips</p></div>
                <div className="text-right"><p className="text-sm font-bold text-neutral-700">{fmt$(v.revenue)}</p><div className="h-1.5 w-20 rounded-full bg-neutral-100 mt-0.5 overflow-hidden"><div className="h-full rounded-full bg-brand-600" style={{ width: `${mostUsed ? Math.round((v.revenue / mostUsed.revenue) * 100) : 0}%` }} /></div></div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Alerts Section */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card padding="md" className={expiringInsurance.length ? "border-danger-200 bg-danger-50/30" : ""}>
          <div className="flex items-center gap-2 mb-3"><AlertTriangle className={["h-4 w-4", expiringInsurance.length ? "text-danger-500" : "text-neutral-400"].join(" ")} /><h3 className="text-sm font-bold text-neutral-800">Insurance Expiring</h3></div>
          {expiringInsurance.length ? expiringInsurance.map((v) => <div key={v.id} className="flex items-center justify-between py-1.5 text-xs"><span className="font-semibold text-neutral-700">{v.name}</span><span className="text-danger-600">{new Date(v.insuranceExpiry).toLocaleDateString()}</span></div>) : <p className="text-xs text-neutral-400 py-2">All insurance up to date ✓</p>}
        </Card>
        <Card padding="md" className={expiringRegistration.length ? "border-warning-200 bg-warning-50/30" : ""}>
          <div className="flex items-center gap-2 mb-3"><FileText className={["h-4 w-4", expiringRegistration.length ? "text-warning-500" : "text-neutral-400"].join(" ")} /><h3 className="text-sm font-bold text-neutral-800">Registration Expiring</h3></div>
          {expiringRegistration.length ? expiringRegistration.map((v) => <div key={v.id} className="flex items-center justify-between py-1.5 text-xs"><span className="font-semibold text-neutral-700">{v.name}</span><span className="text-warning-600">{new Date(v.registrationExpiry).toLocaleDateString()}</span></div>) : <p className="text-xs text-neutral-400 py-2">All registrations current ✓</p>}
        </Card>
        <Card padding="md" className={dueForMaintenance.length ? "border-info-200 bg-info-50/30" : ""}>
          <div className="flex items-center gap-2 mb-3"><Wrench className={["h-4 w-4", dueForMaintenance.length ? "text-info-500" : "text-neutral-400"].join(" ")} /><h3 className="text-sm font-bold text-neutral-800">Service Due</h3></div>
          {dueForMaintenance.length ? dueForMaintenance.map((v) => <div key={v.id} className="flex items-center justify-between py-1.5 text-xs"><span className="font-semibold text-neutral-700">{v.name}</span><span className="text-info-600">{v.nextServiceDue ? new Date(v.nextServiceDue).toLocaleDateString() : "—"}</span></div>) : <p className="text-xs text-neutral-400 py-2">No service due soon ✓</p>}
        </Card>
      </div>

      {/* Vehicle List with Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <SearchInput placeholder="Search by plate, VIN, vehicle name, model..." value={search} onChange={(e) => setSearch(e.target.value)} onClear={() => setSearch("")} containerClassName="flex-1 max-w-md" />
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="rounded-lg border border-neutral-200 px-3 py-2 text-xs bg-white font-medium">
          <option value="all">All Statuses</option>
          {Object.entries(VEHICLE_STATUS_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
        <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className="rounded-lg border border-neutral-200 px-3 py-2 text-xs bg-white font-medium">
          <option value="all">All Categories</option><option value="suv">SUV</option><option value="sedan">Sedan</option><option value="van">Van/Sprinter</option><option value="limo">Stretch/Executive</option>
        </select>
        <Button variant="outline" size="sm" icon={<Filter className="h-3.5 w-3.5" />} onClick={() => { setStatusFilter("all"); setCategoryFilter("all"); setSearch(""); }}>Clear</Button>
        <span className="text-xs text-neutral-400 ml-auto">{filtered.length} vehicles found</span>
      </div>

      {/* Vehicle Card Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {isLoading ? Array.from({ length: 8 }).map((_, i) => <CardSkeleton key={i} />) : filtered.length === 0 ? (
          <div className="col-span-full text-center py-12"><p className="text-sm text-neutral-400">No vehicles match your filters</p></div>
        ) : filtered.map((v) => {
          const driver = v.assignedDriverId ? drivers[v.assignedDriverId] : null;
          const vehBook = allBookings.filter((b) => b.assignedVehicleId === v.id);
          const vehRev = vehBook.reduce((s, b) => s + b.totalAmount, 0);
          const expSoon = new Date(v.insuranceExpiry) < new Date(Date.now() + 30 * 86400000);
          return (
            <Card key={v.id} hover padding="md" onClick={() => setSelectedId(v.id)} className="cursor-pointer relative">
              {expSoon && <div className="absolute top-3 right-3"><Badge variant="danger" dot>Expiring</Badge></div>}
              <div className="flex items-start justify-between mb-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50 text-brand-700"><Car className="h-5 w-5" /></div>
                <StatusChip status={VEHICLE_STATUS_LABEL[v.status] || v.status} />
              </div>
              <h3 className="text-base font-bold text-neutral-800">{v.name}</h3>
              <p className="text-xs text-neutral-400 mt-0.5">{v.year} {v.make} {v.model} · {v.plate}</p>
              <div className="mt-3 space-y-1 text-xs text-neutral-500">
                <div className="flex items-center gap-2"><Gauge className="h-3.5 w-3.5 text-neutral-400" />{v.mileage.toLocaleString()} km</div>
                <div className="flex items-center gap-2"><Fuel className="h-3.5 w-3.5 text-neutral-400" />{v.fuelLevel}% · {v.fuelType}</div>
                <div className="flex items-center gap-2"><DollarSign className="h-3.5 w-3.5 text-neutral-400" />{fmt$(vehRev)} · {vehBook.length} trips</div>
              </div>
              <div className="mt-3 pt-3 border-t border-neutral-100 flex items-center justify-between text-xs">
                <span className="text-neutral-400">Driver: <span className="font-semibold text-neutral-700">{driver?.fullName || "Unassigned"}</span></span>
                <span className="text-neutral-400">Seats: <span className="font-semibold text-neutral-700">{v.seats}</span></span>
              </div>
            </Card>
          );
        })}
      </div>

      {/* ── Vehicle Detail Slide-Over ── */}
      <SlideOver open={!!selected} onClose={() => setSelectedId(null)}
        title={selected?.name || ""} subtitle={selected ? `${selected.year} ${selected.make} ${selected.model} · ${selected.plate}` : ""} width="xl"
        footer={
          <div className="flex gap-2 w-full justify-between">
            <Button variant="destructive" size="sm">Decommission</Button>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => setSelectedId(null)}>Close</Button>
              <Button variant="primary" size="sm">Edit Vehicle</Button>
            </div>
          </div>
        }>
        {selected && (() => { const v = selected; const driver = v.assignedDriverId ? drivers[v.assignedDriverId] : null; return (
          <div className="space-y-6">
            {/* Identity Card */}
            <div className="flex items-start gap-5 p-5 rounded-xl bg-neutral-25 border border-neutral-100">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-brand-100 text-brand-700"><Car className="h-7 w-7" /></div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap"><h3 className="text-lg font-bold text-neutral-800">{v.name}</h3><StatusChip status={VEHICLE_STATUS_LABEL[v.status] || v.status} /></div>
                <p className="text-xs text-neutral-500 mt-1">{v.year} {v.make} {v.model} · {v.color} · VIN: <span className="font-mono">{v.vin}</span></p>
                <div className="grid grid-cols-4 gap-3 mt-3">
                  <div className="text-center p-2 rounded-lg bg-white"><p className="text-[10px] text-neutral-400 uppercase">Mileage</p><p className="text-sm font-bold text-neutral-800">{v.mileage.toLocaleString()} km</p></div>
                  <div className="text-center p-2 rounded-lg bg-white"><p className="text-[10px] text-neutral-400 uppercase">Trips</p><p className="text-sm font-bold text-neutral-800">{vehBookings.length}</p></div>
                  <div className="text-center p-2 rounded-lg bg-white"><p className="text-[10px] text-neutral-400 uppercase">Revenue</p><p className="text-sm font-bold text-neutral-800">{fmt$(vehRevenueTotal)}</p></div>
                  <div className="text-center p-2 rounded-lg bg-white"><p className="text-[10px] text-neutral-400 uppercase">Fuel</p><p className="text-sm font-bold text-neutral-800">{v.fuelLevel}%</p></div>
                </div>
              </div>
            </div>

            <Tabs tabs={[
              { id: "overview", label: "Overview" },
              { id: "documents", label: "Documents" },
              { id: "maintenance", label: "Maintenance", count: vehMaint.length },
              { id: "timeline", label: "Timeline" },
              { id: "photos", label: "Photos" },
            ]} onChange={setDetailTab} />

            <div className="min-h-[300px]">
              {detailTab === "overview" && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <Card padding="md"><h4 className="text-xs font-bold text-neutral-500 uppercase mb-3">Vehicle Information</h4>
                      <Info label="Make/Model" value={`${v.make} ${v.model}`} /><Info label="Year" value={String(v.year)} /><Info label="Color" value={v.color} />
                      <Info label="Plate" value={v.plate} /><Info label="VIN" value={v.vin} mono /><Info label="Category" value={v.type.replace(/_/g, " ")} />
                      <Info label="Fuel Type" value={v.fuelType} /><Info label="Seats" value={String(v.seats)} /><Info label="Luggage" value={`${v.luggageCapacity} bags`} />
                    </Card>
                    <Card padding="md"><h4 className="text-xs font-bold text-neutral-500 uppercase mb-3">Registration & Insurance</h4>
                      <Info label="Registration Exp." value={new Date(v.registrationExpiry).toLocaleDateString()} urgent={new Date(v.registrationExpiry) < new Date(Date.now() + 30 * 86400000)} />
                      <Info label="Insurance Exp." value={new Date(v.insuranceExpiry).toLocaleDateString()} urgent={new Date(v.insuranceExpiry) < new Date(Date.now() + 30 * 86400000)} />
                      <Info label="Last Service" value={v.lastServiceAt ? new Date(v.lastServiceAt).toLocaleDateString() : "—"} />
                      <Info label="Last Mileage" value={v.lastServiceMileage ? `${v.lastServiceMileage.toLocaleString()} km` : "—"} />
                      <Info label="Next Service Due" value={v.nextServiceDue ? new Date(v.nextServiceDue).toLocaleDateString() : "—"} />
                      <Info label="Next Mileage" value={v.nextServiceMileage ? `${v.nextServiceMileage.toLocaleString()} km` : "—"} />
                    </Card>
                  </div>
                  <Card padding="md"><h4 className="text-xs font-bold text-neutral-500 uppercase mb-3">Financial</h4>
                    <div className="grid grid-cols-3 gap-3">
                      <div className="p-3 rounded-lg bg-neutral-50 text-center"><p className="text-[10px] text-neutral-400">Purchase Price</p><p className="text-sm font-bold">{fmt$(v.purchasePrice)}</p></div>
                      <div className="p-3 rounded-lg bg-neutral-50 text-center"><p className="text-[10px] text-neutral-400">Current Value</p><p className="text-sm font-bold">{fmt$(v.currentValue)}</p></div>
                      <div className="p-3 rounded-lg bg-neutral-50 text-center"><p className="text-[10px] text-neutral-400">Depreciation</p><p className="text-sm font-bold">{(v.depreciationRate * 100).toFixed(0)}%/yr</p></div>
                    </div>
                  </Card>
                  <Card padding="md"><h4 className="text-xs font-bold text-neutral-500 uppercase mb-2">Amenities</h4>
                    <div className="flex flex-wrap gap-1.5">{v.amenities.length ? v.amenities.map((a) => <Badge key={a} variant="neutral">{a}</Badge>) : <span className="text-xs text-neutral-400">None listed</span>}</div>
                  </Card>
                  {driver && <Card padding="md"><h4 className="text-xs font-bold text-neutral-500 uppercase mb-2">Assigned Driver</h4>
                    <div className="flex items-center gap-3"><Avatar name={driver.fullName} size="md" /><div><p className="text-sm font-bold text-neutral-800">{driver.fullName}</p><p className="text-xs text-neutral-400">{driver.phone} · ⭐{driver.rating} · {driver.totalTrips} trips</p></div></div></Card>}
                </div>
              )}

              {detailTab === "documents" && (
                <div className="space-y-3">
                  <div className="flex justify-between mb-2"><h4 className="text-sm font-bold text-neutral-700">Vehicle Documents</h4><Button variant="outline" size="sm" icon={<Plus className="h-3.5 w-3.5" />}>Upload</Button></div>
                  <DocCard icon={Shield} title="Insurance Certificate" expiry={v.insuranceExpiry} urgent={new Date(v.insuranceExpiry) < new Date(Date.now() + 30 * 86400000)} />
                  <DocCard icon={FileText} title="Vehicle Registration" expiry={v.registrationExpiry} urgent={new Date(v.registrationExpiry) < new Date(Date.now() + 30 * 86400000)} />
                  <DocCard icon={FileText} title="Lease Agreement" expiry={null} />
                  <DocCard icon={Shield} title="Warranty Certificate" expiry={null} />
                  <DocCard icon={Gauge} title="Last Inspection Report" expiry={v.lastServiceAt || null} />
                </div>
              )}

              {detailTab === "maintenance" && (
                <div className="space-y-3">
                  <div className="flex justify-between mb-2"><h4 className="text-sm font-bold text-neutral-700">Service History</h4><Button variant="outline" size="sm" icon={<Plus className="h-3.5 w-3.5" />}>Schedule</Button></div>
                  {vehMaint.length ? vehMaint.map((m) => (
                    <div key={m.id} className="rounded-xl border border-neutral-100 p-4 hover:bg-neutral-25 transition-colors">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2"><Wrench className="h-4 w-4 text-neutral-500" /><span className="text-sm font-bold text-neutral-800 capitalize">{m.type.replace(/_/g, " ")}</span></div>
                        <StatusChip status={m.status.replace(/_/g, " ")} />
                      </div>
                      <p className="text-xs text-neutral-500 mb-2">{m.description}</p>
                      <div className="grid grid-cols-3 gap-2 text-xs">
                        <div><span className="text-neutral-400">Date:</span> <span className="font-semibold text-neutral-700">{new Date(m.scheduledDate).toLocaleDateString()}</span></div>
                        <div><span className="text-neutral-400">Cost:</span> <span className="font-semibold text-neutral-700">{fmt$(m.cost)}</span></div>
                        <div><span className="text-neutral-400">Vendor:</span> <span className="font-semibold text-neutral-700">{m.vendor || "—"}</span></div>
                        {m.mileageAtService && <div><span className="text-neutral-400">Mileage:</span> <span className="font-semibold text-neutral-700">{m.mileageAtService.toLocaleString()} km</span></div>}
                      </div>
                      {m.parts.length > 0 && <div className="mt-2 pt-2 border-t border-neutral-100"><p className="text-[10px] font-semibold text-neutral-400 uppercase mb-1">Parts</p><div className="flex flex-wrap gap-1">{m.parts.map((p, i) => <Badge key={i} variant="neutral">{p.name} x{p.quantity}</Badge>)}</div></div>}
                    </div>
                  )) : <p className="text-sm text-neutral-400 text-center py-8">No maintenance records yet</p>}
                </div>
              )}

              {detailTab === "timeline" && <VehicleTimeline events={vehTimeline} />}

              {detailTab === "photos" && (
                <div className="space-y-4">
                  <div className="flex justify-between"><h4 className="text-sm font-bold text-neutral-700">Photo Gallery</h4><Button variant="outline" size="sm" icon={<Camera className="h-3.5 w-3.5" />}>Add Photo</Button></div>
                  {v.photos?.length ? (
                    <div className="grid grid-cols-3 gap-3">{v.photos.map((url, i) => <div key={i} className="aspect-video rounded-xl bg-neutral-100 overflow-hidden"><img src={url} alt={`${v.name} photo ${i + 1}`} className="w-full h-full object-cover" /></div>)}</div>
                  ) : (
                    <div className="text-center py-16 border-2 border-dashed border-neutral-200 rounded-xl">
                      <Camera className="mx-auto h-10 w-10 text-neutral-300" />
                      <p className="mt-2 text-sm font-medium text-neutral-400">No photos yet</p>
                      <p className="text-xs text-neutral-300 mt-0.5">Upload vehicle photos to track condition</p>
                      <Button variant="outline" size="sm" className="mt-3" icon={<Plus className="h-3.5 w-3.5" />}>Upload Photos</Button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        ); })()}
      </SlideOver>
    </div>
  );
}

function Info({ label, value, mono, urgent }: { label: string; value: string; mono?: boolean; urgent?: boolean }) {
  return <div className="flex items-start justify-between py-2 border-b border-neutral-50 last:border-0 gap-4"><span className="text-xs font-medium text-neutral-400 shrink-0">{label}</span><span className={["text-xs text-right font-semibold", mono && "font-mono", urgent ? "text-danger-600" : "text-neutral-700"].join(" ")}>{value}</span></div>;
}

function DocCard({ icon: Icon, title, expiry, urgent }: { icon: LucideIcon; title: string; expiry: string | null; urgent?: boolean }) {
  return (
    <div className={["flex items-center justify-between rounded-xl border p-4 hover:bg-neutral-25 transition-colors", urgent ? "border-danger-200 bg-danger-50/30" : "border-neutral-100"].join(" ")}>
      <div className="flex items-center gap-3">
        <div className={["flex h-9 w-9 items-center justify-center rounded-lg", urgent ? "bg-danger-100 text-danger-600" : "bg-neutral-100 text-neutral-500"].join(" ")}><Icon className="h-4 w-4" /></div>
        <div><p className="text-sm font-semibold text-neutral-800">{title}</p>{expiry ? <p className="text-xs text-neutral-400">Expires {new Date(expiry).toLocaleDateString()}</p> : <p className="text-xs text-neutral-400">No expiration</p>}</div>
      </div>
      <div className="flex items-center gap-3">
        {urgent && <Badge variant="danger">Expiring Soon</Badge>}
        <Button variant="ghost" size="sm">View</Button>
      </div>
    </div>
  );
}

"use client";

import { useState, useMemo } from "react";
import {
  Plus, Search, Download, Star, Phone, Mail, MapPin, Car, CalendarDays, Clock,
  Shield, FileText, AlertTriangle, CheckCircle2, Award, TrendingUp,
  DollarSign, Briefcase, Plane, User, Users, Filter, ChevronRight,
  BarChart3, Gauge, type LucideIcon,
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
import { TableRowSkeleton, CardSkeleton } from "@/components/ui/skeleton";
import { useApi, usePaginatedApi } from "@/lib/hooks/use-api";
import { db, queryAll } from "@/lib/db/store";
import { DriverTimeline, type DriverTimelineEvent, type DriverTimelineType } from "@/components/drivers/driver-timeline";
import type { DriverWithRelations, Booking, PaginatedResponse } from "@/lib/types";
import {
  BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";

const ORG = "org_demo001";
const chartTooltip = { contentStyle: { borderRadius: "12px", border: "1px solid #e2e8f0", boxShadow: "0 10px 25px rgba(0,0,0,0.08)", background: "#fff", padding: "10px 14px", fontSize: "13px" } };

const AVAIL_LABEL: Record<string, string> = {
  available: "Available", on_trip: "Driving", off_duty: "Offline", on_break: "Break",
  vacation: "Vacation", sick_leave: "Sick Leave", suspended: "Suspended", unavailable: "Unavailable",
};
const AVAIL_COLORS: Record<string, string> = {
  available: "#10b981", on_trip: "#3b82f6", off_duty: "#94a3b8", on_break: "#f59e0b",
  vacation: "#8b5cf6", sick_leave: "#ef4444", suspended: "#dc2626", unavailable: "#6b7280",
};
function fmt$(n: number) { return `$${n.toLocaleString(undefined, { minimumFractionDigits: 2 })}`; }
function fmtDays(d: string): string { const diff = new Date(d).getTime() - Date.now(); const days = Math.ceil(diff / 86400000); return days <= 0 ? "EXPIRED" : days <= 30 ? `${days}d` : `${Math.floor(days / 30)}mo`; }

export default function ChauffeurDashboard() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [detailTab, setDetailTab] = useState("overview");

  const { data, isLoading } = usePaginatedApi<DriverWithRelations>("/api/drivers", 1, 100);
  const drivers = data?.data || [];
  const vehicles = Object.fromEntries(queryAll(db.vehicles, ORG).map((v) => [v.id, v]));
  const allBookings = queryAll(db.bookings, ORG);

  // Filters
  let filtered = drivers;
  if (search) { const s = search.toLowerCase(); filtered = filtered.filter((d) => d.fullName.toLowerCase().includes(s) || d.phone.includes(s) || d.email.toLowerCase().includes(s) || d.licenseNumber.toLowerCase().includes(s)); }
  if (statusFilter !== "all") filtered = filtered.filter((d) => d.status === statusFilter);

  // KPIs
  const total = drivers.length;
  const available = drivers.filter((d) => d.status === "available").length;
  const onTrip = drivers.filter((d) => d.status === "on_trip").length;
  const offDuty = drivers.filter((d) => ["off_duty", "vacation", "sick_leave"].includes(d.status)).length;
  const avgRating = drivers.length > 0 ? drivers.reduce((s, d) => s + d.rating, 0) / drivers.length : 0;
  const avgCompletion = drivers.length > 0 ? Math.round(drivers.reduce((s, d) => s + d.completionRate, 0) / drivers.length * 100) : 0;

  // License expirations within 90 days
  const ninetyDays = new Date(Date.now() + 90 * 86400000).toISOString();
  const expiringLicenses = drivers.filter((d) => d.licenseExpiry < ninetyDays && new Date(d.licenseExpiry) > new Date());
  const expiringMedical = drivers.filter((d) => d.medicalExpiry && d.medicalExpiry < ninetyDays && new Date(d.medicalExpiry) > new Date());
  const expiringInsurance = drivers.filter((d) => d.insuranceExpiry && d.insuranceExpiry < ninetyDays && new Date(d.insuranceExpiry) > new Date());

  // Top performers
  const topByTrips = [...drivers].sort((a, b) => b.totalTrips - a.totalTrips).slice(0, 6);
  const topByRevenue = [...drivers].sort((a, b) => b.totalRevenue - a.totalRevenue).slice(0, 6);
  const topByRating = [...drivers].sort((a, b) => b.rating - a.rating).slice(0, 6);

  // Availability distribution
  const availDist = Object.entries(
    drivers.reduce<Record<string, number>>((acc, d) => { acc[d.status] = (acc[d.status] || 0) + 1; return acc; }, {})
  ).map(([name, value]) => ({ name: AVAIL_LABEL[name] || name, value, color: AVAIL_COLORS[name] || "#94a3b8" }));

  // Performance chart data
  const perfData = topByRating.slice(0, 6).map((d) => ({ name: d.fullName.split(" ")[0], rating: d.rating, trips: d.totalTrips }));

  // Selected driver
  const selected = drivers.find((d) => d.id === selectedId) || null;
  const drvBookings = selectedId ? allBookings.filter((b) => b.assignedDriverId === selectedId) : [];
  const drvUpcoming = drvBookings.filter((b) => ["confirmed", "assigned", "pending_confirmation"].includes(b.status)).sort((a, b) => new Date(a.scheduledPickupAt).getTime() - new Date(b.scheduledPickupAt).getTime());
  const drvCompleted = drvBookings.filter((b) => b.status === "completed").length;
  const drvCancelled = drvBookings.filter((b) => b.status === "cancelled").length;
  const drvRevenue = drvBookings.reduce((s, b) => s + b.totalAmount, 0);

  // Driver timeline
  const drvTimeline: DriverTimelineEvent[] = selected ? [
    ...drvBookings.slice(0, 5).map((b) => ({
      id: `t_${b.id}`, type: "trip_completed" as DriverTimelineType,
      title: `Trip ${b.bookingNumber}`, description: `${b.pickup.address.city} → ${b.dropoff.address.city}`,
      timestamp: b.scheduledPickupAt, metadata: { revenue: fmt$(b.totalAmount), status: b.status, passenger: b.customerId },
    })),
    ...(selected ? [{ id: "tl_hired", type: "hired" as DriverTimelineType, title: "Hired", description: `Joined Royal Limousine`, timestamp: selected.hiredAt }] : []),
    ...(selected ? [{ id: "tl_lic", type: "license_renewed" as DriverTimelineType, title: "License on File", description: `${selected.licenseClass} — Expires ${new Date(selected.licenseExpiry).toLocaleDateString()}`, timestamp: selected.licenseExpiry, metadata: { license: selected.licenseNumber, class: selected.licenseClass } }] : []),
  ] : [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div><h1 className="text-2xl font-bold text-neutral-800">Chauffeur Management</h1><p className="text-sm text-neutral-400">{total} chauffeurs · {available} available · {onTrip} driving</p></div>
        <div className="flex gap-2"><Button variant="outline" size="md" icon={<Download className="h-4 w-4" />}>Export</Button><Button variant="primary" size="md" icon={<Plus className="h-4 w-4" />}>Add Chauffeur</Button></div>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
        <StatCard label="Total Chauffeurs" value={String(total)} icon={<Users className="h-5 w-5" />} color="brand" />
        <StatCard label="Available" value={String(available)} color="success" />
        <StatCard label="On Trip" value={String(onTrip)} color="info" />
        <StatCard label="Avg Rating" value={avgRating.toFixed(2)} trend="up" trendValue="0.3" color="gold" />
        <StatCard label="Completion" value={`${avgCompletion}%`} color="warning" />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card padding="md" className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4"><div><h2 className="text-base font-bold text-neutral-800">Top Performers</h2><p className="text-xs text-neutral-400">By rating and trip count</p></div></div>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={perfData} layout="vertical"><CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" /><XAxis type="number" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#94a3b8" }} /><YAxis type="category" dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#64748b" }} width={60} /><Tooltip {...chartTooltip} /><Bar dataKey="rating" fill="#d4af37" radius={[0, 4, 4, 0]} barSize={16} name="Rating" /><Bar dataKey="trips" fill="#4263eb" radius={[0, 4, 4, 0]} barSize={16} name="Trips" /></BarChart>
          </ResponsiveContainer>
        </Card>

        <Card padding="md">
          <h2 className="text-base font-bold text-neutral-800 mb-4">Availability</h2>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart><Pie data={availDist} cx="50%" cy="50%" innerRadius={45} outerRadius={75} paddingAngle={2} dataKey="value">{availDist.map((s, i) => <Cell key={i} fill={s.color} />)}</Pie></PieChart>
          </ResponsiveContainer>
          <div className="space-y-1 mt-2">{availDist.map((s) => <div key={s.name} className="flex items-center justify-between text-xs"><div className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full" style={{ background: s.color }} /><span className="text-neutral-600">{s.name}</span></div><span className="font-semibold text-neutral-700">{s.value}</span></div>)}</div>
        </Card>
      </div>

      {/* Alert Panels */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <AlertPanel icon={FileText} title="License Expiring" items={expiringLicenses.map((d) => ({ name: d.fullName, date: d.licenseExpiry, detail: d.licenseClass }))} color="danger" />
        <AlertPanel icon={Shield} title="Medical Expiring" items={expiringMedical.map((d) => ({ name: d.fullName, date: d.medicalExpiry!, detail: "" }))} color="warning" />
        <AlertPanel icon={Shield} title="Insurance Expiring" items={expiringInsurance.map((d) => ({ name: d.fullName, date: d.insuranceExpiry!, detail: "" }))} color="info" />
      </div>

      {/* Top Performers Cards */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card padding="md"><h3 className="text-sm font-bold text-neutral-800 mb-3 flex items-center gap-1.5"><Award className="h-4 w-4 text-gold-500" />Most Trips</h3><div className="space-y-2">{topByTrips.slice(0, 4).map((d, i) => <PerformerRow key={d.id} rank={i + 1} driver={d} value={`${d.totalTrips} trips`} />)}</div></Card>
        <Card padding="md"><h3 className="text-sm font-bold text-neutral-800 mb-3 flex items-center gap-1.5"><DollarSign className="h-4 w-4 text-success-500" />Top Revenue</h3><div className="space-y-2">{topByRevenue.slice(0, 4).map((d, i) => <PerformerRow key={d.id} rank={i + 1} driver={d} value={fmt$(d.totalRevenue)} />)}</div></Card>
        <Card padding="md"><h3 className="text-sm font-bold text-neutral-800 mb-3 flex items-center gap-1.5"><Star className="h-4 w-4 text-gold-500" />Highest Rated</h3><div className="space-y-2">{topByRating.slice(0, 4).map((d, i) => <PerformerRow key={d.id} rank={i + 1} driver={d} value={`⭐${d.rating.toFixed(1)}`} />)}</div></Card>
      </div>

      {/* Driver List with Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <SearchInput placeholder="Search by name, phone, email, license..." value={search} onChange={(e) => setSearch(e.target.value)} onClear={() => setSearch("")} containerClassName="flex-1 max-w-md" />
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="rounded-lg border border-neutral-200 px-3 py-2 text-xs bg-white font-medium">
          <option value="all">All Statuses</option>{Object.entries(AVAIL_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
        <Button variant="outline" size="sm" icon={<Filter className="h-3.5 w-3.5" />} onClick={() => { setSearch(""); setStatusFilter("all"); }}>Clear</Button>
        <span className="text-xs text-neutral-400 ml-auto">{filtered.length} chauffeurs</span>
      </div>

      {/* Driver Table */}
      <Card padding="none">
        <Table>
          <TableHead><TableRow>
            <TableHeaderCell>Chauffeur</TableHeaderCell><TableHeaderCell>Vehicle</TableHeaderCell><TableHeaderCell>License</TableHeaderCell><TableHeaderCell>Rating</TableHeaderCell><TableHeaderCell>Trips</TableHeaderCell><TableHeaderCell>Revenue</TableHeaderCell><TableHeaderCell>On-Time</TableHeaderCell><TableHeaderCell>Status</TableHeaderCell>
          </TableRow></TableHead>
          <TableBody>
            {isLoading ? Array.from({ length: 6 }).map((_, i) => <TableRowSkeleton key={i} cols={8} />) : filtered.length === 0 ? (
              <TableRow><td colSpan={8}><p className="text-center text-sm text-neutral-400 py-10">No chauffeurs found</p></td></TableRow>
            ) : filtered.map((d) => {
              const licExpSoon = new Date(d.licenseExpiry) < new Date(Date.now() + 30 * 86400000);
              return (
                <TableRow key={d.id} clickable onClick={() => setSelectedId(d.id)}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar name={d.fullName} size="md" />
                      <div><p className="font-semibold text-neutral-800 text-sm">{d.fullName}</p><p className="text-xs text-neutral-400">{d.phone}</p></div>
                    </div>
                  </TableCell>
                  <TableCell className="text-neutral-600 text-sm">{d.assignedVehicle?.name || "Unassigned"}</TableCell>
                  <TableCell className="text-neutral-500 text-xs">
                    {d.licenseClass}
                    {licExpSoon && <Badge variant="danger" className="ml-1">Expiring</Badge>}
                    <p className={licExpSoon ? "text-danger-600 font-semibold" : "text-neutral-400"}>Exp. {new Date(d.licenseExpiry).toLocaleDateString()}</p>
                  </TableCell>
                  <TableCell><div className="flex items-center gap-1 font-semibold text-neutral-700"><Star className="h-3.5 w-3.5 fill-gold-500 text-gold-500" />{d.rating.toFixed(1)}</div></TableCell>
                  <TableCell className="font-semibold text-neutral-700">{d.totalTrips}</TableCell>
                  <TableCell className="font-semibold text-neutral-700">{fmt$(d.totalRevenue)}</TableCell>
                  <TableCell className="font-semibold text-neutral-700">{Math.round(d.onTimeRate * 100)}%</TableCell>
                  <TableCell><StatusChip status={AVAIL_LABEL[d.status] || d.status} /></TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </Card>

      {/* ── Driver Detail Slide-Over ── */}
      <SlideOver open={!!selected} onClose={() => setSelectedId(null)}
        title={selected?.fullName || ""} subtitle={selected ? `${selected.totalTrips} trips · ⭐${selected.rating}` : ""} width="xl"
        footer={
          <div className="flex gap-2 w-full justify-between">
            <Button variant="destructive" size="sm">Suspend</Button>
            <div className="flex gap-2"><Button variant="outline" size="sm" onClick={() => setSelectedId(null)}>Close</Button><Button variant="primary" size="sm">Edit Profile</Button></div>
          </div>
        }>
        {selected && (() => { const d = selected; const drvVeh = d.assignedVehicleId ? vehicles[d.assignedVehicleId] : null; return (
          <div className="space-y-6">
            {/* Identity Card */}
            <div className="flex items-start gap-5 p-5 rounded-xl bg-neutral-25 border border-neutral-100">
              <Avatar name={d.fullName} size="xl" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap"><h3 className="text-lg font-bold text-neutral-800">{d.fullName}</h3><StatusChip status={AVAIL_LABEL[d.status] || d.status} /></div>
                <p className="text-xs text-neutral-500 mt-1">ID: {d.id.slice(-8).toUpperCase()} · Hired {new Date(d.hiredAt).toLocaleDateString()}</p>
                <div className="flex gap-3 mt-1.5 text-xs text-neutral-500">
                  <span className="flex items-center gap-1"><Phone className="h-3 w-3" />{d.phone}</span>
                  <span className="flex items-center gap-1"><Mail className="h-3 w-3" />{d.email}</span>
                </div>
                <div className="grid grid-cols-4 gap-2 mt-3">
                  <StatChip label="Trips" value={String(d.totalTrips)} />
                  <StatChip label="Revenue" value={fmt$(d.totalRevenue)} />
                  <StatChip label="Rating" value={`⭐${d.rating}`} />
                  <StatChip label="On-Time" value={`${Math.round(d.onTimeRate * 100)}%`} />
                </div>
              </div>
            </div>

            <Tabs tabs={[
              { id: "overview", label: "Profile" },
              { id: "documents", label: "Documents" },
              { id: "performance", label: "Performance" },
              { id: "bookings", label: "Bookings", count: drvBookings.length },
              { id: "schedule", label: "Schedule" },
              { id: "payroll", label: "Payroll" },
              { id: "timeline", label: "Timeline" },
            ]} onChange={setDetailTab} />

            <div className="min-h-[300px]">
              {detailTab === "overview" && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <Card padding="md"><h4 className="text-xs font-bold text-neutral-500 uppercase mb-3">Personal Info</h4>
                      <Info label="Full Name" value={d.fullName} /><Info label="Phone" value={d.phone} /><Info label="Email" value={d.email} />
                      <Info label="Languages" value={d.languages.join(", ")} /><Info label="Experience" value={`${d.yearsOfExperience} years`} />
                      <Info label="Certifications" value={d.certifications.length ? d.certifications.join(", ") : "None"} />
                    </Card>
                    <Card padding="md"><h4 className="text-xs font-bold text-neutral-500 uppercase mb-3">License & Compliance</h4>
                      <Info label="License Class" value={d.licenseClass} /><Info label="License Number" value={d.licenseNumber} />
                      <Info label="License Expiry" value={new Date(d.licenseExpiry).toLocaleDateString()} urgent={new Date(d.licenseExpiry) < new Date(Date.now() + 30 * 86400000)} />
                      {d.medicalExpiry && <Info label="Medical Expiry" value={new Date(d.medicalExpiry).toLocaleDateString()} urgent={new Date(d.medicalExpiry) < new Date(Date.now() + 30 * 86400000)} />}
                      {d.insuranceExpiry && <Info label="Insurance Expiry" value={new Date(d.insuranceExpiry).toLocaleDateString()} urgent={new Date(d.insuranceExpiry) < new Date(Date.now() + 30 * 86400000)} />}
                      <Info label="Assigned Vehicle" value={drvVeh ? `${drvVeh.name} (${drvVeh.plate})` : "None"} />
                    </Card>
                  </div>
                  <Card padding="md"><h4 className="text-xs font-bold text-neutral-500 uppercase mb-3">Emergency Contact</h4>
                    <div className="grid grid-cols-3 gap-3">
                      <div className="p-2 rounded-lg bg-neutral-50"><p className="text-[10px] text-neutral-400">Name</p><p className="text-sm font-semibold">{d.emergencyContact.name}</p></div>
                      <div className="p-2 rounded-lg bg-neutral-50"><p className="text-[10px] text-neutral-400">Phone</p><p className="text-sm font-semibold">{d.emergencyContact.phone}</p></div>
                      <div className="p-2 rounded-lg bg-neutral-50"><p className="text-[10px] text-neutral-400">Relationship</p><p className="text-sm font-semibold">{d.emergencyContact.relationship}</p></div>
                    </div>
                  </Card>
                </div>
              )}

              {detailTab === "documents" && (
                <div className="space-y-3">
                  <div className="flex justify-between mb-2"><h4 className="text-sm font-bold text-neutral-700">Required Documents</h4><Button variant="outline" size="sm" icon={<Plus className="h-3.5 w-3.5" />}>Upload</Button></div>
                  <DocCard icon={FileText} title="Driver License" expiry={d.licenseExpiry} urgent={new Date(d.licenseExpiry) < new Date(Date.now() + 30 * 86400000)} status="valid" />
                  {d.medicalExpiry && <DocCard icon={Shield} title="Medical Certificate" expiry={d.medicalExpiry} urgent={new Date(d.medicalExpiry) < new Date(Date.now() + 30 * 86400000)} status={new Date(d.medicalExpiry) > new Date() ? "valid" : "expired"} />}
                  {d.insuranceExpiry && <DocCard icon={Shield} title="Insurance Certificate" expiry={d.insuranceExpiry} urgent={new Date(d.insuranceExpiry) < new Date(Date.now() + 30 * 86400000)} status={new Date(d.insuranceExpiry) > new Date() ? "valid" : "expired"} />}
                  <DocCard icon={Shield} title="Background Check" expiry={null} status="valid" />
                  <DocCard icon={Award} title="Training Certificates" expiry={null} status="valid" />
                  <DocCard icon={Plane} title="Airport Permit" expiry={null} status="valid" />
                  <DocCard icon={FileText} title="Passport" expiry={null} status="valid" />
                  <DocCard icon={FileText} title="Visa / Work Authorization" expiry={null} status="valid" />
                </div>
              )}

              {detailTab === "performance" && (
                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-3">
                    <MetricCard label="Completed Trips" value={String(drvCompleted)} color="bg-success-50 text-success-700" />
                    <MetricCard label="Cancelled" value={String(drvCancelled)} color="bg-danger-50 text-danger-700" />
                    <MetricCard label="Revenue" value={fmt$(drvRevenue)} color="bg-brand-50 text-brand-700" />
                    <MetricCard label="Rating" value={`${d.rating.toFixed(1)} ⭐`} color="bg-gold-50 text-gold-700" />
                    <MetricCard label="Completion Rate" value={`${Math.round(d.completionRate * 100)}%`} color="bg-info-50 text-info-700" />
                    <MetricCard label="On-Time Rate" value={`${Math.round(d.onTimeRate * 100)}%`} color="bg-success-50 text-success-700" />
                    <MetricCard label="Trips This Month" value={String(d.metrics.tripsThisMonth)} color="bg-purple-50 text-purple-700" />
                    <MetricCard label="Hours/Week" value={String(d.metrics.hoursWorkedThisWeek)} color="bg-warning-50 text-warning-700" />
                    <MetricCard label="Complaints" value={String(d.metrics.complaints)} color={d.metrics.complaints > 0 ? "bg-danger-50 text-danger-700" : "bg-success-50 text-success-700"} />
                  </div>
                </div>
              )}

              {detailTab === "bookings" && (
                <div className="space-y-4">
                  {drvUpcoming.length > 0 && <div><h4 className="text-sm font-bold text-neutral-700 mb-2">Upcoming ({drvUpcoming.length})</h4><div className="space-y-2">{drvUpcoming.map((b) => <BookingCard key={b.id} booking={b} />)}</div></div>}
                  <div><h4 className="text-sm font-bold text-neutral-700 mb-2">All Trips ({drvBookings.length})</h4>
                    {drvBookings.length === 0 ? <p className="text-sm text-neutral-400 py-4">No trips assigned yet</p> :
                      <div className="space-y-2">{drvBookings.slice(0, 10).map((b) => <BookingCard key={b.id} booking={b} />)}</div>}
                  </div>
                </div>
              )}

              {detailTab === "schedule" && (
                <div className="space-y-2">
                  {["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"].map((day) => {
                    const shift = d.schedule[day as keyof typeof d.schedule];
                    return (
                      <div key={day} className="flex items-center justify-between rounded-xl border border-neutral-100 p-3">
                        <span className="text-sm font-semibold text-neutral-700 capitalize">{day}</span>
                        {shift?.available ? <span className="text-sm text-neutral-600">{shift.start} – {shift.end}</span> : <Badge variant="neutral">Off</Badge>}
                      </div>
                    );
                  })}
                </div>
              )}

              {detailTab === "payroll" && (
                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-3">
                    <div className="p-4 rounded-xl bg-neutral-50 text-center"><p className="text-xs text-neutral-400">Regular Hours</p><p className="text-xl font-bold text-neutral-800">32</p></div>
                    <div className="p-4 rounded-xl bg-neutral-50 text-center"><p className="text-xs text-neutral-400">Overtime</p><p className="text-xl font-bold text-neutral-800">4.5</p></div>
                    <div className="p-4 rounded-xl bg-neutral-50 text-center"><p className="text-xs text-neutral-400">Total Hours</p><p className="text-xl font-bold text-neutral-800">36.5</p></div>
                  </div>
                  <Card padding="md"><h4 className="text-sm font-bold text-neutral-700 mb-3">Earnings — This Pay Period</h4>
                    <div className="space-y-2 text-sm">
                      <PayLine label="Base Pay (36.5h × $28/hr)" amount={1022} />
                      <PayLine label="Overtime (4.5h × $42/hr)" amount={189} />
                      <PayLine label="Commission (15%)" amount={drvRevenue * 0.15} />
                      <PayLine label="Tips" amount={drvRevenue * 0.08} />
                      <PayLine label="Performance Bonus" amount={200} />
                      <div className="border-t border-neutral-200 pt-2 flex justify-between"><span className="font-bold text-neutral-800">Gross Pay</span><span className="text-lg font-black text-brand-700">{fmt$(1022 + 189 + drvRevenue * 0.23 + 200)}</span></div>
                    </div>
                  </Card>
                </div>
              )}

              {detailTab === "timeline" && <DriverTimeline events={drvTimeline} />}
            </div>
          </div>
        ); })()}
      </SlideOver>
    </div>
  );
}

// ── Sub-components ──

function Info({ label, value, urgent }: { label: string; value: string; urgent?: boolean }) {
  return <div className="flex items-start justify-between py-2 border-b border-neutral-50 last:border-0 gap-4"><span className="text-xs font-medium text-neutral-400 shrink-0">{label}</span><span className={["text-xs text-right font-semibold", urgent ? "text-danger-600" : "text-neutral-700"].join(" ")}>{value}</span></div>;
}
function StatChip({ label, value }: { label: string; value: string }) {
  return <div className="p-2 rounded-lg bg-white text-center"><p className="text-[10px] text-neutral-400">{label}</p><p className="text-sm font-bold text-neutral-800">{value}</p></div>;
}
function MetricCard({ label, value, color }: { label: string; value: string; color: string }) {
  return <div className={["p-4 rounded-xl text-center", color].join(" ")}><p className="text-xs opacity-70">{label}</p><p className="text-lg font-bold">{value}</p></div>;
}
function PerformerRow({ rank, driver, value }: { rank: number; driver: DriverWithRelations; value: string }) {
  return (
    <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-neutral-25 transition-colors cursor-pointer">
      <span className={["text-xs font-bold w-5", rank === 1 ? "text-gold-500" : rank === 2 ? "text-neutral-400" : "text-neutral-300"].join(" ")}>#{rank}</span>
      <Avatar name={driver.fullName} size="sm" />
      <div className="flex-1 min-w-0"><p className="text-sm font-semibold text-neutral-800 truncate">{driver.fullName}</p></div>
      <span className="text-xs font-semibold text-neutral-700">{value}</span>
    </div>
  );
}
function BookingCard({ booking: b }: { booking: Booking }) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-neutral-100 p-3 hover:bg-neutral-25 transition-colors">
      <div className="flex items-center gap-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-50 text-brand-700"><CalendarDays className="h-4 w-4" /></div>
        <div><p className="text-sm font-semibold text-neutral-800">{b.bookingNumber}</p><p className="text-xs text-neutral-400">{b.pickup.address.city} → {b.dropoff.address.city}</p></div>
      </div>
      <div className="text-right"><p className="text-sm font-semibold">{fmt$(b.totalAmount)}</p><p className="text-xs text-neutral-400">{new Date(b.scheduledPickupAt).toLocaleDateString()} · <StatusChip status={b.status.replace(/_/g, " ")} /></p></div>
    </div>
  );
}
function DocCard({ icon: Icon, title, expiry, urgent, status }: { icon: LucideIcon; title: string; expiry: string | null; urgent?: boolean; status: "valid" | "expired" }) {
  return (
    <div className={["flex items-center justify-between rounded-xl border p-4 transition-colors", urgent ? "border-danger-200 bg-danger-50/30" : "border-neutral-100 hover:bg-neutral-25"].join(" ")}>
      <div className="flex items-center gap-3">
        <div className={["flex h-9 w-9 items-center justify-center rounded-lg", status === "valid" ? "bg-success-100 text-success-600" : "bg-danger-100 text-danger-600"].join(" ")}>
          {status === "valid" ? <CheckCircle2 className="h-4 w-4" /> : <AlertTriangle className="h-4 w-4" />}
        </div>
        <div><p className="text-sm font-semibold text-neutral-800">{title}</p>{expiry ? <p className="text-xs text-neutral-400">Expires {new Date(expiry).toLocaleDateString()}</p> : <p className="text-xs text-neutral-400">No expiration</p>}</div>
      </div>
      <div className="flex items-center gap-2">{urgent && <Badge variant="danger">Soon</Badge>}<Button variant="ghost" size="sm">View</Button></div>
    </div>
  );
}
function AlertPanel({ icon: Icon, title, items, color }: { icon: LucideIcon; title: string; items: { name: string; date: string; detail: string }[]; color: string }) {
  const colorMap: Record<string, string> = { danger: "border-danger-200 bg-danger-50/30", warning: "border-warning-200 bg-warning-50/30", info: "border-info-200 bg-info-50/30" };
  return (
    <Card padding="md" className={items.length ? colorMap[color] || "" : ""}>
      <div className="flex items-center gap-2 mb-3"><Icon className={["h-4 w-4", items.length ? (color === "danger" ? "text-danger-500" : color === "warning" ? "text-warning-500" : "text-info-500") : "text-neutral-400"].join(" ")} /><h3 className="text-sm font-bold text-neutral-800">{title}</h3></div>
      {items.length ? items.map((item, i) => <div key={i} className="flex items-center justify-between py-1.5 text-xs"><div><span className="font-semibold text-neutral-700">{item.name}</span>{item.detail && <span className="text-neutral-400 ml-1">({item.detail})</span>}</div><span className={color === "danger" ? "text-danger-600 font-semibold" : color === "warning" ? "text-warning-600 font-semibold" : "text-info-600 font-semibold"}>{new Date(item.date).toLocaleDateString()}</span></div>) : <p className="text-xs text-neutral-400 py-2">All up to date ✓</p>}
    </Card>
  );
}
function PayLine({ label, amount }: { label: string; amount: number }) {
  return <div className="flex justify-between"><span className="text-neutral-500 text-xs">{label}</span><span className="font-semibold text-neutral-700 text-xs">{fmt$(amount)}</span></div>;
}

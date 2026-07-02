"use client";

import { useState, useMemo } from "react";
import {
  TrendingUp, TrendingDown, BarChart3, PieChart, Target, Download,
  Activity, Car, Users, Plane, AlertTriangle, CheckCircle2, Clock,
  Star, CalendarDays, Filter, ArrowUpRight, ArrowDownRight,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge, StatusChip } from "@/components/ui/badge";
import { StatCard } from "@/components/ui/stat-card";
import { Tabs } from "@/components/ui/tabs";
import { useApi } from "@/lib/hooks/use-api";
import { db, queryAll } from "@/lib/db/store";
import { SmartInsights } from "@/components/analytics/smart-insights";
import type { Booking, PaginatedResponse } from "@/lib/types";
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line, PieChart as RPie, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from "recharts";

const ORG = "org_demo001";
const chartTooltip = { contentStyle: { borderRadius: "12px", border: "1px solid #e2e8f0", boxShadow: "0 10px 25px rgba(0,0,0,0.08)", background: "#fff", padding: "10px 14px", fontSize: "13px" } };
const fmt$ = (n: number) => `$${n.toLocaleString(undefined, { minimumFractionDigits: 2 })}`;
const pColors = ["#4263eb", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#6366f1", "#3b82f6", "#ec4899"];

export default function AnalyticsCenter() {
  const [opTab, setOpTab] = useState("overview");

  const { data: bData } = useApi<PaginatedResponse<Booking>>("/api/bookings?pageSize=500");
  const bookings = bData?.data || [];
  const customers = Object.fromEntries(queryAll(db.customers, ORG).map((c) => [c.id, c]));
  const drivers = Object.fromEntries(queryAll(db.drivers, ORG).map((d) => [d.id, d]));
  const vehicles = Object.fromEntries(queryAll(db.vehicles, ORG).map((v) => [v.id, v]));

  const total = bookings.length;
  const completed = bookings.filter((b) => b.status === "completed").length;
  const cancelled = bookings.filter((b) => b.status === "cancelled").length;
  const noShows = bookings.filter((b) => b.status === "no_show").length;
  const airportTrips = bookings.filter((b) => b.type === "airport_pickup" || b.type === "airport_dropoff").length;
  const corporateTrips = bookings.filter((b) => b.type === "corporate_roadshow").length;
  const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;
  const cancellationRate = total > 0 ? Math.round(((cancelled + noShows) / total) * 100) : 0;

  // Driver utilization
  const driverUtil = Object.values(drivers).map((d) => {
    const trips = bookings.filter((b) => b.assignedDriverId === d.id).length;
    return { name: d.fullName, trips, utilization: Math.min(100, Math.round((trips / Math.max(...Object.values(drivers).map((dd) => bookings.filter((b) => b.assignedDriverId === dd.id).length))) * 100)) };
  }).sort((a, b) => b.trips - a.trips);

  // Vehicle utilization
  const vehicleUtil = Object.values(vehicles).map((v) => {
    const trips = bookings.filter((b) => b.assignedVehicleId === v.id).length;
    return { name: v.name, trips, utilization: Math.min(100, Math.round((trips / Math.max(...Object.values(vehicles).map((vv) => bookings.filter((b) => b.assignedVehicleId === vv.id).length))) * 100)) };
  }).sort((a, b) => b.trips - a.trips);

  // Booking trends (monthly)
  const bookingTrends = [
    { month: "Jan", completed: 138, cancelled: 7, noShow: 0 }, { month: "Feb", completed: 132, cancelled: 5, noShow: 1 },
    { month: "Mar", completed: 155, cancelled: 6, noShow: 1 }, { month: "Apr", completed: 150, cancelled: 7, noShow: 1 },
    { month: "May", completed: 167, cancelled: 7, noShow: 1 }, { month: "Jun", completed: 178, cancelled: 6, noShow: 2 },
  ];

  // Trip volume by hour
  const byHour = Array.from({ length: 24 }, (_, h) => {
    const count = bookings.filter((b) => new Date(b.scheduledPickupAt).getHours() === h).length;
    return { hour: `${h}:00`, trips: count };
  });

  // Customer segments
  const custSegments = [
    { name: "VIP", value: Object.values(customers).filter((c) => c.tags.includes("vip")).length, color: "#d4af37" },
    { name: "Corporate", value: Object.values(customers).filter((c) => c.type === "corporate").length, color: "#4263eb" },
    { name: "Regular", value: Object.values(customers).filter((c) => c.type === "individual" && !c.tags.includes("vip")).length, color: "#10b981" },
  ];

  // Status distribution
  const statusDist = [
    { name: "Completed", value: completed, color: "#10b981" },
    { name: "In Progress", value: bookings.filter((b) => ["chauffeur_en_route", "passenger_picked_up", "in_progress"].includes(b.status)).length, color: "#3b82f6" },
    { name: "Confirmed", value: bookings.filter((b) => b.status === "confirmed" || b.status === "assigned").length, color: "#6366f1" },
    { name: "Pending", value: bookings.filter((b) => b.status === "draft" || b.status === "pending_confirmation").length, color: "#f59e0b" },
    { name: "Cancelled", value: cancelled + noShows, color: "#ef4444" },
  ];

  // Retention (customers with >1 trip)
  const returning = Object.values(customers).filter((c) => c.totalTrips > 1).length;
  const oneTime = Object.values(customers).filter((c) => c.totalTrips === 1).length;
  const retentionRate = Object.values(customers).length > 0 ? Math.round((returning / Object.values(customers).length) * 100) : 0;

  // Smart insights
  const insights = useMemo(() => [
    { id: "a1", type: "positive" as const, title: "Completion Rate Improving", description: `${completionRate}% of all bookings completed successfully. This is above the industry average of 94%.`, metric: `${completed} completed out of ${total} total`, change: 2.1 },
    { id: "a2", type: "warning" as const, title: "Cancellation Rate Monitor", description: `${cancellationRate}% cancellation rate. Most cancellations occur within 2 hours of pickup time.`, metric: `${cancelled} cancelled + ${noShows} no-shows`, change: cancellationRate },
    { id: "a3", type: "opportunity" as const, title: "Peak Hour Optimization", description: `Highest demand between 8-10 AM and 4-6 PM. ${byHour.filter((h) => [8,9,14,15,16,17].includes(parseInt(h.hour))).reduce((s, h) => s + h.trips, 0)} trips during peak hours.`, metric: "Consider surge pricing for peak slots" },
    { id: "a4", type: "positive" as const, title: "Strong Customer Retention", description: `${retentionRate}% of customers book multiple trips. VIP and corporate segments show highest loyalty.`, metric: `${returning} returning customers out of ${Object.values(customers).length}` },
    { id: "a5", type: "neutral" as const, title: "Airport Transfer Volume", description: `${airportTrips} airport transfers represent ${total > 0 ? Math.round((airportTrips / total) * 100) : 0}% of total bookings. YUL Airport is the primary hub.`, metric: `${airportTrips} trips · ${fmt$(bookings.filter((b) => b.type === "airport_pickup" || b.type === "airport_dropoff").reduce((s, b) => s + b.totalAmount, 0))} revenue` },
    { id: "a6", type: "opportunity" as const, title: "Fleet Optimization Opportunity", description: `Top vehicle (${vehicleUtil[0]?.name || "N/A"}) used ${vehicleUtil[0]?.trips || 0}x vs least used. Redistribute bookings to balance fleet wear.`, metric: `Range: ${vehicleUtil[0]?.trips || 0} to ${vehicleUtil[vehicleUtil.length - 1]?.trips || 0} trips` },
  ], [bookings]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div><h1 className="text-2xl font-bold text-neutral-800">Analytics Center</h1><p className="text-sm text-neutral-400">Operational intelligence · {total} bookings analyzed</p></div>
        <Button variant="outline" size="sm" icon={<Download className="h-4 w-4" />}>Export Report</Button>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
        <StatCard label="Completion Rate" value={`${completionRate}%`} trend="up" trendValue="2.1%" color="success" />
        <StatCard label="Cancellation Rate" value={`${cancellationRate}%`} color="warning" />
        <StatCard label="Airport Volume" value={String(airportTrips)} color="info" />
        <StatCard label="Corporate Volume" value={String(corporateTrips)} color="brand" />
        <StatCard label="Customer Retention" value={`${retentionRate}%`} color="gold" />
      </div>

      {/* Smart Insights */}
      <SmartInsights insights={insights} />

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card padding="md">
          <h2 className="text-base font-bold text-neutral-800 mb-4">Booking Trends</h2>
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={bookingTrends}><CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" /><XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#94a3b8" }} /><YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#94a3b8" }} /><Tooltip {...chartTooltip} /><Area type="monotone" dataKey="completed" stroke="#10b981" strokeWidth={2.5} fill="#10b98120" name="Completed" /><Area type="monotone" dataKey="cancelled" stroke="#ef4444" strokeWidth={1.5} fill="none" name="Cancelled" /><Legend /></AreaChart>
          </ResponsiveContainer>
        </Card>

        <Card padding="md">
          <h2 className="text-base font-bold text-neutral-800 mb-4">Trips by Hour</h2>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={byHour}><CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" /><XAxis dataKey="hour" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "#94a3b8" }} interval={2} /><YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#94a3b8" }} /><Tooltip {...chartTooltip} /><Bar dataKey="trips" fill="#4263eb" radius={[4, 4, 0, 0]} barSize={14} /></BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card padding="md">
          <h2 className="text-base font-bold text-neutral-800 mb-4">Trip Status</h2>
          <ResponsiveContainer width="100%" height={220}>
            <RPie><Pie data={statusDist} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={2} dataKey="value">{statusDist.map((s, i) => <Cell key={i} fill={s.color} />)}</Pie></RPie>
          </ResponsiveContainer>
          <div className="space-y-1 mt-2">{statusDist.map((s) => <div key={s.name} className="flex items-center justify-between text-xs"><div className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full" style={{ background: s.color }} /><span className="text-neutral-600">{s.name}</span></div><span className="font-semibold text-neutral-700">{s.value}</span></div>)}</div>
        </Card>

        <Card padding="md">
          <h2 className="text-base font-bold text-neutral-800 mb-4">Customer Segments</h2>
          <ResponsiveContainer width="100%" height={220}>
            <RPie><Pie data={custSegments} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={2} dataKey="value">{custSegments.map((s, i) => <Cell key={i} fill={s.color} />)}</Pie></RPie>
          </ResponsiveContainer>
          <div className="space-y-1 mt-2">{custSegments.map((s) => <div key={s.name} className="flex items-center justify-between text-xs"><div className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full" style={{ background: s.color }} /><span className="text-neutral-600">{s.name}</span></div><span className="font-semibold text-neutral-700">{s.value}</span></div>)}</div>
        </Card>

        <Card padding="md">
          <h2 className="text-base font-bold text-neutral-800 mb-4">Top Drivers</h2>
          <div className="space-y-2">
            {driverUtil.slice(0, 5).map((d, i) => (
              <div key={i} className="flex items-center gap-3 p-2 rounded-lg hover:bg-neutral-25">
                <span className={["text-xs font-bold w-5", i === 0 ? "text-gold-500" : "text-neutral-400"].join(" ")}>#{i + 1}</span>
                <div className="flex-1 min-w-0"><p className="text-sm font-semibold text-neutral-800 truncate">{d.name}</p><div className="h-1.5 rounded-full bg-neutral-100 mt-1 overflow-hidden"><div className="h-full rounded-full bg-brand-600" style={{ width: `${d.utilization}%` }} /></div></div>
                <span className="text-xs font-semibold text-neutral-700">{d.trips} trips</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Fleet Utilization */}
      <Card padding="md">
        <h2 className="text-base font-bold text-neutral-800 mb-4">Vehicle Utilization</h2>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-4">
          {vehicleUtil.slice(0, 8).map((v, i) => (
            <div key={i} className="p-3 rounded-xl border border-neutral-100 hover:bg-neutral-25 transition-colors">
              <div className="flex items-center justify-between mb-2"><span className="text-sm font-semibold text-neutral-800 truncate">{v.name}</span><span className="text-xs font-bold text-neutral-700">{v.trips}</span></div>
              <div className="h-2 rounded-full bg-neutral-100 overflow-hidden"><div className="h-full rounded-full bg-brand-600" style={{ width: `${v.utilization}%` }} /></div>
              <p className="text-[10px] text-neutral-400 mt-1">{v.utilization}% utilization</p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

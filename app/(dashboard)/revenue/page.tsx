"use client";

import { useState, useMemo } from "react";
import {
  DollarSign, TrendingUp, TrendingDown, Download, CalendarDays, Filter,
  Users, Car, Building2, Plane, Clock, Star, FileText, ChevronDown,
  BarChart3, PieChart, Target, Lightbulb, ArrowUpRight, ArrowDownRight,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { StatCard } from "@/components/ui/stat-card";
import { Tabs } from "@/components/ui/tabs";
import { useApi } from "@/lib/hooks/use-api";
import { db, queryAll } from "@/lib/db/store";
import { SmartInsights } from "@/components/analytics/smart-insights";
import type { Booking, Invoice, Payment, PaginatedResponse } from "@/lib/types";
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line, PieChart as RPie, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from "recharts";

const ORG = "org_demo001";
const chartTooltip = { contentStyle: { borderRadius: "12px", border: "1px solid #e2e8f0", boxShadow: "0 10px 25px rgba(0,0,0,0.08)", background: "#fff", padding: "10px 14px", fontSize: "13px" } };
const fmt$ = (n: number) => `$${n.toLocaleString(undefined, { minimumFractionDigits: 2 })}`;
const pieColors = ["#4263eb", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#3b82f6", "#ec4899", "#6366f1"];

export default function RevenueIntelligenceCenter() {
  const [periodView, setPeriodView] = useState("monthly");
  const [breakdownTab, setBreakdownTab] = useState("customer");

  const { data: bData } = useApi<PaginatedResponse<Booking>>("/api/bookings?pageSize=500");
  const bookings = bData?.data || [];
  const customers = Object.fromEntries(queryAll(db.customers, ORG).map((c) => [c.id, c]));
  const drivers = Object.fromEntries(queryAll(db.drivers, ORG).map((d) => [d.id, d]));
  const vehicles = Object.fromEntries(queryAll(db.vehicles, ORG).map((v) => [v.id, v]));
  const corpAccounts = Object.fromEntries(queryAll(db.corporateAccounts, ORG).map((a) => [a.id, a]));
  const payments = Array.from(db.payments.values()).filter((p) => p.organizationId === ORG && p.status === "completed");

  // Period filtering
  const now = new Date();
  const today = now.toISOString().slice(0, 10);
  const thisWeekStart = new Date(now); thisWeekStart.setDate(now.getDate() - now.getDay());
  const thisMonth = now.toISOString().slice(0, 7);
  const thisYear = now.getFullYear().toString();

  const periodFiltered = periodView === "daily" ? bookings.filter((b) => b.scheduledPickupAt.slice(0, 10) === today)
    : periodView === "weekly" ? bookings.filter((b) => new Date(b.scheduledPickupAt) >= thisWeekStart)
    : periodView === "monthly" ? bookings.filter((b) => b.scheduledPickupAt.startsWith(thisMonth))
    : bookings;

  const periodRevenue = periodFiltered.reduce((s, b) => s + b.totalAmount, 0);
  const periodTrips = periodFiltered.length;
  const avgPerTrip = periodTrips > 0 ? periodRevenue / periodTrips : 0;
  const completedTrips = periodFiltered.filter((b) => b.status === "completed").length;
  const cancelledTrips = periodFiltered.filter((b) => b.status === "cancelled" || b.status === "no_show").length;
  const totalPayments = payments.filter((p) => {
    const pd = p.createdAt.slice(0, periodView === "daily" ? 10 : periodView === "monthly" ? 7 : 4);
    const ref = periodView === "daily" ? today : periodView === "monthly" ? thisMonth : thisYear;
    return pd.startsWith(ref);
  }).reduce((s, p) => s + p.amount, 0);

  // All bookings revenue
  const totalRevenue = bookings.reduce((s, b) => s + b.totalAmount, 0);
  const margin = 48.5;

  // Revenue trend data
  const monthlyTrend = [
    { month: "Jan", revenue: 72000, cost: 38000, bookings: 145 },
    { month: "Feb", revenue: 68500, cost: 36500, bookings: 138 },
    { month: "Mar", revenue: 81000, cost: 41000, bookings: 162 },
    { month: "Apr", revenue: 78500, cost: 39500, bookings: 158 },
    { month: "May", revenue: 84000, cost: 42000, bookings: 175 },
    { month: "Jun", revenue: 87500, cost: 43000, bookings: 186 },
    { month: "Jul", revenue: periodRevenue > 0 ? Math.round(periodRevenue) : 45000, cost: Math.round(periodRevenue * 0.52), bookings: periodTrips },
  ];

  const dailyTrend = [
    { day: "Mon", revenue: 4200 }, { day: "Tue", revenue: 3800 }, { day: "Wed", revenue: 5100 },
    { day: "Thu", revenue: 4600 }, { day: "Fri", revenue: 7200 }, { day: "Sat", revenue: 8900 }, { day: "Sun", revenue: 6500 },
  ];

  // Breakdowns
  const byCustomer = rankBreakdown(bookings, "customerId", customers, "fullName");
  const byDriver = rankBreakdown(bookings.filter((b) => b.assignedDriverId), "assignedDriverId!", drivers, "fullName");
  const byVehicle = rankBreakdown(bookings.filter((b) => b.assignedVehicleId), "assignedVehicleId!", vehicles, "name");
  const byCompany = rankBreakdown(bookings.filter((b) => b.corporateAccountId), "corporateAccountId!", corpAccounts, "companyName");
  const byType = Object.entries(
    bookings.reduce<Record<string, { revenue: number; count: number }>>((acc, b) => {
      const t = b.type.replace(/_/g, " ");
      if (!acc[t]) acc[t] = { revenue: 0, count: 0 };
      acc[t].revenue += b.totalAmount; acc[t].count++; return acc;
    }, {})
  ).map(([name, d]) => ({ name: name.replace(/\b\w/g, (c) => c.toUpperCase()), value: Math.round(d.revenue), count: d.count }));

  const getBreakdown = () => {
    switch (breakdownTab) {
      case "customer": return byCustomer;
      case "driver": return byDriver;
      case "vehicle": return byVehicle;
      case "company": return byCompany;
      case "type": return byType.map((t) => ({ id: t.name, name: t.name, revenue: t.value, trips: t.count }));
      default: return byCustomer;
    }
  };

  const breakdownData = getBreakdown();

  // Smart Insights
  const insights = useMemo(() => [
    { id: "i1", type: "positive" as const, title: "Revenue Growth Accelerating", description: `Monthly revenue up 12.8% year-over-year. Airport transfers driving 37% of growth across all vehicle categories.`, metric: `Top performer: ${byCustomer[0]?.name || "N/A"} at ${fmt$(byCustomer[0]?.revenue || 0)}`, change: 12.8 },
    { id: "i2", type: "opportunity" as const, title: "Underutilized Luxury Sedans", description: "Luxury sedans averaging only 12 trips/month vs 22 for SUVs. Consider promotional airport packages to boost utilization.", metric: `${vehicles ? Object.values(vehicles).filter((v) => v.type.includes("sedan")).length : 0} sedans in fleet`, change: -15 },
    { id: "i3", type: "positive" as const, title: "Highest Value Segment", description: `Corporate clients generate 32% of total revenue with only 15% of trip volume. Average corporate trip value is ${fmt$(317)} vs ${fmt$(174)} for individual.`, metric: `Corporate accounts: ${corpAccounts ? Object.values(corpAccounts).length : 0} active`, change: 32 },
    { id: "i4", type: "warning" as const, title: "Cancellation Rate Increasing", description: `Cancellation rate at ${cancelledTrips > 0 && periodTrips > 0 ? Math.round((cancelledTrips / periodTrips) * 100) : 3}% this period, up from 2.1% last month. Review pending confirmation follow-up process.`, metric: `${cancelledTrips} cancelled out of ${periodTrips} bookings` },
    { id: "i5", type: "positive" as const, title: "Weekend Revenue Premium", description: "Saturday and Sunday bookings generate 52% more revenue per trip than weekdays. Consider expanding weekend fleet availability.", metric: "Saturday avg: $356/trip vs Tuesday: $178/trip", change: 52 },
    { id: "i6", type: "opportunity" as const, title: "Driver Performance Gap", description: `Top driver (${byDriver[0]?.name || "N/A"}) generates ${byDriver.length >= 2 ? Math.round((byDriver[0]?.revenue || 1) / (byDriver[byDriver.length - 1]?.revenue || 1)) : 0}x more revenue than lowest performer. Standardize high-performer practices.`, metric: `Range: ${fmt$(byDriver[0]?.revenue || 0)} to ${fmt$(byDriver[byDriver.length - 1]?.revenue || 0)}` },
  ], [bookings]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div><h1 className="text-2xl font-bold text-neutral-800">Revenue Intelligence</h1><p className="text-sm text-neutral-400">Executive financial dashboard · {fmt$(totalRevenue)} total revenue</p></div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" icon={<Download className="h-4 w-4" />} className="relative group">
            Export
            <div className="absolute right-0 top-full mt-1 hidden group-hover:block bg-white rounded-xl border border-neutral-100 shadow-xl py-1 z-50 w-36">
              {["PDF Report", "Excel (.xlsx)", "CSV (.csv)"].map((o) => <button key={o} className="block w-full text-left px-3 py-2 text-xs text-neutral-600 hover:bg-neutral-50">{o}</button>)}
            </div>
          </Button>
        </div>
      </div>

      {/* Period Selector */}
      <div className="flex items-center gap-1.5">
        {(["daily", "weekly", "monthly", "yearly"] as const).map((p) => (
          <Button key={p} variant={periodView === p ? "primary" : "outline"} size="sm" onClick={() => setPeriodView(p)} className="capitalize">{p}</Button>
        ))}
        <span className="text-xs text-neutral-400 ml-2">{periodTrips} trips · {fmt$(periodRevenue)} revenue</span>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
        <StatCard label={`${periodView.charAt(0).toUpperCase() + periodView.slice(1)} Revenue`} value={fmt$(periodRevenue)} trend="up" trendValue="12.8%" color="success" />
        <StatCard label="Total Trips" value={String(periodTrips)} color="brand" />
        <StatCard label="Avg Per Trip" value={fmt$(avgPerTrip)} trend="up" trendValue="5.4%" color="info" />
        <StatCard label="Profit Margin" value={`${margin}%`} trend="up" trendValue="1.2%" color="gold" />
        <StatCard label="Payments Received" value={fmt$(totalPayments)} color="success" />
      </div>

      {/* Main Chart */}
      <Card padding="md">
        <div className="flex items-center justify-between mb-4"><h2 className="text-base font-bold text-neutral-800">Revenue vs Costs</h2><Badge variant="success">+12.8% YoY</Badge></div>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={(periodView === "daily" ? dailyTrend : monthlyTrend) as any}>
            <defs><linearGradient id="revGrad2" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#4263eb" stopOpacity={0.15} /><stop offset="100%" stopColor="#4263eb" stopOpacity={0} /></linearGradient></defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey={periodView === "daily" ? "day" : "month"} axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#94a3b8" }} />
            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#94a3b8" }} tickFormatter={(v: number) => `$${(v / 1000).toFixed(0)}k`} />
            <Tooltip {...chartTooltip} />
            <Area type="monotone" dataKey="revenue" stroke="#4263eb" strokeWidth={2.5} fill="url(#revGrad2)" name="Revenue" />
            {periodView !== "daily" && <Area type="monotone" dataKey="cost" stroke="#f59e0b" strokeWidth={2} fill="none" name="Costs" strokeDasharray="5 5" />}
            <Legend />
          </AreaChart>
        </ResponsiveContainer>
      </Card>

      {/* Smart Insights */}
      <SmartInsights insights={insights} />

      {/* Revenue by Source + Breakdown */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card padding="md">
          <h2 className="text-base font-bold text-neutral-800 mb-4">Revenue by Booking Type</h2>
          <div className="flex items-center gap-6">
            <ResponsiveContainer width="55%" height={240}>
              <RPie><Pie data={byType} cx="50%" cy="50%" innerRadius={50} outerRadius={85} paddingAngle={2} dataKey="value">{byType.map((_, i) => <Cell key={i} fill={pieColors[i % pieColors.length]} />)}</Pie></RPie>
            </ResponsiveContainer>
            <div className="space-y-1.5 flex-1">{byType.slice(0, 7).map((s, i) => (
              <div key={i} className="flex items-center justify-between text-xs"><div className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full" style={{ background: pieColors[i % pieColors.length] }} /><span className="text-neutral-600">{s.name}</span></div><span className="font-semibold text-neutral-700">{fmt$(s.value)}</span></div>
            ))}</div>
          </div>
        </Card>

        <Card padding="md">
          <h2 className="text-base font-bold text-neutral-800 mb-4">Revenue Trend</h2>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={monthlyTrend.slice(-6)}><CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" /><XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#94a3b8" }} /><YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#94a3b8" }} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} /><Tooltip {...chartTooltip} /><Bar dataKey="revenue" fill="#4263eb" radius={[6, 6, 0, 0]} barSize={28} name="Revenue" /><Bar dataKey="bookings" fill="#10b981" radius={[6, 6, 0, 0]} barSize={28} name="Trips" /><Legend /></BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Detailed Breakdowns */}
      <Card padding="md">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-bold text-neutral-800">Revenue Breakdown</h2>
          <Tabs tabs={[
            { id: "customer", label: "By Customer" },
            { id: "driver", label: "By Driver" },
            { id: "vehicle", label: "By Vehicle" },
            { id: "company", label: "By Company" },
            { id: "type", label: "By Type" },
          ]} onChange={setBreakdownTab} />
        </div>
        <div className="space-y-1">
          {breakdownData.slice(0, 8).map((item, i) => {
            const max = breakdownData[0]?.revenue || 1;
            const pct = Math.round((item.revenue / max) * 100);
            return (
              <div key={i} className="flex items-center gap-4 py-3 px-4 rounded-lg hover:bg-neutral-25 transition-colors">
                <span className={["text-xs font-bold w-6", i === 0 ? "text-gold-500" : i === 1 ? "text-neutral-400" : "text-neutral-300"].join(" ")}>#{i + 1}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1"><p className="text-sm font-semibold text-neutral-800 truncate">{item.name}</p><p className="text-sm font-bold text-neutral-700 ml-4">{fmt$(item.revenue)}</p></div>
                  <div className="h-2 rounded-full bg-neutral-100 overflow-hidden"><div className="h-full rounded-full bg-brand-600 transition-all" style={{ width: `${pct}%` }} /></div>
                  <p className="text-xs text-neutral-400 mt-0.5">{item.trips} trips</p>
                </div>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}

function rankBreakdown(bookings: Booking[], key: string, lookup: Record<string, any>, nameKey: string) {
  return Object.entries(
    bookings.reduce<Record<string, { revenue: number; trips: number }>>((acc, b) => {
      const id = (b as any)[key] as string;
      if (!id) return acc;
      if (!acc[id]) acc[id] = { revenue: 0, trips: 0 };
      acc[id].revenue += b.totalAmount;
      acc[id].trips++;
      return acc;
    }, {})
  ).map(([id, d]) => ({ id, name: lookup[id]?.[nameKey] || id, revenue: Math.round(d.revenue), trips: d.trips }))
  .sort((a, b) => b.revenue - a.revenue);
}

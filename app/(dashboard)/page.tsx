"use client";

import Link from "next/link";
import {
  DollarSign,
  Car,
  Users,
  CalendarDays,
  TrendingUp,
  Plane,
  Star,
  Clock,
  MapPin,
  ArrowUpRight,
} from "lucide-react";
import { StatCard } from "@/components/ui/stat-card";
import { Card } from "@/components/ui/card";
import { Badge, StatusChip } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { StatCardSkeleton } from "@/components/ui/skeleton";
import { useApi } from "@/lib/hooks/use-api";
import type { DashboardStats } from "@/lib/types";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const chartTooltipStyle = {
  contentStyle: {
    borderRadius: "12px",
    border: "1px solid #e2e8f0",
    boxShadow: "0 10px 25px rgba(0,0,0,0.08)",
    background: "#fff",
    padding: "10px 14px",
    fontSize: "13px",
  },
};

const revenueData = [
  { day: "Mon", revenue: 4200 },
  { day: "Tue", revenue: 3800 },
  { day: "Wed", revenue: 5100 },
  { day: "Thu", revenue: 4600 },
  { day: "Fri", revenue: 7200 },
  { day: "Sat", revenue: 8900 },
  { day: "Sun", revenue: 6500 },
];

const bookingsData = [
  { day: "Mon", bookings: 18 },
  { day: "Tue", bookings: 15 },
  { day: "Wed", bookings: 22 },
  { day: "Thu", bookings: 19 },
  { day: "Fri", bookings: 28 },
  { day: "Sat", bookings: 35 },
  { day: "Sun", bookings: 25 },
];

const fleetUtilization = [
  { name: "Available", value: 8, color: "#10b981" },
  { name: "On Trip", value: 4, color: "#3b82f6" },
  { name: "Maintenance", value: 1, color: "#f59e0b" },
  { name: "Offline", value: 1, color: "#94a3b8" },
];

const activityIcons: Record<string, string> = {
  booking_created: "bg-brand-500",
  booking_confirmed: "bg-brand-500",
  booking_completed: "bg-success-500",
  trip_started: "bg-info-500",
  trip_completed: "bg-success-500",
  payment_received: "bg-success-500",
  driver_assigned: "bg-info-500",
  maintenance_scheduled: "bg-warning-500",
  maintenance_completed: "bg-success-500",
  user_login: "bg-neutral-400",
  default: "bg-neutral-400",
};

function formatTimeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins} min ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} hour${hours > 1 ? "s" : ""} ago`;
  const days = Math.floor(hours / 24);
  return `${days} day${days > 1 ? "s" : ""} ago`;
}

export default function DashboardPage() {
  const { data: stats, isLoading } = useApi<DashboardStats>("/api/dashboard");

  return (
    <div className="space-y-8">
      {/* Page header */}
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-neutral-800">
            Dashboard
          </h1>
          <p className="text-sm text-neutral-400">
            Welcome back. Here&apos;s what&apos;s happening today.
          </p>
        </div>
        <div className="flex items-center gap-2 mt-2 sm:mt-0">
          <Badge variant="success" dot>Live</Badge>
          <span className="text-xs text-neutral-400">Auto-refreshing</span>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4 xl:grid-cols-5">
        {isLoading ? (
          Array.from({ length: 5 }).map((_, i) => <StatCardSkeleton key={i} />)
        ) : stats ? (
          <>
            <StatCard
              label="Today's Revenue"
              value={`$${stats.todayRevenue.toLocaleString()}`}
              trend="up"
              trendValue={`${stats.revenueTrend}% vs yesterday`}
              icon={<DollarSign className="h-5 w-5" />}
              color="success"
            />
            <StatCard
              label="Monthly Revenue"
              value={`$${stats.monthlyRevenue.toLocaleString()}`}
              trend="up"
              trendValue="8.2% vs last month"
              icon={<TrendingUp className="h-5 w-5" />}
              color="brand"
            />
            <StatCard
              label="Bookings Today"
              value={String(stats.bookingsToday)}
              subtitle={`${stats.bookingsPending} pending confirmation`}
              icon={<CalendarDays className="h-5 w-5" />}
              color="info"
            />
            <StatCard
              label="Vehicles Available"
              value={`${stats.vehiclesAvailable}/${stats.vehiclesTotal}`}
              subtitle={`${stats.tripsInProgress} on trip, ${stats.vehiclesTotal - stats.vehiclesAvailable - stats.tripsInProgress} in maintenance`}
              icon={<Car className="h-5 w-5" />}
              color="warning"
            />
            <StatCard
              label="Customer Rating"
              value={stats.customerSatisfaction.toFixed(2)}
              trend="up"
              trendValue="Based on 340 reviews"
              icon={<Star className="h-5 w-5" />}
              color="gold"
            />
          </>
        ) : null}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2" padding="md">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-base font-bold text-neutral-800">Revenue Overview</h2>
              <p className="text-xs text-neutral-400">Last 7 days</p>
            </div>
            <Badge variant="success">+12.5%</Badge>
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={revenueData}>
              <defs>
                <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#4263eb" stopOpacity={0.15} />
                  <stop offset="100%" stopColor="#4263eb" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#94a3b8" }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#94a3b8" }} tickFormatter={(v) => `$${(v / 1000).toFixed(1)}k`} />
              <Tooltip {...chartTooltipStyle} />
              <Area type="monotone" dataKey="revenue" stroke="#4263eb" strokeWidth={2.5} fill="url(#revenueGrad)" dot={{ fill: "#4263eb", r: 3 }} activeDot={{ fill: "#4263eb", r: 5, stroke: "#fff", strokeWidth: 2 }} />
            </AreaChart>
          </ResponsiveContainer>
        </Card>

        <Card padding="md">
          <h2 className="text-base font-bold text-neutral-800 mb-4">Fleet Utilization</h2>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={fleetUtilization} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={3} dataKey="value">
                {fleetUtilization.map((entry, i) => <Cell key={i} fill={entry.color} />)}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-2 space-y-2">
            {fleetUtilization.map((item) => (
              <div key={item.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ background: item.color }} />
                  <span className="text-neutral-600">{item.name}</span>
                </div>
                <span className="font-semibold text-neutral-700">{item.value}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Bookings + Trips */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card padding="md">
          <h2 className="text-base font-bold text-neutral-800 mb-4">Bookings</h2>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={bookingsData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#94a3b8" }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#94a3b8" }} />
              <Tooltip {...chartTooltipStyle} />
              <Bar dataKey="bookings" fill="#4263eb" radius={[6, 6, 0, 0]} barSize={28} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Upcoming Trips from API */}
        <Card padding="md">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-neutral-800">Upcoming Trips</h2>
            <Link href="/bookings">
              <Button variant="ghost" size="sm">View All</Button>
            </Link>
          </div>
          <div className="space-y-3">
            {stats?.upcomingTrips?.length ? (
              stats.upcomingTrips.map((trip) => (
                <Link
                  key={trip.id}
                  href={`/bookings`}
                  className="flex items-start gap-3 rounded-xl border border-neutral-100 p-3 hover:bg-neutral-25 transition-colors cursor-pointer block"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-700">
                    <Clock className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-neutral-800">
                        {trip.customerId}
                      </span>
                      <span className="text-xs text-neutral-400">{trip.bookingNumber}</span>
                      <StatusChip status={trip.status} />
                    </div>
                    <div className="mt-1 flex items-center gap-3 text-xs text-neutral-500">
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {trip.pickup.address.city} → {trip.dropoff.address.city}
                      </span>
                    </div>
                    <div className="mt-1 flex items-center gap-3 text-xs text-neutral-400">
                      <span>{new Date(trip.scheduledPickupAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                      <span>•</span>
                      <span>{trip.passengerCount} pax</span>
                      <span>•</span>
                      <span>${trip.totalAmount.toFixed(2)}</span>
                    </div>
                  </div>
                </Link>
              ))
            ) : (
              <p className="text-sm text-neutral-400 text-center py-6">No upcoming trips</p>
            )}
          </div>
        </Card>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Activity Feed */}
        <Card padding="md">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-neutral-800">Recent Activity</h2>
            <Button variant="ghost" size="sm">View All</Button>
          </div>
          <div className="space-y-1">
            {stats?.recentActivity?.length ? (
              stats.recentActivity.map((item, i) => (
                <div key={item.id} className="flex gap-3 rounded-lg px-2 py-2.5 hover:bg-neutral-25 transition-colors cursor-pointer">
                  <div className="relative mt-1">
                    <span className={["block h-2 w-2 rounded-full", activityIcons[item.action] || activityIcons.default].join(" ")} />
                    {i < stats.recentActivity.length - 1 && (
                      <span className="absolute top-3 left-1 h-full w-px bg-neutral-100" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-neutral-700">{item.action.replace(/_/g, " ")} — {item.entityType} #{item.entityId.slice(-4)}</p>
                    <p className="mt-0.5 text-xs text-neutral-400">{formatTimeAgo(item.createdAt)}</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-neutral-400 text-center py-4">No recent activity</p>
            )}
          </div>
        </Card>

        {/* Top Customers */}
        <Card padding="md">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-neutral-800">Top Customers</h2>
            <Link href="/customers">
              <Button variant="ghost" size="sm">View All</Button>
            </Link>
          </div>
          <div className="space-y-3">
            {stats?.topCustomers?.length ? (
              stats.topCustomers.map((c, i) => (
                <div key={c.customerId} className="flex items-center gap-3 rounded-lg p-2 hover:bg-neutral-25 transition-colors cursor-pointer">
                  <Avatar name={c.customerName} size="md" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-neutral-800">{c.customerName}</p>
                    <p className="text-xs text-neutral-400">{c.trips} trips</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-neutral-700">${c.revenue.toLocaleString()}</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-neutral-400 text-center py-4">No customers yet</p>
            )}
          </div>
        </Card>

        {/* Recent Payments */}
        <Card padding="md">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-neutral-800">Recent Payments</h2>
            <Link href="/invoices">
              <Button variant="ghost" size="sm">View All</Button>
            </Link>
          </div>
          <div className="space-y-1">
            {stats?.recentPayments?.length ? (
              stats.recentPayments.map((payment) => (
                <div key={payment.id} className="flex items-center justify-between rounded-lg px-2 py-2.5 hover:bg-neutral-25 transition-colors cursor-pointer">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-success-50">
                      <DollarSign className="h-4 w-4 text-success-600" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-neutral-800">{payment.customerId}</p>
                      <p className="text-xs text-neutral-400">{payment.reference || payment.id.slice(-8)}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-neutral-700">${payment.amount.toFixed(2)}</p>
                    <StatusChip status={payment.status} />
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-neutral-400 text-center py-4">No payments yet</p>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}

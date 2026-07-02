import { type NextRequest } from "next/server";
import { ensureSeed, getOrgContext, ok } from "@/lib/api/helpers";
import { db, queryAll } from "@/lib/db/store";
import type { DashboardStats } from "@/lib/types";

export async function GET(request: NextRequest) {
  ensureSeed();
  const { organizationId } = getOrgContext(request);

  const bookings = queryAll(db.bookings, organizationId);
  const drivers = queryAll(db.drivers, organizationId);
  const vehicles = queryAll(db.vehicles, organizationId);
  const customers = queryAll(db.customers, organizationId);
  const invoices = queryAll(db.invoices, organizationId);
  const payments = queryAll(db.payments, organizationId);
  const activityLog = db.activityLog.filter((a) => a.organizationId === organizationId);

  const today = new Date().toISOString().slice(0, 10);
  const bookingsToday = bookings.filter((b) => b.createdAt.slice(0, 10) === today);
  const tripsInProgress = bookings.filter(
    (b) => ["chauffeur_en_route", "passenger_picked_up", "in_progress"].includes(b.status)
  );
  const airportArrivals = bookings.filter(
    (b) =>
      (b.type === "airport_pickup" || b.type === "airport_dropoff") &&
      b.createdAt.slice(0, 10) === today
  );
  const pendingQuotes = bookings.filter((b) => b.status === "pending_confirmation" || b.status === "draft");

  const paidInvoices = invoices.filter((i) => i.status === "paid");
  const todayRevenue = payments
    .filter((p) => p.createdAt.slice(0, 10) === today && p.status === "completed")
    .reduce((sum, p) => sum + p.amount, 0);
  const monthlyRevenue = payments
    .filter((p) => p.status === "completed")
    .reduce((sum, p) => sum + p.amount, 0);

  const vehiclesAvailable = vehicles.filter((v) => v.status === "available").length;
  const driversAvailable = drivers.filter((d) => d.status === "available").length;

  // Top customers by revenue
  const customerRevenue = customers
    .map((c) => ({
      customerId: c.id,
      customerName: c.fullName,
      trips: c.totalTrips,
      revenue: c.totalRevenue,
    }))
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5);

  // Recent payments
  const recentPayments = [...payments]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  // Recent activity
  const recentActivity = [...activityLog]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 10);

  // Upcoming trips
  const upcomingTrips = bookings
    .filter((b) => ["confirmed", "assigned", "pending_confirmation"].includes(b.status))
    .sort((a, b) => new Date(a.scheduledPickupAt).getTime() - new Date(b.scheduledPickupAt).getTime())
    .slice(0, 5);

  // Customer satisfaction (average rating)
  const ratings = customers.filter((c) => c.averageRating > 0).map((c) => c.averageRating);
  const avgRating = ratings.length ? ratings.reduce((s, r) => s + r, 0) / ratings.length : 0;

  // Fleet utilization
  const onTrip = vehicles.filter((v) => v.status === "on_trip").length;
  const inMaintenance = vehicles.filter((v) => v.status === "maintenance").length;
  const offline = vehicles.filter((v) => v.status === "offline").length;

  const stats: DashboardStats = {
    todayRevenue,
    monthlyRevenue,
    bookingsToday: bookingsToday.length,
    bookingsPending: pendingQuotes.length,
    vehiclesAvailable,
    vehiclesTotal: vehicles.length,
    driversAvailable,
    driversTotal: drivers.length,
    tripsInProgress: tripsInProgress.length,
    airportArrivals: airportArrivals.length,
    pendingQuotes: pendingQuotes.length,
    customerSatisfaction: Math.round(avgRating * 100) / 100,
    revenueTrend: 12.5,
    bookingTrend: 8.2,
    fleetUtilization: vehicles.length > 0 ? Math.round((onTrip / vehicles.length) * 100) : 0,
    onTimePercentage: 97.2,
    avgResponseTime: 4.2,
    topCustomers: customerRevenue,
    recentPayments,
    upcomingTrips: upcomingTrips.slice(0, 4),
    recentActivity,
  };

  return ok(stats);
}

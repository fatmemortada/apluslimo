"use client";

import Link from "next/link";
import { Car, CalendarDays, FileText, MapPin, Clock, Star, ChevronRight, Phone, CreditCard } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge, StatusChip } from "@/components/ui/badge";
import { StatCard } from "@/components/ui/stat-card";

const upcomingRides = [
  { id: "MRL-1042", date: "Jul 15", time: "09:00 AM", pickup: "YUL Airport", dropoff: "456 Rue Peel", driver: "David Chen", vehicle: "Cadillac Escalade", status: "confirmed", amount: "$382" },
  { id: "MRL-1051", date: "Jul 22", time: "02:30 PM", pickup: "Ritz Carlton", dropoff: "Mont Tremblant", driver: "James Wilson", vehicle: "BMW 7 Series", status: "pending_confirmation", amount: "$520" },
];
const pastRides = [
  { id: "MRL-1038", date: "Jun 28", pickup: "Downtown", dropoff: "YUL Airport", driver: "Michael Torres", amount: "$280", rating: 5 },
  { id: "MRL-1035", date: "Jun 20", pickup: "Hotel Bonaventure", dropoff: "Old Port", driver: "Alex Kim", amount: "$145", rating: 5 },
  { id: "MRL-1030", date: "Jun 15", pickup: "YUL Airport", dropoff: "Westmount", driver: "David Chen", amount: "$310", rating: 4 },
];

export default function PortalDashboard() {
  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-6 rounded-2xl bg-gradient-to-br from-brand-800 to-brand-950 text-white">
        <div><p className="text-sm text-white/60">Welcome back</p><h1 className="text-2xl font-bold">John Smith</h1><p className="text-sm text-white/50 mt-1">VIP Client · 28 trips · ⭐ 4.9 rating</p></div>
        <div className="flex gap-2"><Link href="/portal/book"><Button variant="gold" size="lg" icon={<Car className="h-4 w-4" />}>Book a Ride</Button></Link></div>
      </div>
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Total Rides" value="28" color="brand" /><StatCard label="This Year" value="14" color="info" /><StatCard label="Total Spent" value="$12,450" color="gold" /><StatCard label="Rating" value="⭐ 4.9" color="success" />
      </div>
      <div>
        <div className="flex items-center justify-between mb-3"><h2 className="text-lg font-bold text-neutral-800">Upcoming Rides</h2><Link href="/portal/rides"><Button variant="ghost" size="sm">View All <ChevronRight className="h-3.5 w-3.5 ml-1" /></Button></Link></div>
        <div className="space-y-3">
          {upcomingRides.map((ride) => (
            <Card key={ride.id} padding="md" hover>
              <div className="flex items-start gap-4"><div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-700"><CalendarDays className="h-5 w-5" /></div>
                <div className="flex-1 min-w-0"><div className="flex items-center gap-2 flex-wrap"><span className="font-mono text-sm font-bold text-brand-700">{ride.id}</span><StatusChip status={ride.status.replace(/_/g, " ")} /></div>
                  <div className="mt-1 grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-neutral-500"><span><Clock className="h-3 w-3 inline mr-1" />{ride.date} at {ride.time}</span><span><Car className="h-3 w-3 inline mr-1" />{ride.vehicle}</span><span><MapPin className="h-3 w-3 inline mr-1" />{ride.pickup} → {ride.dropoff}</span><span>Driver: <span className="font-semibold text-neutral-700">{ride.driver}</span></span></div>
                </div>
                <div className="text-right shrink-0"><p className="text-lg font-bold text-neutral-800">{ride.amount}</p></div>
              </div>
            </Card>
          ))}
        </div>
      </div>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card padding="md"><div className="flex items-center justify-between mb-3"><h2 className="text-lg font-bold text-neutral-800">Recent Rides</h2><Link href="/portal/rides"><Button variant="ghost" size="sm">View All</Button></Link></div>
          <div className="space-y-2">{pastRides.map((ride) => (
            <div key={ride.id} className="flex items-center justify-between py-2 border-b border-neutral-50 last:border-0"><div><p className="text-sm font-semibold text-neutral-800">{ride.pickup} → {ride.dropoff}</p><p className="text-xs text-neutral-400">{ride.date} · {ride.driver}</p></div><div className="text-right"><p className="text-sm font-bold text-neutral-700">{ride.amount}</p><div className="flex items-center gap-0.5 text-xs text-gold-500">{Array.from({ length: ride.rating }).map((_, i) => <Star key={i} className="h-3 w-3 fill-gold-500" />)}</div></div></div>
          ))}</div>
        </Card>
        <Card padding="md"><div className="flex items-center justify-between mb-3"><h2 className="text-lg font-bold text-neutral-800">Quick Links</h2></div>
          <div className="space-y-2">
            <Link href="/portal/book" className="flex items-center gap-3 p-3 rounded-lg hover:bg-neutral-25 transition-colors"><Car className="h-5 w-5 text-brand-600" /><span className="text-sm font-semibold text-neutral-700">Book a New Ride</span><ChevronRight className="h-4 w-4 text-neutral-300 ml-auto" /></Link>
            <Link href="/portal/invoices" className="flex items-center gap-3 p-3 rounded-lg hover:bg-neutral-25 transition-colors"><FileText className="h-5 w-5 text-brand-600" /><span className="text-sm font-semibold text-neutral-700">View Invoices</span><ChevronRight className="h-4 w-4 text-neutral-300 ml-auto" /></Link>
            <Link href="/portal/profile" className="flex items-center gap-3 p-3 rounded-lg hover:bg-neutral-25 transition-colors"><CreditCard className="h-5 w-5 text-brand-600" /><span className="text-sm font-semibold text-neutral-700">Payment Methods</span><ChevronRight className="h-4 w-4 text-neutral-300 ml-auto" /></Link>
          </div>
        </Card>
      </div>
    </div>
  );
}

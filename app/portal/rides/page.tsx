"use client";
import { useState } from "react";
import { CalendarDays, MapPin, Clock, Car, Star, Download, Plane } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge, StatusChip } from "@/components/ui/badge";
import { Tabs } from "@/components/ui/tabs";

const allRides = [
  { id: "MRL-1042", date: "Jul 15", time: "09:00 AM", pickup: "YUL Airport", dropoff: "456 Rue Peel", driver: "David Chen", vehicle: "Cadillac Escalade", status: "confirmed", amount: "$382", type: "airport_pickup", flight: "AC842" },
  { id: "MRL-1051", date: "Jul 22", time: "02:30 PM", pickup: "Ritz Carlton", dropoff: "Mont Tremblant", driver: "James Wilson", vehicle: "BMW 7 Series", status: "pending_confirmation", amount: "$520", type: "point_to_point" },
  { id: "MRL-1038", date: "Jun 28", time: "11:00 AM", pickup: "Downtown", dropoff: "YUL Airport", driver: "Michael Torres", vehicle: "Chevrolet Suburban", status: "completed", amount: "$280", type: "airport_dropoff", rating: 5 },
  { id: "MRL-1035", date: "Jun 20", time: "06:30 PM", pickup: "Hotel Bonaventure", dropoff: "Old Port", driver: "Alex Kim", vehicle: "Mercedes Sprinter", status: "completed", amount: "$145", type: "point_to_point", rating: 5 },
  { id: "MRL-1030", date: "Jun 15", time: "08:00 AM", pickup: "YUL Airport", dropoff: "Westmount", driver: "David Chen", vehicle: "Cadillac Escalade", status: "completed", amount: "$310", type: "airport_pickup", rating: 4, flight: "AC815" },
  { id: "MRL-1025", date: "May 30", time: "04:00 PM", pickup: "456 Rue Peel", dropoff: "Trudeau Airport", driver: "Omar Hassan", vehicle: "Cadillac ESV", status: "cancelled", amount: "$0", type: "airport_dropoff" },
];

export default function MyRidesPage() {
  const [tab, setTab] = useState("all");
  let filtered = allRides;
  if (tab === "upcoming") filtered = allRides.filter((r) => r.status !== "completed" && r.status !== "cancelled");
  else if (tab === "completed") filtered = allRides.filter((r) => r.status === "completed");

  return (
    <div className="max-w-4xl space-y-6">
      <div><h1 className="text-2xl font-bold text-neutral-800">My Rides</h1><p className="text-sm text-neutral-400">{allRides.length} rides total</p></div>
      <Tabs tabs={[{ id: "all", label: "All", count: allRides.length },{ id: "upcoming", label: "Upcoming", count: allRides.filter((r) => r.status !== "completed" && r.status !== "cancelled").length },{ id: "completed", label: "Completed", count: allRides.filter((r) => r.status === "completed").length },]} onChange={setTab} />
      <div className="space-y-3">
        {filtered.map((ride) => (
          <Card key={ride.id} padding="md" hover>
            <div className="flex items-start gap-4"><div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-700"><CalendarDays className="h-5 w-5" /></div>
              <div className="flex-1 min-w-0"><div className="flex items-center gap-2 flex-wrap"><span className="font-mono text-sm font-bold text-brand-700">{ride.id}</span><StatusChip status={ride.status.replace(/_/g, " ")} />{(ride.type === "airport_pickup" || ride.type === "airport_dropoff") && <Badge variant="info"><Plane className="h-3 w-3 mr-0.5" />{ride.flight || "Airport"}</Badge>}</div>
                <div className="mt-1 grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-neutral-500"><span><Clock className="h-3 w-3 inline mr-1" />{ride.date} at {ride.time}</span><span><Car className="h-3 w-3 inline mr-1" />{ride.vehicle}</span><span><MapPin className="h-3 w-3 inline mr-1" />{ride.pickup} → {ride.dropoff}</span><span>Driver: <span className="font-semibold">{ride.driver}</span></span></div>
              </div>
              <div className="text-right shrink-0"><p className="text-lg font-bold">{ride.amount}</p>{ride.rating && <div className="flex gap-0.5 mt-0.5">{Array.from({ length: ride.rating }).map((_, i) => <Star key={i} className="h-3 w-3 fill-gold-500 text-gold-500" />)}</div>}{ride.status === "completed" && <Button variant="ghost" size="sm" icon={<Download className="h-3.5 w-3.5" />} className="mt-1">Receipt</Button>}</div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

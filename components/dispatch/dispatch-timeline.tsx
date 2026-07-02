"use client";

import {
  FileText, User, Car, Navigation, CheckCircle2, Clock, AlertTriangle,
  XCircle, DollarSign, Plane, MapPin, type LucideIcon,
} from "lucide-react";

export type DispatchTimelineEventType =
  | "booking_created" | "booking_confirmed"
  | "driver_assigned" | "vehicle_assigned" | "driver_reassigned" | "vehicle_reassigned"
  | "chauffeur_en_route" | "passenger_picked_up"
  | "trip_started" | "trip_completed"
  | "invoice_generated" | "payment_received"
  | "flight_delayed" | "driver_late" | "vehicle_unavailable"
  | "cancelled" | "no_show" | "notes_added";

export interface DispatchTimelineEvent {
  id: string;
  type: DispatchTimelineEventType;
  title: string;
  description: string;
  timestamp: string;
  actor?: string;
  metadata?: Record<string, string>;
}

const config: Record<DispatchTimelineEventType, { icon: LucideIcon; color: string; bg: string }> = {
  booking_created: { icon: FileText, color: "text-brand-600", bg: "bg-brand-50 border-brand-200" },
  booking_confirmed: { icon: CheckCircle2, color: "text-success-600", bg: "bg-success-50 border-success-200" },
  driver_assigned: { icon: User, color: "text-info-600", bg: "bg-info-50 border-info-200" },
  vehicle_assigned: { icon: Car, color: "text-info-600", bg: "bg-info-50 border-info-200" },
  driver_reassigned: { icon: User, color: "text-warning-600", bg: "bg-warning-50 border-warning-200" },
  vehicle_reassigned: { icon: Car, color: "text-warning-600", bg: "bg-warning-50 border-warning-200" },
  chauffeur_en_route: { icon: Navigation, color: "text-blue-600", bg: "bg-blue-50 border-blue-200" },
  passenger_picked_up: { icon: CheckCircle2, color: "text-success-600", bg: "bg-success-50 border-success-200" },
  trip_started: { icon: MapPin, color: "text-brand-600", bg: "bg-brand-50 border-brand-200" },
  trip_completed: { icon: CheckCircle2, color: "text-success-600", bg: "bg-success-50 border-success-200" },
  invoice_generated: { icon: DollarSign, color: "text-gold-600", bg: "bg-gold-50 border-gold-200" },
  payment_received: { icon: DollarSign, color: "text-success-600", bg: "bg-success-50 border-success-200" },
  flight_delayed: { icon: Plane, color: "text-danger-600", bg: "bg-danger-50 border-danger-200" },
  driver_late: { icon: Clock, color: "text-danger-600", bg: "bg-danger-50 border-danger-200" },
  vehicle_unavailable: { icon: AlertTriangle, color: "text-danger-600", bg: "bg-danger-50 border-danger-200" },
  cancelled: { icon: XCircle, color: "text-danger-600", bg: "bg-danger-50 border-danger-200" },
  no_show: { icon: AlertTriangle, color: "text-warning-600", bg: "bg-warning-50 border-warning-200" },
  notes_added: { icon: FileText, color: "text-neutral-600", bg: "bg-neutral-50 border-neutral-200" },
};

export function DispatchTimeline({ events }: { events: DispatchTimelineEvent[] }) {
  if (!events.length) return <p className="text-sm text-neutral-400 text-center py-8">No dispatch activity yet</p>;

  const sorted = [...events].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  return (
    <div className="relative">
      {sorted.map((event, i) => {
        const cfg = config[event.type] || config.notes_added;
        const Icon = cfg.icon;
        const isLast = i === sorted.length - 1;

        return (
          <div key={event.id} className="flex gap-4">
            <div className="flex flex-col items-center">
              <div className={["flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2", cfg.bg].join(" ")}>
                <Icon className={["h-3.5 w-3.5", cfg.color].join(" ")} />
              </div>
              {!isLast && <div className="w-0.5 flex-1 min-h-[20px] bg-neutral-100" />}
            </div>
            <div className={["pb-5", isLast && "pb-0"].join(" ")}>
              <div className="flex items-center gap-2 flex-wrap">
                <p className="text-sm font-semibold text-neutral-800">{event.title}</p>
                {event.actor && <span className="text-[10px] text-neutral-400 bg-neutral-50 px-1.5 py-0.5 rounded">by {event.actor}</span>}
              </div>
              <p className="text-xs text-neutral-500 mt-0.5">{event.description}</p>
              {event.metadata && (
                <div className="flex flex-wrap gap-2 mt-1.5">
                  {Object.entries(event.metadata).map(([k, v]) => (
                    <span key={k} className="text-[10px] text-neutral-400 bg-neutral-50 px-1.5 py-0.5 rounded">
                      {k.replace(/_/g, " ")}: <span className="font-semibold text-neutral-600">{v}</span>
                    </span>
                  ))}
                </div>
              )}
              <p className="text-[10px] text-neutral-400 mt-1">
                {new Date(event.timestamp).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}
                {" · "}
                {new Date(event.timestamp).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

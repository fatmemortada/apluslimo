"use client";

import {
  CheckCircle2, Wrench, AlertTriangle, Car, CalendarDays, Camera, FileText,
  Shield, Droplets, Gauge, PaintBucket, type LucideIcon,
} from "lucide-react";

export type TimelineEventType =
  | "booking_assigned" | "trip_started" | "trip_completed"
  | "cleaning" | "maintenance" | "maintenance_completed"
  | "inspection" | "inspection_passed"
  | "accident" | "repair" | "repair_completed"
  | "insurance_renewed" | "registration_renewed"
  | "photo_added" | "document_added"
  | "fuel_added" | "mileage_recorded"
  | "driver_assigned" | "driver_removed";

export interface TimelineEvent {
  id: string;
  type: TimelineEventType;
  title: string;
  description: string;
  timestamp: string;
  metadata?: Record<string, string>;
}

const eventConfig: Record<TimelineEventType, { icon: LucideIcon; color: string; bg: string }> = {
  booking_assigned: { icon: CalendarDays, color: "text-brand-600", bg: "bg-brand-50 border-brand-200" },
  trip_started: { icon: Car, color: "text-info-600", bg: "bg-info-50 border-info-200" },
  trip_completed: { icon: CheckCircle2, color: "text-success-600", bg: "bg-success-50 border-success-200" },
  cleaning: { icon: Droplets, color: "text-blue-500", bg: "bg-blue-50 border-blue-200" },
  maintenance: { icon: Wrench, color: "text-warning-600", bg: "bg-warning-50 border-warning-200" },
  maintenance_completed: { icon: CheckCircle2, color: "text-success-600", bg: "bg-success-50 border-success-200" },
  inspection: { icon: Gauge, color: "text-purple-600", bg: "bg-purple-50 border-purple-200" },
  inspection_passed: { icon: CheckCircle2, color: "text-success-600", bg: "bg-success-50 border-success-200" },
  accident: { icon: AlertTriangle, color: "text-danger-600", bg: "bg-danger-50 border-danger-200" },
  repair: { icon: Wrench, color: "text-warning-600", bg: "bg-warning-50 border-warning-200" },
  repair_completed: { icon: CheckCircle2, color: "text-success-600", bg: "bg-success-50 border-success-200" },
  insurance_renewed: { icon: Shield, color: "text-success-600", bg: "bg-success-50 border-success-200" },
  registration_renewed: { icon: FileText, color: "text-success-600", bg: "bg-success-50 border-success-200" },
  photo_added: { icon: Camera, color: "text-info-600", bg: "bg-info-50 border-info-200" },
  document_added: { icon: FileText, color: "text-info-600", bg: "bg-info-50 border-info-200" },
  fuel_added: { icon: Gauge, color: "text-neutral-600", bg: "bg-neutral-50 border-neutral-200" },
  mileage_recorded: { icon: Gauge, color: "text-neutral-600", bg: "bg-neutral-50 border-neutral-200" },
  driver_assigned: { icon: Car, color: "text-brand-600", bg: "bg-brand-50 border-brand-200" },
  driver_removed: { icon: Car, color: "text-neutral-500", bg: "bg-neutral-50 border-neutral-200" },
};

export function VehicleTimeline({ events }: { events: TimelineEvent[] }) {
  if (!events.length) {
    return <p className="text-sm text-neutral-400 text-center py-8">No activity recorded yet</p>;
  }

  const sorted = [...events].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  return (
    <div className="relative">
      {sorted.map((event, i) => {
        const config = eventConfig[event.type] || eventConfig.mileage_recorded;
        const Icon = config.icon;
        const isLast = i === sorted.length - 1;

        return (
          <div key={event.id} className="flex gap-4">
            {/* Timeline line + dot */}
            <div className="flex flex-col items-center">
              <div className={["flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2", config.bg].join(" ")}>
                <Icon className={["h-4 w-4", config.color].join(" ")} />
              </div>
              {!isLast && <div className="w-0.5 flex-1 min-h-[24px] bg-neutral-100" />}
            </div>

            {/* Content */}
            <div className={["pb-5", isLast && "pb-0"].join(" ")}>
              <p className="text-sm font-semibold text-neutral-800">{event.title}</p>
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
                {new Date(event.timestamp).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                {" · "}
                {new Date(event.timestamp).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

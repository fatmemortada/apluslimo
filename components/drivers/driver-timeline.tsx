"use client";

import {
  CheckCircle2, Clock, CalendarDays, Car, User, Star, DollarSign,
  FileText, Shield, AlertTriangle, Award, Briefcase, Plane,
  type LucideIcon,
} from "lucide-react";

export type DriverTimelineType =
  | "trip_completed" | "trip_cancelled" | "trip_assigned" | "trip_started"
  | "license_renewed" | "medical_passed" | "background_check_passed"
  | "training_completed" | "airport_permit_issued" | "insurance_renewed"
  | "performance_review" | "compliment_received" | "complaint_received"
  | "status_changed" | "hired" | "vacation_started" | "vacation_ended"
  | "sick_leave" | "payroll_processed" | "document_uploaded";

export interface DriverTimelineEvent {
  id: string;
  type: DriverTimelineType;
  title: string;
  description: string;
  timestamp: string;
  metadata?: Record<string, string>;
}

const eventConfig: Record<DriverTimelineType, { icon: LucideIcon; color: string; bg: string }> = {
  trip_completed: { icon: CheckCircle2, color: "text-success-600", bg: "bg-success-50 border-success-200" },
  trip_cancelled: { icon: AlertTriangle, color: "text-danger-600", bg: "bg-danger-50 border-danger-200" },
  trip_assigned: { icon: CalendarDays, color: "text-brand-600", bg: "bg-brand-50 border-brand-200" },
  trip_started: { icon: Car, color: "text-info-600", bg: "bg-info-50 border-info-200" },
  license_renewed: { icon: FileText, color: "text-success-600", bg: "bg-success-50 border-success-200" },
  medical_passed: { icon: Shield, color: "text-success-600", bg: "bg-success-50 border-success-200" },
  background_check_passed: { icon: Shield, color: "text-success-600", bg: "bg-success-50 border-success-200" },
  training_completed: { icon: Award, color: "text-purple-600", bg: "bg-purple-50 border-purple-200" },
  airport_permit_issued: { icon: Plane, color: "text-info-600", bg: "bg-info-50 border-info-200" },
  insurance_renewed: { icon: Shield, color: "text-success-600", bg: "bg-success-50 border-success-200" },
  performance_review: { icon: Star, color: "text-gold-600", bg: "bg-gold-50 border-gold-200" },
  compliment_received: { icon: Star, color: "text-gold-500", bg: "bg-gold-50 border-gold-200" },
  complaint_received: { icon: AlertTriangle, color: "text-warning-600", bg: "bg-warning-50 border-warning-200" },
  status_changed: { icon: Briefcase, color: "text-brand-600", bg: "bg-brand-50 border-brand-200" },
  hired: { icon: User, color: "text-success-600", bg: "bg-success-50 border-success-200" },
  vacation_started: { icon: Plane, color: "text-info-600", bg: "bg-info-50 border-info-200" },
  vacation_ended: { icon: CheckCircle2, color: "text-success-600", bg: "bg-success-50 border-success-200" },
  sick_leave: { icon: AlertTriangle, color: "text-warning-600", bg: "bg-warning-50 border-warning-200" },
  payroll_processed: { icon: DollarSign, color: "text-success-600", bg: "bg-success-50 border-success-200" },
  document_uploaded: { icon: FileText, color: "text-info-600", bg: "bg-info-50 border-info-200" },
};

export function DriverTimeline({ events }: { events: DriverTimelineEvent[] }) {
  if (!events.length) {
    return <p className="text-sm text-neutral-400 text-center py-8">No activity recorded yet</p>;
  }

  const sorted = [...events].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  return (
    <div className="relative">
      {sorted.map((event, i) => {
        const config = eventConfig[event.type] || eventConfig.trip_completed;
        const Icon = config.icon;
        const isLast = i === sorted.length - 1;

        return (
          <div key={event.id} className="flex gap-4">
            <div className="flex flex-col items-center">
              <div className={["flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2", config.bg].join(" ")}>
                <Icon className={["h-4 w-4", config.color].join(" ")} />
              </div>
              {!isLast && <div className="w-0.5 flex-1 min-h-[24px] bg-neutral-100" />}
            </div>
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

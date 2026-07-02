"use client";

import { CheckCircle2, Circle, Clock, AlertCircle, XCircle, type LucideIcon } from "lucide-react";
import type { BookingStatus } from "@/lib/types";

interface TimelineStep {
  status: BookingStatus;
  label: string;
  description: string;
  timestamp?: string;
}

const STATUS_ORDER: BookingStatus[] = [
  "draft",
  "pending_confirmation",
  "confirmed",
  "assigned",
  "chauffeur_en_route",
  "passenger_picked_up",
  "in_progress",
  "completed",
];

const TERMINAL_STATUSES: BookingStatus[] = ["cancelled", "no_show"];

const STEP_LABELS: Record<BookingStatus, { label: string; desc: string; icon: LucideIcon }> = {
  draft: { label: "Draft", desc: "Booking created but not yet submitted", icon: Circle },
  pending_confirmation: { label: "Pending Confirmation", desc: "Awaiting customer or dispatcher confirmation", icon: Clock },
  confirmed: { label: "Confirmed", desc: "Booking confirmed, awaiting driver assignment", icon: CheckCircle2 },
  assigned: { label: "Assigned", desc: "Driver and vehicle assigned to trip", icon: CheckCircle2 },
  chauffeur_en_route: { label: "Chauffeur En Route", desc: "Driver is on the way to pickup location", icon: Clock },
  passenger_picked_up: { label: "Passenger Picked Up", desc: "Passenger has been picked up", icon: CheckCircle2 },
  in_progress: { label: "In Progress", desc: "Trip is in progress", icon: Clock },
  completed: { label: "Completed", desc: "Trip completed successfully", icon: CheckCircle2 },
  cancelled: { label: "Cancelled", desc: "Booking has been cancelled", icon: XCircle },
  no_show: { label: "No-Show", desc: "Passenger did not show up", icon: AlertCircle },
};

function getStatusIndex(status: BookingStatus): number {
  return STATUS_ORDER.indexOf(status);
}

interface BookingTimelineProps {
  currentStatus: BookingStatus;
  statusHistory?: { status: BookingStatus; timestamp: string }[];
  cancelledReason?: string;
}

export function BookingTimeline({ currentStatus, statusHistory = [], cancelledReason }: BookingTimelineProps) {
  const isTerminal = TERMINAL_STATUSES.includes(currentStatus);
  const historyMap = new Map(statusHistory.map((h) => [h.status, h.timestamp]));

  if (isTerminal) {
    // Show what was reached before cancellation/no-show + the terminal state
    const reachedStatuses = STATUS_ORDER.filter((s) => {
      const idx = getStatusIndex(s);
      const currentIdx = currentStatus === "cancelled" || currentStatus === "no_show"
        ? STATUS_ORDER.length
        : getStatusIndex(currentStatus);
      return idx <= Math.min(currentIdx, STATUS_ORDER.length - 1);
    });

    return (
      <div className="space-y-1">
        <div className="relative">
          {reachedStatuses.map((status, i) => {
            const info = STEP_LABELS[status];
            const isLast = i === reachedStatuses.length - 1;
            const Icon = info.icon;
            const isReached = true;

            return (
              <div key={status} className="flex gap-3">
                <div className="flex flex-col items-center">
                  <div className={["flex h-7 w-7 items-center justify-center rounded-full border-2 transition-all", isReached ? "border-success-500 bg-success-50 text-success-600" : "border-neutral-200 bg-white text-neutral-300"].join(" ")}>
                    <Icon className="h-3.5 w-3.5" />
                  </div>
                  {!isLast && <div className="w-0.5 flex-1 min-h-[28px] bg-success-200" />}
                </div>
                <div className={["pb-4", isLast && "pb-0"].join(" ")}>
                  <p className={["text-sm font-semibold", isReached ? "text-neutral-800" : "text-neutral-400"].join(" ")}>{info.label}</p>
                  <p className="text-xs text-neutral-400">{info.desc}</p>
                  {historyMap.get(status) && <p className="text-[10px] text-neutral-400 mt-0.5">{new Date(historyMap.get(status)!).toLocaleString()}</p>}
                </div>
              </div>
            );
          })}

          {/* Terminal state */}
          <div className="flex gap-3">
            <div className="flex flex-col items-center">
              <div className={["flex h-7 w-7 items-center justify-center rounded-full border-2", currentStatus === "cancelled" ? "border-danger-500 bg-danger-50 text-danger-600" : "border-warning-500 bg-warning-50 text-warning-600"].join(" ")}>
                {currentStatus === "cancelled" ? <XCircle className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
              </div>
            </div>
            <div>
              <p className={["text-sm font-semibold", currentStatus === "cancelled" ? "text-danger-700" : "text-warning-700"].join(" ")}>
                {STEP_LABELS[currentStatus].label}
              </p>
              <p className="text-xs text-neutral-400">{STEP_LABELS[currentStatus].desc}</p>
              {cancelledReason && <p className="text-xs text-neutral-500 mt-1 italic">Reason: {cancelledReason}</p>}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Normal flow: show all steps with current/reached/future states
  const currentIdx = getStatusIndex(currentStatus);

  return (
    <div className="space-y-1">
      <div className="relative">
        {STATUS_ORDER.map((status, i) => {
          const info = STEP_LABELS[status];
          const isReached = i <= currentIdx;
          const isCurrent = i === currentIdx;
          const isLast = i === STATUS_ORDER.length - 1;
          const Icon = info.icon;

          return (
            <div key={status} className="flex gap-3">
              <div className="flex flex-col items-center">
                <div className={[
                  "flex h-7 w-7 items-center justify-center rounded-full border-2 transition-all",
                  isCurrent ? "border-brand-500 bg-brand-50 text-brand-600 ring-2 ring-brand-100" :
                  isReached ? "border-success-500 bg-success-50 text-success-600" :
                  "border-neutral-200 bg-white text-neutral-300"
                ].join(" ")}>
                  <Icon className="h-3.5 w-3.5" />
                </div>
                {!isLast && <div className={["w-0.5 flex-1 min-h-[28px]", isReached ? "bg-success-200" : "bg-neutral-100"].join(" ")} />}
              </div>
              <div className={["pb-4", isLast && "pb-0"].join(" ")}>
                <p className={["text-sm font-semibold", isReached ? "text-neutral-800" : "text-neutral-400"].join(" ")}>
                  {isCurrent && <span className="inline-block w-1.5 h-1.5 bg-brand-500 rounded-full mr-1.5 animate-pulse-soft" />}
                  {info.label}
                </p>
                <p className="text-xs text-neutral-400">{info.desc}</p>
                {historyMap.get(status) && <p className="text-[10px] text-neutral-400 mt-0.5">{new Date(historyMap.get(status)!).toLocaleString()}</p>}
                {isCurrent && <p className="text-[10px] font-semibold text-brand-600 mt-0.5">CURRENT STATUS</p>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Compact horizontal timeline for cards
export function BookingTimelineCompact({ currentStatus }: { currentStatus: BookingStatus }) {
  const currentIdx = getStatusIndex(currentStatus);
  const isTerminal = TERMINAL_STATUSES.includes(currentStatus);
  const totalSteps = STATUS_ORDER.length;

  const progressPercent = isTerminal
    ? 100
    : Math.round(((currentIdx + 1) / totalSteps) * 100);

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-[10px]">
        <span className="text-neutral-400">Progress</span>
        <span className="font-semibold text-neutral-600">
          {isTerminal ? STEP_LABELS[currentStatus].label : `${currentIdx + 1} of ${totalSteps}`}
        </span>
      </div>
      <div className="h-1.5 w-full rounded-full bg-neutral-100 overflow-hidden">
        <div
          className={["h-full rounded-full transition-all duration-500", isTerminal && currentStatus === "cancelled" ? "bg-danger-500" : isTerminal ? "bg-warning-500" : "bg-brand-600"].join(" ")}
          style={{ width: `${progressPercent}%` }}
        />
      </div>
      <p className="text-[10px] text-neutral-400 text-right">{STEP_LABELS[currentStatus].label}</p>
    </div>
  );
}

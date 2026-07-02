import type { BookingStatus, BookingType } from "@/lib/types";

export const BOOKING_STATUS_LABEL: Record<BookingStatus, string> = {
  draft: "Draft",
  pending_confirmation: "Pending Confirmation",
  confirmed: "Confirmed",
  assigned: "Assigned",
  chauffeur_en_route: "Chauffeur En Route",
  passenger_picked_up: "Passenger Picked Up",
  in_progress: "In Progress",
  completed: "Completed",
  cancelled: "Cancelled",
  no_show: "No-Show",
};

export const BOOKING_TYPE_LABEL: Record<BookingType, string> = {
  airport_pickup: "Airport Pickup",
  airport_dropoff: "Airport Dropoff",
  point_to_point: "Point-to-Point",
  hourly: "Hourly Chauffeur",
  wedding_event: "Wedding/Event",
  corporate_roadshow: "Corporate Roadshow",
  round_trip: "Round Trip",
};

export function statusLabel(s: string): string {
  return BOOKING_STATUS_LABEL[s as BookingStatus] || s.replace(/_/g, " ");
}

export function typeLabel(t: string): string {
  return BOOKING_TYPE_LABEL[t as BookingType] || t.replace(/_/g, " ");
}

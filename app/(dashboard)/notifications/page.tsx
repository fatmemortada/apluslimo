"use client";

import { useState } from "react";
import { Bell, CheckCircle2, CalendarDays, Car, DollarSign, Users, AlertTriangle, Settings, Trash2, Shield, Wrench, FileText, Search, Filter, MessageSquare, Mail, Smartphone, Activity, Clock } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs } from "@/components/ui/tabs";
import { SearchInput } from "@/components/ui/search-input";
import { useApi } from "@/lib/hooks/use-api";
import { db, queryAll } from "@/lib/db/store";
import type { Notification, ActivityLogEntry, PaginatedResponse } from "@/lib/types";
import type { LucideIcon } from "lucide-react";

const ORG = "org_demo001";
const typeIcons: Record<string, LucideIcon> = { booking: CalendarDays, payment: DollarSign, driver: Users, maintenance: Wrench, system: Settings, alert: AlertTriangle, security: Shield, message: MessageSquare };
const typeStyles: Record<string, string> = { booking: "bg-brand-50 text-brand-700", payment: "bg-success-50 text-success-600", driver: "bg-info-50 text-info-600", maintenance: "bg-warning-50 text-warning-600", system: "bg-neutral-100 text-neutral-600", alert: "bg-danger-50 text-danger-600", security: "bg-purple-50 text-purple-600", message: "bg-blue-50 text-blue-600" };
const activityLabels: Record<string, string> = { booking_created: "Booking Created", booking_confirmed: "Booking Confirmed", booking_cancelled: "Booking Cancelled", booking_completed: "Booking Completed", trip_started: "Trip Started", trip_completed: "Trip Completed", driver_assigned: "Driver Assigned", driver_status_changed: "Driver Status Changed", vehicle_status_changed: "Vehicle Status Changed", payment_received: "Payment Received", invoice_created: "Invoice Created", invoice_paid: "Invoice Paid", maintenance_scheduled: "Maintenance Scheduled", maintenance_completed: "Maintenance Completed", customer_created: "Customer Created", document_uploaded: "Document Uploaded", user_login: "User Login", settings_changed: "Settings Changed" };

function timeAgo(d: string) { const diff = Date.now() - new Date(d).getTime(); const m = Math.floor(diff / 60000); if (m < 1) return "Just now"; if (m < 60) return `${m}m ago`; const h = Math.floor(m / 60); if (h < 24) return `${h}h ago`; return `${Math.floor(h / 24)}d ago`; }

export default function CommunicationCenter() {
  const [tab, setTab] = useState("notifications");
  const [search, setSearch] = useState("");

  const notifications = queryAll(db.notifications, ORG).filter((n) => n.userId === "user_fatme").sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  const activityLog = db.activityLog.filter((a) => a.organizationId === ORG).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const unread = notifications.filter((n) => !n.read).length;

  let displayActivities = activityLog;
  if (search) { const s = search.toLowerCase(); displayActivities = displayActivities.filter((a) => a.action.toLowerCase().includes(s) || a.entityType.toLowerCase().includes(s)); }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div><h1 className="text-2xl font-bold text-neutral-800">Communication Center</h1><p className="text-sm text-neutral-400">{unread} unread · {notifications.length} notifications · {activityLog.length} activities</p></div>
        <div className="flex gap-2">
          {unread > 0 && <Button variant="outline" size="sm" icon={<CheckCircle2 className="h-4 w-4" />}>Mark All Read</Button>}
          <Button variant="ghost" size="sm" icon={<Settings className="h-4 w-4" />}>Settings</Button>
        </div>
      </div>

      <Tabs tabs={[
        { id: "notifications", label: "Notifications", count: unread },
        { id: "activity", label: "Activity Log", count: activityLog.length },
        { id: "email", label: "Email Center" },
        { id: "sms", label: "SMS Center" },
      ]} onChange={setTab} />

      {tab === "notifications" && <div className="space-y-2">
        {notifications.length === 0 ? <Card padding="lg"><div className="text-center py-6"><Bell className="mx-auto h-8 w-8 text-neutral-300" /><p className="mt-2 text-sm text-neutral-500">All caught up!</p></div></Card> :
          notifications.map((n) => { const Icon = typeIcons[n.type] || Settings; const style = typeStyles[n.type] || typeStyles.system;
            return <Card key={n.id} padding="md" className={!n.read ? "ring-1 ring-brand-200 bg-brand-50/30" : ""}><div className="flex items-start gap-4">
              <div className={["flex h-10 w-10 shrink-0 items-center justify-center rounded-xl", style].join(" ")}><Icon className="h-5 w-5" /></div>
              <div className="flex-1 min-w-0"><div className="flex items-center gap-2"><h3 className="text-sm font-bold text-neutral-800">{n.title}</h3>{!n.read && <Badge variant="brand">New</Badge>}<Badge variant="neutral">{n.priority}</Badge></div><p className="text-sm text-neutral-500 mt-1">{n.message}</p><p className="text-xs text-neutral-400 mt-1.5">{timeAgo(n.createdAt)}</p></div>
              <Button variant="ghost" size="sm" icon={<Trash2 className="h-4 w-4 text-neutral-400" />} /></div></Card>;
          })}
      </div>}

      {tab === "activity" && <div>
        <div className="flex items-center gap-3 mb-4"><SearchInput placeholder="Search activity log..." value={search} onChange={(e) => setSearch(e.target.value)} onClear={() => setSearch("")} containerClassName="flex-1 max-w-sm" /></div>
        <Card padding="none"><div className="divide-y divide-neutral-50">
          {displayActivities.slice(0, 50).map((a) => (
            <div key={a.id} className="flex items-center gap-4 px-6 py-3.5 hover:bg-neutral-25 transition-colors">
              <Activity className="h-4 w-4 text-neutral-400 shrink-0" />
              <div className="flex-1 min-w-0"><p className="text-sm text-neutral-700"><span className="font-semibold">{activityLabels[a.action] || a.action}</span> — {a.entityType} <span className="font-mono text-xs text-neutral-400">#{a.entityId.slice(-6)}</span></p></div>
              <div className="text-right shrink-0"><p className="text-xs text-neutral-400">{timeAgo(a.createdAt)}</p><p className="text-[10px] text-neutral-300">by {a.userId}</p></div>
            </div>
          ))}
        </div></Card>
      </div>}

      {tab === "email" && <Card padding="lg"><div className="text-center py-8">
        <Mail className="mx-auto h-10 w-10 text-neutral-300" /><h3 className="text-base font-bold text-neutral-700 mt-3">Email Center</h3><p className="text-sm text-neutral-400 mt-1 max-w-md mx-auto">Email infrastructure ready for integration with SendGrid, Mailgun, or AWS SES. Templates prepared for booking confirmations, reminders, invoices, and corporate billing.</p>
        <div className="flex flex-wrap justify-center gap-2 mt-4">
          {["Booking Confirmation", "Trip Reminder", "Invoice", "Corporate Billing", "Driver Assignment"].map((t) => <Badge key={t} variant="neutral">{t}</Badge>)}
        </div>
      </div></Card>}

      {tab === "sms" && <Card padding="lg"><div className="text-center py-8">
        <Smartphone className="mx-auto h-10 w-10 text-neutral-300" /><h3 className="text-base font-bold text-neutral-700 mt-3">SMS Center</h3><p className="text-sm text-neutral-400 mt-1 max-w-md mx-auto">SMS infrastructure ready for Twilio or Vonage integration. Templates prepared for booking confirmations, driver arrival alerts, and trip completion notifications.</p>
        <div className="flex flex-wrap justify-center gap-2 mt-4">
          {["Booking Confirmed", "Driver Arriving", "Vehicle Dispatched", "Trip Complete", "Invoice Reminder"].map((t) => <Badge key={t} variant="neutral">{t}</Badge>)}
        </div>
      </div></Card>}
    </div>
  );
}

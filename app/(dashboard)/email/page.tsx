"use client";

import { useState, useMemo, useCallback } from "react";
import {
  Mail, MailOpen, Inbox, Send, Archive, AlertCircle, Search,
  Sparkles, CalendarDays, User, ChevronRight, Paperclip,
  Clock, Building2, Plus, Loader2, CheckCheck, MoreHorizontal,
  Eye, Trash2, BookOpen, Filter, RefreshCw, MessageSquare,
  Phone, MapPin, Plane, Users, X, Star, AlertTriangle,
  Ban, Briefcase, HelpCircle, MessageCircle, ChevronDown,
  ArrowUpDown, Download, Reply, Flag, Truck, Edit3, Car,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog } from "@/components/ui/dialog";
import { SlideOver } from "@/components/ui/slide-over";
import { SearchInput } from "@/components/ui/search-input";
import { useApi, useMutation } from "@/lib/hooks/use-api";
import { Dropdown } from "@/components/ui/dropdown";
import { Tabs } from "@/components/ui/tabs";
import type { EmailMessage, EmailInbox, EmailCategory, EmailPriority, PaginatedResponse, ParsedEmailData } from "@/lib/types";

// ── Company branding config ──────────────────────────────────
const COMPANY_BRANDS: Record<string, { name: string; email: string; badgeBg: string; badgeText: string; color: string }> = {
  inbox_aplus:    { name: "A Plus Limo", email: "info@apluslimo.ca", badgeBg: "bg-blue-100", badgeText: "text-blue-700", color: "bg-blue-500" },
  inbox_mtlroyal: { name: "Montreal Royal Limo", email: "info@montrealroyallimo.ca", badgeBg: "bg-purple-100", badgeText: "text-purple-700", color: "bg-purple-500" },
  inbox_calgary:  { name: "Calgary Limo Services", email: "info@calgarylimoservices.ca", badgeBg: "bg-amber-100", badgeText: "text-amber-700", color: "bg-amber-500" },
};

function getBrand(inboxId: string) {
  return COMPANY_BRANDS[inboxId] || { name: "Unknown", email: "", badgeBg: "bg-neutral-100", badgeText: "text-neutral-600", color: "bg-neutral-500" };
}

// ── Category config ──────────────────────────────────────────
const CATEGORY_CONFIG: Record<EmailCategory, { label: string; icon: any; color: string }> = {
  booking_request:      { label: "Booking Request", icon: CalendarDays, color: "text-brand-600 bg-brand-50" },
  quote_request:        { label: "Quote Request", icon: MessageSquare, color: "text-warning-600 bg-warning-50" },
  cancellation:         { label: "Cancellation", icon: Ban, color: "text-danger-600 bg-danger-50" },
  booking_modification: { label: "Modification", icon: Edit3, color: "text-info-600 bg-info-50" },
  complaint:            { label: "Complaint", icon: AlertTriangle, color: "text-danger-600 bg-danger-50" },
  general_inquiry:      { label: "Inquiry", icon: HelpCircle, color: "text-neutral-500 bg-neutral-100" },
  corporate_request:    { label: "Corporate", icon: Briefcase, color: "text-purple-600 bg-purple-50" },
  customer_question:    { label: "Question", icon: MessageCircle, color: "text-sky-600 bg-sky-50" },
  dispatch_request:     { label: "Dispatch", icon: Truck, color: "text-orange-600 bg-orange-50" },
  feedback:             { label: "Feedback", icon: Star, color: "text-gold-600 bg-gold-50" },
  other:                { label: "Other", icon: Mail, color: "text-neutral-400 bg-neutral-50" },
};

const PRIORITY_CONFIG: Record<EmailPriority, { label: string; color: string; dot: string }> = {
  low:    { label: "Low", color: "text-neutral-400", dot: "bg-neutral-300" },
  normal: { label: "Normal", color: "text-neutral-600", dot: "bg-neutral-400" },
  high:   { label: "High", color: "text-warning-600 bg-warning-50", dot: "bg-warning-500" },
  urgent: { label: "Urgent", color: "text-danger-600 bg-danger-50", dot: "bg-danger-500" },
};

const STATUS_LABELS: Record<string, { label: string; variant: "success" | "info" | "warning" | "neutral" | "brand" | "danger" }> = {
  unread: { label: "Unread", variant: "warning" },
  read: { label: "Read", variant: "neutral" },
  replied: { label: "Replied", variant: "info" },
  converted_to_booking: { label: "Converted", variant: "success" },
  archived: { label: "Archived", variant: "neutral" },
};

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  if (diff < 86400000) return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  if (diff < 172800000) return "Yesterday";
  if (diff < 604800000) return d.toLocaleDateString([], { weekday: "short" });
  return d.toLocaleDateString([], { month: "short", day: "numeric" });
}

function formatFull(d: string) {
  return new Date(d).toLocaleDateString([], { weekday: "long", month: "long", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

// ── Category Tabs ────────────────────────────────────────────
const CATEGORY_TABS = [
  { id: "all", label: "All", icon: Inbox },
  { id: "unread", label: "Unread", icon: Mail },
  { id: "booking_request", label: "Booking Requests", icon: CalendarDays },
  { id: "quote_request", label: "Quote Requests", icon: MessageSquare },
  { id: "customer_question", label: "Questions", icon: MessageCircle },
  { id: "dispatch_request", label: "Dispatch", icon: Truck },
  { id: "cancellation", label: "Cancellations", icon: Ban },
  { id: "converted_to_booking", label: "Processed", icon: CheckCheck },
  { id: "archived", label: "Archived", icon: Archive },
];

// ── Email List Item ──────────────────────────────────────────
function EmailItem({ email, selected, onSelect, onConvert }: {
  email: EmailMessage; selected: boolean; onSelect: () => void; onConvert: () => void;
}) {
  const brand = getBrand(email.inboxId);
  const cat = CATEGORY_CONFIG[email.category] || CATEGORY_CONFIG.other;
  const pri = PRIORITY_CONFIG[email.priority] || PRIORITY_CONFIG.normal;
  const CatIcon = cat.icon;
  const isUnread = email.status === "unread";
  const isConverted = email.status === "converted_to_booking";

  return (
    <button onClick={onSelect} className={["flex w-full items-start gap-3 px-5 py-4 text-left transition-all border-b border-neutral-50 last:border-b-0 group relative",
      selected ? "bg-brand-50/70 ring-1 ring-brand-200/50" : "hover:bg-neutral-25",
      isUnread ? "bg-white" : "",
    ].join(" ")}>
      {/* Priority indicator */}
      {email.priority === "urgent" && <span className="absolute left-0 top-0 bottom-0 w-0.5 bg-danger-500" />}
      {email.priority === "high" && <span className="absolute left-0 top-0 bottom-0 w-0.5 bg-warning-500" />}

      <div className="flex flex-col items-center gap-1.5 pt-0.5 w-5 shrink-0">
        <span className={["block h-2 w-2 rounded-full", isUnread ? "bg-brand-500" : "bg-transparent"].join(" ")} />
        {email.priority === "urgent" && <AlertTriangle className="h-3 w-3 text-danger-500" />}
      </div>

      {/* Company badge */}
      <span className={["shrink-0 rounded-md px-2 py-0.5 text-[10px] font-bold leading-tight", brand.badgeBg, brand.badgeText].join(" ")}>
        {brand.name}
      </span>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className={["truncate", isUnread ? "text-sm font-bold text-neutral-800" : "text-sm font-semibold text-neutral-700"].join(" ")}>
            {email.from.name}
          </span>
          <span className="shrink-0 text-[10px] text-neutral-400">&lt;{email.from.email}&gt;</span>
          {email.parsedData?.customerPhone && <Phone className="h-3 w-3 text-neutral-300 shrink-0" />}
        </div>
        <p className={["mt-0.5 truncate", isUnread ? "text-sm font-semibold text-neutral-800" : "text-sm text-neutral-600"].join(" ")}>
          {email.subject}
        </p>
        <p className="mt-0.5 truncate text-xs text-neutral-400">{email.bodyPreview}</p>
      </div>

      {/* Right info */}
      <div className="flex flex-col items-end gap-1 shrink-0 ml-2">
        <span className="text-[11px] text-neutral-400 whitespace-nowrap">{formatDate(email.receivedAt)}</span>
        <span className={["inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[9px] font-semibold", cat.color].join(" ")}>
          <CatIcon className="h-2.5 w-2.5" />
          <span className="hidden lg:inline">{cat.label}</span>
        </span>
        {email.priority !== "normal" && (
          <span className={["inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[9px] font-semibold", pri.color].join(" ")}>
            <span className={["h-1.5 w-1.5 rounded-full", pri.dot].join(" ")} />
            {pri.label}
          </span>
        )}
        {email.attachments.length > 0 && (
          <span className="flex items-center gap-1 text-[9px] text-neutral-400">
            <Paperclip className="h-2.5 w-2.5" />
            {email.attachments.length}
          </span>
        )}
        {/* Convert button on hover */}
        {!isConverted && email.status !== "archived" && (
          <span className="hidden group-hover:inline-flex mt-1">
            <button onClick={(e) => { e.stopPropagation(); onConvert(); }}
              className="rounded-md bg-brand-600 px-2 py-1 text-[10px] font-semibold text-white hover:bg-brand-700 shadow-sm transition-all whitespace-nowrap">
              Convert to Booking
            </button>
          </span>
        )}
        {isConverted && <Badge variant="success" size="sm"><CheckCheck className="h-2.5 w-2.5 mr-0.5" />Booked</Badge>}
      </div>
    </button>
  );
}

// ── Main Email Center ────────────────────────────────────────
export default function EmailCenter() {
  const [activeTab, setActiveTab] = useState("all");
  const [activeInbox, setActiveInbox] = useState("all");
  const [search, setSearch] = useState("");
  const [selectedEmail, setSelectedEmail] = useState<EmailMessage | null>(null);
  const [showConvertDialog, setShowConvertDialog] = useState(false);
  const [emailToConvert, setEmailToConvert] = useState<EmailMessage | null>(null);

  const { data: inboxesData } = useApi<EmailInbox[]>("/api/emails/inboxes");
  const inboxes = inboxesData || [];
  const queryParams = new URLSearchParams();
  queryParams.set("pageSize", "200");
  if (activeInbox !== "all") queryParams.set("inboxId", activeInbox);
  if (search) queryParams.set("search", search);
  if (activeTab === "unread") queryParams.set("status", "unread");
  if (activeTab === "converted_to_booking") queryParams.set("status", "converted_to_booking");
  if (activeTab === "archived") queryParams.set("status", "archived");
  if (activeTab === "booking_request" || activeTab === "quote_request" || activeTab === "cancellation" || activeTab === "customer_question" || activeTab === "dispatch_request") {
    queryParams.set("label", activeTab);
  }

  const { data: emailsData, isLoading, refetch } = useApi<PaginatedResponse<EmailMessage>>(`/api/emails?${queryParams}`);
  const allEmails = emailsData?.data || [];

  // Client-side category filter for tabs that map cleanly
  const emails = useMemo(() => {
    let filtered = allEmails;
    if (activeTab === "booking_request") filtered = filtered.filter(e => e.category === "booking_request");
    else if (activeTab === "quote_request") filtered = filtered.filter(e => e.category === "quote_request");
    else if (activeTab === "cancellation") filtered = filtered.filter(e => e.category === "cancellation");
    else if (activeTab === "customer_question") filtered = filtered.filter(e => e.category === "customer_question" || e.category === "general_inquiry");
    else if (activeTab === "dispatch_request") filtered = filtered.filter(e => e.category === "dispatch_request");
    return filtered;
  }, [allEmails, activeTab]);

  const markRead = useMutation("/api/emails", "PATCH");
  const convertMut = useMutation("/api/emails", "PATCH");

  const inboxSummary = useMemo(() => {
    const all = allEmails;
    return {
      total: all.length,
      unread: all.filter(e => e.status === "unread").length,
      bookingRequests: all.filter(e => e.category === "booking_request").length,
      quoteRequests: all.filter(e => e.category === "quote_request").length,
      cancellations: all.filter(e => e.category === "cancellation").length,
      complaints: all.filter(e => e.category === "complaint").length,
      processed: all.filter(e => e.status === "converted_to_booking").length,
      archived: all.filter(e => e.status === "archived").length,
      urgent: all.filter(e => e.priority === "urgent").length,
    };
  }, [allEmails]);

  async function handleSelect(email: EmailMessage) {
    setSelectedEmail(email);
    if (email.status === "unread") {
      await markRead.mutate({ id: email.id, action: "read" });
    }
  }

  function handleConvert(email: EmailMessage) {
    setEmailToConvert(email);
    setShowConvertDialog(true);
  }

  async function handleConfirmConversion(companyName: string) {
    if (!emailToConvert) return;
    await convertMut.mutate({
      id: emailToConvert.id, action: "convert_to_booking",
      bookingId: `bkg_auto_${Date.now().toString(36)}`,
    });
    setShowConvertDialog(false);
    setEmailToConvert(null);
    refetch();
  }

  return (
    <div className="flex h-[calc(100vh-5rem)] gap-0 overflow-hidden">
      {/* ── Left Sidebar ──────────────────────────────── */}
      <div className="w-64 shrink-0 border-r border-neutral-200 bg-white overflow-y-auto p-4">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xs font-bold text-neutral-500 uppercase tracking-wider">Inboxes</h2>
          <button onClick={() => refetch()} className="rounded-lg p-1 text-neutral-400 hover:bg-neutral-100" title="Refresh">
            <RefreshCw className="h-3.5 w-3.5" />
          </button>
        </div>
        <button onClick={() => setActiveInbox("all")}
          className={["flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all",
            activeInbox === "all" ? "bg-brand-50 text-brand-700" : "text-neutral-600 hover:bg-neutral-50"].join(" ")}>
          <Inbox className="h-4 w-4 shrink-0" />
          <span className="flex-1 text-left">All Inboxes</span>
          {inboxSummary.unread > 0 && <span className="rounded-full bg-brand-100 px-2 py-0.5 text-[10px] font-bold text-brand-700">{inboxSummary.unread}</span>}
        </button>
        <div className="my-3 border-t border-neutral-100" />
        <div className="space-y-0.5">
          {inboxes.map(inbox => {
            const brand = getBrand(inbox.id);
            return (
              <button key={inbox.id} onClick={() => setActiveInbox(inbox.id)}
                className={["flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition-all",
                  activeInbox === inbox.id ? "bg-neutral-100 text-neutral-800" : "text-neutral-600 hover:bg-neutral-50"].join(" ")}>
                <div className={["flex h-6 w-6 shrink-0 items-center justify-center rounded-md", brand.badgeBg, brand.badgeText].join(" ")}>
                  <Mail className="h-3 w-3" />
                </div>
                <div className="flex-1 min-w-0 text-left">
                  <p className="truncate text-xs font-semibold">{brand.name}</p>
                  <p className="text-[8px] text-warning-500 font-semibold uppercase tracking-wider">Demo</p>
                </div>
                {inbox.unreadCount > 0 && <span className={["shrink-0 rounded-full px-1.5 py-0.5 text-[9px] font-bold", brand.badgeBg, brand.badgeText].join(" ")}>{inbox.unreadCount}</span>}
              </button>
            );
          })}
        </div>

        {/* Summary stats */}
        <div className="mt-6 space-y-1.5">
          <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider mb-2">Summary</p>
          {[
            { label: "Unread", value: inboxSummary.unread, color: "text-brand-600" },
            { label: "Booking Requests", value: inboxSummary.bookingRequests, color: "text-brand-600" },
            { label: "Quote Requests", value: inboxSummary.quoteRequests, color: "text-warning-600" },
            { label: "Cancellations", value: inboxSummary.cancellations, color: "text-danger-600" },
            { label: "Urgent", value: inboxSummary.urgent, color: "text-danger-600" },
          ].map(s => (
            <div key={s.label} className="flex items-center justify-between px-1">
              <span className="text-xs text-neutral-500">{s.label}</span>
              <span className={["text-xs font-bold", s.color].join(" ")}>{s.value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Main Content ──────────────────────────────── */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Category tabs */}
        <div className="shrink-0 border-b border-neutral-200 bg-white overflow-x-auto">
          <div className="flex px-4">
            {CATEGORY_TABS.map(tab => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className={["relative flex items-center gap-1.5 px-3 py-3 text-xs font-medium whitespace-nowrap transition-colors",
                  activeTab === tab.id ? "text-brand-700" : "text-neutral-500 hover:text-neutral-700"].join(" ")}>
                <tab.icon className="h-3.5 w-3.5" />
                {tab.label}
                {activeTab === tab.id && <span className="absolute -bottom-px left-2 right-2 h-0.5 rounded-full bg-brand-600" />}
              </button>
            ))}
          </div>
        </div>

        {/* Search bar */}
        <div className="shrink-0 border-b border-neutral-200 bg-white px-5 py-2.5">
          <div className="flex items-center gap-3">
            <SearchInput placeholder="Search by sender, subject, or company..." value={search} onChange={e => setSearch(e.target.value)} onClear={() => setSearch("")} containerClassName="flex-1 max-w-lg" />
            <span className="text-xs text-neutral-400">{emails.length} emails</span>
            <Dropdown trigger={
              <Button variant="outline" size="sm" icon={<Filter className="h-3.5 w-3.5" />}>Filter</Button>
            } items={[
              { label: "All Priority", onClick: () => {} },
              { label: "Urgent Only", onClick: () => {} },
              { label: "High Priority", onClick: () => {} },
              { divider: true },
              { label: "With Attachments", onClick: () => {} },
              { label: "Has Phone Number", onClick: () => {} },
            ]} />
          </div>
        </div>

        {/* Email list */}
        <div className="flex-1 overflow-y-auto bg-white">
          {isLoading ? (
            <div className="flex items-center justify-center py-20"><Loader2 className="h-6 w-6 animate-spin text-neutral-400" /></div>
          ) : emails.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-neutral-400">
              <MailOpen className="h-12 w-12 mb-3" />
              <p className="text-sm font-medium">No emails found</p>
              <p className="text-xs mt-1">{search ? "Try a different search" : "All caught up in this view"}</p>
            </div>
          ) : (
            <div>{emails.map(email => (
              <EmailItem key={email.id} email={email} selected={selectedEmail?.id === email.id}
                onSelect={() => handleSelect(email)} onConvert={() => handleConvert(email)} />
            ))}</div>
          )}
        </div>
      </div>

      {/* ── Detail Slide-Over ─────────────────────────── */}
      <SlideOver open={!!selectedEmail} onClose={() => setSelectedEmail(null)}
        title={selectedEmail?.subject || ""}
        subtitle={selectedEmail ? `${selectedEmail.from.name} <${selectedEmail.from.email}>` : ""}
        width="xl"
        footer={selectedEmail ? (
          <div className="flex w-full items-center justify-between">
            <div className="flex items-center gap-2">
              {selectedEmail.status === "converted_to_booking" ? (
                <Badge variant="success" size="md"><CheckCheck className="h-3.5 w-3.5 mr-1" />Booking Created</Badge>
              ) : selectedEmail.status !== "archived" ? (
                <Button variant="primary" size="sm" onClick={() => handleConvert(selectedEmail)} icon={<CalendarDays className="h-4 w-4" />}>
                  Convert to Booking
                </Button>
              ) : null}
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" icon={<Reply className="h-4 w-4" />}>Reply</Button>
              <Button variant="ghost" size="sm" icon={<Archive className="h-4 w-4" />}>Archive</Button>
              <Button variant="ghost" size="sm" icon={<Trash2 className="h-4 w-4 text-danger-500" />} />
            </div>
          </div>
        ) : null}
      >
        {selectedEmail && (() => {
          const brand = getBrand(selectedEmail.inboxId);
          const cat = CATEGORY_CONFIG[selectedEmail.category] || CATEGORY_CONFIG.other;
          const pri = PRIORITY_CONFIG[selectedEmail.priority] || PRIORITY_CONFIG.normal;
          const CatIcon = cat.icon;
          const pd = selectedEmail.parsedData;

          return <div className="space-y-5">
            {/* Header badges */}
            <div className="flex flex-wrap items-center gap-2">
              <span className={["rounded-lg px-3 py-1 text-xs font-bold", brand.badgeBg, brand.badgeText].join(" ")}>{brand.name}</span>
              <Badge variant={STATUS_LABELS[selectedEmail.status]?.variant || "neutral"}>{STATUS_LABELS[selectedEmail.status]?.label || selectedEmail.status}</Badge>
              <span className={["inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold", cat.color].join(" ")}>
                <CatIcon className="h-3.5 w-3.5" />{cat.label}
              </span>
              {selectedEmail.priority !== "normal" && (
                <span className={["inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold", pri.color].join(" ")}>
                  <span className={["h-1.5 w-1.5 rounded-full", pri.dot].join(" ")} />{pri.label}
                </span>
              )}
              <span className="flex items-center gap-1 text-xs text-neutral-400">
                <Sparkles className="h-3.5 w-3.5 text-gold-500" />AI: {cat.label}
              </span>
            </div>

            {/* Sender info */}
            <div className="rounded-xl border border-neutral-200 bg-neutral-25 p-4">
              <div className="grid grid-cols-2 gap-y-3 gap-x-6 text-sm">
                <div><p className="text-[10px] text-neutral-400 uppercase font-semibold">From</p>
                  <p className="font-semibold text-neutral-800">{selectedEmail.from.name}</p>
                  <p className="text-xs text-neutral-500">{selectedEmail.from.email}</p>
                </div>
                <div><p className="text-[10px] text-neutral-400 uppercase font-semibold">Date</p>
                  <p className="font-semibold text-neutral-800">{formatFull(selectedEmail.receivedAt)}</p>
                </div>
                <div><p className="text-[10px] text-neutral-400 uppercase font-semibold">To</p>
                  <p className="text-neutral-700 text-xs">{selectedEmail.to.map(t => t.email).join(", ")}</p>
                </div>
                {selectedEmail.cc.length > 0 && <div><p className="text-[10px] text-neutral-400 uppercase font-semibold">CC</p>
                  <p className="text-neutral-700 text-xs">{selectedEmail.cc.map(c => c.email).join(", ")}</p>
                </div>}
              </div>
            </div>

            {/* Parsed Data — Extracted Fields */}
            {pd && pd.confidence > 0 && (
              <div>
                <p className="mb-2 text-[10px] font-bold text-neutral-500 uppercase tracking-wider">Extracted Information</p>
                <div className="grid grid-cols-2 gap-2">
                  {pd.customerName && <InfoChip icon={User} label="Customer" value={pd.customerName} />}
                  {pd.customerPhone && <InfoChip icon={Phone} label="Phone" value={pd.customerPhone} />}
                  {pd.pickupLocation && <InfoChip icon={MapPin} label="Pickup" value={pd.pickupLocation} />}
                  {pd.dropoffLocation && <InfoChip icon={MapPin} label="Dropoff" value={pd.dropoffLocation} />}
                  {pd.pickupDate && <InfoChip icon={CalendarDays} label="Date" value={`${pd.pickupDate}${pd.pickupTime ? ` at ${pd.pickupTime}` : ""}`} />}
                  {pd.passengerCount && <InfoChip icon={Users} label="Passengers" value={`${pd.passengerCount}`} />}
                  {pd.flightNumber && <InfoChip icon={Plane} label="Flight" value={pd.flightNumber} />}
                  {pd.vehicleType && <InfoChip icon={Car} label="Vehicle" value={pd.vehicleType.replace(/_/g, " ")} />}
                  {pd.specialRequests && <div className="col-span-2"><InfoChip icon={Star} label="Special Requests" value={pd.specialRequests} /></div>}
                </div>
                <div className="mt-1 flex items-center gap-1">
                  <span className="text-[9px] text-neutral-400">Parsing confidence:</span>
                  <div className="h-1.5 w-20 rounded-full bg-neutral-200 overflow-hidden">
                    <div className={["h-full rounded-full", pd.confidence > 0.7 ? "bg-success-500" : pd.confidence > 0.4 ? "bg-warning-500" : "bg-neutral-400"].join(" ")}
                      style={{ width: `${pd.confidence * 100}%` }} />
                  </div>
                  <span className="text-[9px] text-neutral-400">{Math.round(pd.confidence * 100)}%</span>
                </div>
              </div>
            )}

            {/* Labels */}
            {selectedEmail.labels.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {selectedEmail.labels.map(l => <Badge key={l} variant="neutral" size="sm">{l}</Badge>)}
              </div>
            )}

            {/* Body */}
            <div>
              <p className="mb-2 text-[10px] font-bold text-neutral-500 uppercase tracking-wider">Message</p>
              <div className="rounded-xl border border-neutral-200 bg-white p-5 max-h-80 overflow-y-auto">
                <p className="whitespace-pre-wrap text-sm text-neutral-700 leading-relaxed">{selectedEmail.body}</p>
              </div>
            </div>

            {/* Attachments */}
            {selectedEmail.attachments.length > 0 && (
              <div>
                <p className="mb-2 text-[10px] font-bold text-neutral-500 uppercase tracking-wider">Attachments ({selectedEmail.attachments.length})</p>
                <div className="space-y-2">
                  {selectedEmail.attachments.map(att => (
                    <div key={att.id} className="flex items-center gap-3 rounded-xl border border-neutral-200 p-3 hover:bg-neutral-25 cursor-pointer">
                      <Paperclip className="h-4 w-4 text-neutral-400" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-neutral-700 truncate">{att.filename}</p>
                        <p className="text-xs text-neutral-400">{(att.size / 1024).toFixed(0)} KB</p>
                      </div>
                      <Button variant="ghost" size="sm" icon={<Download className="h-3.5 w-3.5" />} />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Booking status */}
            {selectedEmail.status === "converted_to_booking" && (
              <div className="rounded-xl border border-success-200 bg-success-50 p-4">
                <div className="flex items-center gap-3">
                  <CheckCheck className="h-5 w-5 text-success-600" />
                  <div>
                    <p className="text-sm font-bold text-success-700">Converted to Booking</p>
                    <p className="text-xs text-success-600">This email has been processed into a booking.</p>
                  </div>
                </div>
              </div>
            )}
          </div>;
        })()}
      </SlideOver>

      {/* ── Convert Dialog ────────────────────────────── */}
      <Dialog open={showConvertDialog} onClose={() => { setShowConvertDialog(false); setEmailToConvert(null); }}
        title="Convert to Booking" description={emailToConvert?.subject || ""} size="lg"
        footer={emailToConvert ? <div className="flex gap-3">
          <Button variant="outline" onClick={() => { setShowConvertDialog(false); setEmailToConvert(null); }}>Cancel</Button>
          <Button variant="primary" onClick={() => handleConfirmConversion(getBrand(emailToConvert.inboxId).name)} icon={<CalendarDays className="h-4 w-4" />}>
            Create Booking for {getBrand(emailToConvert.inboxId).name}
          </Button>
        </div> : null}
      >
        {emailToConvert && (() => {
          const brand = getBrand(emailToConvert.inboxId);
          const pd = emailToConvert.parsedData;
          return <div className="space-y-4">
            <div className={["rounded-xl border p-4", brand.badgeBg.replace("bg-", "border-").replace("-100", "-200")].join(" ")}>
              <div className="flex items-center gap-3 mb-2">
                <Building2 className={["h-5 w-5", brand.badgeText].join(" ")} />
                <div><p className="text-sm font-semibold text-neutral-800">Auto-assigned to</p><p className={["text-sm font-bold", brand.badgeText].join(" ")}>{brand.name}</p></div>
              </div>
              <p className="text-xs text-neutral-500">Received at <strong>{brand.email}</strong></p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-lg border border-neutral-200 p-3">
                <p className="text-[10px] text-neutral-400 uppercase font-semibold">Customer</p>
                <p className="text-sm font-semibold text-neutral-800">{pd?.customerName || emailToConvert.from.name}</p>
                <p className="text-xs text-neutral-500">{pd?.customerEmail || emailToConvert.from.email}</p>
              </div>
              {pd?.customerPhone && <div className="rounded-lg border border-neutral-200 p-3">
                <p className="text-[10px] text-neutral-400 uppercase font-semibold">Phone</p>
                <p className="text-sm font-semibold text-neutral-800">{pd.customerPhone}</p>
              </div>}
              {pd?.pickupDate && <div className="rounded-lg border border-neutral-200 p-3">
                <p className="text-[10px] text-neutral-400 uppercase font-semibold">Date & Time</p>
                <p className="text-sm font-semibold text-neutral-800">{pd.pickupDate}{pd.pickupTime ? ` ${pd.pickupTime}` : ""}</p>
              </div>}
              {pd?.passengerCount && <div className="rounded-lg border border-neutral-200 p-3">
                <p className="text-[10px] text-neutral-400 uppercase font-semibold">Passengers</p>
                <p className="text-sm font-semibold text-neutral-800">{pd.passengerCount}</p>
              </div>}
              {pd?.pickupLocation && <div className="col-span-2 rounded-lg border border-neutral-200 p-3">
                <p className="text-[10px] text-neutral-400 uppercase font-semibold">Pickup</p>
                <p className="text-sm font-semibold text-neutral-800">{pd.pickupLocation}</p>
              </div>}
              {pd?.dropoffLocation && <div className="col-span-2 rounded-lg border border-neutral-200 p-3">
                <p className="text-[10px] text-neutral-400 uppercase font-semibold">Dropoff</p>
                <p className="text-sm font-semibold text-neutral-800">{pd.dropoffLocation}</p>
              </div>}
              {pd?.flightNumber && <div className="rounded-lg border border-neutral-200 p-3">
                <p className="text-[10px] text-neutral-400 uppercase font-semibold">Flight</p>
                <p className="text-sm font-semibold text-neutral-800">{pd.flightNumber}</p>
              </div>}
              {pd?.vehicleType && <div className="rounded-lg border border-neutral-200 p-3">
                <p className="text-[10px] text-neutral-400 uppercase font-semibold">Vehicle</p>
                <p className="text-sm font-semibold text-neutral-800">{pd.vehicleType.replace(/_/g, " ")}</p>
              </div>}
              {pd?.specialRequests && <div className="col-span-2 rounded-lg border border-neutral-200 p-3">
                <p className="text-[10px] text-neutral-400 uppercase font-semibold">Special Requests</p>
                <p className="text-sm text-neutral-700">{pd.specialRequests}</p>
              </div>}
            </div>
          </div>;
        })()}
      </Dialog>
    </div>
  );
}

// ── Helpers ──────────────────────────────────────────────────
function InfoChip({ icon: Icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <div className="flex items-center gap-2 rounded-lg border border-neutral-100 bg-white p-2.5">
      <Icon className="h-3.5 w-3.5 text-neutral-400 shrink-0" />
      <div className="min-w-0">
        <p className="text-[9px] text-neutral-400 uppercase font-semibold">{label}</p>
        <p className="text-xs font-semibold text-neutral-800 truncate">{value}</p>
      </div>
    </div>
  );
}

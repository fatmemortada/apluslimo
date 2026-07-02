"use client";

import { useState } from "react";
import {
  Plus, Download, Upload, MoreHorizontal, Star, Phone, Mail, MapPin,
  Building2, CalendarDays, DollarSign, FileText, Heart, CreditCard,
  Clock, Car, User, Settings, Edit, Trash2, MessageSquare,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge, StatusChip } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { SearchInput } from "@/components/ui/search-input";
import { StatCard } from "@/components/ui/stat-card";
import { Tabs } from "@/components/ui/tabs";
import { SlideOver } from "@/components/ui/slide-over";
import { Table, TableHead, TableBody, TableRow, TableHeaderCell, TableCell } from "@/components/ui/table";
import { TableRowSkeleton } from "@/components/ui/skeleton";
import { usePaginatedApi, useApi } from "@/lib/hooks/use-api";
import type { Customer, Booking, PaginatedResponse } from "@/lib/types";

// ── Helpers ──
function formatCurrency(n: number) { return `$${n.toLocaleString()}`; }

export default function CRMPage() {
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [page, setPage] = useState(1);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [detailTab, setDetailTab] = useState("overview");

  const filters: Record<string, string | undefined> = { search: search || undefined };
  if (activeTab === "vip") filters.tags = "vip";
  if (activeTab === "corporate") filters.type = "corporate";

  const { data, isLoading, refetch } = usePaginatedApi<Customer>("/api/customers", page, 20, filters);
  const customers = data?.data || [];
  const total = data?.total || 0;

  // Selected customer
  const selected = customers.find((c) => c.id === selectedId) || null;

  // Customer bookings
  const { data: customerBookings } = useApi<PaginatedResponse<Booking>>(
    selectedId ? `/api/bookings?customerId=${selectedId}&pageSize=10` : null
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-800">CRM</h1>
          <p className="text-sm text-neutral-400">{total} customers — Relationship Management</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="md" icon={<Download className="h-4 w-4" />}>Export</Button>
          <Button variant="primary" size="md" icon={<Plus className="h-4 w-4" />}>Add Customer</Button>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
        <StatCard label="Total Customers" value={String(total)} color="brand" />
        <StatCard label="VIP" value={String(customers.filter((c) => c.tags.includes("vip")).length)} color="gold" />
        <StatCard label="Corporate" value={String(customers.filter((c) => c.type === "corporate").length)} color="info" />
        <StatCard label="Avg. Lifetime Value" value="$9,450" color="success" />
        <StatCard label="Avg. Rating" value="4.82" trend="up" trendValue="0.2" color="warning" />
      </div>

      {/* Filters + Table */}
      <Tabs
        tabs={[
          { id: "all", label: "All", count: total },
          { id: "vip", label: "VIP", count: customers.filter((c) => c.tags.includes("vip")).length },
          { id: "corporate", label: "Corporate", count: customers.filter((c) => c.type === "corporate").length },
        ]}
        onChange={(t) => { setActiveTab(t); setPage(1); }}
      />

      <Card padding="none">
        <div className="flex items-center gap-3 border-b border-neutral-100 p-4">
          <SearchInput
            placeholder="Search by name, email, phone, or city..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            onClear={() => { setSearch(""); setPage(1); }}
            containerClassName="flex-1 max-w-sm"
          />
          <Button variant="outline" size="sm" icon={<Upload className="h-4 w-4" />}>Import</Button>
        </div>
        <Table>
          <TableHead>
            <TableRow>
              <TableHeaderCell>Customer</TableHeaderCell>
              <TableHeaderCell>Type</TableHeaderCell>
              <TableHeaderCell>Contact</TableHeaderCell>
              <TableHeaderCell>City</TableHeaderCell>
              <TableHeaderCell>Trips</TableHeaderCell>
              <TableHeaderCell>Revenue</TableHeaderCell>
              <TableHeaderCell>Rating</TableHeaderCell>
              <TableHeaderCell>Status</TableHeaderCell>
              <TableHeaderCell>{" "}</TableHeaderCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 7 }).map((_, i) => <TableRowSkeleton key={i} cols={9} />)
            ) : customers.length === 0 ? (
              <TableRow><td colSpan={9}><p className="text-center text-sm text-neutral-400 py-10">No customers found</p></td></TableRow>
            ) : (
              customers.map((c) => (
                <TableRow key={c.id} clickable onClick={() => setSelectedId(c.id)}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar name={c.fullName} />
                      <div>
                        <p className="font-semibold text-neutral-800 text-sm">{c.fullName}</p>
                        {c.company && <p className="text-xs text-neutral-400">{c.company}</p>}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {c.tags.includes("vip") ? <Badge variant="gold" dot>VIP</Badge>
                     : c.type === "corporate" ? <Badge variant="brand">Corporate</Badge>
                     : <Badge variant="neutral">Individual</Badge>}
                  </TableCell>
                  <TableCell>
                    <div className="text-xs space-y-0.5">
                      <p className="flex items-center gap-1 text-neutral-600"><Phone className="h-3 w-3" />{c.phone}</p>
                      <p className="flex items-center gap-1 text-neutral-400"><Mail className="h-3 w-3" />{c.email}</p>
                    </div>
                  </TableCell>
                  <TableCell className="text-neutral-600">{c.address?.city || "—"}</TableCell>
                  <TableCell className="font-semibold text-neutral-700">{c.totalTrips}</TableCell>
                  <TableCell className="font-semibold text-neutral-700">{formatCurrency(c.totalRevenue)}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1 font-semibold text-neutral-700">
                      <Star className="h-3.5 w-3.5 fill-gold-500 text-gold-500" />{c.averageRating.toFixed(1)}
                    </div>
                  </TableCell>
                  <TableCell><StatusChip status={c.status} /></TableCell>
                  <TableCell><Button variant="ghost" size="sm" icon={<MoreHorizontal className="h-4 w-4" />} /></TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
        {data && data.totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-neutral-100 px-6 py-3">
            <p className="text-xs text-neutral-400">Showing {Math.min((page - 1) * 20 + 1, total)}–{Math.min(page * 20, total)} of {total}</p>
            <div className="flex gap-1">
              <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(page - 1)}>Previous</Button>
              <Button variant="outline" size="sm" disabled={page >= data.totalPages} onClick={() => setPage(page + 1)}>Next</Button>
            </div>
          </div>
        )}
      </Card>

      {/* ── Customer Detail Slide-Over ── */}
      <SlideOver
        open={!!selected}
        onClose={() => setSelectedId(null)}
        title={selected?.fullName || ""}
        subtitle={selected?.email || ""}
        width="xl"
        footer={
          <div className="flex gap-2 w-full justify-between">
            <Button variant="destructive" size="sm" icon={<Trash2 className="h-4 w-4" />}>Delete</Button>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => setSelectedId(null)}>Close</Button>
              <Button variant="primary" size="sm" icon={<Edit className="h-4 w-4" />}>Edit Customer</Button>
            </div>
          </div>
        }
      >
        {selected && (
          <div className="space-y-6">
            {/* Identity Card */}
            <div className="flex items-start gap-4 p-4 rounded-xl bg-neutral-25 border border-neutral-100">
              <Avatar name={selected.fullName} size="xl" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-lg font-bold text-neutral-800">{selected.fullName}</h3>
                  {selected.tags.includes("vip") && <Badge variant="gold" dot>VIP</Badge>}
                  {selected.type === "corporate" && <Badge variant="brand">Corporate</Badge>}
                  <StatusChip status={selected.status} />
                </div>
                {selected.company && <p className="text-sm text-neutral-500 mt-0.5 flex items-center gap-1"><Building2 className="h-3.5 w-3.5" />{selected.company}{selected.position ? ` — ${selected.position}` : ""}</p>}
                <div className="flex flex-wrap gap-3 mt-2 text-xs text-neutral-500">
                  <span className="flex items-center gap-1"><Phone className="h-3 w-3" />{selected.phone}</span>
                  <span className="flex items-center gap-1"><Mail className="h-3 w-3" />{selected.email}</span>
                  {selected.address && <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{selected.address.city}, {selected.address.province}</span>}
                </div>
                <div className="flex gap-4 mt-2 text-xs">
                  <span className="font-semibold text-neutral-700">{selected.totalTrips} <span className="font-normal text-neutral-400">trips</span></span>
                  <span className="font-semibold text-neutral-700">{formatCurrency(selected.totalRevenue)} <span className="font-normal text-neutral-400">revenue</span></span>
                  <span className="font-semibold text-neutral-700">{formatCurrency(selected.lifetimeValue)} <span className="font-normal text-neutral-400">LTV</span></span>
                  <span className="flex items-center gap-0.5 font-semibold text-neutral-700"><Star className="h-3 w-3 fill-gold-500 text-gold-500" />{selected.averageRating.toFixed(1)}</span>
                </div>
                {selected.lastTripAt && (
                  <p className="text-xs text-neutral-400 mt-1 flex items-center gap-1"><Clock className="h-3 w-3" />Last trip: {new Date(selected.lastTripAt).toLocaleDateString()}</p>
                )}
              </div>
            </div>

            {/* Detail Tabs */}
            <Tabs
              tabs={[
                { id: "overview", label: "Overview", icon: <User className="h-4 w-4" /> },
                { id: "history", label: "Ride History", icon: <CalendarDays className="h-4 w-4" />, count: selected.totalTrips },
                { id: "preferences", label: "Preferences", icon: <Heart className="h-4 w-4" /> },
                { id: "payments", label: "Payments", icon: <CreditCard className="h-4 w-4" /> },
                { id: "notes", label: "Notes", icon: <MessageSquare className="h-4 w-4" /> },
              ]}
              onChange={setDetailTab}
            />

            {/* Tab Content */}
            <div className="min-h-[300px]">
              {detailTab === "overview" && (
                <div className="space-y-4">
                  <InfoRow label="Customer Since" value={new Date(selected.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })} />
                  <InfoRow label="Customer ID" value={selected.id} mono />
                  <InfoRow label="Type" value={selected.type === "individual" ? "Individual" : "Corporate"} />
                  <InfoRow label="Status" value={<StatusChip status={selected.status} />} />
                  <InfoRow label="Tags" value={selected.tags.length ? selected.tags.map((t) => <Badge key={t} variant="neutral" className="mr-1 capitalize">{t.replace(/_/g, " ")}</Badge>) : "—"} />
                  {selected.address && <InfoRow label="Address" value={`${selected.address.street}, ${selected.address.city}, ${selected.address.province} ${selected.address.postalCode}`} />}
                  <InfoRow label="Total Trips" value={String(selected.totalTrips)} />
                  <InfoRow label="Total Revenue" value={formatCurrency(selected.totalRevenue)} />
                  <InfoRow label="Lifetime Value" value={formatCurrency(selected.lifetimeValue)} />
                </div>
              )}

              {detailTab === "history" && (
                <div className="space-y-2">
                  {customerBookings?.data?.length ? (
                    customerBookings.data.map((b) => (
                      <div key={b.id} className="flex items-center justify-between rounded-lg border border-neutral-100 p-3 hover:bg-neutral-25 transition-colors">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-50 text-brand-700"><CalendarDays className="h-4 w-4" /></div>
                          <div>
                            <p className="text-sm font-semibold text-neutral-800">{b.bookingNumber}</p>
                            <p className="text-xs text-neutral-400">{b.pickup.address.city} → {b.dropoff.address.city}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-semibold text-neutral-700">{formatCurrency(b.totalAmount)}</p>
                          <p className="text-xs text-neutral-400">{new Date(b.scheduledPickupAt).toLocaleDateString()} · <StatusChip status={b.status.replace(/_/g, " ")} /></p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-neutral-400 text-center py-8">No booking history yet</p>
                  )}
                </div>
              )}

              {detailTab === "preferences" && (
                <div className="space-y-4">
                  <InfoRow label="Preferred Vehicle" value={selected.preferences.preferredVehicleType?.replace(/_/g, " ") || "Not set"} />
                  <InfoRow label="Preferred Driver" value={selected.preferences.preferredDriverId || "Not set"} />
                  <InfoRow label="Payment Method" value={selected.preferences.preferredPaymentMethod.replace(/_/g, " ")} />
                  <InfoRow label="Music Preference" value={selected.preferences.musicPreference || "Not specified"} />
                  <InfoRow label="Temperature" value={selected.preferences.temperaturePreference || "Not specified"} />
                  <InfoRow label="Water Brand" value={selected.preferences.waterBrand || "Not specified"} />
                  <InfoRow label="Newspaper" value={selected.preferences.newspaper || "Not specified"} />
                  <InfoRow label="SMS Notifications" value={selected.preferences.notifySms ? "Enabled" : "Disabled"} />
                  <InfoRow label="Email Notifications" value={selected.preferences.notifyEmail ? "Enabled" : "Disabled"} />
                  {selected.preferences.specialInstructions && (
                    <InfoRow label="Special Instructions" value={selected.preferences.specialInstructions} />
                  )}
                </div>
              )}

              {detailTab === "payments" && (
                <div className="space-y-4">
                  <Card padding="md">
                    <h4 className="text-sm font-bold text-neutral-700 mb-3">Payment Profile</h4>
                    <InfoRow label="Default Method" value={selected.preferences.preferredPaymentMethod.replace(/_/g, " ")} />
                    <InfoRow label="Total Revenue" value={formatCurrency(selected.totalRevenue)} />
                    <InfoRow label="Outstanding Balance" value="$0.00" />
                    <InfoRow label="Credit Limit" value={selected.type === "corporate" ? "$25,000" : "N/A"} />
                  </Card>
                </div>
              )}

              {detailTab === "notes" && (
                <div className="space-y-4">
                  <Card padding="md">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-sm font-bold text-neutral-700">Internal Notes</h4>
                      <Button variant="ghost" size="sm" icon={<Plus className="h-3.5 w-3.5" />}>Add Note</Button>
                    </div>
                    {selected.notes ? (
                      <p className="text-sm text-neutral-600 whitespace-pre-wrap">{selected.notes}</p>
                    ) : (
                      <p className="text-sm text-neutral-400 text-center py-6">No notes yet. Add internal notes about this customer.</p>
                    )}
                  </Card>
                </div>
              )}
            </div>
          </div>
        )}
      </SlideOver>
    </div>
  );
}

// ── Mini Helper ──
function InfoRow({ label, value, mono }: { label: string; value: React.ReactNode; mono?: boolean }) {
  return (
    <div className="flex items-start justify-between py-2 border-b border-neutral-50 last:border-0 gap-4">
      <span className="text-xs font-medium text-neutral-400 shrink-0">{label}</span>
      <span className={["text-sm text-right", mono ? "font-mono text-neutral-500" : "text-neutral-700 font-medium"].join(" ")}>{value}</span>
    </div>
  );
}

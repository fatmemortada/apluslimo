"use client";

import { useState } from "react";
import {
  Plus, Building2, Users, DollarSign, TrendingUp, Download, Upload,
  Phone, Mail, MapPin, FileText, CreditCard, Shield, Settings, Edit,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge, StatusChip } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { StatCard } from "@/components/ui/stat-card";
import { SearchInput } from "@/components/ui/search-input";
import { SlideOver } from "@/components/ui/slide-over";
import { Tabs } from "@/components/ui/tabs";
import { Table, TableHead, TableBody, TableRow, TableHeaderCell, TableCell } from "@/components/ui/table";
import { TableRowSkeleton } from "@/components/ui/skeleton";
import type { CorporateAccount, Customer } from "@/lib/types";
import { useApi, usePaginatedApi } from "@/lib/hooks/use-api";
import { db } from "@/lib/db/store";
import { queryAll } from "@/lib/db/store";

const ORG_ID = "org_demo001";
function formatCur(n: number) { return `$${n.toLocaleString()}`; }

export default function CorporatePage() {
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [detailTab, setDetailTab] = useState("overview");

  const accounts = Array.from(db.corporateAccounts.values()).filter((a) => a.organizationId === ORG_ID);
  const customers = queryAll(db.customers, ORG_ID);

  const filtered = accounts.filter((a) =>
    !search || a.companyName.toLowerCase().includes(search.toLowerCase())
  );

  const selected = accounts.find((a) => a.id === selectedId) || null;

  // Stats
  const totalRevenue = accounts.reduce((s, a) => s + a.totalRevenue, 0);
  const totalTrips = accounts.reduce((s, a) => s + a.totalTrips, 0);
  const active = accounts.filter((a) => a.status === "active").length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-800">Corporate Accounts</h1>
          <p className="text-sm text-neutral-400">{accounts.length} accounts — Enterprise client management</p>
        </div>
        <Button variant="primary" size="md" icon={<Plus className="h-4 w-4" />}>Add Account</Button>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
        <StatCard label="Total Accounts" value={String(accounts.length)} icon={<Building2 className="h-5 w-5" />} color="brand" />
        <StatCard label="Active" value={String(active)} color="success" />
        <StatCard label="Total Trips" value={String(totalTrips)} color="info" />
        <StatCard label="Total Revenue" value={formatCur(totalRevenue)} trend="up" trendValue="18%" color="gold" />
        <StatCard label="Avg. Contract" value="$4,380" color="warning" />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card padding="none">
            <div className="flex items-center gap-3 border-b border-neutral-100 p-4">
              <SearchInput placeholder="Search accounts..." value={search} onChange={(e) => setSearch(e.target.value)} onClear={() => setSearch("")} containerClassName="flex-1 max-w-sm" />
              <Button variant="outline" size="sm" icon={<Download className="h-4 w-4" />}>Export</Button>
            </div>
            <Table>
              <TableHead>
                <TableRow>
                  <TableHeaderCell>Company</TableHeaderCell>
                  <TableHeaderCell>Contact</TableHeaderCell>
                  <TableHeaderCell>Plan</TableHeaderCell>
                  <TableHeaderCell>Trips</TableHeaderCell>
                  <TableHeaderCell>Revenue</TableHeaderCell>
                  <TableHeaderCell>Discount</TableHeaderCell>
                  <TableHeaderCell>Status</TableHeaderCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filtered.map((a) => (
                  <TableRow key={a.id} clickable onClick={() => setSelectedId(a.id)}>
                    <TableCell><span className="font-semibold text-neutral-800">{a.companyName}</span></TableCell>
                    <TableCell className="text-neutral-600">{a.billingContactName}</TableCell>
                    <TableCell><Badge variant={a.paymentTerms === "net_30" ? "brand" : "info"}>{a.paymentTerms.replace(/_/g, " ").toUpperCase()}</Badge></TableCell>
                    <TableCell className="font-semibold text-neutral-700">{a.totalTrips}</TableCell>
                    <TableCell className="font-semibold text-neutral-700">{formatCur(a.totalRevenue)}</TableCell>
                    <TableCell className="text-neutral-500">{(a.discountRate * 100).toFixed(0)}%</TableCell>
                    <TableCell><StatusChip status={a.status} /></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </div>

        {/* Summary Card */}
        <Card padding="md">
          <h3 className="text-sm font-bold text-neutral-700 mb-4 flex items-center gap-2"><Shield className="h-4 w-4 text-brand-600" />Account Summary</h3>
          <div className="space-y-3">
            <div className="flex justify-between text-xs"><span className="text-neutral-400">Net 30 Accounts</span><span className="font-semibold text-neutral-700">{accounts.filter((a) => a.paymentTerms === "net_30").length}</span></div>
            <div className="flex justify-between text-xs"><span className="text-neutral-400">Net 15 Accounts</span><span className="font-semibold text-neutral-700">{accounts.filter((a) => a.paymentTerms === "net_15").length}</span></div>
            <div className="flex justify-between text-xs"><span className="text-neutral-400">With Discount</span><span className="font-semibold text-neutral-700">{accounts.filter((a) => a.discountRate > 0).length}</span></div>
            <div className="flex justify-between text-xs"><span className="text-neutral-400">Total Credit Limit</span><span className="font-semibold text-neutral-700">{formatCur(accounts.reduce((s, a) => s + (a.creditLimit || 0), 0))}</span></div>
          </div>
        </Card>
      </div>

      {/* ── Corporate Detail Slide-Over ── */}
      <SlideOver
        open={!!selected}
        onClose={() => setSelectedId(null)}
        title={selected?.companyName || ""}
        subtitle={selected ? `${selected.employees} employees · ${selected.paymentTerms.replace(/_/g, " ")}` : ""}
        width="xl"
        footer={
          <div className="flex gap-2 w-full justify-between">
            <Button variant="destructive" size="sm">Remove Account</Button>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => setSelectedId(null)}>Close</Button>
              <Button variant="primary" size="sm" icon={<Edit className="h-4 w-4" />}>Edit Account</Button>
            </div>
          </div>
        }
      >
        {selected && (
          <div className="space-y-6">
            {/* Company Identity */}
            <div className="flex items-start gap-4 p-4 rounded-xl bg-neutral-25 border border-neutral-100">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-brand-100 text-brand-700"><Building2 className="h-7 w-7" /></div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2"><h3 className="text-lg font-bold text-neutral-800">{selected.companyName}</h3><StatusChip status={selected.status} /></div>
                <p className="text-xs text-neutral-500 mt-1 flex items-center gap-1"><MapPin className="h-3 w-3" />{selected.address.street}, {selected.address.city}</p>
                <div className="flex gap-4 mt-2 text-xs">
                  <span className="font-semibold text-neutral-700">{selected.employees} <span className="font-normal text-neutral-400">employees</span></span>
                  <span className="font-semibold text-neutral-700">{formatCur(selected.totalRevenue)} <span className="font-normal text-neutral-400">revenue</span></span>
                  <span className="font-semibold text-neutral-700">{selected.totalTrips} <span className="font-normal text-neutral-400">trips</span></span>
                </div>
              </div>
            </div>

            <Tabs
              tabs={[
                { id: "overview", label: "Overview", icon: <Building2 className="h-4 w-4" /> },
                { id: "billing", label: "Billing", icon: <DollarSign className="h-4 w-4" /> },
                { id: "employees", label: "Employees", icon: <Users className="h-4 w-4" /> },
                { id: "contract", label: "Contract", icon: <FileText className="h-4 w-4" /> },
              ]}
              onChange={setDetailTab}
            />

            <div className="min-h-[300px]">
              {detailTab === "overview" && (
                <div className="space-y-4">
                  <InfoRow label="Company Name" value={selected.companyName} />
                  <InfoRow label="Tax ID" value={selected.taxId || "—"} />
                  <InfoRow label="Billing Contact" value={selected.billingContactName} />
                  <InfoRow label="Billing Email" value={selected.billingEmail} />
                  <InfoRow label="Contract Start" value={new Date(selected.contractStartDate).toLocaleDateString()} />
                  {selected.contractEndDate && <InfoRow label="Contract End" value={new Date(selected.contractEndDate).toLocaleDateString()} />}
                  <InfoRow label="Status" value={<StatusChip status={selected.status} />} />
                </div>
              )}

              {detailTab === "billing" && (
                <div className="space-y-4">
                  <Card padding="md">
                    <h4 className="text-sm font-bold text-neutral-700 mb-3">Billing Configuration</h4>
                    <InfoRow label="Payment Terms" value={selected.paymentTerms.replace(/_/g, " ").toUpperCase()} />
                    <InfoRow label="Discount Rate" value={`${(selected.discountRate * 100).toFixed(0)}%`} />
                    <InfoRow label="Credit Limit" value={selected.creditLimit ? formatCur(selected.creditLimit) : "None"} />
                    <InfoRow label="Total Revenue" value={formatCur(selected.totalRevenue)} />
                    <InfoRow label="Total Trips" value={String(selected.totalTrips)} />
                  </Card>
                  <Card padding="md">
                    <h4 className="text-sm font-bold text-neutral-700 mb-3">Monthly Invoicing</h4>
                    <label className="flex items-center gap-3 py-2">
                      <input type="checkbox" defaultChecked className="h-4 w-4 rounded border-neutral-200 text-brand-600 focus:ring-brand-500/30" />
                      <span className="text-sm text-neutral-700">Auto-generate monthly invoice</span>
                    </label>
                    <label className="flex items-center gap-3 py-2">
                      <input type="checkbox" defaultChecked className="h-4 w-4 rounded border-neutral-200 text-brand-600 focus:ring-brand-500/30" />
                      <span className="text-sm text-neutral-700">Require approval for bookings</span>
                    </label>
                    <label className="flex items-center gap-3 py-2">
                      <input type="checkbox" defaultChecked className="h-4 w-4 rounded border-neutral-200 text-brand-600 focus:ring-brand-500/30" />
                      <span className="text-sm text-neutral-700">Send invoice by email</span>
                    </label>
                  </Card>
                  <Card padding="md">
                    <h4 className="text-sm font-bold text-neutral-700 mb-3">Cost Centers</h4>
                    <div className="space-y-2">
                      {["Executive Travel", "Sales Team", "Operations", "Client Entertainment"].map((cc) => (
                        <div key={cc} className="flex items-center justify-between text-sm py-1.5 border-b border-neutral-50 last:border-0">
                          <span className="text-neutral-700">{cc}</span>
                          <span className="text-xs text-neutral-400 font-mono">CC-{Math.floor(Math.random() * 9000) + 1000}</span>
                        </div>
                      ))}
                    </div>
                  </Card>
                </div>
              )}

              {detailTab === "employees" && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between"><p className="text-sm text-neutral-500">Authorized employees/passengers</p><Button variant="outline" size="sm" icon={<Plus className="h-3.5 w-3.5" />}>Add</Button></div>
                  {customers.slice(0, 4).map((c) => (
                    <div key={c.id} className="flex items-center gap-3 rounded-lg border border-neutral-100 p-3">
                      <Avatar name={c.fullName} size="sm" />
                      <div className="flex-1"><p className="text-sm font-semibold text-neutral-800">{c.fullName}</p><p className="text-xs text-neutral-400">{c.email}</p></div>
                      <Badge variant="success" dot>Active</Badge>
                    </div>
                  ))}
                </div>
              )}

              {detailTab === "contract" && (
                <div className="space-y-4">
                  <Card padding="md">
                    <h4 className="text-sm font-bold text-neutral-700 mb-3">Contract Details</h4>
                    <InfoRow label="Start Date" value={new Date(selected.contractStartDate).toLocaleDateString()} />
                    {selected.contractEndDate && <InfoRow label="End Date" value={new Date(selected.contractEndDate).toLocaleDateString()} />}
                    <InfoRow label="Payment Terms" value={selected.paymentTerms.replace(/_/g, " ")} />
                    <InfoRow label="Discount Rate" value={`${(selected.discountRate * 100).toFixed(0)}%`} />
                    <InfoRow label="Credit Limit" value={selected.creditLimit ? formatCur(selected.creditLimit) : "None"} />
                  </Card>
                  <Card padding="md">
                    <h4 className="text-sm font-bold text-neutral-700 mb-3">Contract Notes</h4>
                    <p className="text-sm text-neutral-600 whitespace-pre-wrap">Corporate transportation agreement for {selected.companyName}. Includes airport transfers, executive travel, and event transportation services. Annual review scheduled.</p>
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

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between py-2 border-b border-neutral-50 last:border-0 gap-4">
      <span className="text-xs font-medium text-neutral-400 shrink-0">{label}</span>
      <span className="text-sm text-right text-neutral-700 font-medium">{value}</span>
    </div>
  );
}

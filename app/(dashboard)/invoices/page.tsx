"use client";

import { useState, useMemo } from "react";
import {
  Plus, Search, Download, FileText, DollarSign, Clock, Send, CreditCard,
  Building2, User, CalendarDays, Printer, Mail, AlertTriangle, CheckCircle2,
  XCircle, Filter, TrendingUp, TrendingDown, Receipt, Ban, RefreshCw,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge, StatusChip } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { StatCard } from "@/components/ui/stat-card";
import { SearchInput } from "@/components/ui/search-input";
import { Tabs } from "@/components/ui/tabs";
import { SlideOver } from "@/components/ui/slide-over";
import { Table, TableHead, TableBody, TableRow, TableHeaderCell, TableCell } from "@/components/ui/table";
import { TableRowSkeleton } from "@/components/ui/skeleton";
import { useApi } from "@/lib/hooks/use-api";
import { db, queryAll } from "@/lib/db/store";
import type { Invoice, Payment, PaginatedResponse } from "@/lib/types";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const ORG = "org_demo001";
const chartTooltip = { contentStyle: { borderRadius: "12px", border: "1px solid #e2e8f0", boxShadow: "0 10px 25px rgba(0,0,0,0.08)", background: "#fff", padding: "10px 14px", fontSize: "13px" } };
const fmt$ = (n: number) => `$${n.toLocaleString(undefined, { minimumFractionDigits: 2 })}`;

export default function FinancialOperationsCenter() {
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [viewTab, setViewTab] = useState<"invoices" | "payments" | "dashboard">("dashboard");

  const invoices = queryAll(db.invoices, ORG);
  const payments = queryAll(db.payments, ORG);
  const customers = Object.fromEntries(queryAll(db.customers, ORG).map((c) => [c.id, c]));
  const bookings = Object.fromEntries(queryAll(db.bookings, ORG).map((b) => [b.id, b]));

  // Filters
  let filteredInvoices = invoices;
  if (search) { const s = search.toLowerCase(); filteredInvoices = filteredInvoices.filter((i) => i.invoiceNumber.toLowerCase().includes(s) || customers[i.customerId]?.fullName?.toLowerCase().includes(s)); }
  if (activeTab !== "all") filteredInvoices = filteredInvoices.filter((i) => i.status === activeTab);

  // KPIs
  const totalBilled = invoices.reduce((s, i) => s + i.totalAmount, 0);
  const totalPaid = invoices.filter((i) => i.status === "paid").reduce((s, i) => s + i.amountPaid, 0);
  const totalOutstanding = invoices.filter((i) => i.status === "sent" || i.status === "overdue" || i.status === "partial").reduce((s, i) => s + i.balanceDue, 0);
  const totalOverdue = invoices.filter((i) => i.status === "overdue").reduce((s, i) => s + i.balanceDue, 0);
  const paidCount = invoices.filter((i) => i.status === "paid").length;
  const overdueCount = invoices.filter((i) => i.status === "overdue").length;

  // Monthly data
  const monthlyFinancials = [
    { month: "Jan", billed: 28000, paid: 26500 }, { month: "Feb", billed: 24000, paid: 22800 },
    { month: "Mar", billed: 32000, paid: 30500 }, { month: "Apr", billed: 29000, paid: 27500 },
    { month: "May", billed: 35000, paid: 33200 }, { month: "Jun", billed: 38500, paid: 35800 },
  ];

  // Selected invoice detail
  const selected = invoices.find((i) => i.id === selectedId) || null;
  const selCustomer = selected ? customers[selected.customerId] : null;
  const selBooking = selected?.bookingId ? bookings[selected.bookingId] : null;
  const selPayments = selectedId ? payments.filter((p) => p.invoiceId === selectedId) : [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div><h1 className="text-2xl font-bold text-neutral-800">Financial Operations</h1><p className="text-sm text-neutral-400">{invoices.length} invoices · {payments.length} payments · {fmt$(totalBilled)} billed</p></div>
        <div className="flex gap-2">
          <Button variant="outline" size="md" icon={<Download className="h-4 w-4" />}>Export</Button>
          <Button variant="primary" size="md" icon={<Plus className="h-4 w-4" />}>Create Invoice</Button>
        </div>
      </div>

      {/* View Toggle */}
      <div className="flex gap-1.5">
        {(["dashboard", "invoices", "payments"] as const).map((v) => (
          <Button key={v} variant={viewTab === v ? "primary" : "outline"} size="sm" onClick={() => setViewTab(v)} className="capitalize">{v}</Button>
        ))}
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
        <StatCard label="Total Billed" value={fmt$(totalBilled)} trend="up" trendValue="14%" color="brand" />
        <StatCard label="Collected" value={fmt$(totalPaid)} color="success" />
        <StatCard label="Outstanding" value={fmt$(totalOutstanding)} color="warning" />
        <StatCard label="Overdue" value={fmt$(totalOverdue)} color="danger" />
        <StatCard label="Collection Rate" value={`${totalBilled > 0 ? Math.round((totalPaid / totalBilled) * 100) : 0}%`} color="gold" />
      </div>

      {viewTab === "dashboard" && (
        <div className="space-y-6">
          <Card padding="md">
            <h2 className="text-base font-bold text-neutral-800 mb-4">Billed vs Collected</h2>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={monthlyFinancials}><CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" /><XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#94a3b8" }} /><YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#94a3b8" }} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} /><Tooltip {...chartTooltip} /><Bar dataKey="billed" fill="#4263eb" radius={[6, 6, 0, 0]} barSize={20} name="Billed" /><Bar dataKey="paid" fill="#10b981" radius={[6, 6, 0, 0]} barSize={20} name="Collected" /></BarChart>
            </ResponsiveContainer>
          </Card>

          {/* Financial Summary Cards */}
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            <Card padding="md"><h3 className="text-sm font-bold text-neutral-800 mb-3 flex items-center gap-2"><TrendingUp className="h-4 w-4 text-success-500" />Revenue Breakdown</h3>
              <div className="space-y-2 text-sm"><FinLine label="Gross Revenue" value={totalBilled} /><FinLine label="Taxes (15%)" value={totalBilled * 0.13} /><FinLine label="Tips" value={totalBilled * 0.08} /><FinLine label="Discounts" value={totalBilled * 0.04} /><FinLine label="Refunds" value={totalBilled * 0.01} /><div className="border-t border-neutral-200 pt-2 flex justify-between"><span className="font-bold">Net Revenue</span><span className="font-bold text-brand-700">{fmt$(totalBilled * 0.87)}</span></div></div></Card>
            <Card padding="md"><h3 className="text-sm font-bold text-neutral-800 mb-3 flex items-center gap-2"><AlertTriangle className="h-4 w-4 text-danger-500" />Outstanding</h3>
              <div className="space-y-2"><FinLine label="Current" value={totalOutstanding - totalOverdue} /><FinLine label="1-30 Days" value={totalOverdue * 0.6} /><FinLine label="31-60 Days" value={totalOverdue * 0.3} /><FinLine label="60+ Days" value={totalOverdue * 0.1} /><div className="border-t border-neutral-200 pt-2 flex justify-between"><span className="font-bold text-danger-600">Total Outstanding</span><span className="font-bold text-danger-600">{fmt$(totalOutstanding)}</span></div></div></Card>
            <Card padding="md"><h3 className="text-sm font-bold text-neutral-800 mb-3 flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-success-500" />Quick Stats</h3>
              <div className="space-y-2 text-sm"><FinLine label="Paid Invoices" value={paidCount} isCount /><FinLine label="Overdue Invoices" value={overdueCount} isCount /><FinLine label="Avg Payment Time" value={12} suffix=" days" /><FinLine label="Refund Rate" value={1.2} suffix="%" /></div></Card>
          </div>
        </div>
      )}

      {viewTab === "invoices" && (
        <div>
          <Tabs tabs={[{ id: "all", label: "All", count: invoices.length },{ id: "sent", label: "Sent" },{ id: "paid", label: "Paid" },{ id: "overdue", label: "Overdue", count: overdueCount },{ id: "draft", label: "Draft" }]} onChange={setActiveTab} />
          <div className="mt-4">
            <Card padding="none">
              <div className="flex items-center gap-3 border-b border-neutral-100 p-4"><SearchInput placeholder="Search by invoice # or customer..." value={search} onChange={(e) => setSearch(e.target.value)} onClear={() => setSearch("")} containerClassName="flex-1 max-w-sm" /></div>
              <div className="divide-y divide-neutral-50">
                {filteredInvoices.slice(0, 15).map((inv) => {
                  const cust = customers[inv.customerId];
                  return (
                    <div key={inv.id} className="flex items-center gap-4 px-6 py-4 hover:bg-neutral-25 transition-colors cursor-pointer" onClick={() => setSelectedId(inv.id)}>
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-neutral-100 text-neutral-500"><FileText className="h-5 w-5" /></div>
                      <div className="flex-1 min-w-0"><div className="flex items-center gap-2"><span className="font-mono text-sm font-bold text-brand-700">{inv.invoiceNumber}</span><StatusChip status={inv.status} /></div><p className="text-sm text-neutral-600 mt-0.5">{cust?.fullName || inv.customerId}</p><p className="text-xs text-neutral-400">Issued {new Date(inv.issueDate).toLocaleDateString()} · Due {new Date(inv.dueDate).toLocaleDateString()}</p></div>
                      <div className="text-right"><p className="text-lg font-bold text-neutral-800">{fmt$(inv.totalAmount)}</p>{inv.balanceDue > 0 && <p className="text-xs text-warning-600 font-semibold">Balance: {fmt$(inv.balanceDue)}</p>}</div>
                    </div>
                  );
                })}
              </div>
            </Card>
          </div>
        </div>
      )}

      {viewTab === "payments" && (
        <Card padding="none">
          <div className="divide-y divide-neutral-50">
            {payments.slice(0, 15).map((p) => {
              const cust = customers[p.customerId];
              return (
                <div key={p.id} className="flex items-center gap-4 px-6 py-4 hover:bg-neutral-25">
                  <div className={["flex h-10 w-10 shrink-0 items-center justify-center rounded-xl", p.status === "completed" ? "bg-success-50 text-success-600" : "bg-warning-50 text-warning-600"].join(" ")}><DollarSign className="h-5 w-5" /></div>
                  <div className="flex-1"><p className="text-sm font-semibold text-neutral-800">{cust?.fullName || p.customerId}</p><p className="text-xs text-neutral-400">{p.reference || p.id} · {p.method.replace(/_/g, " ")}</p></div>
                  <div className="text-right"><p className="text-lg font-bold text-neutral-800">{fmt$(p.amount)}</p><StatusChip status={p.status} /><p className="text-[10px] text-neutral-400">{new Date(p.processedAt).toLocaleDateString()}</p></div>
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {/* ── Invoice Detail Slide-Over ── */}
      <SlideOver open={!!selected} onClose={() => setSelectedId(null)} title={selected ? `Invoice ${selected.invoiceNumber}` : ""} subtitle={selected ? `${fmt$(selected.totalAmount)} · ${selected.status}` : ""} width="xl"
        footer={
          <div className="flex gap-2 flex-wrap justify-end w-full">
            <Button variant="outline" size="sm" icon={<Printer className="h-3.5 w-3.5" />}>Print</Button>
            <Button variant="outline" size="sm" icon={<Download className="h-3.5 w-3.5" />}>Download PDF</Button>
            <Button variant="outline" size="sm" icon={<Mail className="h-3.5 w-3.5" />}>Email</Button>
            {selected && selected.status !== "paid" && <Button variant="primary" size="sm" icon={<CreditCard className="h-3.5 w-3.5" />}>Record Payment</Button>}
          </div>
        }>
        {selected && selCustomer && (
          <div className="space-y-6">
            {/* Status Banner */}
            <div className={["rounded-xl p-4 border", selected.status === "paid" ? "bg-success-50 border-success-200" : selected.status === "overdue" ? "bg-danger-50 border-danger-200" : selected.status === "sent" ? "bg-info-50 border-info-200" : "bg-neutral-50 border-neutral-200"].join(" ")}>
              <div className="flex items-center justify-between"><div className="flex items-center gap-2"><StatusChip status={selected.status} />{selected.status === "overdue" && <Badge variant="danger">Overdue</Badge>}</div><span className="text-2xl font-black text-neutral-800">{fmt$(selected.totalAmount)}</span></div>
              <div className="flex gap-4 mt-2 text-xs text-neutral-500"><span>Issued: {new Date(selected.issueDate).toLocaleDateString()}</span><span>Due: {new Date(selected.dueDate).toLocaleDateString()}</span><span>Balance: <span className={selected.balanceDue > 0 ? "text-danger-600 font-bold" : "text-success-600 font-bold"}>{fmt$(selected.balanceDue)}</span></span></div>
            </div>

            {/* Invoice Header (PDF-ready layout) */}
            <div className="border border-neutral-200 rounded-xl p-6 bg-white">
              <div className="flex justify-between items-start mb-6">
                <div><h3 className="text-xl font-black text-neutral-800">INVOICE</h3><p className="text-sm font-mono font-bold text-brand-700 mt-1">{selected.invoiceNumber}</p></div>
                <div className="text-right"><p className="text-sm font-bold text-neutral-800">Royal Limousine Montreal</p><p className="text-xs text-neutral-400">1234 Sherbrooke St W</p><p className="text-xs text-neutral-400">Montreal, QC H3G 1H1</p><p className="text-xs text-neutral-400">Tax ID: 12345-6789</p></div>
              </div>
              <div className="grid grid-cols-2 gap-4 mb-6 p-4 bg-neutral-25 rounded-lg">
                <div><p className="text-[10px] font-bold text-neutral-400 uppercase">Bill To</p><p className="text-sm font-bold text-neutral-800">{selCustomer.fullName}</p>{selCustomer.company && <p className="text-xs text-neutral-500">{selCustomer.company}</p>}<p className="text-xs text-neutral-400">{selCustomer.email}</p></div>
                <div className="text-right"><p className="text-[10px] font-bold text-neutral-400 uppercase">Details</p><p className="text-xs text-neutral-500">Invoice Date: {new Date(selected.issueDate).toLocaleDateString()}</p><p className="text-xs text-neutral-500">Due Date: {new Date(selected.dueDate).toLocaleDateString()}</p><p className="text-xs text-neutral-500">Terms: Net {Math.round((new Date(selected.dueDate).getTime() - new Date(selected.issueDate).getTime()) / 86400000)}</p></div>
              </div>
              <table className="w-full text-sm mb-4">
                <thead><tr className="border-b-2 border-neutral-200"><th className="text-left py-2 text-xs font-bold text-neutral-500 uppercase">Description</th><th className="text-center py-2 text-xs font-bold text-neutral-500 uppercase w-16">Qty</th><th className="text-right py-2 text-xs font-bold text-neutral-500 uppercase w-24">Unit Price</th><th className="text-right py-2 text-xs font-bold text-neutral-500 uppercase w-24">Amount</th></tr></thead>
                <tbody>
                  {selected.lineItems.map((li) => (
                    <tr key={li.id} className="border-b border-neutral-100"><td className="py-2.5 text-neutral-700">{li.description}</td><td className="text-center py-2.5 text-neutral-500">{li.quantity}</td><td className="text-right py-2.5 text-neutral-600">{fmt$(li.unitPrice)}</td><td className="text-right py-2.5 font-semibold text-neutral-700">{fmt$(li.amount)}</td></tr>
                  ))}
                </tbody>
              </table>
              <div className="flex justify-end"><div className="w-64 space-y-1.5 text-sm">
                <div className="flex justify-between"><span className="text-neutral-500">Subtotal</span><span className="font-semibold">{fmt$(selected.subtotal)}</span></div>
                {selected.discountAmount > 0 && <div className="flex justify-between"><span className="text-neutral-500">Discount</span><span className="text-success-600 font-semibold">-{fmt$(selected.discountAmount)}</span></div>}
                <div className="flex justify-between"><span className="text-neutral-500">Tax ({(selected.taxRate * 100).toFixed(0)}%)</span><span className="font-semibold">{fmt$(selected.taxAmount)}</span></div>
                <div className="flex justify-between border-t-2 border-neutral-800 pt-2"><span className="text-base font-black">Total</span><span className="text-base font-black text-brand-700">{fmt$(selected.totalAmount)}</span></div>
                <div className="flex justify-between"><span className="text-neutral-500">Amount Paid</span><span className="text-success-600 font-semibold">{fmt$(selected.amountPaid)}</span></div>
                {selected.balanceDue > 0 && <div className="flex justify-between"><span className="text-danger-600 font-bold">Balance Due</span><span className="text-danger-600 font-bold">{fmt$(selected.balanceDue)}</span></div>}
              </div></div>
            </div>

            {/* Payments History */}
            {selPayments.length > 0 && <Card padding="md"><h4 className="text-sm font-bold text-neutral-700 mb-3">Payment History</h4>
              <div className="space-y-2">{selPayments.map((p) => <div key={p.id} className="flex items-center justify-between py-2 border-b border-neutral-50 last:border-0"><div className="flex items-center gap-3"><DollarSign className="h-4 w-4 text-success-500" /><div><p className="text-sm font-semibold">{fmt$(p.amount)}</p><p className="text-xs text-neutral-400">{p.method.replace(/_/g, " ")} · {p.reference || "—"}</p></div></div><div className="text-right"><StatusChip status={p.status} /><p className="text-[10px] text-neutral-400">{new Date(p.processedAt).toLocaleDateString()}</p></div></div>)}</div></Card>}
          </div>
        )}
      </SlideOver>
    </div>
  );
}

function FinLine({ label, value, isCount, suffix }: { label: string; value: number; isCount?: boolean; suffix?: string }) {
  return <div className="flex justify-between"><span className="text-neutral-500 text-xs">{label}</span><span className="text-xs font-semibold text-neutral-700">{isCount ? value : fmt$(value)}{suffix || ""}</span></div>;
}

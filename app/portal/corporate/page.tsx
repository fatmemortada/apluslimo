"use client";
import { useState } from "react";
import { Building2, Users, DollarSign, Download, FileText, Check, X, Plus, Settings } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge, StatusChip } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { StatCard } from "@/components/ui/stat-card";
import { Tabs } from "@/components/ui/tabs";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const chartTooltip = { contentStyle: { borderRadius: "12px", border: "1px solid #e2e8f0", boxShadow: "0 10px 25px rgba(0,0,0,0.08)", background: "#fff", padding: "10px 14px", fontSize: "13px" } };
const fmt$ = (n: number) => `$${n.toLocaleString(undefined, { minimumFractionDigits: 2 })}`;

const employees = [
  { name: "Robert Chen", email: "robert.chen@techcorp.com", department: "Executive", trips: 55, spent: 24800, status: "active", approvalRequired: false },
  { name: "Anna Lee", email: "anna.lee@techcorp.com", department: "Sales", trips: 32, spent: 14200, status: "active", approvalRequired: true },
  { name: "James Miller", email: "james.miller@techcorp.com", department: "Operations", trips: 28, spent: 11500, status: "active", approvalRequired: true },
  { name: "Lisa Wang", email: "lisa.wang@techcorp.com", department: "Sales", trips: 18, spent: 8200, status: "active", approvalRequired: false },
  { name: "Mark Johnson", email: "mark.johnson@techcorp.com", department: "Engineering", trips: 12, spent: 5600, status: "inactive", approvalRequired: true },
];
const departments = [
  { name: "Executive", spent: 26100, trips: 58 }, { name: "Sales", spent: 22400, trips: 50 }, { name: "Operations", spent: 11500, trips: 28 }, { name: "Engineering", spent: 7200, trips: 15 }, { name: "Marketing", spent: 3800, trips: 8 },
];
const pendingApprovals = [
  { id: "MRL-1060", employee: "Anna Lee", date: "Jul 18, 2026", pickup: "YUL Airport", dropoff: "Client Site — Laval", amount: "$420", requested: "2 hours ago" },
  { id: "MRL-1061", employee: "James Miller", date: "Jul 19, 2026", pickup: "TechCorp HQ", dropoff: "Mirabel Airport", amount: "$380", requested: "5 hours ago" },
];
const monthlySpend = [{ month: "Jan", amount: 12400 },{ month: "Feb", amount: 10800 },{ month: "Mar", amount: 15200 },{ month: "Apr", amount: 13800 },{ month: "May", amount: 16500 },{ month: "Jun", amount: 18500 }];

export default function CorporatePortal() {
  const [tab, setTab] = useState("overview");
  const totalSpent = employees.reduce((s, e) => s + e.spent, 0);
  const totalTrips = employees.reduce((s, e) => s + e.trips, 0);

  return (
    <div className="max-w-5xl space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div><div className="flex items-center gap-2 mb-1"><Building2 className="h-5 w-5 text-brand-600" /><Badge variant="brand">Corporate Account</Badge></div><h1 className="text-2xl font-bold text-neutral-800">TechCorp Inc.</h1><p className="text-sm text-neutral-400">Enterprise plan · Net 30 · 12% discount</p></div>
        <div className="flex gap-2"><Button variant="outline" size="sm" icon={<Download className="h-4 w-4" />}>Export</Button><Button variant="primary" size="sm" icon={<Settings className="h-4 w-4" />}>Settings</Button></div>
      </div>
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
        <StatCard label="Total Spent YTD" value={fmt$(totalSpent)} trend="up" trendValue="18%" color="success" /><StatCard label="Trips" value={String(totalTrips)} color="brand" /><StatCard label="Employees" value={String(employees.length)} color="info" /><StatCard label="Avg/Trip" value={fmt$(totalTrips > 0 ? totalSpent / totalTrips : 0)} color="gold" /><StatCard label="Savings" value={fmt$(totalSpent * 0.12)} color="success" />
      </div>
      <Tabs tabs={[{ id: "overview", label: "Overview" },{ id: "employees", label: "Employees", count: employees.length },{ id: "billing", label: "Billing" },{ id: "approvals", label: "Approvals", count: pendingApprovals.length }]} onChange={setTab} />
      {tab === "overview" && <div className="space-y-6">
        <Card padding="md"><h2 className="text-base font-bold mb-4">Monthly Spending</h2><ResponsiveContainer width="100%" height={260}><BarChart data={monthlySpend}><CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" /><XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#94a3b8" }} /><YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#94a3b8" }} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} /><Tooltip {...chartTooltip} /><Bar dataKey="amount" fill="#4263eb" radius={[6, 6, 0, 0]} barSize={28} /></BarChart></ResponsiveContainer></Card>
        <Card padding="md"><h2 className="text-base font-bold mb-4">Spending by Department</h2><div className="space-y-2">{departments.map((d) => { const pct = Math.round((d.spent / departments[0].spent) * 100); return <div key={d.name} className="flex items-center gap-4 py-2"><span className="text-xs font-bold text-neutral-400 w-20">{d.name}</span><div className="flex-1 h-2 rounded-full bg-neutral-100 overflow-hidden"><div className="h-full rounded-full bg-brand-600" style={{ width: `${pct}%` }} /></div><span className="text-xs font-semibold w-16 text-right">{fmt$(d.spent)}</span><span className="text-xs text-neutral-400 w-12 text-right">{d.trips} trips</span></div>; })}</div></Card>
      </div>}
      {tab === "employees" && <Card padding="none"><div className="divide-y divide-neutral-50">{employees.map((e) => <div key={e.email} className="flex items-center gap-4 px-6 py-4 hover:bg-neutral-25"><Avatar name={e.name} size="md" /><div className="flex-1"><div className="flex items-center gap-2"><p className="text-sm font-semibold">{e.name}</p><Badge variant="neutral">{e.department}</Badge>{e.approvalRequired && <Badge variant="warning">Approval Required</Badge>}</div><p className="text-xs text-neutral-400">{e.email}</p></div><div className="text-right text-xs"><p className="font-semibold">{e.trips} trips</p><p className="text-neutral-500">{fmt$(e.spent)}</p></div><StatusChip status={e.status} /></div>)}</div></Card>}
      {tab === "billing" && <Card padding="md"><h3 className="text-sm font-bold mb-3">Billing Configuration</h3><div className="space-y-2 text-sm"><InfoR label="Payment Terms" value="Net 30" /><InfoR label="Credit Limit" value="$25,000" /><InfoR label="Discount" value="12%" /><InfoR label="Billing Contact" value="Robert Chen" /><InfoR label="Billing Email" value="ap@techcorp.com" /></div></Card>}
      {tab === "approvals" && <div className="space-y-3">{pendingApprovals.length === 0 ? <Card padding="lg"><p className="text-sm text-neutral-400 text-center py-6">No pending approvals ✓</p></Card> : pendingApprovals.map((a) => <Card key={a.id} padding="md"><div className="flex items-start gap-4"><div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-warning-50 text-warning-600"><FileText className="h-5 w-5" /></div><div className="flex-1"><div className="flex items-center gap-2"><span className="font-mono text-sm font-bold text-brand-700">{a.id}</span><Badge variant="warning">Awaiting Approval</Badge></div><p className="text-sm font-semibold mt-1">{a.employee} — {a.pickup} → {a.dropoff}</p><p className="text-xs text-neutral-400 mt-0.5">{a.date} · {a.amount} · Requested {a.requested}</p></div><div className="flex gap-2 shrink-0"><Button variant="primary" size="sm" icon={<Check className="h-3.5 w-3.5" />}>Approve</Button><Button variant="outline" size="sm" icon={<X className="h-3.5 w-3.5" />}>Decline</Button></div></div></Card>)}</div>}
    </div>
  );
}
function InfoR({ label, value }: { label: string; value: string }) { return <div className="flex justify-between py-2 border-b border-neutral-50 last:border-0"><span className="text-xs text-neutral-400">{label}</span><span className="text-xs font-semibold text-neutral-700">{value}</span></div>; }

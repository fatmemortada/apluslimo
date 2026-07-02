"use client";

import { useState, useMemo } from "react";
import {
  Plus, Wrench, AlertTriangle, CheckCircle2, Clock, CalendarDays, DollarSign,
  Gauge, Search, Filter, Download, FileText, Phone, MapPin,
  TrendingUp, TrendingDown, BarChart3, Car, Activity,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge, StatusChip } from "@/components/ui/badge";
import { StatCard } from "@/components/ui/stat-card";
import { SearchInput } from "@/components/ui/search-input";
import { Tabs } from "@/components/ui/tabs";
import { useApi } from "@/lib/hooks/use-api";
import { db, queryAll } from "@/lib/db/store";
import type { MaintenanceRecord, PaginatedResponse, Vehicle } from "@/lib/types";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
} from "recharts";

const ORG = "org_demo001";
const chartTooltip = { contentStyle: { borderRadius: "12px", border: "1px solid #e2e8f0", boxShadow: "0 10px 25px rgba(0,0,0,0.08)", background: "#fff", padding: "10px 14px", fontSize: "13px" } };
const STATUS_LABEL: Record<string, string> = { scheduled: "Scheduled", in_progress: "In Progress", completed: "Completed", cancelled: "Cancelled" };
const PRIORITY_COLORS: Record<string, string> = { low: "bg-neutral-100 text-neutral-600", medium: "bg-warning-100 text-warning-700", high: "bg-danger-100 text-danger-700", critical: "bg-danger-200 text-danger-800" };
const TYPE_LABELS: Record<string, string> = { oil_change: "Oil Change", tire_rotation: "Tire Rotation", brake_replacement: "Brake Replacement", inspection: "Annual Inspection", repair: "Repair", cleaning: "Cleaning", battery: "Battery", transmission: "Transmission", engine: "Engine", other: "Other" };
function fmt$(n: number) { return `$${n.toLocaleString(undefined, { minimumFractionDigits: 2 })}`; }

export default function MaintenanceCenter() {
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [showForm, setShowForm] = useState(false);

  const maintRecords = queryAll(db.maintenanceRecords, ORG);
  const vehicles = Object.fromEntries(queryAll(db.vehicles, ORG).map((v) => [v.id, v]));

  // Filter
  let filtered = maintRecords;
  if (search) { const s = search.toLowerCase(); filtered = filtered.filter((m) => vehicles[m.vehicleId]?.name.toLowerCase().includes(s) || m.type.toLowerCase().includes(s) || m.vendor?.toLowerCase().includes(s) || m.description.toLowerCase().includes(s)); }
  if (activeTab !== "all") filtered = filtered.filter((m) => m.status === activeTab);

  // Sort by date
  filtered.sort((a, b) => new Date(b.scheduledDate).getTime() - new Date(a.scheduledDate).getTime());

  // KPIs
  const totalCost = maintRecords.filter((m) => m.status !== "cancelled").reduce((s, m) => s + m.cost, 0);
  const thisMonth = new Date().toISOString().slice(0, 7);
  const costMTD = maintRecords.filter((m) => m.scheduledDate.startsWith(thisMonth)).reduce((s, m) => s + m.cost, 0);
  const scheduled = maintRecords.filter((m) => m.status === "scheduled").length;
  const inProgress = maintRecords.filter((m) => m.status === "in_progress").length;
  const completed = maintRecords.filter((m) => m.status === "completed").length;
  const critical = maintRecords.filter((m) => m.priority === "critical" || m.priority === "high").length;

  // Cost by type chart
  const costByType = Object.entries(
    maintRecords.filter((m) => m.status !== "cancelled").reduce<Record<string, number>>((acc, m) => { acc[m.type] = (acc[m.type] || 0) + m.cost; return acc; }, {})
  ).map(([type, cost]) => ({ name: TYPE_LABELS[type] || type, cost: Math.round(cost) })).sort((a, b) => b.cost - a.cost);
  const pColors = ["#f59e0b", "#ef4444", "#3b82f6", "#10b981", "#8b5cf6", "#6366f1", "#ec4899"];

  // Monthly cost trend
  const monthlyCosts = [
    { month: "Jan", cost: 3200, services: 4 }, { month: "Feb", cost: 1800, services: 2 }, { month: "Mar", cost: 4500, services: 5 },
    { month: "Apr", cost: 2100, services: 3 }, { month: "May", cost: 3800, services: 4 }, { month: "Jun", cost: 5200, services: 6 },
  ];

  // Vehicles needing service
  const upcomingDue = vehicles ? Object.values(vehicles).filter((v) => v.nextServiceDue && new Date(v.nextServiceDue) > new Date() && new Date(v.nextServiceDue) < new Date(Date.now() + 60 * 86400000)).slice(0, 6) : [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div><h1 className="text-2xl font-bold text-neutral-800">Maintenance Center</h1><p className="text-sm text-neutral-400">{maintRecords.length} service records · {scheduled} scheduled · ${costMTD.toLocaleString()} this month</p></div>
        <div className="flex gap-2">
          <Button variant="outline" size="md" icon={<Download className="h-4 w-4" />}>Export</Button>
          <Button variant="primary" size="md" icon={<Plus className="h-4 w-4" />} onClick={() => setShowForm(true)}>Schedule Service</Button>
        </div>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
        <StatCard label="Total Services" value={String(maintRecords.length)} icon={<Wrench className="h-5 w-5" />} color="brand" />
        <StatCard label="Scheduled" value={String(scheduled)} color="info" />
        <StatCard label="In Progress" value={String(inProgress)} color="warning" />
        <StatCard label="Critical/High" value={String(critical)} color="danger" />
        <StatCard label="Cost MTD" value={fmt$(costMTD)} color="gold" />
      </div>

      {/* Maintenance Dashboard */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Vehicles Due */}
        <Card padding="md">
          <div className="flex items-center gap-2 mb-4"><AlertTriangle className="h-4 w-4 text-warning-500" /><h3 className="text-sm font-bold text-neutral-800">Vehicles Due for Service</h3></div>
          {upcomingDue.length ? upcomingDue.map((v) => (
            <div key={v.id} className="flex items-center justify-between py-2 border-b border-neutral-50 last:border-0">
              <div><p className="text-sm font-semibold text-neutral-800">{v.name}</p><p className="text-xs text-neutral-400">{v.plate}</p></div>
              <div className="text-right"><p className="text-xs font-semibold text-warning-600">{v.nextServiceDue ? new Date(v.nextServiceDue).toLocaleDateString() : "—"}</p><p className="text-[10px] text-neutral-400">{v.nextServiceMileage ? `${v.nextServiceMileage.toLocaleString()} km` : "—"}</p></div>
            </div>
          )) : <p className="text-xs text-neutral-400 py-4 text-center">All vehicles up to date ✓</p>}
        </Card>

        {/* Cost by Type */}
        <Card padding="md">
          <h3 className="text-sm font-bold text-neutral-800 mb-4">Cost by Service Type</h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart><Pie data={costByType} cx="50%" cy="50%" innerRadius={45} outerRadius={75} paddingAngle={2} dataKey="cost">{costByType.map((_, i) => <Cell key={i} fill={pColors[i % pColors.length]} />)}</Pie></PieChart>
          </ResponsiveContainer>
          <div className="space-y-1 mt-2">{costByType.slice(0, 5).map((s, i) => <div key={s.name} className="flex items-center justify-between text-xs"><div className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full" style={{ background: pColors[i % pColors.length] }} /><span className="text-neutral-600">{s.name}</span></div><span className="font-semibold text-neutral-700">{fmt$(s.cost)}</span></div>)}</div>
        </Card>

        {/* Monthly Trend */}
        <Card padding="md">
          <h3 className="text-sm font-bold text-neutral-800 mb-4">Monthly Cost Trend</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={monthlyCosts}><CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" /><XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#94a3b8" }} /><YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#94a3b8" }} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} /><Tooltip {...chartTooltip} /><Bar dataKey="cost" fill="#f59e0b" radius={[6, 6, 0, 0]} barSize={24} /></BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Filters + List */}
      <div className="flex flex-wrap items-center gap-3">
        <SearchInput placeholder="Search by vehicle, service type, vendor..." value={search} onChange={(e) => setSearch(e.target.value)} onClear={() => setSearch("")} containerClassName="flex-1 max-w-sm" />
        <Button variant="outline" size="sm" icon={<Filter className="h-3.5 w-3.5" />} onClick={() => { setSearch(""); setActiveTab("all"); }}>Clear</Button>
        <span className="text-xs text-neutral-400 ml-auto">{filtered.length} records</span>
      </div>

      <Tabs tabs={[
        { id: "all", label: "All", count: maintRecords.length },
        { id: "scheduled", label: "Scheduled", count: scheduled },
        { id: "in_progress", label: "In Progress", count: inProgress },
        { id: "completed", label: "Completed", count: completed },
      ]} onChange={setActiveTab} />

      {/* Service Records List */}
      <div className="space-y-3">
        {filtered.length === 0 ? <Card padding="lg"><p className="text-sm text-neutral-400 text-center py-6">No service records found</p></Card> : filtered.map((m) => {
          const vehicle = vehicles[m.vehicleId];
          return (
            <Card key={m.id} padding="md" hover>
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-warning-50 text-warning-600"><Wrench className="h-5 w-5" /></div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <h3 className="text-sm font-bold text-neutral-800 capitalize">{TYPE_LABELS[m.type] || m.type.replace(/_/g, " ")}</h3>
                    <Badge variant={m.priority === "critical" ? "danger" : m.priority === "high" ? "warning" : "neutral"}>{m.priority.toUpperCase()}</Badge>
                    <StatusChip status={STATUS_LABEL[m.status] || m.status} />
                  </div>
                  <p className="text-xs text-neutral-500 mb-2">{m.description}</p>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                    <div><span className="text-neutral-400">Vehicle:</span> <span className="font-semibold text-neutral-700">{vehicle?.name || m.vehicleId}</span></div>
                    <div><span className="text-neutral-400">Date:</span> <span className="font-semibold text-neutral-700">{new Date(m.scheduledDate).toLocaleDateString()}</span></div>
                    <div><span className="text-neutral-400">Cost:</span> <span className="font-semibold text-neutral-700">{fmt$(m.cost)}</span></div>
                    <div><span className="text-neutral-400">Vendor:</span> <span className="font-semibold text-neutral-700">{m.vendor || "—"}</span></div>
                    {m.mileageAtService && <div><span className="text-neutral-400">Mileage:</span> <span className="font-semibold text-neutral-700">{m.mileageAtService.toLocaleString()} km</span></div>}
                    {m.completedDate && <div><span className="text-neutral-400">Completed:</span> <span className="font-semibold text-neutral-700">{new Date(m.completedDate).toLocaleDateString()}</span></div>}
                  </div>
                  {m.parts.length > 0 && (
                    <div className="mt-2 pt-2 border-t border-neutral-100">
                      <p className="text-[10px] font-semibold text-neutral-400 uppercase mb-1">Parts Used</p>
                      <div className="flex flex-wrap gap-1">{m.parts.map((p, i) => <span key={i} className="text-[10px] bg-neutral-50 px-1.5 py-0.5 rounded text-neutral-600">{p.name} x{p.quantity} ({fmt$(p.unitPrice)})</span>)}</div>
                    </div>
                  )}
                  {m.notes && <p className="mt-2 text-xs text-neutral-500 italic">{m.notes}</p>}
                </div>
                <div className="flex flex-col gap-1 shrink-0">
                  <Button variant="ghost" size="sm">View</Button>
                  {m.status === "in_progress" && <Button variant="primary" size="sm">Complete</Button>}
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Quick Schedule Form (simple inline) */}
      {showForm && (
        <Card padding="lg" className="border-brand-200 bg-brand-25/30">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-neutral-800">Schedule New Service</h3>
            <Button variant="ghost" size="sm" onClick={() => setShowForm(false)}>Cancel</Button>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-xs font-semibold text-neutral-500 mb-1">Vehicle</label><select className="w-full rounded-lg border border-neutral-200 px-3 py-2.5 text-sm bg-white">{Object.values(vehicles).map((v) => <option key={v.id} value={v.id}>{v.name} ({v.plate})</option>)}</select></div>
            <div><label className="block text-xs font-semibold text-neutral-500 mb-1">Service Type</label><select className="w-full rounded-lg border border-neutral-200 px-3 py-2.5 text-sm bg-white">{Object.entries(TYPE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select></div>
            <div><label className="block text-xs font-semibold text-neutral-500 mb-1">Priority</label><select className="w-full rounded-lg border border-neutral-200 px-3 py-2.5 text-sm bg-white"><option>low</option><option>medium</option><option>high</option><option>critical</option></select></div>
            <div><label className="block text-xs font-semibold text-neutral-500 mb-1">Date</label><input type="date" className="w-full rounded-lg border border-neutral-200 px-3 py-2.5 text-sm bg-white" /></div>
            <div><label className="block text-xs font-semibold text-neutral-500 mb-1">Cost ($)</label><input type="number" defaultValue={0} className="w-full rounded-lg border border-neutral-200 px-3 py-2.5 text-sm bg-white" /></div>
            <div><label className="block text-xs font-semibold text-neutral-500 mb-1">Vendor</label><input placeholder="Garage name..." className="w-full rounded-lg border border-neutral-200 px-3 py-2.5 text-sm bg-white" /></div>
            <div><label className="block text-xs font-semibold text-neutral-500 mb-1">Mileage at Service</label><input type="number" placeholder="km" className="w-full rounded-lg border border-neutral-200 px-3 py-2.5 text-sm bg-white" /></div>
            <div><label className="block text-xs font-semibold text-neutral-500 mb-1">Vendor Phone</label><input placeholder="+1..." className="w-full rounded-lg border border-neutral-200 px-3 py-2.5 text-sm bg-white" /></div>
            <div className="col-span-2"><label className="block text-xs font-semibold text-neutral-500 mb-1">Description</label><textarea rows={2} placeholder="Service description..." className="w-full rounded-lg border border-neutral-200 px-3 py-2.5 text-sm bg-white resize-none" /></div>
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
            <Button variant="primary" icon={<Plus className="h-4 w-4" />}>Schedule Service</Button>
          </div>
        </Card>
      )}
    </div>
  );
}

"use client";
import { FileText, Download } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusChip } from "@/components/ui/badge";
import { Tabs } from "@/components/ui/tabs";

const invoices = [
  { id: "INV-1051", date: "Jul 22", due: "Aug 5", amount: "$520.00", status: "pending", desc: "Point to Point — Ritz to Mont Tremblant" },
  { id: "INV-1042", date: "Jul 1", due: "Jul 15", amount: "$382.00", status: "paid", desc: "Airport Pickup — YUL to Downtown" },
  { id: "INV-1038", date: "Jun 28", due: "Jul 12", amount: "$280.00", status: "paid", desc: "Airport Drop-off" },
  { id: "INV-1035", date: "Jun 20", due: "Jul 4", amount: "$145.00", status: "paid", desc: "Point to Point" },
  { id: "INV-1030", date: "Jun 15", due: "Jun 29", amount: "$310.00", status: "paid", desc: "Airport Pickup — YUL to Westmount" },
];

export default function InvoicesPage() {
  return (
    <div className="max-w-4xl space-y-6">
      <div><h1 className="text-2xl font-bold text-neutral-800">Invoices</h1><p className="text-sm text-neutral-400">{invoices.length} invoices</p></div>
      <Tabs tabs={[{ id: "all", label: "All", count: invoices.length },{ id: "paid", label: "Paid" },{ id: "pending", label: "Pending" }]} />
      <div className="space-y-3">{invoices.map((inv) => (
        <Card key={inv.id} padding="md" hover><div className="flex items-center justify-between"><div className="flex items-center gap-4"><div className="flex h-10 w-10 items-center justify-center rounded-xl bg-neutral-100 text-neutral-500"><FileText className="h-5 w-5" /></div><div><div className="flex items-center gap-2"><span className="font-mono text-sm font-bold text-brand-700">{inv.id}</span><StatusChip status={inv.status} /></div><p className="text-sm text-neutral-600 mt-0.5">{inv.desc}</p><p className="text-xs text-neutral-400">Issued {inv.date} · Due {inv.due}</p></div></div><div className="flex items-center gap-3"><span className="text-lg font-bold">{inv.amount}</span><Button variant="outline" size="sm" icon={<Download className="h-3.5 w-3.5" />}>PDF</Button></div></div></Card>
      ))}</div>
    </div>
  );
}

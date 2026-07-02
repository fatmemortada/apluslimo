"use client";
import { Mail, Phone, MapPin, CreditCard, Star, Save } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";

const savedAddresses = ["YUL Airport — Arrivals Level", "456 Rue Peel, Montreal, QC H3A 1T2", "Ritz Carlton — 1228 Sherbrooke St W", "Downtown Office — 2000 Rue University"];
const preferences = [{ label: "Preferred Vehicle", value: "Luxury SUV" },{ label: "Music", value: "Classical / Jazz" },{ label: "Temperature", value: "21°C" },{ label: "Water", value: "Evian" },{ label: "Newspaper", value: "Financial Times" }];

export default function ProfilePage() {
  return (
    <div className="max-w-4xl space-y-6">
      <div><h1 className="text-2xl font-bold text-neutral-800">My Profile</h1><p className="text-sm text-neutral-400">Manage your account and preferences</p></div>
      <Card padding="lg"><div className="flex items-start gap-5"><Avatar name="John Smith" size="xl" /><div className="flex-1"><div className="flex items-center gap-2"><h3 className="text-lg font-bold">John Smith</h3><Badge variant="gold">VIP Client</Badge></div><p className="text-sm text-neutral-500 mt-0.5">Member since Mar 2024 · 28 trips · $12,450 spent</p><div className="flex gap-4 mt-2 text-xs text-neutral-500"><span className="flex items-center gap-1"><Mail className="h-3 w-3" />john.smith@email.com</span><span className="flex items-center gap-1"><Phone className="h-3 w-3" />+1 (514) 555-1001</span></div></div><Button variant="outline" size="sm">Edit</Button></div></Card>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card padding="md"><h3 className="text-sm font-bold mb-4">Contact Information</h3><div className="space-y-3"><Input label="Full Name" defaultValue="John Smith" /><Input label="Email" type="email" defaultValue="john.smith@email.com" /><Input label="Phone" defaultValue="+1 (514) 555-1001" /></div></Card>
        <Card padding="md"><h3 className="text-sm font-bold mb-4">Ride Preferences</h3><div className="space-y-2">{preferences.map((p) => <div key={p.label} className="flex justify-between py-2 border-b border-neutral-50 last:border-0"><span className="text-xs text-neutral-400">{p.label}</span><span className="text-xs font-semibold text-neutral-700">{p.value}</span></div>)}</div></Card>
        <Card padding="md"><h3 className="text-sm font-bold mb-4">Saved Addresses</h3><div className="space-y-1">{savedAddresses.map((addr) => <div key={addr} className="flex items-center gap-3 py-2 px-3 rounded-lg hover:bg-neutral-25"><MapPin className="h-4 w-4 text-neutral-400 shrink-0" /><span className="text-sm text-neutral-700">{addr}</span></div>)}</div></Card>
        <Card padding="md"><h3 className="text-sm font-bold mb-4">Payment Methods</h3><div className="flex gap-4"><div className="flex-1 rounded-xl border border-neutral-200 p-4 flex items-center gap-3"><CreditCard className="h-8 w-8 text-brand-600" /><div><p className="text-sm font-semibold">Visa •••• 4242</p><p className="text-xs text-neutral-400">Expires 12/2027</p></div><Badge variant="success" className="ml-auto">Default</Badge></div><div className="flex-1 rounded-xl border border-neutral-200 p-4 flex items-center gap-3"><CreditCard className="h-8 w-8 text-neutral-400" /><div><p className="text-sm font-semibold">Amex •••• 1005</p><p className="text-xs text-neutral-400">Expires 06/2026</p></div></div></div></Card>
      </div>
      <div className="flex justify-end"><Button variant="primary" icon={<Save className="h-4 w-4" />}>Save Changes</Button></div>
    </div>
  );
}

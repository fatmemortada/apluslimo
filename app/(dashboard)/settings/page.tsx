"use client";

import { useState } from "react";
import { User, Building2, CreditCard, Bell, Shield, Globe, Palette, Users, Key, HelpCircle, Activity, AlertTriangle, Clock, Laptop, LogOut, Sliders, Receipt, Car, Wrench, FileText, Lock } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge, StatusChip } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";

const settingSections = [
  { id: "profile", label: "Profile", icon: User },
  { id: "company", label: "Company", icon: Building2 },
  { id: "team", label: "Users & Roles", icon: Users },
  { id: "billing", label: "Billing & Plan", icon: CreditCard },
  { id: "operations", label: "Operations", icon: Sliders },
  { id: "security", label: "Security", icon: Shield },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "regional", label: "Regional", icon: Globe },
  { id: "branding", label: "White Label", icon: Palette },
  { id: "api", label: "API & Integrations", icon: Key },
];

const securityEvents = [
  { type: "login_success", user: "Fatme Mortada", device: "Chrome / Windows", location: "Montreal, CA", time: "2 min ago", status: "success" },
  { type: "login_failed", user: "Unknown", device: "Safari / iPhone", location: "Toronto, CA", time: "15 min ago", status: "failed" },
  { type: "password_changed", user: "Sarah Martinez", device: "Chrome / Mac", location: "Montreal, CA", time: "1 hour ago", status: "success" },
  { type: "login_success", user: "Fatme Mortada", device: "Chrome / Windows", location: "Montreal, CA", time: "3 hours ago", status: "success" },
];

const activeSessions = [
  { device: "Chrome / Windows", location: "Montreal, CA", ip: "192.168.1.1", current: true, lastActive: "Active now" },
  { device: "Safari / iPhone", location: "Montreal, CA", ip: "10.0.0.1", current: false, lastActive: "2 hours ago" },
];

export default function AdminPanel() {
  const [activeSection, setActiveSection] = useState("profile");

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold text-neutral-800">Administration</h1><p className="text-sm text-neutral-400">Platform configuration · Enterprise plan · Royal Limousine Montreal</p></div>

      <div className="flex flex-col gap-6 lg:flex-row">
        <div className="w-full lg:w-56 shrink-0">
          <Card padding="none"><nav className="py-2">{settingSections.map((s) => { const Icon = s.icon; return <button key={s.id} onClick={() => setActiveSection(s.id)} className={["flex w-full items-center gap-3 px-4 py-2.5 text-sm font-medium text-left transition-colors", activeSection === s.id ? "bg-brand-50 text-brand-700 border-r-2 border-brand-600" : "text-neutral-600 hover:bg-neutral-50"].join(" ")}><Icon className="h-4 w-4" />{s.label}</button>; })}</nav></Card>
        </div>

        <div className="flex-1 space-y-6">
          {activeSection === "profile" && <SettingsCard title="Profile Information"><div className="flex items-center gap-5 mb-6"><Avatar name="Fatme Mortada" size="xl" /><div><p className="text-base font-bold">Fatme Mortada</p><p className="text-sm text-neutral-400">Owner · Super Admin</p><Button variant="outline" size="sm" className="mt-2">Change Avatar</Button></div></div><div className="grid grid-cols-1 gap-4 sm:grid-cols-2"><Input label="First Name" defaultValue="Fatme" /><Input label="Last Name" defaultValue="Mortada" /><Input label="Email" defaultValue="fatme@royallimo.com" /><Input label="Phone" defaultValue="+1 (514) 555-0001" /></div></SettingsCard>}

          {activeSection === "company" && <SettingsCard title="Company Details"><div className="grid grid-cols-1 gap-4 sm:grid-cols-2"><Input label="Company Name" defaultValue="Royal Limousine Montreal" /><Input label="Tax ID" defaultValue="12345-6789-RC0001" /><Input label="Address" defaultValue="1234 Sherbrooke St W" /><Input label="City" defaultValue="Montreal" /><Input label="Province" defaultValue="Quebec" /><Input label="Postal Code" defaultValue="H3G 1H1" /><Input label="Phone" defaultValue="+1 (514) 555-0000" /><Input label="Email" defaultValue="info@royallimo.com" /></div></SettingsCard>}

          {activeSection === "team" && <SettingsCard title="Users & Roles"><div className="space-y-3">{[{ name: "Fatme Mortada", email: "fatme@royallimo.com", role: "Owner", status: "active" },{ name: "Sarah Martinez", email: "sarah@royallimo.com", role: "Dispatcher", status: "active" }].map((u) => <div key={u.email} className="flex items-center gap-4 p-3 rounded-lg border border-neutral-100"><Avatar name={u.name} /><div className="flex-1"><p className="text-sm font-bold">{u.name}</p><p className="text-xs text-neutral-400">{u.email}</p></div><Badge variant="brand">{u.role}</Badge><StatusChip status={u.status} /></div>)}</div><Button variant="outline" size="sm" className="mt-4" icon={<Users className="h-4 w-4" />}>Invite User</Button></SettingsCard>}

          {activeSection === "billing" && <SettingsCard title="Billing & Plan"><div className="flex items-center gap-3 mb-6"><Badge variant="gold">Enterprise Plan</Badge><span className="text-sm text-neutral-400">$499/month · 50 vehicles · Unlimited users</span></div><div className="rounded-xl border border-neutral-200 p-5 bg-neutral-25"><div className="flex items-center justify-between mb-3"><div><p className="text-sm font-semibold">Current Period</p><p className="text-xs text-neutral-400">Jul 1 – Jul 31, 2026</p></div><p className="text-xl font-bold">$499.00</p></div><div className="flex items-center justify-between text-sm"><span className="text-neutral-500">Next payment: Aug 1, 2026</span><Button variant="outline" size="sm">Manage</Button></div></div><div className="mt-4 grid grid-cols-3 gap-3">{["Starter ($99/mo)", "Professional ($249/mo)", "Enterprise ($499/mo)"].map((p) => <div key={p} className="p-3 rounded-lg border border-neutral-200 text-center text-xs"><p className="font-semibold text-neutral-700">{p}</p></div>)}</div></SettingsCard>}

          {activeSection === "operations" && <SettingsCard title="Operational Settings"><div className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2"><Input label="Default Tax Rate (%)" defaultValue="15" /><Input label="Currency" defaultValue="CAD" /><Input label="Gratuity Default (%)" defaultValue="18" /><Input label="Booking Lead Time (hours)" defaultValue="2" /></div>
            <div className="space-y-2"><h4 className="text-xs font-bold text-neutral-500 uppercase">Maintenance Intervals</h4><div className="grid grid-cols-1 gap-3 sm:grid-cols-2"><Input label="Oil Change (km)" defaultValue="8000" /><Input label="Tire Rotation (km)" defaultValue="10000" /><Input label="Brake Inspection (km)" defaultValue="25000" /><Input label="Annual Inspection (months)" defaultValue="12" /></div></div>
          </div></SettingsCard>}

          {activeSection === "security" && <div className="space-y-6">
            <SettingsCard title="Active Sessions"><div className="space-y-3">{activeSessions.map((s, i) => <div key={i} className="flex items-center gap-4 p-3 rounded-lg border border-neutral-100"><Laptop className="h-8 w-8 text-neutral-400" /><div className="flex-1"><div className="flex items-center gap-2"><p className="text-sm font-bold">{s.device}</p>{s.current && <Badge variant="success">Current</Badge>}</div><p className="text-xs text-neutral-400">{s.location} · IP: {s.ip} · {s.lastActive}</p></div>{!s.current && <Button variant="ghost" size="sm" icon={<LogOut className="h-3.5 w-3.5" />}>End</Button>}</div>)}</div></SettingsCard>
            <SettingsCard title="Security Events"><div className="space-y-1">{securityEvents.map((e, i) => <div key={i} className="flex items-center gap-4 py-2.5 px-2 rounded-lg hover:bg-neutral-25">
              <div className={["flex h-8 w-8 items-center justify-center rounded-lg", e.status === "success" ? "bg-success-50 text-success-600" : "bg-danger-50 text-danger-600"].join(" ")}>{e.status === "success" ? <Shield className="h-4 w-4" /> : <AlertTriangle className="h-4 w-4" />}</div>
              <div className="flex-1"><p className="text-sm font-semibold">{e.type.replace(/_/g, " ")} — {e.user}</p><p className="text-xs text-neutral-400">{e.device} · {e.location}</p></div><p className="text-xs text-neutral-400">{e.time}</p>
            </div>)}</div></SettingsCard>
            <SettingsCard title="Security Settings"><div className="grid grid-cols-1 gap-4 sm:grid-cols-2"><Input label="Password Minimum Length" defaultValue="8" /><Input label="Session Timeout (minutes)" defaultValue="60" /><Input label="Max Failed Login Attempts" defaultValue="5" /><Input label="2FA Required for Roles" defaultValue="Admin, Owner" /></div></SettingsCard>
          </div>}

          {activeSection === "branding" && <SettingsCard title="White Label Branding"><div className="grid grid-cols-1 gap-4 sm:grid-cols-2"><Input label="Company Name" defaultValue="Royal Limousine Montreal" /><Input label="Primary Color" defaultValue="#0f172a" /><Input label="Accent Color" defaultValue="#d4af37" /><Input label="Logo URL" placeholder="https://..." /><Input label="Customer Portal Title" defaultValue="RoyalOS Client Portal" /><Input label="Email From Name" defaultValue="Royal Limousine" /></div></SettingsCard>}

          {activeSection === "regional" && <SettingsCard title="Regional Settings"><div className="grid grid-cols-1 gap-4 sm:grid-cols-2"><Input label="Timezone" defaultValue="America/Toronto" /><Input label="Currency" defaultValue="CAD" /><Input label="Date Format" defaultValue="MM/DD/YYYY" /><Input label="Time Format" defaultValue="12-hour" /><Input label="Distance Unit" defaultValue="Kilometers" /><Input label="Language" defaultValue="English" /></div></SettingsCard>}

          {activeSection === "notifications" && <SettingsCard title="Notification Preferences"><div className="space-y-3">{[{ label: "Email booking confirmations", checked: true },{ label: "Email invoice to customers", checked: true },{ label: "SMS driver alerts", checked: true },{ label: "Push notifications for dispatchers", checked: true },{ label: "Maintenance reminders", checked: true },{ label: "License expiry alerts", checked: true }].map((n) => <label key={n.label} className="flex items-center gap-3 py-2 cursor-pointer"><input type="checkbox" defaultChecked={n.checked} className="h-4 w-4 rounded border-neutral-200 text-brand-600" /><span className="text-sm text-neutral-700">{n.label}</span></label>)}</div></SettingsCard>}

          {activeSection === "api" && <SettingsCard title="API & Integrations"><div className="space-y-3"><div className="p-3 rounded-lg bg-neutral-25 flex items-center justify-between"><div><p className="text-sm font-bold">API Key</p><p className="text-xs text-neutral-400 font-mono">royal_live_••••••••••••••••</p></div><Button variant="outline" size="sm">Regenerate</Button></div><div className="p-3 rounded-lg bg-neutral-25 flex items-center justify-between"><div><p className="text-sm font-bold">Webhook URL</p><p className="text-xs text-neutral-400">https://api.royalos.com/v1/webhooks</p></div><Button variant="outline" size="sm">Configure</Button></div></div></SettingsCard>}

          <div className="flex justify-end gap-3"><Button variant="outline">Cancel</Button><Button variant="primary">Save Changes</Button></div>
        </div>
      </div>
    </div>
  );
}

function SettingsCard({ title, children }: { title: string; children: React.ReactNode }) {
  return <Card padding="lg"><h2 className="text-lg font-bold text-neutral-800 mb-6">{title}</h2>{children}</Card>;
}

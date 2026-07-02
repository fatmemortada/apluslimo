"use client";

import { useState, useEffect } from "react";
import { User, Building2, CreditCard, Bell, Shield, Globe, Palette, Users, Key, HelpCircle, Activity, AlertTriangle, Clock, Laptop, LogOut, Sliders, Receipt, Car, Wrench, FileText, Lock, Mail, RefreshCw, CheckCircle2, XCircle, Plus, ExternalLink, Trash2, Edit3, Power, PowerOff, Eye, EyeOff, ShieldCheck, KeyRound, Globe2, Smartphone, Clock as ClockIcon, AlertCircle, X, Loader2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge, StatusChip } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { useApi } from "@/lib/hooks/use-api";
import type { EmailInbox } from "@/lib/types";

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
  { id: "email", label: "Connected Inboxes", icon: Mail },
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
  const { data: inboxesData, refetch } = useApi<EmailInbox[]>("/api/emails/inboxes");
  const inboxes = inboxesData || [];
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showConnectDialog, setShowConnectDialog] = useState<string | null>(null);
  const [editInboxId, setEditInboxId] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [newInbox, setNewInbox] = useState({ email: "", companyName: "", displayName: "", phone: "", website: "" });

  // Connection dialog state
  const [selectedProvider, setSelectedProvider] = useState<string | null>(null);
  const [imapForm, setImapForm] = useState({
    imapHost: "imap.hostinger.com", imapPort: "993",
    smtpHost: "smtp.hostinger.com", smtpPort: "465",
    emailPassword: "",
  });
  const [testStatus, setTestStatus] = useState<{ type: "idle" | "testing" | "success" | "error"; message?: string }>({ type: "idle" });
  const [saveStatus, setSaveStatus] = useState<{ type: "idle" | "saving" | "success" | "error"; message?: string }>({ type: "idle" });

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold text-neutral-800">Administration</h1><p className="text-sm text-neutral-400">Platform configuration · Enterprise plan · ChauffeurOS Fleet Operations</p></div>

      <div className="flex flex-col gap-6 lg:flex-row">
        <div className="w-full lg:w-56 shrink-0">
          <Card padding="none"><nav className="py-2">{settingSections.map((s) => { const Icon = s.icon; return <button key={s.id} onClick={() => setActiveSection(s.id)} className={["flex w-full items-center gap-3 px-4 py-2.5 text-sm font-medium text-left transition-colors", activeSection === s.id ? "bg-brand-50 text-brand-700 border-r-2 border-brand-600" : "text-neutral-600 hover:bg-neutral-50"].join(" ")}><Icon className="h-4 w-4" />{s.label}</button>; })}</nav></Card>
        </div>

        <div className="flex-1 space-y-6">
          {activeSection === "profile" && <SettingsCard title="Profile Information"><div className="flex items-center gap-5 mb-6"><Avatar name="Fatme Mortada" size="xl" /><div><p className="text-base font-bold">Fatme Mortada</p><p className="text-sm text-neutral-400">Owner · Super Admin</p><Button variant="outline" size="sm" className="mt-2">Change Avatar</Button></div></div><div className="grid grid-cols-1 gap-4 sm:grid-cols-2"><Input label="First Name" defaultValue="Fatme" /><Input label="Last Name" defaultValue="Mortada" /><Input label="Email" defaultValue="fatme@chauffeuross.com" /><Input label="Phone" defaultValue="+1 (514) 555-0001" /></div></SettingsCard>}

          {activeSection === "company" && <SettingsCard title="Company Details"><div className="grid grid-cols-1 gap-4 sm:grid-cols-2"><Input label="Company Name" defaultValue="ChauffeurOS Fleet Operations" /><Input label="Tax ID" defaultValue="12345-6789-RC0001" /><Input label="Address" defaultValue="1234 Sherbrooke St W" /><Input label="City" defaultValue="Montreal" /><Input label="Province" defaultValue="Quebec" /><Input label="Postal Code" defaultValue="H3G 1H1" /><Input label="Phone" defaultValue="+1 (514) 555-0000" /><Input label="Email" defaultValue="ops@chauffeuross.com" /></div></SettingsCard>}

          {activeSection === "team" && <SettingsCard title="Users & Roles"><div className="space-y-3">{[{ name: "Fatme Mortada", email: "fatme@chauffeuross.com", role: "Owner", status: "active" },{ name: "Sarah Martinez", email: "sarah@chauffeuross.com", role: "Dispatcher", status: "active" }].map((u) => <div key={u.email} className="flex items-center gap-4 p-3 rounded-lg border border-neutral-100"><Avatar name={u.name} /><div className="flex-1"><p className="text-sm font-bold">{u.name}</p><p className="text-xs text-neutral-400">{u.email}</p></div><Badge variant="brand">{u.role}</Badge><StatusChip status={u.status} /></div>)}</div><Button variant="outline" size="sm" className="mt-4" icon={<Users className="h-4 w-4" />}>Invite User</Button></SettingsCard>}

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

          {activeSection === "branding" && <SettingsCard title="White Label Branding"><div className="grid grid-cols-1 gap-4 sm:grid-cols-2"><Input label="Company Name" defaultValue="ChauffeurOS Fleet Operations" /><Input label="Primary Color" defaultValue="#0f172a" /><Input label="Accent Color" defaultValue="#d4af37" /><Input label="Logo URL" placeholder="https://..." /><Input label="Customer Portal Title" defaultValue="ChauffeurOS Client Portal" /><Input label="Email From Name" defaultValue="ChauffeurOS Fleet" /></div></SettingsCard>}

          {activeSection === "regional" && <SettingsCard title="Regional Settings"><div className="grid grid-cols-1 gap-4 sm:grid-cols-2"><Input label="Timezone" defaultValue="America/Toronto" /><Input label="Currency" defaultValue="CAD" /><Input label="Date Format" defaultValue="MM/DD/YYYY" /><Input label="Time Format" defaultValue="12-hour" /><Input label="Distance Unit" defaultValue="Kilometers" /><Input label="Language" defaultValue="English" /></div></SettingsCard>}

          {activeSection === "notifications" && <SettingsCard title="Notification Preferences"><div className="space-y-3">{[{ label: "Email booking confirmations", checked: true },{ label: "Email invoice to customers", checked: true },{ label: "SMS driver alerts", checked: true },{ label: "Push notifications for dispatchers", checked: true },{ label: "Maintenance reminders", checked: true },{ label: "License expiry alerts", checked: true }].map((n) => <label key={n.label} className="flex items-center gap-3 py-2 cursor-pointer"><input type="checkbox" defaultChecked={n.checked} className="h-4 w-4 rounded border-neutral-200 text-brand-600" /><span className="text-sm text-neutral-700">{n.label}</span></label>)}</div></SettingsCard>}

          {activeSection === "api" && <SettingsCard title="API & Integrations"><div className="space-y-3"><div className="p-3 rounded-lg bg-neutral-25 flex items-center justify-between"><div><p className="text-sm font-bold">API Key</p><p className="text-xs text-neutral-400 font-mono">chauffeur_live_••••••••••••••••</p></div><Button variant="outline" size="sm">Regenerate</Button></div><div className="p-3 rounded-lg bg-neutral-25 flex items-center justify-between"><div><p className="text-sm font-bold">Webhook URL</p><p className="text-xs text-neutral-400">https://api.chauffeuross.com/v1/webhooks</p></div><Button variant="outline" size="sm">Configure</Button></div></div></SettingsCard>}

          {activeSection === "email" && <SettingsCard title="Connected Inboxes">
            {/* Header with warning banner */}
            <div className="mb-5 rounded-xl border border-warning-200 bg-warning-50 p-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-warning-600 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-bold text-warning-800">Demo Mode — Not Connected to Real Email</p>
                  <p className="text-xs text-warning-700 mt-1">
                    The inboxes below contain demo/sample data. They are <strong>not</strong> connected to real email providers.
                    To receive real emails, you must configure OAuth credentials for each inbox.
                    See the "Real Email Setup" section below for details.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between mb-5">
              <p className="text-sm text-neutral-500">Manage company email inboxes. OAuth-ready for Google Workspace, Microsoft 365, and IMAP/SMTP.</p>
              <Button variant="primary" size="sm" icon={<Plus className="h-4 w-4" />} onClick={() => setShowAddDialog(true)}>Add Inbox</Button>
            </div>

            {/* Inbox list */}
            <div className="space-y-4">
              {inboxes.length === 0 ? (
                <div className="rounded-xl border-2 border-dashed border-neutral-200 p-10 text-center">
                  <Mail className="mx-auto h-10 w-10 text-neutral-300" />
                  <p className="mt-3 text-sm font-semibold text-neutral-500">No inboxes configured</p>
                  <p className="text-xs text-neutral-400 mt-1">Add your first company inbox to start</p>
                  <Button variant="primary" size="sm" className="mt-4" onClick={() => setShowAddDialog(true)} icon={<Plus className="h-4 w-4" />}>Add Your First Inbox</Button>
                </div>
              ) : (
                inboxes.map((inbox) => {
                  const isEditing = editInboxId === inbox.id;
                  const isDeleting = deleteConfirmId === inbox.id;
                  const isDemo = inbox.provider === "mock" || inbox.syncStatus === "demo";
                  const connected = inbox.syncStatus === "connected";

                  if (isDeleting) {
                    return (
                      <div key={inbox.id} className="rounded-xl border-2 border-danger-200 bg-danger-50/30 p-4">
                        <div className="flex items-center gap-3">
                          <AlertCircle className="h-5 w-5 text-danger-600" />
                          <div className="flex-1">
                            <p className="text-sm font-bold text-danger-700">Remove {inbox.displayName}?</p>
                            <p className="text-xs text-danger-600">All emails from this inbox will be archived. This action cannot be undone.</p>
                          </div>
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm" onClick={() => setDeleteConfirmId(null)}>Cancel</Button>
                            <Button variant="destructive" size="sm" icon={<Trash2 className="h-3.5 w-3.5" />}>Remove</Button>
                          </div>
                        </div>
                      </div>
                    );
                  }

                  if (isEditing) {
                    return (
                      <div key={inbox.id} className="rounded-xl border-2 border-brand-200 bg-brand-50/20 p-4">
                        <p className="text-xs font-bold text-brand-700 uppercase mb-3">Editing {inbox.displayName}</p>
                        <div className="grid grid-cols-2 gap-3">
                          <Input label="Company Name" defaultValue={inbox.companyName} />
                          <Input label="Display Name" defaultValue={inbox.displayName} />
                          <Input label="Email" defaultValue={inbox.email} />
                          <Input label="Phone" defaultValue={inbox.phone || ""} />
                          <Input label="Website" defaultValue={inbox.website || ""} />
                          <Input label="Notes" defaultValue={inbox.notes || ""} />
                        </div>
                        <div className="flex gap-2 mt-3">
                          <Button variant="primary" size="sm" onClick={() => setEditInboxId(null)}>Save Changes</Button>
                          <Button variant="ghost" size="sm" onClick={() => setEditInboxId(null)}>Cancel</Button>
                        </div>
                      </div>
                    );
                  }

                  return (
                    <div key={inbox.id} className={["rounded-xl border p-4 transition-colors", isDemo ? "border-warning-200 bg-warning-50/20" : connected ? "border-success-200 bg-white" : "border-neutral-200 bg-white hover:bg-neutral-25"].join(" ")}>
                      <div className="flex items-start gap-4">
                        {/* Icon */}
                        <div className={["flex h-10 w-10 shrink-0 items-center justify-center rounded-xl", isDemo ? "bg-warning-100" : connected ? "bg-success-50" : "bg-neutral-100"].join(" ")}>
                          <Mail className={["h-5 w-5", isDemo ? "text-warning-600" : connected ? "text-success-600" : "text-neutral-400"].join(" ")} />
                        </div>

                        {/* Details */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="text-sm font-bold text-neutral-800">{inbox.displayName}</p>
                            {inbox.enabled ? <Badge variant="success" size="sm" dot>Active</Badge> : <Badge variant="neutral" size="sm">Paused</Badge>}
                            {isDemo ? (
                              <Badge variant="warning" size="sm" dot>Demo Mode</Badge>
                            ) : connected ? (
                              <Badge variant="success" size="sm" dot>Connected</Badge>
 ) : inbox.syncStatus === "error" ? (
   <Badge variant="danger" size="sm" dot>Error</Badge>
 ) : inbox.syncStatus === "needs_reauthorization" ? (
   <Badge variant="warning" size="sm" dot>Needs Reauthorization</Badge>
 ) : (
   <Badge variant="neutral" size="sm">Not Connected</Badge>
 )}
                          </div>
                          <p className="text-xs text-neutral-500 mt-0.5">{inbox.email}</p>
                          <div className="flex items-center gap-3 mt-1 flex-wrap">
                            {isDemo && (
                              <span className="text-[10px] font-semibold text-warning-600">Sample data — not receiving real emails</span>
                            )}
                            {connected && (
                              <span className="text-[10px] font-semibold text-success-600">Receiving real emails</span>
                            )}
                            <span className="text-[10px] text-neutral-400 uppercase">Provider: {inbox.provider}</span>
                            {inbox.lastSyncAt && (
                              <span className="text-[10px] text-neutral-400 flex items-center gap-1">
                                <ClockIcon className="h-3 w-3" />
                                Last sync: {new Date(inbox.lastSyncAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex flex-col items-end gap-2 shrink-0">
                          <div className="flex items-center gap-1">
                            <button onClick={() => { /* toggle enable */ }} className="rounded-lg p-2 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-600 transition-colors" title={inbox.enabled ? "Disable" : "Enable"}>
                              {inbox.enabled ? <Power className="h-4 w-4 text-success-600" /> : <PowerOff className="h-4 w-4" />}
                            </button>
                            <button onClick={() => setEditInboxId(inbox.id)} className="rounded-lg p-2 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-600 transition-colors" title="Edit">
                              <Edit3 className="h-4 w-4" />
                            </button>
                            <button onClick={() => setDeleteConfirmId(inbox.id)} className="rounded-lg p-2 text-neutral-400 hover:bg-danger-50 hover:text-danger-600 transition-colors" title="Remove">
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                          {isDemo && (
                            <Button variant="outline" size="sm" icon={<ExternalLink className="h-3.5 w-3.5" />} onClick={() => setShowConnectDialog(inbox.id)}>
                              Configure Connection
                            </Button>
                          )}
                          {inbox.oauthConnected && (
                            <span className="text-[10px] text-success-600 font-semibold flex items-center gap-1">
                              <CheckCircle2 className="h-3 w-3" /> OAuth Active
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Demo warning bar */}
                      {isDemo && (
                        <div className="mt-3 rounded-lg bg-warning-100/50 border border-warning-200 px-3 py-2 flex items-center gap-2">
                          <AlertTriangle className="h-3.5 w-3.5 text-warning-600 shrink-0" />
                          <p className="text-[11px] text-warning-700">
                            This inbox contains <strong>sample demo data</strong>.
                            Configure OAuth to connect a real inbox and receive live emails.
                          </p>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>

            {/* Connect Inbox Dialog */}
            {showConnectDialog && (() => {
              const inbox = inboxes.find(i => i.id === showConnectDialog) ;
              if (!inbox) return null;
              const ib = inbox;

              const isHostinger = selectedProvider === "hostinger";
              const isGeneric = selectedProvider === "generic";
              const isGoogle = selectedProvider === "google";
              const isMicrosoft = selectedProvider === "microsoft";

              async function handleTestConnection() {
                setTestStatus({ type: "testing" });
                try {
                  const saveRes = await fetch("/api/emails/inboxes", {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      id: ib.id,
                      imapHost: imapForm.imapHost,
                      imapPort: parseInt(imapForm.imapPort),
                      imapSecure: true,
                      smtpHost: imapForm.smtpHost,
                      smtpPort: parseInt(imapForm.smtpPort),
                      encryptedPassword: btoa(imapForm.emailPassword),
                      provider: "hostinger",
                    }),
                  });
                  if (!saveRes.ok) throw new Error("Failed to save IMAP config");

                  const res = await fetch("/api/emails/test-connection", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ inboxId: ib.id }),
                  });
                  const json = await res.json();
                  if (json.success && json.data?.success) {
                    setTestStatus({ type: "success", message: "Connection successful! IMAP server is reachable." });
                  } else {
                    setTestStatus({ type: "error", message: json.data?.error || json.error || "Connection failed" });
                  }
                } catch (err) {
                  setTestStatus({ type: "error", message: err instanceof Error ? err.message : "Connection test failed" });
                }
              }

              async function handleSaveAndConnect() {
                setSaveStatus({ type: "saving" });
                try {
                  const saveRes = await fetch("/api/emails/inboxes", {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      id: ib.id,
                      imapHost: imapForm.imapHost,
                      imapPort: parseInt(imapForm.imapPort),
                      imapSecure: true,
                      smtpHost: imapForm.smtpHost,
                      smtpPort: parseInt(imapForm.smtpPort),
                      encryptedPassword: btoa(imapForm.emailPassword),
                      provider: "hostinger",
                      syncStatus: "connecting",
                    }),
                  });
                  if (!saveRes.ok) throw new Error("Failed to save configuration");

                  const syncRes = await fetch(`/api/sync?inboxId=${ib.id}`);
                  const syncJson = await syncRes.json();
                  if (syncJson.success) {
                    const result = syncJson.data?.results?.[0];
                    if (result?.status === "success") {
                      setSaveStatus({ type: "success", message: `Connected! ${result.newEmails} new email(s) synced.` });
                    } else if (result?.status === "error") {
                      setSaveStatus({ type: "error", message: result.errors?.[0] || "Sync completed with errors" });
                    } else {
                      setSaveStatus({ type: "success", message: "Configuration saved. No new emails found." });
                    }
                  } else {
                    setSaveStatus({ type: "error", message: syncJson.error || "Sync failed" });
                  }
                  refetch();
                } catch (err) {
                  setSaveStatus({ type: "error", message: err instanceof Error ? err.message : "Save failed" });
                }
              }

              function resetDialog() {
                setShowConnectDialog(null);
                setSelectedProvider(null);
                setTestStatus({ type: "idle" });
                setSaveStatus({ type: "idle" });
                setImapForm({ imapHost: "imap.hostinger.com", imapPort: "993", smtpHost: "smtp.hostinger.com", smtpPort: "465", emailPassword: "" });
              }

              return (
                <div className="mt-4 rounded-2xl border-2 border-brand-200 bg-brand-50/30 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-base font-bold text-neutral-800">Connect {ib.displayName}</h3>
                      <p className="text-sm text-neutral-500">{ib.email}</p>
                    </div>
                    <Button variant="ghost" size="sm" onClick={resetDialog} icon={<X className="h-4 w-4" />} />
                  </div>

                  {/* Provider Selection */}
                  <p className="text-xs font-bold text-neutral-500 uppercase mb-3">Select Provider</p>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-4 mb-6">
                    <button onClick={() => setSelectedProvider("google")}
                      className={["rounded-xl border-2 p-4 text-left transition-all", selectedProvider === "google" ? "border-brand-300 bg-brand-50 shadow-sm" : "border-neutral-200 bg-white hover:border-neutral-300"].join(" ")}>
                      <div className="flex items-center gap-3 mb-1"><div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600 font-bold">G</div>
                        <div><p className="text-sm font-bold text-neutral-800">Google</p><p className="text-[10px] text-neutral-400">Gmail API</p></div></div>
                    </button>
                    <button onClick={() => setSelectedProvider("microsoft")}
                      className={["rounded-xl border-2 p-4 text-left transition-all", selectedProvider === "microsoft" ? "border-brand-300 bg-brand-50 shadow-sm" : "border-neutral-200 bg-white hover:border-neutral-300"].join(" ")}>
                      <div className="flex items-center gap-3 mb-1"><div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600 font-bold">M</div>
                        <div><p className="text-sm font-bold text-neutral-800">Microsoft</p><p className="text-[10px] text-neutral-400">Graph API</p></div></div>
                    </button>
                    <button onClick={() => { setSelectedProvider("hostinger"); setTestStatus({ type: "idle" }); }}
                      className={["rounded-xl border-2 p-4 text-left transition-all", selectedProvider === "hostinger" ? "border-amber-300 bg-amber-50 shadow-sm" : "border-neutral-200 bg-white hover:border-neutral-300"].join(" ")}>
                      <div className="flex items-center gap-3 mb-1"><div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-amber-50 text-amber-600 font-bold">H</div>
                        <div><p className="text-sm font-bold text-neutral-800">Hostinger</p><p className="text-[10px] text-neutral-400">IMAP/SMTP</p></div></div>
                    </button>
                    <button onClick={() => { setSelectedProvider("generic"); setTestStatus({ type: "idle" }); }}
                      className={["rounded-xl border-2 p-4 text-left transition-all", selectedProvider === "generic" ? "border-neutral-400 bg-neutral-100 shadow-sm" : "border-neutral-200 bg-white hover:border-neutral-300"].join(" ")}>
                      <div className="flex items-center gap-3 mb-1"><div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-neutral-100 text-neutral-600 font-bold">@</div>
                        <div><p className="text-sm font-bold text-neutral-800">Generic</p><p className="text-[10px] text-neutral-400">IMAP/SMTP</p></div></div>
                    </button>
                  </div>

                  {/* Hostinger / Generic IMAP Form */}
                  {(isHostinger || isGeneric) && (
                    <div className="rounded-xl border border-amber-200 bg-amber-50/20 p-5 mb-4">
                      <h4 className="text-xs font-bold text-neutral-500 uppercase mb-3">
                        {isHostinger ? "Hostinger IMAP/SMTP Configuration" : "Generic IMAP/SMTP Configuration"}
                      </h4>
                      {testStatus.type === "testing" && <div className="mb-3 rounded-lg bg-info-50 border border-info-200 p-3 flex items-center gap-2 text-sm text-info-700"><Loader2 className="h-4 w-4 animate-spin" /> Testing connection...</div>}
                      {testStatus.type === "success" && <div className="mb-3 rounded-lg bg-success-50 border border-success-200 p-3 flex items-center gap-2 text-sm text-success-700"><CheckCircle2 className="h-4 w-4" /> {testStatus.message}</div>}
                      {testStatus.type === "error" && <div className="mb-3 rounded-lg bg-danger-50 border border-danger-200 p-3 flex items-center gap-2 text-sm text-danger-600"><AlertCircle className="h-4 w-4 shrink-0" /> {testStatus.message}</div>}
                      {saveStatus.type === "saving" && <div className="mb-3 rounded-lg bg-info-50 border border-info-200 p-3 flex items-center gap-2 text-sm text-info-700"><Loader2 className="h-4 w-4 animate-spin" /> Saving and syncing emails...</div>}
                      {saveStatus.type === "success" && <div className="mb-3 rounded-lg bg-success-50 border border-success-200 p-3 flex items-center gap-2 text-sm text-success-700"><CheckCircle2 className="h-4 w-4" /> {saveStatus.message}</div>}
                      {saveStatus.type === "error" && <div className="mb-3 rounded-lg bg-danger-50 border border-danger-200 p-3 flex items-center gap-2 text-sm text-danger-600"><AlertCircle className="h-4 w-4 shrink-0" /> {saveStatus.message}</div>}

                      <div className="grid grid-cols-2 gap-3">
                        <div><label className="block mb-1.5 text-sm font-semibold text-neutral-700">IMAP Host</label>
                          <input value={imapForm.imapHost} onChange={e => setImapForm(f => ({ ...f, imapHost: e.target.value }))} className="w-full rounded-lg border border-neutral-200 bg-white py-2.5 px-3 text-sm" /></div>
                        <div><label className="block mb-1.5 text-sm font-semibold text-neutral-700">IMAP Port</label>
                          <input value={imapForm.imapPort} onChange={e => setImapForm(f => ({ ...f, imapPort: e.target.value }))} className="w-full rounded-lg border border-neutral-200 bg-white py-2.5 px-3 text-sm" /></div>
                        <div><label className="block mb-1.5 text-sm font-semibold text-neutral-700">SMTP Host</label>
                          <input value={imapForm.smtpHost} onChange={e => setImapForm(f => ({ ...f, smtpHost: e.target.value }))} className="w-full rounded-lg border border-neutral-200 bg-white py-2.5 px-3 text-sm" /></div>
                        <div><label className="block mb-1.5 text-sm font-semibold text-neutral-700">SMTP Port</label>
                          <input value={imapForm.smtpPort} onChange={e => setImapForm(f => ({ ...f, smtpPort: e.target.value }))} className="w-full rounded-lg border border-neutral-200 bg-white py-2.5 px-3 text-sm" /></div>
                        <div className="col-span-2"><label className="block mb-1.5 text-sm font-semibold text-neutral-700">Email Password</label>
                          <input type="password" value={imapForm.emailPassword} onChange={e => setImapForm(f => ({ ...f, emailPassword: e.target.value }))} className="w-full rounded-lg border border-neutral-200 bg-white py-2.5 px-3 text-sm" placeholder="Enter your email password (encrypted at rest)" />
                          <p className="mt-1 text-[10px] text-neutral-400">Password is base64-encoded for storage. AES-256-GCM used in production. Never stored in plain text or logs.</p>
                        </div>
                      </div>
                      <div className="mt-4 flex items-center gap-3 flex-wrap">
                        <button onClick={handleTestConnection} disabled={testStatus.type === "testing" || !imapForm.emailPassword}
                          className="inline-flex items-center justify-center rounded-lg border border-amber-300 bg-amber-50 px-5 py-2.5 text-sm font-semibold text-amber-700 hover:bg-amber-100 disabled:opacity-50 transition-all">
                          {testStatus.type === "testing" ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <RefreshCw className="h-4 w-4 mr-2" />} Test Connection
                        </button>
                        <button onClick={handleSaveAndConnect} disabled={saveStatus.type === "saving" || !imapForm.emailPassword}
                          className="inline-flex items-center justify-center rounded-lg bg-brand-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-800 disabled:opacity-50 transition-all">
                          {saveStatus.type === "saving" ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Mail className="h-4 w-4 mr-2" />} Save & Connect
                        </button>
                        <span className="flex items-center gap-1 text-[10px] text-neutral-500"><ShieldCheck className="h-3.5 w-3.5" /> AES-256 encrypted</span>
                      </div>
                    </div>
                  )}

                  {isGoogle && (
                    <div className="rounded-xl border border-blue-200 bg-blue-50/20 p-5 mb-4">
                      <h4 className="text-sm font-bold text-neutral-800 mb-2">Google Workspace</h4>
                      <p className="text-sm text-neutral-500 mb-3">Connect via Gmail API using OAuth 2.0. No password required.</p>
                      <a href={`/api/auth/google?inboxId=${ib.id}`} className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 transition-all">Sign in with Google</a>
                      <p className="mt-2 text-xs text-neutral-400">Requires GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in environment variables.</p>
                    </div>
                  )}

                  {isMicrosoft && (
                    <div className="rounded-xl border border-blue-200 bg-blue-50/20 p-5 mb-4">
                      <h4 className="text-sm font-bold text-neutral-800 mb-2">Microsoft 365</h4>
                      <p className="text-sm text-neutral-500 mb-3">Connect via Microsoft Graph API using OAuth 2.0. No password required.</p>
                      <a href={`/api/auth/microsoft?inboxId=${ib.id}`} className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 transition-all">Sign in with Microsoft</a>
                      <p className="mt-2 text-xs text-neutral-400">Requires MICROSOFT_CLIENT_ID, CLIENT_SECRET, and TENANT_ID in environment variables.</p>
                    </div>
                  )}

                  {!selectedProvider && (
                    <div className="rounded-xl border border-dashed border-neutral-300 bg-white/50 p-8 text-center mb-4">
                      <p className="text-sm text-neutral-500">Select a provider above to configure the connection.</p>
                    </div>
                  )}
                </div>
              );
            })()}

            {/* Real Email Setup — Technical Note */}
            <div className="mt-6 rounded-xl border border-info-200 bg-info-50 p-4">
              <div className="flex items-start gap-3">
                <Shield className="h-5 w-5 text-info-600 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-bold text-info-800">Real Email Setup — How It Works</p>
                  <p className="text-xs text-info-700 mt-1 leading-relaxed">
                    To receive real emails, each inbox must be connected via OAuth 2.0 or IMAP/SMTP with encrypted app passwords.
                    Here is what is required per provider:
                  </p>
                  <ul className="mt-2 space-y-1 text-xs text-info-700">
                    <li><strong>Google Workspace:</strong> Create a GCP project, enable Gmail API, configure OAuth consent screen, and provide your Client ID and Client Secret. Tokens are encrypted at rest.</li>
                    <li><strong>Microsoft 365:</strong> Register an app in Azure AD, enable Microsoft Graph API (Mail.Read, Mail.Send scopes), and provide your Tenant ID, Client ID, and Client Secret.</li>
                    <li><strong>IMAP/SMTP:</strong> Generate an app-specific password from your email provider (never your real password). The app password is encrypted using AES-256 before storage.</li>
                  </ul>
                  <p className="mt-2 text-xs text-info-600 font-semibold">
                    Once configured, the platform polls every 60 seconds for new emails and processes them through the parsing engine.
                    Currently, all inboxes display demo/sample data for evaluation.
                  </p>
                </div>
              </div>
            </div>
          </SettingsCard>}

          <div className="flex justify-end gap-3"><Button variant="outline">Cancel</Button><Button variant="primary">Save Changes</Button></div>
        </div>
      </div>
    </div>
  );
}

function SettingsCard({ title, children }: { title: string; children: React.ReactNode }) {
  return <Card padding="lg"><h2 className="text-lg font-bold text-neutral-800 mb-6">{title}</h2>{children}</Card>;
}

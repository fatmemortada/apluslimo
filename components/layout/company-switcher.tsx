"use client";

import { useState } from "react";
import { Building2, Check, ChevronDown, Plus, Settings } from "lucide-react";

const companies = [
  { id: "org_demo001", name: "ChauffeurOS Fleet Operations", plan: "Enterprise", initials: "CF" },
  { id: "org_002", name: "Toronto Executive Transport", plan: "Business", initials: "TE" },
  { id: "org_003", name: "Vancouver Luxury Fleet", plan: "Professional", initials: "VL" },
];

export function CompanySwitcher() {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(companies[0]);

  return (
    <div className="relative">
      <button onClick={() => setOpen(!open)} className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm font-semibold text-neutral-700 hover:bg-neutral-100 transition-all">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand-100 text-brand-700 text-[10px] font-black">{active.initials}</div>
        <span className="hidden lg:inline max-w-[120px] truncate">{active.name}</span>
        <ChevronDown className="hidden lg:block h-3.5 w-3.5 text-neutral-400" />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute left-0 top-full mt-2 w-72 rounded-xl border border-neutral-100 bg-white shadow-xl z-50 py-2 animate-scale-in">
            <div className="px-3 py-2"><p className="text-[10px] font-bold text-neutral-400 uppercase">Switch Company</p></div>
            {companies.map((c) => (
              <button key={c.id} onClick={() => { setActive(c); setOpen(false); }}
                className={["flex w-full items-center gap-3 px-3 py-2.5 text-sm transition-colors", active.id === c.id ? "bg-brand-50 text-brand-700" : "text-neutral-600 hover:bg-neutral-50"].join(" ")}>
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-neutral-100 text-neutral-600 text-[10px] font-black">{c.initials}</div>
                <div className="text-left flex-1"><p className="font-semibold text-sm">{c.name}</p><p className="text-xs text-neutral-400">{c.plan} Plan</p></div>
                {active.id === c.id && <Check className="h-4 w-4 text-brand-600" />}
              </button>
            ))}
            <div className="border-t border-neutral-100 mt-1 pt-1">
              <button className="flex w-full items-center gap-2 px-3 py-2 text-sm text-neutral-500 hover:bg-neutral-50 transition-colors"><Plus className="h-4 w-4" />Add Company</button>
              <button className="flex w-full items-center gap-2 px-3 py-2 text-sm text-neutral-500 hover:bg-neutral-50 transition-colors"><Settings className="h-4 w-4" />Manage Companies</button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

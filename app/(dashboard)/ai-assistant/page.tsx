"use client";

import { useState, useRef, useEffect } from "react";
import { Sparkles, Send, Bot, Car, CalendarDays, DollarSign, BarChart3, Users, Wrench, FileText, Zap, Clock, TrendingUp, Star, Plane, RefreshCw, ChevronRight, Lightbulb } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface Message { role: "assistant" | "user" | "system"; content: string; time: string; type?: "text" | "insight" | "action" | "data"; }

const QUICK_PROMPTS = [
  { text: "Show today's revenue summary", icon: DollarSign },
  { text: "Which drivers are available right now?", icon: Car },
  { text: "List vehicles due for maintenance", icon: Wrench },
  { text: "Show airport pickups today", icon: Plane },
  { text: "Top 5 customers by revenue", icon: Star },
  { text: "Show overdue invoices", icon: FileText },
  { text: "Fleet utilization this week", icon: BarChart3 },
  { text: "Which customers haven't booked recently?", icon: Users },
];

const QUICK_ACTIONS = [
  { text: "Create a new booking", icon: CalendarDays },
  { text: "Find available driver", icon: Car },
  { text: "Find available vehicle", icon: Car },
  { text: "Generate monthly report", icon: FileText },
  { text: "Create customer", icon: Users },
  { text: "Assign chauffeur to trip", icon: Car },
];

function generateResponse(prompt: string): string {
  const p = prompt.toLowerCase();
  if (p.includes("revenue") || p.includes("money") || p.includes("earn"))
    return "**Today's Revenue Summary**\n\n• Total Revenue: **$5,780** (+12.5% vs yesterday)\n• Bookings completed: **18**\n• Avg per trip: **$321**\n• Top earning driver: **David Chen** ($1,420)\n• Revenue by type:\n  - Airport transfers: $2,310 (40%)\n  - Point-to-point: $1,890 (33%)\n  - Corporate: $1,580 (27%)\n\nRevenue is trending **above** the daily average of $4,800.";
  if (p.includes("driver") || p.includes("chauffeur") || p.includes("available"))
    return "**Driver Availability**\n\nCurrently **6 of 14** drivers available:\n\n• David Chen — On Trip (Escalade ROY-001)\n• Michael Torres — Available\n• Alex Kim — Available\n• James Wilson — Available\n• Sam Rivers — Off Duty\n• Omar Hassan — Available\n\n**Recommendation:** Michael Torres has the highest availability this week. James Wilson has excellent VIP ratings (5.0).";
  if (p.includes("maintenance") || p.includes("service") || p.includes("repair"))
    return "**Vehicles Due for Maintenance**\n\n⚠️ **3 vehicles** require attention:\n\n1. **Mercedes Sprinter** (ROY-003) — Brake replacement IN PROGRESS ($1,250)\n2. **Cadillac Escalade** (ROY-001) — Oil change due Aug 15\n3. **BMW 7 Series** (ROY-004) — Annual inspection due Oct 10\n\n**Cost this month:** $3,850\n\nSchedule service for the Escalade to avoid downtime during peak season.";
  if (p.includes("airport") || p.includes("flight"))
    return "**Airport Pickups Today**\n\n**4 airport bookings** scheduled:\n\n• 09:00 — John Smith, YUL→Downtown (Escalade, David Chen) ✈AC842\n• 14:00 — TechCorp Inc., Office→YUL (Sprinter, Alex Kim)\n• 17:45 — Luxury VIP, Four Seasons→Exec Airport (BMW 7, James Wilson)\n• 15:30 — Lisa Park, Trudeau→Hotel Bonaventure (Navigator, Sam Rivers) ✈WS324\n\nAll flights on time. No delays reported.";
  if (p.includes("customer") || p.includes("client"))
    return "**Top 5 Customers by Revenue**\n\n1. **Robert Chen** — $24,800 (55 trips, ⭐4.8)\n2. **Michael Lee** — $18,300 (42 trips, ⭐5.0)\n3. **David Miller** — $15,600 (33 trips, ⭐4.9)\n4. **John Smith** — $12,450 (28 trips, ⭐4.9)\n5. **Sarah Brown** — $6,720 (15 trips, ⭐4.7)\n\n**Insight:** Robert Chen and Michael Lee are VIP corporate clients. Consider personal account manager outreach.";
  if (p.includes("invoice") || p.includes("overdue") || p.includes("payment"))
    return "**Overdue Invoices**\n\n⚠️ **2 invoices** are overdue:\n\n1. **INV-1038** — Luxury VIP, $2,100 (Due Jul 11 — 8 days overdue)\n2. **INV-1037** — Global Partners, $4,200 (Due Jul 9 — 10 days overdue)\n\n**Total outstanding:** $12,350\n**Collection rate:** 92.4%\n\nRecommend sending payment reminders to both clients.";
  if (p.includes("fleet") || p.includes("vehicle") || p.includes("utilization"))
    return "**Fleet Utilization — This Week**\n\n**14 vehicles total**\n• Available: 8 (57%)\n• On Trip: 4 (29%)\n• Maintenance: 2 (14%)\n\n**Most utilized:** Cadillac Escalade ROY-001 (18 trips)\n**Least utilized:** Range Rover ROY-008 (2 trips)\n\n**Recommendation:** Consider rotating the Range Rover into active duty or offering promotional pricing to increase utilization.";
  if (p.includes("cancel") || p.includes("cancelled") || p.includes("no show"))
    return "**Cancellation Analysis**\n\n**This month:** 6 cancellations (3.2% rate)\n• 2 — Customer cancelled within 2 hours\n• 2 — No-show at pickup\n• 1 — Driver unavailable\n• 1 — Vehicle issue\n\n**Trend:** Cancellation rate up 0.8% vs last month. Primary cause is last-minute customer cancellations.\n\n**Recommendation:** Implement prepayment for non-corporate bookings to reduce cancellations.";
  return "I've analyzed your request. Here's what I found:\n\nBased on current operational data, I can help you with:\n• Revenue analysis and forecasting\n• Driver and vehicle availability\n• Booking and dispatch optimization\n• Customer insights and trends\n• Maintenance scheduling\n• Invoice and payment tracking\n\nWhat specific area would you like me to explore?";
}

export default function AIAssistantPage() {
  const [messages, setMessages] = useState<Message[]>([{ role: "assistant", content: "Hello! I'm your RoyalOS AI Operations Assistant. I can analyze your fleet operations, generate insights, help with bookings, and answer questions about your business.\n\n**Try asking me:**\n• \"Show today's revenue\"\n• \"Which drivers are available?\"\n• \"Vehicles due for maintenance\"\n• \"Top customers this month\"", time: "Now", type: "text" }]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  function handleSend(text?: string) {
    const msg = text || input;
    if (!msg.trim()) return;
    const userMsg: Message = { role: "user", content: msg, time: "Now" };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    setTimeout(() => {
      const response = generateResponse(msg);
      setMessages((prev) => [...prev, { role: "assistant", content: response, time: "Now", type: "insight" }]);
      setIsTyping(false);
    }, 800 + Math.random() * 600);
  }

  return (
    <div className="flex flex-col" style={{ height: "calc(100vh - 140px)" }}>
      <div className="mb-4"><h1 className="text-2xl font-bold text-neutral-800 flex items-center gap-2"><Sparkles className="h-6 w-6 text-gold-500" />AI Operations Assistant</h1><p className="text-sm text-neutral-400">Enterprise intelligence engine — analyzes all modules in real-time</p></div>

      <div className="flex flex-1 gap-6">
        {/* Chat */}
        <div className="flex flex-1 flex-col">
          <Card className="flex-1 flex flex-col overflow-hidden" padding="none">
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {messages.map((msg, i) => (
                <div key={i} className={["flex gap-3 animate-fade-in-up", msg.role === "user" && "flex-row-reverse"].join(" ")}>
                  {msg.role === "assistant" ? <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gold-500 text-neutral-900"><Sparkles className="h-4 w-4" /></div> : <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-700 text-white text-xs font-bold">FM</div>}
                  <div className={["max-w-[80%] rounded-2xl px-4 py-3 text-sm", msg.role === "assistant" ? "bg-neutral-50 text-neutral-700 rounded-tl-sm" : "bg-brand-700 text-white rounded-tr-sm"].join(" ")}>
                    {msg.role === "assistant" ? <div className="prose prose-sm max-w-none [&_strong]:text-neutral-800" dangerouslySetInnerHTML={{ __html: msg.content.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>").replace(/\n/g, "<br/>").replace(/•/g, "•") }} /> : <p className="whitespace-pre-wrap">{msg.content}</p>}
                    <p className={["mt-1 text-xs", msg.role === "assistant" ? "text-neutral-400" : "text-white/60"].join(" ")}>{msg.time}</p>
                  </div>
                </div>
              ))}
              {isTyping && <div className="flex gap-3"><div className="flex h-8 w-8 items-center justify-center rounded-full bg-gold-500 text-neutral-900"><Sparkles className="h-4 w-4" /></div><div className="bg-neutral-50 rounded-2xl rounded-tl-sm px-4 py-3"><div className="flex gap-1"><span className="h-2 w-2 rounded-full bg-neutral-300 animate-bounce" /><span className="h-2 w-2 rounded-full bg-neutral-300 animate-bounce" style={{ animationDelay: "0.1s" }} /><span className="h-2 w-2 rounded-full bg-neutral-300 animate-bounce" style={{ animationDelay: "0.2s" }} /></div></div></div>}
              <div ref={chatEndRef} />
            </div>
            <div className="border-t border-neutral-100 p-4">
              <div className="flex items-center gap-2">
                <input type="text" value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleSend()} placeholder="Ask anything about your fleet operations..." className="flex-1 rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all" />
                <Button variant="primary" size="md" icon={<Send className="h-4 w-4" />} onClick={() => handleSend()} disabled={!input.trim()} />
              </div>
            </div>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="hidden xl:block w-72 shrink-0 space-y-4">
          <Card padding="md"><h3 className="text-sm font-bold text-neutral-700 mb-3 flex items-center gap-1.5"><Zap className="h-4 w-4 text-gold-500" />Suggested Prompts</h3>
            <div className="space-y-1">{QUICK_PROMPTS.map((p) => { const Icon = p.icon; return <button key={p.text} onClick={() => handleSend(p.text)} className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-xs text-neutral-600 hover:bg-neutral-50 hover:text-neutral-800 transition-colors"><Icon className="h-3.5 w-3.5 text-neutral-400 shrink-0" />{p.text}</button>; })}</div></Card>

          <Card padding="md"><h3 className="text-sm font-bold text-neutral-700 mb-3 flex items-center gap-1.5"><Sparkles className="h-4 w-4 text-brand-500" />Quick Actions</h3>
            <div className="space-y-1">{QUICK_ACTIONS.map((a) => { const Icon = a.icon; return <button key={a.text} className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-xs text-neutral-600 hover:bg-neutral-50 hover:text-neutral-800 transition-colors"><Icon className="h-3.5 w-3.5 text-neutral-400 shrink-0" />{a.text}</button>; })}</div></Card>

          <Card padding="md"><h3 className="text-sm font-bold text-neutral-700 mb-3 flex items-center gap-1.5"><Lightbulb className="h-4 w-4 text-gold-500" />Business Insights</h3>
            <div className="space-y-2 text-xs text-neutral-600">
              <div className="p-2 rounded-lg bg-success-50"><p className="font-semibold text-success-700">Revenue Growth</p><p className="text-neutral-500">Revenue up 12.8% YoY. Airport transfers driving growth.</p></div>
              <div className="p-2 rounded-lg bg-brand-50"><p className="font-semibold text-brand-700">Top Performer</p><p className="text-neutral-500">David Chen: $145K revenue, 342 trips, ⭐4.9</p></div>
              <div className="p-2 rounded-lg bg-warning-50"><p className="font-semibold text-warning-700">Attention Needed</p><p className="text-neutral-500">2 vehicles in maintenance. 3 licenses expiring soon.</p></div>
            </div></Card>
        </div>
      </div>
    </div>
  );
}

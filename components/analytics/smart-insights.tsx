"use client";

import { TrendingUp, TrendingDown, Star, AlertTriangle, Lightbulb, DollarSign, Car, Users, Target } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface Insight {
  id: string;
  type: "positive" | "negative" | "neutral" | "warning" | "opportunity";
  title: string;
  description: string;
  metric?: string;
  change?: number;
}

interface SmartInsightsProps {
  insights: Insight[];
}

const typeStyles: Record<string, { icon: React.ReactNode; bg: string; border: string; badge: string }> = {
  positive: { icon: <TrendingUp className="h-5 w-5" />, bg: "bg-success-50", border: "border-success-200", badge: "bg-success-100 text-success-700" },
  negative: { icon: <TrendingDown className="h-5 w-5" />, bg: "bg-danger-50", border: "border-danger-200", badge: "bg-danger-100 text-danger-700" },
  neutral: { icon: <Lightbulb className="h-5 w-5" />, bg: "bg-neutral-50", border: "border-neutral-200", badge: "bg-neutral-200 text-neutral-600" },
  warning: { icon: <AlertTriangle className="h-5 w-5" />, bg: "bg-warning-50", border: "border-warning-200", badge: "bg-warning-100 text-warning-700" },
  opportunity: { icon: <Target className="h-5 w-5" />, bg: "bg-brand-50", border: "border-brand-200", badge: "bg-brand-100 text-brand-700" },
};

const typeLabels: Record<string, string> = {
  positive: "Growth", negative: "Decline", neutral: "Note", warning: "Alert", opportunity: "Opportunity",
};

export function SmartInsights({ insights }: SmartInsightsProps) {
  if (!insights.length) return null;

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Lightbulb className="h-4 w-4 text-gold-500" />
        <h2 className="text-base font-bold text-neutral-800">Smart Insights</h2>
        <Badge variant="gold">AI Analysis</Badge>
      </div>
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
        {insights.map((insight) => {
          const style = typeStyles[insight.type] || typeStyles.neutral;
          return (
            <div key={insight.id} className={["rounded-xl border p-4 transition-all hover:shadow-md", style.bg, style.border].join(" ")}>
              <div className="flex items-start gap-3">
                <div className={["flex h-10 w-10 shrink-0 items-center justify-center rounded-xl", style.badge].join(" ")}>
                  {style.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={["text-[10px] font-bold px-1.5 py-0.5 rounded", style.badge].join(" ")}>
                      {typeLabels[insight.type]}
                    </span>
                    {insight.change !== undefined && (
                      <span className={["text-xs font-bold", insight.change > 0 ? "text-success-600" : "text-danger-600"].join(" ")}>
                        {insight.change > 0 ? "+" : ""}{insight.change}%
                      </span>
                    )}
                  </div>
                  <p className="text-sm font-bold text-neutral-800">{insight.title}</p>
                  <p className="text-xs text-neutral-500 mt-1">{insight.description}</p>
                  {insight.metric && (
                    <p className="text-xs font-semibold text-neutral-600 mt-1.5">{insight.metric}</p>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

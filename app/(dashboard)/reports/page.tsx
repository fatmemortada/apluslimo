"use client";

import { FileText, Download, TrendingUp, BarChart3, Users, Car, DollarSign, CalendarDays } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatCard } from "@/components/ui/stat-card";

const reportTemplates = [
  { title: "Monthly Revenue Report", description: "Complete financial breakdown by revenue source", icon: DollarSign, color: "success", updated: "Generated Jul 1, 2026" },
  { title: "Fleet Utilization Report", description: "Vehicle usage, mileage, and maintenance costs", icon: Car, color: "brand", updated: "Generated Jun 30, 2026" },
  { title: "Driver Performance", description: "Ratings, trip counts, and customer feedback", icon: Users, color: "info", updated: "Generated Jun 30, 2026" },
  { title: "Booking Analytics", description: "Booking trends, peak hours, and cancellation rates", icon: BarChart3, color: "gold", updated: "Generated Jun 29, 2026" },
  { title: "Customer Lifetime Value", description: "Top customers, repeat rate, and churn analysis", icon: TrendingUp, color: "warning", updated: "Generated Jun 28, 2026" },
  { title: "Monthly Operations Summary", description: "Trips completed, on-time %, and incidents", icon: CalendarDays, color: "brand", updated: "Generated Jul 1, 2026" },
  { title: "Maintenance Log", description: "All service records, costs, and upcoming due", icon: FileText, color: "danger", updated: "Generated Jun 27, 2026" },
  { title: "Revenue Forecast", description: "Projected revenue based on current bookings", icon: TrendingUp, color: "success", updated: "Generated Jun 26, 2026" },
];

export default function ReportsPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-800">Reports</h1>
          <p className="text-sm text-neutral-400">Generate and download business reports</p>
        </div>
        <Button variant="primary" size="lg" icon={<FileText className="h-4 w-4" />}>Generate Report</Button>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Reports Generated" value="24" color="brand" />
        <StatCard label="Scheduled Reports" value="8" color="info" />
        <StatCard label="Last Generated" value="Today" color="success" />
        <StatCard label="Auto-Reports" value="Weekly" color="gold" />
      </div>

      {/* Report Templates */}
      <div>
        <h2 className="text-base font-bold text-neutral-800 mb-4">Report Templates</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {reportTemplates.map((report, i) => {
            const Icon = report.icon;
            const colors = {
              brand: "bg-brand-50 text-brand-700",
              success: "bg-success-50 text-success-600",
              warning: "bg-warning-50 text-warning-600",
              danger: "bg-danger-50 text-danger-600",
              info: "bg-info-50 text-info-600",
              gold: "bg-gold-50 text-gold-700",
            };
            return (
              <Card key={i} hover padding="md">
                <div className={["flex h-10 w-10 items-center justify-center rounded-xl mb-3", colors[report.color as keyof typeof colors] || colors.brand].join(" ")}>
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="text-sm font-bold text-neutral-800">{report.title}</h3>
                <p className="mt-1 text-xs text-neutral-400">{report.description}</p>
                <div className="mt-4 flex items-center justify-between">
                  <span className="text-xs text-neutral-300">{report.updated}</span>
                  <Button variant="outline" size="sm" icon={<Download className="h-3.5 w-3.5" />}>Download</Button>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}

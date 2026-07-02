"use client";

import { Plus, Search, Car, Gauge, Settings, MoreHorizontal, Download } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge, StatusChip } from "@/components/ui/badge";
import { StatCard } from "@/components/ui/stat-card";
import { SearchInput } from "@/components/ui/search-input";
import { Table, TableHead, TableBody, TableRow, TableHeaderCell, TableCell } from "@/components/ui/table";

const vehicles = [
  { name: "Cadillac Escalade", type: "Luxury SUV", year: 2024, plate: "ROY-001", vin: "1GYS4BKJ9PR123456", seats: 6, color: "Black", status: "Active", mileage: "45,200 km" },
  { name: "Chevrolet Suburban", type: "Full-Size SUV", year: 2024, plate: "ROY-002", vin: "1GNSKHKD2PR654321", seats: 7, color: "White", status: "Active", mileage: "32,800 km" },
  { name: "Mercedes Sprinter", type: "Passenger Van", year: 2023, plate: "ROY-003", vin: "W1W4EBHY7PT789012", seats: 12, color: "Silver", status: "Maintenance", mileage: "58,900 km" },
  { name: "BMW 7 Series", type: "Luxury Sedan", year: 2025, plate: "ROY-004", vin: "WBA7U2C08NC345678", seats: 4, color: "Black", status: "Active", mileage: "28,100 km" },
  { name: "Cadillac Escalade ESV", type: "Extended SUV", year: 2024, plate: "ROY-005", vin: "1GYS4PKL2PR901234", seats: 7, color: "Black", status: "Active", mileage: "38,400 km" },
  { name: "Lincoln Navigator", type: "Luxury SUV", year: 2024, plate: "ROY-006", vin: "5LMJJ2LT2RE567890", seats: 7, color: "Navy", status: "Active", mileage: "22,600 km" },
];

export default function VehiclesPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-800">Vehicles</h1>
          <p className="text-sm text-neutral-400">Vehicle inventory and specifications</p>
        </div>
        <Button variant="primary" size="lg" icon={<Plus className="h-4 w-4" />}>Add Vehicle</Button>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Total Vehicles" value="14" icon={<Car className="h-5 w-5" />} color="brand" />
        <StatCard label="Active" value="12" color="success" />
        <StatCard label="Avg. Year" value="2024" color="info" />
        <StatCard label="Avg. Mileage" value="32,600 km" color="gold" />
      </div>

      <Card padding="none">
        <div className="flex items-center gap-3 border-b border-neutral-100 p-4">
          <SearchInput placeholder="Search vehicles..." containerClassName="flex-1 max-w-sm" />
          <Button variant="outline" size="md" icon={<Download className="h-4 w-4" />}>Export</Button>
        </div>
        <Table>
          <TableHead>
            <TableRow>
              <TableHeaderCell>Vehicle</TableHeaderCell>
              <TableHeaderCell>Type</TableHeaderCell>
              <TableHeaderCell>Year</TableHeaderCell>
              <TableHeaderCell>Plate</TableHeaderCell>
              <TableHeaderCell>VIN</TableHeaderCell>
              <TableHeaderCell>Seats</TableHeaderCell>
              <TableHeaderCell>Color</TableHeaderCell>
              <TableHeaderCell>Mileage</TableHeaderCell>
              <TableHeaderCell>Status</TableHeaderCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {vehicles.map((v, i) => (
              <TableRow key={i} clickable>
                <TableCell><span className="font-semibold text-neutral-800">{v.name}</span></TableCell>
                <TableCell className="text-neutral-600">{v.type}</TableCell>
                <TableCell className="text-neutral-600">{v.year}</TableCell>
                <TableCell className="font-mono text-sm font-semibold text-neutral-700">{v.plate}</TableCell>
                <TableCell className="font-mono text-xs text-neutral-400">{v.vin}</TableCell>
                <TableCell className="text-neutral-600">{v.seats}</TableCell>
                <TableCell className="text-neutral-600">{v.color}</TableCell>
                <TableCell className="text-neutral-600">{v.mileage}</TableCell>
                <TableCell><StatusChip status={v.status} /></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}

"use client";

import { Plus, Search, Star, Phone, Mail, MoreHorizontal, Download } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { SearchInput } from "@/components/ui/search-input";
import { StatCard } from "@/components/ui/stat-card";
import { Table, TableHead, TableBody, TableRow, TableHeaderCell, TableCell } from "@/components/ui/table";

const customers = [
  { name: "John Smith", phone: "+1 (514) 555-1001", email: "john@example.com", city: "Montreal", vip: true, trips: 28, revenue: "$12,450", rating: 4.9 },
  { name: "Sarah Brown", phone: "+1 (514) 555-1002", email: "sarah@example.com", city: "Westmount", vip: false, trips: 15, revenue: "$6,720", rating: 4.7 },
  { name: "Michael Lee", phone: "+1 (514) 555-1003", email: "michael@example.com", city: "Laval", vip: true, trips: 42, revenue: "$18,300", rating: 5.0 },
  { name: "Emily Watson", phone: "+1 (514) 555-1004", email: "emily@example.com", city: "Downtown", vip: false, trips: 8, revenue: "$3,200", rating: 4.5 },
  { name: "Robert Chen", phone: "+1 (514) 555-1005", email: "robert@example.com", city: "Montreal", vip: true, trips: 55, revenue: "$24,800", rating: 4.8 },
  { name: "Lisa Park", phone: "+1 (514) 555-1006", email: "lisa@example.com", city: "Brossard", vip: false, trips: 12, revenue: "$5,100", rating: 4.6 },
  { name: "David Miller", phone: "+1 (514) 555-1007", email: "david@example.com", city: "Westmount", vip: true, trips: 33, revenue: "$15,600", rating: 4.9 },
  { name: "Amanda Jones", phone: "+1 (514) 555-1008", email: "amanda@example.com", city: "Laval", vip: false, trips: 6, revenue: "$2,800", rating: 4.4 },
];

export default function CustomersPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-800">Customers</h1>
          <p className="text-sm text-neutral-400">Manage your client database</p>
        </div>
        <Button variant="primary" size="lg" icon={<Plus className="h-4 w-4" />}>Add Customer</Button>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Total Customers" value="1,284" color="brand" />
        <StatCard label="VIP Clients" value="342" color="gold" />
        <StatCard label="Avg. Rating" value="4.8" color="success" />
        <StatCard label="Repeat Rate" value="78%" trend="up" trendValue="5.2%" color="info" />
      </div>

      <Card padding="none">
        <div className="flex items-center gap-3 border-b border-neutral-100 p-4">
          <SearchInput placeholder="Search customers..." containerClassName="flex-1 max-w-sm" />
          <Button variant="outline" size="md" icon={<Download className="h-4 w-4" />}>Export</Button>
        </div>
        <Table>
          <TableHead>
            <TableRow>
              <TableHeaderCell>Customer</TableHeaderCell>
              <TableHeaderCell>Status</TableHeaderCell>
              <TableHeaderCell>Phone</TableHeaderCell>
              <TableHeaderCell>Email</TableHeaderCell>
              <TableHeaderCell>City</TableHeaderCell>
              <TableHeaderCell>Trips</TableHeaderCell>
              <TableHeaderCell>Revenue</TableHeaderCell>
              <TableHeaderCell>Rating</TableHeaderCell>
              <TableHeaderCell>{" "}</TableHeaderCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {customers.map((c, i) => (
              <TableRow key={i} clickable>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar name={c.name} />
                    <span className="font-semibold text-neutral-800">{c.name}</span>
                  </div>
                </TableCell>
                <TableCell>{c.vip ? <Badge variant="gold" dot>VIP</Badge> : <Badge variant="neutral">Standard</Badge>}</TableCell>
                <TableCell className="text-neutral-500">{c.phone}</TableCell>
                <TableCell className="text-neutral-500">{c.email}</TableCell>
                <TableCell className="text-neutral-500">{c.city}</TableCell>
                <TableCell className="font-semibold text-neutral-700">{c.trips}</TableCell>
                <TableCell className="font-semibold text-neutral-700">{c.revenue}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-1 text-sm font-semibold text-neutral-700">
                    <Star className="h-3.5 w-3.5 fill-gold-500 text-gold-500" />
                    {c.rating}
                  </div>
                </TableCell>
                <TableCell><Button variant="ghost" size="sm" icon={<MoreHorizontal className="h-4 w-4" />} /></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}

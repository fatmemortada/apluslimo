"use client";

import { Upload, FileText, FileImage, File, Download, Search, Plus, MoreHorizontal, FolderOpen } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SearchInput } from "@/components/ui/search-input";
import { StatCard } from "@/components/ui/stat-card";
import { Table, TableHead, TableBody, TableRow, TableHeaderCell, TableCell } from "@/components/ui/table";

const documents = [
  { name: "Insurance Certificate — Cadillac Escalade.pdf", type: "PDF", size: "2.4 MB", category: "Insurance", uploaded: "Jul 1, 2026", uploadedBy: "Fatme Mortada" },
  { name: "Driver License — David Chen.pdf", type: "PDF", size: "1.1 MB", category: "Driver", uploaded: "Jun 28, 2026", uploadedBy: "Fatme Mortada" },
  { name: "Vehicle Registration — ROY-001.pdf", type: "PDF", size: "0.8 MB", category: "Registration", uploaded: "Jun 25, 2026", uploadedBy: "Fatme Mortada" },
  { name: "Fleet Inspection Report — June 2026.pdf", type: "PDF", size: "3.2 MB", category: "Inspection", uploaded: "Jun 30, 2026", uploadedBy: "Fatme Mortada" },
  { name: "Corporate Contract — TechCorp Inc.pdf", type: "PDF", size: "1.8 MB", category: "Contract", uploaded: "Jun 20, 2026", uploadedBy: "Fatme Mortada" },
  { name: "Fleet Photo — Escalade Interior.jpg", type: "Image", size: "4.5 MB", category: "Photo", uploaded: "Jun 15, 2026", uploadedBy: "Fatme Mortada" },
];

const typeIcons: Record<string, React.ReactNode> = {
  PDF: <FileText className="h-5 w-5 text-danger-500" />,
  Image: <FileImage className="h-5 w-5 text-info-500" />,
};

export default function DocumentsPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-800">Documents</h1>
          <p className="text-sm text-neutral-400">File storage and document management</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="md" icon={<FolderOpen className="h-4 w-4" />}>New Folder</Button>
          <Button variant="primary" size="md" icon={<Upload className="h-4 w-4" />}>Upload</Button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Total Documents" value="186" color="brand" />
        <StatCard label="Storage Used" value="1.2 GB" color="info" />
        <StatCard label="Uploaded Today" value="4" color="success" />
        <StatCard label="Categories" value="12" color="gold" />
      </div>

      <Card padding="none">
        <div className="flex items-center gap-3 border-b border-neutral-100 p-4">
          <SearchInput placeholder="Search documents..." containerClassName="flex-1 max-w-sm" />
        </div>
        <Table>
          <TableHead>
            <TableRow>
              <TableHeaderCell>Name</TableHeaderCell>
              <TableHeaderCell>Type</TableHeaderCell>
              <TableHeaderCell>Category</TableHeaderCell>
              <TableHeaderCell>Size</TableHeaderCell>
              <TableHeaderCell>Uploaded</TableHeaderCell>
              <TableHeaderCell>Uploaded By</TableHeaderCell>
              <TableHeaderCell>{" "}</TableHeaderCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {documents.map((doc, i) => (
              <TableRow key={i} clickable>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-neutral-50">
                      {typeIcons[doc.type] || <File className="h-5 w-5 text-neutral-400" />}
                    </span>
                    <span className="font-semibold text-neutral-800 text-sm">{doc.name}</span>
                  </div>
                </TableCell>
                <TableCell><Badge variant={doc.type === "PDF" ? "danger" : "info"}>{doc.type}</Badge></TableCell>
                <TableCell className="text-neutral-600">{doc.category}</TableCell>
                <TableCell className="text-neutral-500">{doc.size}</TableCell>
                <TableCell className="text-neutral-500">{doc.uploaded}</TableCell>
                <TableCell className="text-neutral-600">{doc.uploadedBy}</TableCell>
                <TableCell>
                  <Button variant="ghost" size="sm" icon={<Download className="h-4 w-4" />} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}

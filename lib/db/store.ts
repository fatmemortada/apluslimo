// ============================================================
// RoyalOS — Normalized In-Memory Data Store
// Drop-in replacement target for PostgreSQL/Prisma
// ============================================================

import type {
  Organization,
  User,
  Customer,
  CorporateAccount,
  Driver,
  Vehicle,
  MaintenanceRecord,
  Booking,
  Invoice,
  Payment,
  Document,
  Notification,
  ActivityLogEntry,
  EmailInbox,
  EmailMessage,
} from "@/lib/types";

// Singleton store — in production this is PostgreSQL
// All "tables" are Maps keyed by ID for O(1) lookup
// Foreign keys maintain referential integrity

export interface DatabaseSchema {
  organizations: Map<string, Organization>;
  users: Map<string, User>;
  customers: Map<string, Customer>;
  corporateAccounts: Map<string, CorporateAccount>;
  drivers: Map<string, Driver>;
  vehicles: Map<string, Vehicle>;
  maintenanceRecords: Map<string, MaintenanceRecord>;
  bookings: Map<string, Booking>;
  invoices: Map<string, Invoice>;
  payments: Map<string, Payment>;
  documents: Map<string, Document>;
  notifications: Map<string, Notification>;
  emailInboxes: Map<string, EmailInbox>;
  emailMessages: Map<string, EmailMessage>;
  activityLog: ActivityLogEntry[];
}

function createStore(): DatabaseSchema {
  return {
    organizations: new Map(),
    users: new Map(),
    customers: new Map(),
    corporateAccounts: new Map(),
    drivers: new Map(),
    vehicles: new Map(),
    maintenanceRecords: new Map(),
    bookings: new Map(),
    invoices: new Map(),
    payments: new Map(),
    documents: new Map(),
    notifications: new Map(),
    emailInboxes: new Map(),
    emailMessages: new Map(),
    activityLog: [],
  };
}

// Global store instance (server-side singleton in dev)
declare global {
  // eslint-disable-next-line no-var
  var __royalos_db: DatabaseSchema | undefined;
}

// Ensure the global store has all fields (backward-compatible with HMR)
function ensureStoreComplete(store: DatabaseSchema): DatabaseSchema {
  if (!store.emailInboxes) {
    (store as any).emailInboxes = new Map();
  }
  if (!store.emailMessages) {
    (store as any).emailMessages = new Map();
  }
  return store;
}

export const db: DatabaseSchema = ensureStoreComplete(
  globalThis.__royalos_db ?? createStore()
);

// Persist across HMR in development
if (process.env.NODE_ENV !== "production") {
  globalThis.__royalos_db = db;
}

// ── Helper: Generate IDs ────────────────────────────────────

let _idCounter = 0;
export function generateId(prefix: string): string {
  _idCounter++;
  const ts = Date.now().toString(36);
  const rnd = Math.random().toString(36).substring(2, 6);
  return `${prefix}_${ts}${rnd}${_idCounter}`;
}

export function generateBookingNumber(): string {
  const num = Math.floor(Math.random() * 9000) + 1000;
  return `MRL-${num}`;
}

export function generateInvoiceNumber(): string {
  const num = Math.floor(Math.random() * 9000) + 1000;
  return `INV-${num}`;
}

// ── Helper: Query collection ────────────────────────────────

export function queryAll<T extends { organizationId: string }>(
  collection: Map<string, T>,
  orgId: string,
  filters?: { search?: string; status?: string; [key: string]: unknown }
): T[] {
  let results = Array.from(collection.values()).filter(
    (item) => item.organizationId === orgId
  );

  if (filters?.status) {
    results = results.filter(
      (item) =>
        (item as Record<string, unknown>).status === filters.status
    );
  }

  if (filters?.search) {
    const s = filters.search.toLowerCase();
    results = results.filter((item) =>
      Object.values(item as Record<string, unknown>).some(
        (v) => typeof v === "string" && v.toLowerCase().includes(s)
      )
    );
  }

  return results;
}

export function paginate<T>(
  items: T[],
  page = 1,
  pageSize = 20
): { data: T[]; total: number; page: number; pageSize: number; totalPages: number } {
  const total = items.length;
  const totalPages = Math.ceil(total / pageSize);
  const start = (page - 1) * pageSize;
  const data = items.slice(start, start + pageSize);
  return { data, total, page, pageSize, totalPages };
}

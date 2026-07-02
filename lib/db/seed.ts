// ============================================================
// ChauffeurOS — Seed Data
// Complete interconnected dataset for development
// ============================================================

import { db, generateId, generateBookingNumber, generateInvoiceNumber } from "./store";
import { parseEmail, classifyEmail, classifyPriority } from "@/lib/email/parser";
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
  Notification,
  ActivityLogEntry,
  EmailInbox,
  EmailMessage,
} from "@/lib/types";

const ORG_ID = "org_demo001";
const NOW = "2026-07-02T14:00:00Z";

export function seed(): void {
  if (db.organizations.has(ORG_ID)) return; // already seeded

  // ── Organization ──────────────────────────────────────
  const org: Organization = {
    id: ORG_ID,
    name: "Royal Limousine Montreal",
    slug: "royal-limousine-montreal",
    taxId: "12345-6789-RC0001",
    address: {
      street: "1234 Sherbrooke St W",
      city: "Montreal",
      province: "Quebec",
      postalCode: "H3G 1H1",
      country: "Canada",
      lat: 45.5017,
      lng: -73.5673,
    },
    phone: "+1 (514) 555-0000",
    email: "info@royallimo.com",
    website: "https://royallimo.com",
    plan: "enterprise",
    status: "active",
    maxVehicles: 50,
    maxDrivers: 50,
    maxUsers: 25,
    settings: {
      timezone: "America/Toronto",
      currency: "CAD",
      dateFormat: "MM/DD/YYYY",
      timeFormat: "12h",
      distanceUnit: "km",
      defaultLanguage: "en",
      branding: { primaryColor: "#0f172a", accentColor: "#d4af37" },
      notifications: {
        emailBookingConfirmations: true,
        emailInvoices: true,
        smsDriverAlerts: true,
        pushNotifications: true,
      },
    },
    createdAt: "2024-01-15T00:00:00Z",
    updatedAt: NOW,
  };
  db.organizations.set(ORG_ID, org);

  // ── Users ─────────────────────────────────────────────
  const users: User[] = [
    {
      id: "user_fatme", organizationId: ORG_ID, email: "fatme@royallimo.com",
      firstName: "Fatme", lastName: "Mortada", fullName: "Fatme Mortada",
      role: "owner", status: "active", phone: "+1 (514) 555-0001",
      lastLoginAt: NOW,
      permissions: [
        { resource: "dashboard", actions: ["create", "read", "update", "delete", "export", "manage"] },
        { resource: "customers", actions: ["create", "read", "update", "delete", "export", "manage"] },
        { resource: "bookings", actions: ["create", "read", "update", "delete", "export", "manage"] },
        { resource: "dispatch", actions: ["create", "read", "update", "delete", "export", "manage"] },
        { resource: "drivers", actions: ["create", "read", "update", "delete", "export", "manage"] },
        { resource: "fleet", actions: ["create", "read", "update", "delete", "export", "manage"] },
        { resource: "vehicles", actions: ["create", "read", "update", "delete", "export", "manage"] },
        { resource: "maintenance", actions: ["create", "read", "update", "delete", "export", "manage"] },
        { resource: "calendar", actions: ["create", "read", "update", "delete", "export", "manage"] },
        { resource: "invoices", actions: ["create", "read", "update", "delete", "export", "manage"] },
        { resource: "revenue", actions: ["create", "read", "update", "delete", "export", "manage"] },
        { resource: "reports", actions: ["create", "read", "update", "delete", "export", "manage"] },
        { resource: "analytics", actions: ["create", "read", "update", "delete", "export", "manage"] },
        { resource: "documents", actions: ["create", "read", "update", "delete", "export", "manage"] },
        { resource: "notifications", actions: ["create", "read", "update", "delete", "export", "manage"] },
        { resource: "settings", actions: ["create", "read", "update", "delete", "export", "manage"] },
        { resource: "users", actions: ["create", "read", "update", "delete", "export", "manage"] },
        { resource: "organization", actions: ["create", "read", "update", "delete", "export", "manage"] },
      ],
      createdAt: "2024-01-15T00:00:00Z", updatedAt: NOW,
    },
    {
      id: "user_sarah", organizationId: ORG_ID, email: "sarah@royallimo.com",
      firstName: "Sarah", lastName: "Martinez", fullName: "Sarah Martinez",
      role: "dispatcher", status: "active", phone: "+1 (514) 555-0002",
      lastLoginAt: "2026-07-02T08:30:00Z",
      permissions: [
        { resource: "dashboard", actions: ["read"] },
        { resource: "customers", actions: ["create", "read", "update"] },
        { resource: "bookings", actions: ["create", "read", "update", "delete"] },
        { resource: "dispatch", actions: ["create", "read", "update", "delete"] },
        { resource: "drivers", actions: ["read", "update"] },
        { resource: "fleet", actions: ["read"] },
        { resource: "calendar", actions: ["create", "read", "update"] },
        { resource: "invoices", actions: ["read"] },
        { resource: "reports", actions: ["read"] },
      ],
      createdAt: "2024-06-01T00:00:00Z", updatedAt: NOW,
    },
  ];
  users.forEach((u) => db.users.set(u.id, u));

  // ── Customers ─────────────────────────────────────────
  const custId = (n: string) => `cust_${n}`;
  const customers: Customer[] = [
    {
      id: custId("john"), organizationId: ORG_ID, type: "individual", status: "active",
      firstName: "John", lastName: "Smith", fullName: "John Smith",
      email: "john.smith@email.com", phone: "+1 (514) 555-1001",
      address: { street: "456 Rue Peel", city: "Montreal", province: "Quebec", postalCode: "H3A 1T2", country: "Canada" },
      preferences: { preferredVehicleType: "luxury_suv", preferredPaymentMethod: "credit_card", notifySms: true, notifyEmail: true },
      tags: ["vip", "frequent"],
      totalTrips: 28, totalRevenue: 12450, lifetimeValue: 12450, averageRating: 4.9,
      lastTripAt: "2026-07-01T16:00:00Z",
      createdAt: "2024-03-10T00:00:00Z", updatedAt: NOW,
    },
    {
      id: custId("sarah"), organizationId: ORG_ID, type: "individual", status: "active",
      firstName: "Sarah", lastName: "Brown", fullName: "Sarah Brown",
      email: "sarah.brown@email.com", phone: "+1 (514) 555-1002",
      address: { street: "789 Avenue Greene", city: "Westmount", province: "Quebec", postalCode: "H3Z 1Z5", country: "Canada" },
      preferences: { preferredVehicleType: "luxury_sedan", preferredPaymentMethod: "credit_card", notifySms: false, notifyEmail: true },
      tags: [],
      totalTrips: 15, totalRevenue: 6720, lifetimeValue: 6720, averageRating: 4.7,
      lastTripAt: "2026-06-28T12:00:00Z",
      createdAt: "2024-06-15T00:00:00Z", updatedAt: NOW,
    },
    {
      id: custId("michael"), organizationId: ORG_ID, type: "individual", status: "active",
      firstName: "Michael", lastName: "Lee", fullName: "Michael Lee",
      email: "michael.lee@email.com", phone: "+1 (514) 555-1003",
      address: { street: "2345 Boul Saint-Martin", city: "Laval", province: "Quebec", postalCode: "H7T 1A1", country: "Canada" },
      preferences: { preferredPaymentMethod: "bank_transfer", preferredVehicleType: "executive_sedan", notifySms: true, notifyEmail: true },
      tags: ["vip", "corporate_contact"],
      totalTrips: 42, totalRevenue: 18300, lifetimeValue: 18300, averageRating: 5.0,
      lastTripAt: "2026-07-01T09:00:00Z",
      createdAt: "2024-01-20T00:00:00Z", updatedAt: NOW,
    },
    {
      id: custId("emily"), organizationId: ORG_ID, type: "individual", status: "active",
      firstName: "Emily", lastName: "Watson", fullName: "Emily Watson",
      email: "emily.watson@email.com", phone: "+1 (514) 555-1004",
      address: { street: "1200 McGill College", city: "Montreal", province: "Quebec", postalCode: "H3B 4G7", country: "Canada" },
      preferences: { preferredPaymentMethod: "credit_card", notifySms: false, notifyEmail: true },
      tags: [],
      totalTrips: 8, totalRevenue: 3200, lifetimeValue: 3200, averageRating: 4.5,
      lastTripAt: "2026-06-20T18:00:00Z",
      createdAt: "2024-09-01T00:00:00Z", updatedAt: NOW,
    },
    {
      id: custId("robert"), organizationId: ORG_ID, type: "individual", status: "active",
      firstName: "Robert", lastName: "Chen", fullName: "Robert Chen",
      email: "robert.chen@email.com", phone: "+1 (514) 555-1005",
      address: { street: "3500 Boul de Maisonneuve", city: "Montreal", province: "Quebec", postalCode: "H3Z 3C1", country: "Canada" },
      preferences: { preferredVehicleType: "luxury_sedan", preferredPaymentMethod: "corporate_account", notifySms: true, notifyEmail: true },
      tags: ["vip", "corporate_contact", "high_value"],
      totalTrips: 55, totalRevenue: 24800, lifetimeValue: 24800, averageRating: 4.8,
      lastTripAt: "2026-07-02T08:00:00Z",
      createdAt: "2023-11-05T00:00:00Z", updatedAt: NOW,
    },
    {
      id: custId("lisa"), organizationId: ORG_ID, type: "individual", status: "active",
      firstName: "Lisa", lastName: "Park", fullName: "Lisa Park",
      email: "lisa.park@email.com", phone: "+1 (514) 555-1006",
      address: { street: "8800 Boul Leduc", city: "Brossard", province: "Quebec", postalCode: "J4Y 0G4", country: "Canada" },
      preferences: { preferredPaymentMethod: "credit_card", notifySms: true, notifyEmail: false },
      tags: [],
      totalTrips: 12, totalRevenue: 5100, lifetimeValue: 5100, averageRating: 4.6,
      lastTripAt: "2026-06-25T14:00:00Z",
      createdAt: "2025-02-10T00:00:00Z", updatedAt: NOW,
    },
    {
      id: custId("david"), organizationId: ORG_ID, type: "individual", status: "active",
      firstName: "David", lastName: "Miller", fullName: "David Miller",
      email: "david.miller@email.com", phone: "+1 (514) 555-1007",
      address: { street: "1 Westmount Square", city: "Westmount", province: "Quebec", postalCode: "H3Z 2P9", country: "Canada" },
      preferences: { preferredVehicleType: "full_size_suv", preferredPaymentMethod: "credit_card", notifySms: true, notifyEmail: true },
      tags: ["vip"],
      totalTrips: 33, totalRevenue: 15600, lifetimeValue: 15600, averageRating: 4.9,
      lastTripAt: "2026-07-01T11:00:00Z",
      createdAt: "2024-04-22T00:00:00Z", updatedAt: NOW,
    },
  ];
  customers.forEach((c) => db.customers.set(c.id, c));

  // ── Corporate Accounts ────────────────────────────────
  const corpAccounts: CorporateAccount[] = [
    {
      id: "corp_techcorp", organizationId: ORG_ID, companyName: "TechCorp Inc.",
      taxId: "87654-3210", address: { street: "2000 Rue University", city: "Montreal", province: "Quebec", postalCode: "H3A 2A5", country: "Canada" },
      primaryContactId: custId("robert"), billingEmail: "ap@techcorp.com", billingContactName: "Robert Chen",
      creditLimit: 25000, paymentTerms: "net_30", employees: 1200,
      contractStartDate: "2024-01-01T00:00:00Z", discountRate: 0.12,
      activeEmployees: [], totalTrips: 156, totalRevenue: 87200,
      status: "active", createdAt: "2024-01-01T00:00:00Z", updatedAt: NOW,
    },
    {
      id: "corp_morgan", organizationId: ORG_ID, companyName: "Morgan Stanley",
      taxId: "98765-4321", address: { street: "1501 McGill College", city: "Montreal", province: "Quebec", postalCode: "H3A 3M8", country: "Canada" },
      primaryContactId: custId("david"), billingEmail: "finance@morganstanley.com", billingContactName: "David Miller",
      creditLimit: 50000, paymentTerms: "net_30", employees: 850,
      contractStartDate: "2024-03-01T00:00:00Z", discountRate: 0.10,
      activeEmployees: [], totalTrips: 89, totalRevenue: 52400,
      status: "active", createdAt: "2024-03-01T00:00:00Z", updatedAt: NOW,
    },
    {
      id: "corp_global", organizationId: ORG_ID, companyName: "Global Partners Ltd.",
      taxId: "45678-9123", address: { street: "500 Place d'Armes", city: "Montreal", province: "Quebec", postalCode: "H2Y 2W2", country: "Canada" },
      primaryContactId: custId("lisa"), billingEmail: "billing@globalpartners.com", billingContactName: "Lisa Park",
      creditLimit: 15000, paymentTerms: "net_15", employees: 280,
      contractStartDate: "2025-01-15T00:00:00Z", discountRate: 0.08,
      activeEmployees: [], totalTrips: 41, totalRevenue: 22800,
      status: "active", createdAt: "2025-01-15T00:00:00Z", updatedAt: NOW,
    },
  ];
  corpAccounts.forEach((c) => db.corporateAccounts.set(c.id, c));

  // ── Drivers ───────────────────────────────────────────
  const drvId = (n: string) => `drv_${n}`;
  const drivers: Driver[] = [
    {
      id: drvId("david"), organizationId: ORG_ID, firstName: "David", lastName: "Chen", fullName: "David Chen",
      email: "david.chen@royallimo.com", phone: "+1 (514) 555-2001",
      status: "on_trip", licenseNumber: "C4B-987654", licenseClass: "Class 4B",
      licenseExpiry: "2027-06-15T00:00:00Z", medicalExpiry: "2027-03-01T00:00:00Z",
      insuranceExpiry: "2027-01-01T00:00:00Z", assignedVehicleId: "veh_escalade1",
      rating: 4.9, totalTrips: 342, totalRevenue: 145000, completionRate: 0.98, onTimeRate: 0.96,
      yearsOfExperience: 8, languages: ["English", "French", "Mandarin"],
      certifications: ["Chauffeur License", "First Aid", "Defensive Driving"],
      emergencyContact: { name: "Mei Chen", phone: "+1 (514) 555-9001", relationship: "Spouse" },
      schedule: {
        monday: { start: "06:00", end: "14:00", available: true },
        tuesday: { start: "06:00", end: "14:00", available: true },
        wednesday: { start: "06:00", end: "14:00", available: true },
        thursday: { start: "06:00", end: "14:00", available: true },
        friday: { start: "06:00", end: "14:00", available: true },
      },
      metrics: { tripsThisMonth: 42, tripsThisWeek: 10, revenueThisMonth: 18200, hoursWorkedThisWeek: 32, customerRating: 4.9, complaints: 0, compliments: 12, accidents: 0 },
      hiredAt: "2022-03-15T00:00:00Z", createdAt: "2022-03-15T00:00:00Z", updatedAt: NOW,
    },
    {
      id: drvId("michael"), organizationId: ORG_ID, firstName: "Michael", lastName: "Torres", fullName: "Michael Torres",
      email: "michael.torres@royallimo.com", phone: "+1 (514) 555-2002",
      status: "available", licenseNumber: "C4B-123789", licenseClass: "Class 4B",
      licenseExpiry: "2028-01-10T00:00:00Z", assignedVehicleId: "veh_suburban",
      rating: 4.7, totalTrips: 218, totalRevenue: 92000, completionRate: 0.97, onTimeRate: 0.94,
      yearsOfExperience: 5, languages: ["English", "French", "Spanish"],
      certifications: ["Chauffeur License", "First Aid"],
      emergencyContact: { name: "Maria Torres", phone: "+1 (514) 555-9002", relationship: "Spouse" },
      schedule: {
        monday: { start: "14:00", end: "22:00", available: true },
        tuesday: { start: "14:00", end: "22:00", available: true },
        wednesday: { start: "14:00", end: "22:00", available: true },
        thursday: { start: "14:00", end: "22:00", available: true },
        friday: { start: "14:00", end: "22:00", available: true },
        saturday: { start: "10:00", end: "18:00", available: true },
      },
      metrics: { tripsThisMonth: 28, tripsThisWeek: 7, revenueThisMonth: 12400, hoursWorkedThisWeek: 28, customerRating: 4.7, complaints: 1, compliments: 8, accidents: 0 },
      hiredAt: "2023-06-01T00:00:00Z", createdAt: "2023-06-01T00:00:00Z", updatedAt: NOW,
    },
    {
      id: drvId("alex"), organizationId: ORG_ID, firstName: "Alex", lastName: "Kim", fullName: "Alex Kim",
      email: "alex.kim@royallimo.com", phone: "+1 (514) 555-2003",
      status: "available", licenseNumber: "C4B-456321", licenseClass: "Class 4B",
      licenseExpiry: "2026-12-20T00:00:00Z", assignedVehicleId: "veh_sprinter",
      rating: 4.8, totalTrips: 156, totalRevenue: 68000, completionRate: 0.98, onTimeRate: 0.97,
      yearsOfExperience: 3, languages: ["English", "French", "Korean"],
      certifications: ["Chauffeur License"],
      emergencyContact: { name: "Jennifer Kim", phone: "+1 (514) 555-9003", relationship: "Spouse" },
      schedule: {
        monday: { start: "08:00", end: "16:00", available: true },
        tuesday: { start: "08:00", end: "16:00", available: true },
        wednesday: { start: "08:00", end: "16:00", available: true },
        thursday: { start: "08:00", end: "16:00", available: true },
        friday: { start: "08:00", end: "16:00", available: true },
      },
      metrics: { tripsThisMonth: 22, tripsThisWeek: 5, revenueThisMonth: 9800, hoursWorkedThisWeek: 32, customerRating: 4.8, complaints: 0, compliments: 6, accidents: 0 },
      hiredAt: "2024-01-10T00:00:00Z", createdAt: "2024-01-10T00:00:00Z", updatedAt: NOW,
    },
    {
      id: drvId("james"), organizationId: ORG_ID, firstName: "James", lastName: "Wilson", fullName: "James Wilson",
      email: "james.wilson@royallimo.com", phone: "+1 (514) 555-2004",
      status: "available", licenseNumber: "C4B-789654", licenseClass: "Class 4B",
      licenseExpiry: "2027-08-05T00:00:00Z", assignedVehicleId: "veh_bmw7",
      rating: 5.0, totalTrips: 420, totalRevenue: 178000, completionRate: 0.99, onTimeRate: 0.98,
      yearsOfExperience: 12, languages: ["English", "French"],
      certifications: ["Chauffeur License", "First Aid", "Defensive Driving", "Executive Protection"],
      emergencyContact: { name: "Patricia Wilson", phone: "+1 (514) 555-9004", relationship: "Spouse" },
      schedule: {
        monday: { start: "10:00", end: "18:00", available: true },
        tuesday: { start: "10:00", end: "18:00", available: true },
        wednesday: { start: "10:00", end: "18:00", available: true },
        thursday: { start: "10:00", end: "18:00", available: true },
        friday: { start: "10:00", end: "18:00", available: true },
        saturday: { start: "12:00", end: "20:00", available: true },
      },
      metrics: { tripsThisMonth: 48, tripsThisWeek: 12, revenueThisMonth: 21200, hoursWorkedThisWeek: 38, customerRating: 5.0, complaints: 0, compliments: 22, accidents: 0 },
      hiredAt: "2021-09-01T00:00:00Z", createdAt: "2021-09-01T00:00:00Z", updatedAt: NOW,
    },
    {
      id: drvId("sam"), organizationId: ORG_ID, firstName: "Sam", lastName: "Rivers", fullName: "Sam Rivers",
      email: "sam.rivers@royallimo.com", phone: "+1 (514) 555-2005",
      status: "off_duty", licenseNumber: "C4B-321987", licenseClass: "Class 4B",
      licenseExpiry: "2026-11-30T00:00:00Z", assignedVehicleId: "veh_navigator",
      rating: 4.6, totalTrips: 98, totalRevenue: 42000, completionRate: 0.95, onTimeRate: 0.92,
      yearsOfExperience: 2, languages: ["English", "French"],
      certifications: ["Chauffeur License"],
      emergencyContact: { name: "Tom Rivers", phone: "+1 (514) 555-9005", relationship: "Brother" },
      schedule: {
        monday: { start: "16:00", end: "00:00", available: true },
        tuesday: { start: "16:00", end: "00:00", available: true },
        wednesday: { start: "16:00", end: "00:00", available: true },
        thursday: { start: "16:00", end: "00:00", available: true },
        friday: { start: "16:00", end: "00:00", available: true },
        saturday: { start: "16:00", end: "00:00", available: true },
      },
      metrics: { tripsThisMonth: 14, tripsThisWeek: 3, revenueThisMonth: 5800, hoursWorkedThisWeek: 20, customerRating: 4.6, complaints: 2, compliments: 4, accidents: 1 },
      hiredAt: "2024-08-15T00:00:00Z", createdAt: "2024-08-15T00:00:00Z", updatedAt: NOW,
    },
    {
      id: drvId("omar"), organizationId: ORG_ID, firstName: "Omar", lastName: "Hassan", fullName: "Omar Hassan",
      email: "omar.hassan@royallimo.com", phone: "+1 (514) 555-2006",
      status: "available", licenseNumber: "C4B-654987", licenseClass: "Class 4B",
      licenseExpiry: "2027-04-22T00:00:00Z", assignedVehicleId: "veh_escalade2",
      rating: 4.9, totalTrips: 275, totalRevenue: 118000, completionRate: 0.97, onTimeRate: 0.95,
      yearsOfExperience: 6, languages: ["English", "French", "Arabic"],
      certifications: ["Chauffeur License", "First Aid"],
      emergencyContact: { name: "Aisha Hassan", phone: "+1 (514) 555-9006", relationship: "Spouse" },
      schedule: {
        monday: { start: "06:00", end: "14:00", available: true },
        tuesday: { start: "06:00", end: "14:00", available: true },
        wednesday: { start: "06:00", end: "14:00", available: true },
        thursday: { start: "06:00", end: "14:00", available: true },
        friday: { start: "06:00", end: "14:00", available: true },
        sunday: { start: "08:00", end: "16:00", available: true },
      },
      metrics: { tripsThisMonth: 35, tripsThisWeek: 8, revenueThisMonth: 15100, hoursWorkedThisWeek: 30, customerRating: 4.9, complaints: 0, compliments: 10, accidents: 0 },
      hiredAt: "2022-07-01T00:00:00Z", createdAt: "2022-07-01T00:00:00Z", updatedAt: NOW,
    },
  ];
  drivers.forEach((d) => db.drivers.set(d.id, d));

  // ── Vehicles ──────────────────────────────────────────
  const vehicles: Vehicle[] = [
    { id: "veh_escalade1", organizationId: ORG_ID, name: "Cadillac Escalade", type: "luxury_suv", status: "on_trip", year: 2024, make: "Cadillac", model: "Escalade Premium", color: "Black", plate: "ROY-001", vin: "1GYS4BKJ9PR123456", seats: 6, luggageCapacity: 4, fuelType: "gasoline", fuelLevel: 75, mileage: 45200, assignedDriverId: drvId("david"), amenities: ["WiFi", "Water", "Charger", "Sunroof"], registrationExpiry: "2027-03-15T00:00:00Z", insuranceExpiry: "2027-03-15T00:00:00Z", lastServiceAt: "2026-05-15T00:00:00Z", lastServiceMileage: 42000, nextServiceDue: "2026-08-15T00:00:00Z", nextServiceMileage: 50000, purchaseDate: "2024-01-15T00:00:00Z", purchasePrice: 120000, currentValue: 95000, depreciationRate: 0.15, photos: [], createdAt: "2024-01-15T00:00:00Z", updatedAt: NOW },
    { id: "veh_suburban", organizationId: ORG_ID, name: "Chevrolet Suburban", type: "full_size_suv", status: "available", year: 2024, make: "Chevrolet", model: "Suburban Premier", color: "White", plate: "ROY-002", vin: "1GNSKHKD2PR654321", seats: 7, luggageCapacity: 5, fuelType: "gasoline", fuelLevel: 90, mileage: 32800, assignedDriverId: drvId("michael"), amenities: ["WiFi", "Water", "Charger"], registrationExpiry: "2027-06-01T00:00:00Z", insuranceExpiry: "2027-06-01T00:00:00Z", lastServiceAt: "2026-06-01T00:00:00Z", lastServiceMileage: 30000, nextServiceDue: "2026-09-02T00:00:00Z", nextServiceMileage: 38000, purchaseDate: "2024-03-01T00:00:00Z", purchasePrice: 95000, currentValue: 78000, depreciationRate: 0.15, photos: [], createdAt: "2024-03-01T00:00:00Z", updatedAt: NOW },
    { id: "veh_sprinter", organizationId: ORG_ID, name: "Mercedes Sprinter", type: "passenger_van", status: "maintenance", year: 2023, make: "Mercedes-Benz", model: "Sprinter 2500", color: "Silver", plate: "ROY-003", vin: "W1W4EBHY7PT789012", seats: 12, luggageCapacity: 8, fuelType: "diesel", fuelLevel: 50, mileage: 58900, assignedDriverId: drvId("alex"), amenities: ["WiFi", "Water", "TV", "Charger"], registrationExpiry: "2027-01-20T00:00:00Z", insuranceExpiry: "2027-01-20T00:00:00Z", lastServiceAt: "2026-04-01T00:00:00Z", lastServiceMileage: 55000, nextServiceDue: "2026-07-02T00:00:00Z", nextServiceMileage: 60000, purchaseDate: "2023-06-15T00:00:00Z", purchasePrice: 75000, currentValue: 52000, depreciationRate: 0.18, photos: [], createdAt: "2023-06-15T00:00:00Z", updatedAt: NOW },
    { id: "veh_bmw7", organizationId: ORG_ID, name: "BMW 7 Series", type: "luxury_sedan", status: "available", year: 2025, make: "BMW", model: "740i xDrive", color: "Black Sapphire", plate: "ROY-004", vin: "WBA7U2C08NC345678", seats: 4, luggageCapacity: 2, fuelType: "gasoline", fuelLevel: 100, mileage: 28100, assignedDriverId: drvId("james"), amenities: ["WiFi", "Water", "Massage Seats", "Charger"], registrationExpiry: "2028-02-10T00:00:00Z", insuranceExpiry: "2028-02-10T00:00:00Z", lastServiceAt: "2026-06-10T00:00:00Z", lastServiceMileage: 25000, nextServiceDue: "2026-10-10T00:00:00Z", nextServiceMileage: 35000, purchaseDate: "2025-01-10T00:00:00Z", purchasePrice: 110000, currentValue: 92000, depreciationRate: 0.14, photos: [], createdAt: "2025-01-10T00:00:00Z", updatedAt: NOW },
    { id: "veh_escalade2", organizationId: ORG_ID, name: "Cadillac Escalade ESV", type: "luxury_suv", status: "available", year: 2024, make: "Cadillac", model: "Escalade ESV Platinum", color: "Black", plate: "ROY-005", vin: "1GYS4PKL2PR901234", seats: 7, luggageCapacity: 5, fuelType: "gasoline", fuelLevel: 60, mileage: 38400, assignedDriverId: drvId("omar"), amenities: ["WiFi", "Water", "Charger", "Sunroof", "Fridge"], registrationExpiry: "2027-05-20T00:00:00Z", insuranceExpiry: "2027-05-20T00:00:00Z", lastServiceAt: "2026-04-22T00:00:00Z", lastServiceMileage: 35000, nextServiceDue: "2026-08-22T00:00:00Z", nextServiceMileage: 43000, purchaseDate: "2024-04-01T00:00:00Z", purchasePrice: 130000, currentValue: 102000, depreciationRate: 0.15, photos: [], createdAt: "2024-04-01T00:00:00Z", updatedAt: NOW },
    { id: "veh_navigator", organizationId: ORG_ID, name: "Lincoln Navigator", type: "luxury_suv", status: "available", year: 2024, make: "Lincoln", model: "Navigator Black Label", color: "Navy", plate: "ROY-006", vin: "5LMJJ2LT2RE567890", seats: 7, luggageCapacity: 5, fuelType: "gasoline", fuelLevel: 85, mileage: 22600, assignedDriverId: drvId("sam"), amenities: ["WiFi", "Water", "Charger", "Sunroof"], registrationExpiry: "2027-08-01T00:00:00Z", insuranceExpiry: "2027-08-01T00:00:00Z", lastServiceAt: "2026-05-05T00:00:00Z", lastServiceMileage: 20000, nextServiceDue: "2026-11-05T00:00:00Z", nextServiceMileage: 28000, purchaseDate: "2024-07-01T00:00:00Z", purchasePrice: 115000, currentValue: 90000, depreciationRate: 0.15, photos: [], createdAt: "2024-07-01T00:00:00Z", updatedAt: NOW },
  ];
  vehicles.forEach((v) => db.vehicles.set(v.id, v));

  // ── Maintenance ───────────────────────────────────────
  const maintenances: MaintenanceRecord[] = [
    { id: "maint_001", organizationId: ORG_ID, vehicleId: "veh_escalade1", type: "oil_change", status: "scheduled", priority: "low", description: "Regular oil change and filter replacement", scheduledDate: "2026-08-15T00:00:00Z", cost: 180, vendor: "Royal Auto Service", vendorPhone: "+1 (514) 555-3001", parts: [{ name: "Synthetic Oil 5W-30", quantity: 6, unitPrice: 15 }, { name: "Oil Filter", partNumber: "ACD-OF467", quantity: 1, unitPrice: 25 }], createdAt: "2026-07-01T00:00:00Z", updatedAt: NOW },
    { id: "maint_002", organizationId: ORG_ID, vehicleId: "veh_sprinter", type: "brake_replacement", status: "in_progress", priority: "high", description: "Front and rear brake pad replacement, rotor inspection", scheduledDate: "2026-07-02T00:00:00Z", cost: 1250, vendor: "European Auto Care", vendorPhone: "+1 (514) 555-3002", parts: [{ name: "Front Brake Pads", partNumber: "MB-BP890", quantity: 1, unitPrice: 280 }, { name: "Rear Brake Pads", partNumber: "MB-BP891", quantity: 1, unitPrice: 260 }, { name: "Brake Sensor", quantity: 2, unitPrice: 45 }], createdAt: "2026-06-28T00:00:00Z", updatedAt: NOW },
    { id: "maint_003", organizationId: ORG_ID, vehicleId: "veh_suburban", type: "tire_rotation", status: "scheduled", priority: "low", description: "Tire rotation and wheel alignment", scheduledDate: "2026-09-02T00:00:00Z", cost: 120, vendor: "Royal Auto Service", vendorPhone: "+1 (514) 555-3001", parts: [], createdAt: "2026-06-15T00:00:00Z", updatedAt: NOW },
    { id: "maint_004", organizationId: ORG_ID, vehicleId: "veh_bmw7", type: "inspection", status: "scheduled", priority: "medium", description: "Annual safety and emissions inspection", scheduledDate: "2026-10-10T00:00:00Z", cost: 350, vendor: "BMW Westmount", vendorPhone: "+1 (514) 555-3003", parts: [], createdAt: "2026-06-01T00:00:00Z", updatedAt: NOW },
  ];
  maintenances.forEach((m) => db.maintenanceRecords.set(m.id, m));

  // ── Bookings ──────────────────────────────────────────
  const bookings: Booking[] = [
    {
      id: "bkg_001", organizationId: ORG_ID, bookingNumber: "MRL-1042", type: "airport_pickup", tripType: "one_way", status: "in_progress",
      customerId: custId("john"), passengerCount: 2, luggageCount: 3,
      pickup: { id: "stop_p1", type: "pickup", address: { street: "YUL Airport", city: "Montreal", province: "Quebec", postalCode: "H4S 1A9", country: "Canada" }, scheduledAt: "2026-07-02T09:00:00Z", sequence: 1 },
      dropoff: { id: "stop_d1", type: "dropoff", address: { street: "456 Rue Peel", city: "Montreal", province: "Quebec", postalCode: "H3A 1T2", country: "Canada" }, scheduledAt: "2026-07-02T09:45:00Z", sequence: 2 },
      stops: [], scheduledPickupAt: "2026-07-02T09:00:00Z", estimatedDropoffAt: "2026-07-02T09:45:00Z",
      assignedDriverId: drvId("david"), assignedVehicleId: "veh_escalade1",
      baseFare: 280, taxAmount: 42, gratuity: 45, tolls: 0, surcharges: [{ name: "Airport Fee", amount: 15, taxable: true }],
      totalAmount: 382, paymentMethod: "credit_card", paymentStatus: "completed",
      flightNumber: "AC842", flightTracking: true,
      specialInstructions: "Meet at arrivals gate A, assist with luggage",
      createdById: "user_sarah", createdAt: "2026-07-01T16:00:00Z", updatedAt: NOW,
    },
    {
      id: "bkg_002", organizationId: ORG_ID, bookingNumber: "MRL-1043", type: "point_to_point", tripType: "one_way", status: "confirmed",
      customerId: custId("sarah"), passengerCount: 1, luggageCount: 1,
      pickup: { id: "stop_p2", type: "pickup", address: { street: "Ritz Carlton", city: "Montreal", province: "Quebec", postalCode: "H3G 1R6", country: "Canada" }, scheduledAt: "2026-07-02T11:30:00Z", sequence: 1 },
      dropoff: { id: "stop_d2", type: "dropoff", address: { street: "Mont Tremblant Resort", city: "Mont-Tremblant", province: "Quebec", postalCode: "J8E 1B1", country: "Canada" }, scheduledAt: "2026-07-02T13:30:00Z", sequence: 2 },
      stops: [], scheduledPickupAt: "2026-07-02T11:30:00Z", estimatedDropoffAt: "2026-07-02T13:30:00Z",
      assignedDriverId: drvId("michael"), assignedVehicleId: "veh_suburban",
      baseFare: 480, taxAmount: 72, gratuity: 0, tolls: 10, surcharges: [],
      totalAmount: 562, paymentMethod: "credit_card", paymentStatus: "pending",
      flightTracking: false,
      createdById: "user_sarah", createdAt: "2026-07-01T14:00:00Z", updatedAt: NOW,
    },
    {
      id: "bkg_003", organizationId: ORG_ID, bookingNumber: "MRL-1044", type: "corporate_roadshow", tripType: "one_way", status: "confirmed",
      customerId: custId("robert"), corporateAccountId: "corp_techcorp", passengerCount: 1, luggageCount: 1,
      pickup: { id: "stop_p3", type: "pickup", address: { street: "2000 Rue University", city: "Montreal", province: "Quebec", postalCode: "H3A 2A5", country: "Canada" }, scheduledAt: "2026-07-02T14:00:00Z", sequence: 1 },
      dropoff: { id: "stop_d3", type: "dropoff", address: { street: "YUL Airport", city: "Montreal", province: "Quebec", postalCode: "H4S 1A9", country: "Canada" }, scheduledAt: "2026-07-02T14:40:00Z", sequence: 2 },
      stops: [], scheduledPickupAt: "2026-07-02T14:00:00Z", estimatedDropoffAt: "2026-07-02T14:40:00Z",
      assignedDriverId: drvId("alex"), assignedVehicleId: "veh_sprinter",
      baseFare: 260, taxAmount: 39, gratuity: 0, tolls: 0, surcharges: [{ name: "Corporate Discount (12%)", amount: -31.20, taxable: false }],
      totalAmount: 267.80, paymentMethod: "corporate_account", paymentStatus: "pending",
      flightTracking: false,
      specialInstructions: "Pick up at main entrance reception",
      createdById: "user_sarah", createdAt: "2026-07-01T10:00:00Z", updatedAt: NOW,
    },
    {
      id: "bkg_004", organizationId: ORG_ID, bookingNumber: "MRL-1045", type: "airport_dropoff", tripType: "one_way", status: "pending_confirmation",
      customerId: custId("david"), passengerCount: 3, luggageCount: 4,
      pickup: { id: "stop_p4", type: "pickup", address: { street: "Four Seasons Hotel", city: "Montreal", province: "Quebec", postalCode: "H3G 1Z3", country: "Canada" }, scheduledAt: "2026-07-02T17:45:00Z", sequence: 1 },
      dropoff: { id: "stop_d4", type: "dropoff", address: { street: "Montreal Executive Airport", city: "Montreal", province: "Quebec", postalCode: "H2W 1B3", country: "Canada" }, scheduledAt: "2026-07-02T18:15:00Z", sequence: 2 },
      stops: [], scheduledPickupAt: "2026-07-02T17:45:00Z", estimatedDropoffAt: "2026-07-02T18:15:00Z",
      baseFare: 650, taxAmount: 97.50, gratuity: 130, tolls: 0, surcharges: [{ name: "VIP Service", amount: 100, taxable: true }, { name: "Meet & Greet", amount: 50, taxable: true }],
      totalAmount: 1027.50, paymentMethod: "credit_card", paymentStatus: "pending",
      flightTracking: false,
      specialInstructions: "VIP client: provide champagne service, red carpet at pickup",
      createdById: "user_fatme", createdAt: "2026-07-01T20:00:00Z", updatedAt: NOW,
    },
    {
      id: "bkg_005", organizationId: ORG_ID, bookingNumber: "MRL-1046", type: "airport_dropoff", tripType: "one_way", status: "confirmed",
      customerId: custId("robert"), corporateAccountId: "corp_techcorp", passengerCount: 1, luggageCount: 1,
      pickup: { id: "stop_p5", type: "pickup", address: { street: "Downtown Montreal", city: "Montreal", province: "Quebec", postalCode: "H3B 1A1", country: "Canada" }, scheduledAt: "2026-07-03T08:00:00Z", sequence: 1 },
      dropoff: { id: "stop_d5", type: "dropoff", address: { street: "Mirabel Airport", city: "Mirabel", province: "Quebec", postalCode: "J7N 1A1", country: "Canada" }, scheduledAt: "2026-07-03T08:50:00Z", sequence: 2 },
      stops: [], scheduledPickupAt: "2026-07-03T08:00:00Z", estimatedDropoffAt: "2026-07-03T08:50:00Z",
      assignedDriverId: drvId("omar"), assignedVehicleId: "veh_escalade2",
      baseFare: 390, taxAmount: 58.50, gratuity: 0, tolls: 5, surcharges: [{ name: "Corporate Discount (12%)", amount: -46.80, taxable: false }],
      totalAmount: 406.70, paymentMethod: "corporate_account", paymentStatus: "pending",
      flightTracking: false,
      createdById: "user_sarah", createdAt: "2026-07-02T08:00:00Z", updatedAt: NOW,
    },
    {
      id: "bkg_006", organizationId: ORG_ID, bookingNumber: "MRL-1047", type: "point_to_point", tripType: "one_way", status: "assigned",
      customerId: custId("lisa"), passengerCount: 2, luggageCount: 2,
      pickup: { id: "stop_p6", type: "pickup", address: { street: "Trudeau Airport", city: "Montreal", province: "Quebec", postalCode: "H4S 1A9", country: "Canada" }, scheduledAt: "2026-07-03T15:30:00Z", sequence: 1 },
      dropoff: { id: "stop_d6", type: "dropoff", address: { street: "Hotel Bonaventure", city: "Montreal", province: "Quebec", postalCode: "H5A 1E4", country: "Canada" }, scheduledAt: "2026-07-03T16:00:00Z", sequence: 2 },
      stops: [], scheduledPickupAt: "2026-07-03T15:30:00Z", estimatedDropoffAt: "2026-07-03T16:00:00Z",
      assignedDriverId: drvId("sam"), assignedVehicleId: "veh_navigator",
      baseFare: 280, taxAmount: 42, gratuity: 0, tolls: 0, surcharges: [{ name: "Airport Fee", amount: 15, taxable: true }],
      totalAmount: 337, paymentMethod: "credit_card", paymentStatus: "pending",
      flightNumber: "WS324", flightTracking: true,
      createdById: "user_sarah", createdAt: "2026-07-02T09:00:00Z", updatedAt: NOW,
    },
  ];
  bookings.forEach((b) => db.bookings.set(b.id, b));

  // ── Invoices ──────────────────────────────────────────
  const invoices: Invoice[] = [
    { id: "inv_001", organizationId: ORG_ID, invoiceNumber: "INV-1042", bookingId: "bkg_001", customerId: custId("john"), status: "paid", issueDate: "2026-07-01T00:00:00Z", dueDate: "2026-07-15T00:00:00Z", lineItems: [{ id: "li_1", description: "Airport Transfer — YUL to Downtown", quantity: 1, unitPrice: 280, amount: 280, taxable: true }, { id: "li_2", description: "Airport Fee", quantity: 1, unitPrice: 15, amount: 15, taxable: true }, { id: "li_3", description: "Gratuity", quantity: 1, unitPrice: 45, amount: 45, taxable: false }], subtotal: 340, taxRate: 0.15, taxAmount: 44.25, discountAmount: 0, totalAmount: 384.25, amountPaid: 384.25, balanceDue: 0, paidAt: "2026-07-01T18:00:00Z", createdAt: "2026-07-01T00:00:00Z", updatedAt: NOW },
    { id: "inv_002", organizationId: ORG_ID, invoiceNumber: "INV-1040", bookingId: "bkg_003", customerId: custId("robert"), corporateAccountId: "corp_techcorp", status: "sent", issueDate: "2026-07-01T00:00:00Z", dueDate: "2026-07-31T00:00:00Z", lineItems: [{ id: "li_4", description: "Corporate Airport Transfer", quantity: 1, unitPrice: 260, amount: 260, taxable: true }, { id: "li_5", description: "Corporate Discount (12%)", quantity: 1, unitPrice: -31.20, amount: -31.20, taxable: false }], subtotal: 228.80, taxRate: 0.15, taxAmount: 39, discountAmount: 31.20, totalAmount: 267.80, amountPaid: 0, balanceDue: 267.80, createdAt: "2026-07-01T10:00:00Z", updatedAt: NOW },
    { id: "inv_003", organizationId: ORG_ID, invoiceNumber: "INV-1039", bookingId: "bkg_002", customerId: custId("sarah"), status: "paid", issueDate: "2026-06-28T00:00:00Z", dueDate: "2026-07-12T00:00:00Z", lineItems: [{ id: "li_6", description: "Point-to-Point Transfer — Ritz to Mont Tremblant", quantity: 1, unitPrice: 480, amount: 480, taxable: true }, { id: "li_7", description: "Tolls", quantity: 1, unitPrice: 10, amount: 10, taxable: false }], subtotal: 490, taxRate: 0.15, taxAmount: 72, discountAmount: 0, totalAmount: 562, amountPaid: 562, balanceDue: 0, paidAt: "2026-06-29T10:00:00Z", createdAt: "2026-06-28T00:00:00Z", updatedAt: NOW },
  ];
  invoices.forEach((inv) => db.invoices.set(inv.id, inv));

  // ── Payments ──────────────────────────────────────────
  const payments: Payment[] = [
    { id: "pay_001", organizationId: ORG_ID, invoiceId: "inv_001", customerId: custId("john"), amount: 384.25, method: "credit_card", status: "completed", reference: "TXN-CC-78945", processedAt: "2026-07-01T18:00:00Z", createdAt: "2026-07-01T18:00:00Z" },
    { id: "pay_002", organizationId: ORG_ID, invoiceId: "inv_003", customerId: custId("sarah"), amount: 562, method: "credit_card", status: "completed", reference: "TXN-CC-78946", processedAt: "2026-06-29T10:00:00Z", createdAt: "2026-06-29T10:00:00Z" },
  ];
  payments.forEach((p) => db.payments.set(p.id, p));

  // ── Notifications ─────────────────────────────────────
  const notifications: Notification[] = [
    { id: "notif_001", organizationId: ORG_ID, userId: "user_fatme", type: "booking", priority: "normal", title: "Booking Confirmed", message: "MRL-1042 confirmed: John Smith — YUL to Downtown at 9:00 AM with David Chen (Cadillac Escalade)", read: false, actionUrl: "/bookings", entityType: "booking", entityId: "bkg_001", createdAt: "2026-07-01T16:00:00Z" },
    { id: "notif_002", organizationId: ORG_ID, userId: "user_fatme", type: "payment", priority: "normal", title: "Payment Received", message: "$384.25 received from John Smith for INV-1042.", read: false, actionUrl: "/invoices", entityType: "invoice", entityId: "inv_001", createdAt: "2026-07-01T18:00:00Z" },
    { id: "notif_003", organizationId: ORG_ID, userId: "user_fatme", type: "driver", priority: "normal", title: "Trip Started", message: "David Chen started trip MRL-1042 with John Smith — en route to Downtown.", read: false, actionUrl: "/dispatch", entityType: "booking", entityId: "bkg_001", createdAt: "2026-07-02T09:05:00Z" },
    { id: "notif_004", organizationId: ORG_ID, userId: "user_fatme", type: "maintenance", priority: "high", title: "Maintenance In Progress", message: "Mercedes Sprinter ROY-003 brake replacement started at European Auto Care. Estimated cost: $1,250.", read: true, actionUrl: "/maintenance", entityType: "maintenance", entityId: "maint_002", createdAt: "2026-07-02T08:00:00Z" },
    { id: "notif_005", organizationId: ORG_ID, userId: "user_fatme", type: "system", priority: "low", title: "System Update", message: "ChauffeurOS v1.2.0 is available with new reporting features. Update scheduled for this weekend.", read: true, createdAt: "2026-07-01T06:00:00Z" },
    { id: "notif_006", organizationId: ORG_ID, userId: "user_fatme", type: "alert", priority: "urgent", title: "License Expiring", message: "Alex Kim's Class 4B chauffeur license expires on Dec 20, 2026. Please ensure renewal documents are submitted.", read: true, actionUrl: "/drivers", entityType: "driver", entityId: drvId("alex"), createdAt: "2026-07-01T12:00:00Z" },
  ];
  notifications.forEach((n) => db.notifications.set(n.id, n));

  // ── Activity Log ──────────────────────────────────────
  const activityLog: ActivityLogEntry[] = [
    { id: "act_001", organizationId: ORG_ID, userId: "user_sarah", action: "booking_created", entityType: "booking", entityId: "bkg_001", details: { bookingNumber: "MRL-1042", customer: "John Smith" }, createdAt: "2026-07-01T16:00:00Z" },
    { id: "act_002", organizationId: ORG_ID, userId: "user_sarah", action: "booking_confirmed", entityType: "booking", entityId: "bkg_001", details: { bookingNumber: "MRL-1042" }, createdAt: "2026-07-01T16:05:00Z" },
    { id: "act_003", organizationId: ORG_ID, userId: "user_sarah", action: "driver_assigned", entityType: "booking", entityId: "bkg_001", details: { driver: "David Chen", vehicle: "Cadillac Escalade" }, createdAt: "2026-07-01T16:10:00Z" },
    { id: "act_004", organizationId: ORG_ID, userId: "user_fatme", action: "payment_received", entityType: "invoice", entityId: "inv_001", details: { amount: 384.25, customer: "John Smith" }, createdAt: "2026-07-01T18:00:00Z" },
    { id: "act_005", organizationId: ORG_ID, userId: "user_fatme", action: "trip_started", entityType: "booking", entityId: "bkg_001", details: { driver: "David Chen", vehicle: "Cadillac Escalade" }, createdAt: "2026-07-02T09:03:00Z" },
    { id: "act_006", organizationId: ORG_ID, userId: "user_sarah", action: "booking_created", entityType: "booking", entityId: "bkg_002", details: { bookingNumber: "MRL-1043", customer: "Sarah Brown" }, createdAt: "2026-07-01T14:00:00Z" },
    { id: "act_007", organizationId: ORG_ID, userId: "user_sarah", action: "booking_created", entityType: "booking", entityId: "bkg_003", details: { bookingNumber: "MRL-1044", customer: "TechCorp Inc." }, createdAt: "2026-07-01T10:00:00Z" },
    { id: "act_008", organizationId: ORG_ID, userId: "user_fatme", action: "maintenance_scheduled", entityType: "maintenance", entityId: "maint_002", details: { vehicle: "Mercedes Sprinter", type: "Brake Replacement" }, createdAt: "2026-06-28T00:00:00Z" },
    { id: "act_009", organizationId: ORG_ID, userId: "user_fatme", action: "booking_created", entityType: "booking", entityId: "bkg_004", details: { bookingNumber: "MRL-1045", customer: "Luxury VIP" }, createdAt: "2026-07-01T20:00:00Z" },
    { id: "act_010", organizationId: ORG_ID, userId: "user_fatme", action: "user_login", entityType: "user", entityId: "user_fatme", details: {}, createdAt: "2026-07-02T07:00:00Z" },
  ];
  db.activityLog.push(...activityLog);

  // ── Email Inboxes ────────────────────────────────────────
  const inboxes: EmailInbox[] = [
    {
      id: "inbox_aplus", organizationId: ORG_ID,
      email: "info@apluslimo.ca", companyName: "A Plus Limo",
      displayName: "A Plus Limo", provider: "mock",
      syncStatus: "demo", enabled: true, lastSyncAt: NOW,
      unreadCount: 3, totalEmails: 8,
      oauthConnected: false,
      createdAt: "2026-01-01T00:00:00Z", updatedAt: NOW,
    },
    {
      id: "inbox_mtlroyal", organizationId: ORG_ID,
      email: "info@montrealroyallimo.ca", companyName: "Montreal Royal Limo",
      displayName: "Montreal Royal Limo", provider: "mock",
      syncStatus: "demo", enabled: true, lastSyncAt: NOW,
      unreadCount: 5, totalEmails: 14,
      oauthConnected: false,
      createdAt: "2026-01-01T00:00:00Z", updatedAt: NOW,
    },
    {
      id: "inbox_calgary", organizationId: ORG_ID,
      email: "info@calgarylimoservices.ca", companyName: "Calgary Limo Services",
      displayName: "Calgary Limo Services", provider: "mock",
      syncStatus: "demo", enabled: true, lastSyncAt: NOW,
      unreadCount: 2, totalEmails: 6,
      oauthConnected: false,
      createdAt: "2026-03-15T00:00:00Z", updatedAt: NOW,
    },
  ];
  inboxes.forEach((inv) => db.emailInboxes.set(inv.id, inv));

  // ── Email Messages ────────────────────────────────────────
  const emails: Array<Omit<EmailMessage, "priority" | "category">> = [
    // ── A Plus Limo inbox ──
    {
      id: "email_aplus_001", organizationId: ORG_ID, inboxId: "inbox_aplus",
      subject: "Airport Transfer Request — July 15",
      from: { name: "James Wilson", email: "jwilson@corp.com" },
      to: [{ name: "A Plus Limo", email: "info@apluslimo.ca" }],
      cc: [], replyTo: "jwilson@corp.com",
      body: "Hi team,\n\nI need a luxury SUV transfer from YUL airport to downtown Montreal on July 15. Flight arrives at 14:30. 2 passengers, 3 suitcases.\n\nPlease send a quote.\n\nBest,\nJames Wilson",
      bodyPreview: "I need a luxury SUV transfer from YUL airport to downtown Montreal on July 15...",
      status: "unread", labels: ["booking_request", "airport"],
      attachments: [], threadId: "thread_aplus_001",
      receivedAt: "2026-07-02T08:15:00Z", createdAt: "2026-07-02T08:15:00Z", updatedAt: "2026-07-02T08:15:00Z",
    },
    {
      id: "email_aplus_002", organizationId: ORG_ID, inboxId: "inbox_aplus",
      subject: "Re: Weekly Corporate Account Summary",
      from: { name: "Sarah Chen", email: "sarah.chen@techcorp.com" },
      to: [{ name: "A Plus Limo", email: "info@apluslimo.ca" }],
      cc: ["accounts@techcorp.com"].map(e => ({ name: "Accounts", email: e })),
      replyTo: "sarah.chen@techcorp.com",
      body: "Hi there,\n\nCould you please send me the trip summary for last month? We need it for our expense reconciliation.\n\nThanks,\nSarah",
      bodyPreview: "Could you please send me the trip summary for last month? We need it for our expense reconciliation.",
      status: "read", labels: ["corporate", "invoice"],
      attachments: [], threadId: "thread_aplus_002",
      receivedAt: "2026-07-01T11:30:00Z", createdAt: "2026-07-01T11:30:00Z", updatedAt: "2026-07-02T08:00:00Z",
    },
    {
      id: "email_aplus_003", organizationId: ORG_ID, inboxId: "inbox_aplus",
      subject: "VIP Client — Wedding Event on Aug 20",
      from: { name: "Emily Watson", email: "emily.watson@email.com" },
      to: [{ name: "A Plus Limo", email: "info@apluslimo.ca" }],
      cc: [], replyTo: "emily.watson@email.com",
      body: "Hello,\n\nWe are looking to book a stretch limo for our wedding on August 20. Pickup from church at 16:00, reception venue after. Approximately 8 passengers.\n\nPlease advise availability and pricing.\n\nBest regards,\nEmily Watson",
      bodyPreview: "We are looking to book a stretch limo for our wedding on August 20...",
      status: "unread", labels: ["wedding", "quote_request"],
      attachments: [], threadId: "thread_aplus_003",
      receivedAt: "2026-07-02T09:45:00Z", createdAt: "2026-07-02T09:45:00Z", updatedAt: "2026-07-02T09:45:00Z",
    },
    {
      id: "email_aplus_004", organizationId: ORG_ID, inboxId: "inbox_aplus",
      subject: "Invoice INV-2026-0842 Paid",
      from: { name: "Michael Lee", email: "michael.lee@email.com" },
      to: [{ name: "A Plus Limo", email: "info@apluslimo.ca" }],
      cc: [], replyTo: "michael.lee@email.com",
      body: "Hi,\n\nJust confirming that invoice INV-2026-0842 has been paid via bank transfer. Receipt attached.\n\nRegards,\nMichael Lee",
      bodyPreview: "Just confirming that invoice INV-2026-0842 has been paid via bank transfer.",
      status: "read", labels: ["invoice", "payment"],
      attachments: [{ id: "att_aplus_001", filename: "payment_receipt.pdf", mimeType: "application/pdf", size: 245000, url: "#" }],
      threadId: "thread_aplus_004",
      receivedAt: "2026-06-30T15:20:00Z", createdAt: "2026-06-30T15:20:00Z", updatedAt: "2026-07-01T10:00:00Z",
    },

    // ── Montreal Royal Limo inbox ──
    {
      id: "email_mtl_001", organizationId: ORG_ID, inboxId: "inbox_mtlroyal",
      subject: "YUL Airport Pickup — July 3, 06:30",
      from: { name: "Robert Chen", email: "robert.chen@email.com" },
      to: [{ name: "Montreal Royal Limo", email: "info@montrealroyallimo.ca" }],
      cc: ["assistant@techcorp.com"].map(e => ({ name: "Executive Assistant", email: e })),
      replyTo: "robert.chen@email.com",
      body: "Good morning,\n\nI have an early flight on July 3 and need a sedan pickup at 06:30 from Westmount to YUL. One passenger, one carry-on.\n\nCan you confirm availability?\n\nThanks,\nRobert Chen",
      bodyPreview: "I have an early flight on July 3 and need a sedan pickup at 06:30 from Westmount to YUL.",
      status: "unread", labels: ["booking_request", "airport"],
      attachments: [], threadId: "thread_mtl_001",
      receivedAt: "2026-07-02T07:00:00Z", createdAt: "2026-07-02T07:00:00Z", updatedAt: "2026-07-02T07:00:00Z",
    },
    {
      id: "email_mtl_002", organizationId: ORG_ID, inboxId: "inbox_mtlroyal",
      subject: "Corporate Account — Monthly Statement Request",
      from: { name: "David Miller", email: "david.miller@email.com" },
      to: [{ name: "Montreal Royal Limo", email: "info@montrealroyallimo.ca" }],
      cc: [], replyTo: "david.miller@email.com",
      body: "Hello,\n\nPlease provide the monthly statement for June 2026 for our corporate account (Morgan Stanley). We need it for end-of-quarter.\n\nBest,\nDavid Miller",
      bodyPreview: "Please provide the monthly statement for June 2026 for our corporate account.",
      status: "unread", labels: ["corporate", "invoice"],
      attachments: [], threadId: "thread_mtl_002",
      receivedAt: "2026-07-01T14:22:00Z", createdAt: "2026-07-01T14:22:00Z", updatedAt: "2026-07-01T14:22:00Z",
    },
    {
      id: "email_mtl_003", organizationId: ORG_ID, inboxId: "inbox_mtlroyal",
      subject: "Re: Booking #MRL-1043 — Confirmation Details",
      from: { name: "Sarah Brown", email: "sarah.brown@email.com" },
      to: [{ name: "Montreal Royal Limo", email: "info@montrealroyallimo.ca" }],
      cc: [], replyTo: "sarah.brown@email.com",
      body: "Thank you for the confirmation! Looking forward to the trip to Mont Tremblant.\n\nCould you please ensure the vehicle has winter tires fitted?\n\nBest,\nSarah",
      bodyPreview: "Thank you for the confirmation! Could you ensure winter tires are fitted?",
      status: "read", labels: ["booking", "confirmed"],
      attachments: [], threadId: "thread_mtl_003",
      receivedAt: "2026-07-01T16:45:00Z", createdAt: "2026-07-01T16:45:00Z", updatedAt: "2026-07-02T09:00:00Z",
    },
    {
      id: "email_mtl_004", organizationId: ORG_ID, inboxId: "inbox_mtlroyal",
      subject: "New Booking Request — Montreal to Quebec City",
      from: { name: "Lisa Park", email: "lisa.park@email.com" },
      to: [{ name: "Montreal Royal Limo", email: "info@montrealroyallimo.ca" }],
      cc: [], replyTo: "lisa.park@email.com",
      body: "Hi,\n\nI'd like to book a trip from Montreal to Quebec City on July 10. Departure around 09:00 from Brossard. 2 passengers, 2 suitcases.\n\nPlease send a quote for a luxury sedan.\n\nThanks,\nLisa Park",
      bodyPreview: "I'd like to book a trip from Montreal to Quebec City on July 10.",
      status: "unread", labels: ["quote_request", "point_to_point"],
      attachments: [], threadId: "thread_mtl_004",
      receivedAt: "2026-07-02T10:10:00Z", createdAt: "2026-07-02T10:10:00Z", updatedAt: "2026-07-02T10:10:00Z",
    },
    {
      id: "email_mtl_005", organizationId: ORG_ID, inboxId: "inbox_mtlroyal",
      subject: "Thank You — Excellent Service",
      from: { name: "John Smith", email: "john.smith@email.com" },
      to: [{ name: "Montreal Royal Limo", email: "info@montrealroyallimo.ca" }],
      cc: [], replyTo: "john.smith@email.com",
      body: "Just wanted to say thank you for the excellent service this morning. David was punctual and the vehicle was immaculate.\n\nWill definitely book again!\n\nBest,\nJohn Smith",
      bodyPreview: "Thank you for the excellent service this morning. David was punctual...",
      status: "read", labels: ["feedback", "compliment"],
      attachments: [], threadId: "thread_mtl_005",
      receivedAt: "2026-07-02T10:30:00Z", createdAt: "2026-07-02T10:30:00Z", updatedAt: "2026-07-02T10:30:00Z",
    },

    // ── Calgary Limo Services inbox ──
    {
      id: "email_yyc_001", organizationId: ORG_ID, inboxId: "inbox_calgary",
      subject: "Calgary Airport to Banff — Group Transfer July 18",
      from: { name: "Tom Harrison", email: "tom.h@energycorp.ca" },
      to: [{ name: "Calgary Limo Services", email: "info@calgarylimoservices.ca" }],
      cc: [], replyTo: "tom.h@energycorp.ca",
      body: "Hello,\n\nWe have a group of 6 arriving at YYC on July 18 at 11:00. Need transfer to Banff Springs Hotel. 6 passengers, 8 luggage pieces.\n\nPlease quote for SUV or van.\n\nThanks,\nTom Harrison",
      bodyPreview: "We have a group of 6 arriving at YYC on July 18. Need transfer to Banff Springs Hotel.",
      status: "unread", labels: ["booking_request", "group"],
      attachments: [], threadId: "thread_yyc_001",
      receivedAt: "2026-07-02T11:00:00Z", createdAt: "2026-07-02T11:00:00Z", updatedAt: "2026-07-02T11:00:00Z",
    },
    {
      id: "email_yyc_002", organizationId: ORG_ID, inboxId: "inbox_calgary",
      subject: "Invoice Inquiry — INV-2026-0912",
      from: { name: "Patricia Wong", email: "pwong@accounting.ca" },
      to: [{ name: "Calgary Limo", email: "info@calgarylimoservices.ca" }],
      cc: [], replyTo: "pwong@accounting.ca",
      body: "Hi,\n\nI'm following up on invoice INV-2026-0912 for $520.00. It seems there's a discrepancy in the billing amount vs. the quoted price.\n\nCould you please review and get back to me?\n\nRegards,\nPatricia Wong",
      bodyPreview: "Following up on invoice INV-2026-0912 — discrepancy in billing amount vs quoted price.",
      status: "read", labels: ["invoice", "billing"],
      attachments: [], threadId: "thread_yyc_002",
      receivedAt: "2026-07-01T09:15:00Z", createdAt: "2026-07-01T09:15:00Z", updatedAt: "2026-07-02T08:30:00Z",
    },
    {
      id: "email_yyc_003", organizationId: ORG_ID, inboxId: "inbox_calgary",
      subject: "Booking Confirmed — Stampede Week Transport",
      from: { name: "Mike Dawson", email: "mike.d@stampede.ca" },
      to: [{ name: "Calgary Limo", email: "info@calgarylimoservices.ca" }],
      cc: ["events@stampede.ca"].map(e => ({ name: "Events Team", email: e })),
      replyTo: "mike.d@stampede.ca",
      body: "Hi team,\n\nWe've confirmed the booking for Stampede Week (July 5-12). We need 2 SUVs on standby each evening from 18:00 to 02:00.\n\nVIP transport for our guests. Please confirm driver assignments.\n\nThanks,\nMike",
      bodyPreview: "Confirmed booking for Stampede Week — 2 SUVs on standby each evening.",
      status: "unread", labels: ["booking", "corporate", "event"],
      attachments: [
        { id: "att_yyc_001", filename: "stampede_schedule.pdf", mimeType: "application/pdf", size: 520000, url: "#" },
        { id: "att_yyc_002", filename: "vip_guest_list.xlsx", mimeType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", size: 180000, url: "#" },
      ],
      threadId: "thread_yyc_003",
      receivedAt: "2026-07-01T18:30:00Z", createdAt: "2026-07-01T18:30:00Z", updatedAt: "2026-07-01T18:30:00Z",
    },

    // ── Cancellation ──
    {
      id: "email_aplus_005", organizationId: ORG_ID, inboxId: "inbox_aplus",
      subject: "Booking Cancellation — MRL-1045",
      from: { name: "David Miller", email: "david.miller@email.com" },
      to: [{ name: "A Plus Limo", email: "info@apluslimo.ca" }],
      cc: [], replyTo: "david.miller@email.com",
      body: "Hi,\n\nI need to cancel my booking for July 2 (MRL-1045). Sorry for the late notice — our plans have changed.\n\nPlease confirm the cancellation and any fees.\n\nBest,\nDavid Miller",
      bodyPreview: "I need to cancel my booking MRL-1045 for July 2. Plans have changed.",
      status: "unread", labels: ["cancellation", "booking"],
      attachments: [], threadId: "thread_aplus_005",
      receivedAt: "2026-07-02T12:15:00Z", createdAt: "2026-07-02T12:15:00Z", updatedAt: "2026-07-02T12:15:00Z",
    },

    // ── Complaint ──
    {
      id: "email_mtl_006", organizationId: ORG_ID, inboxId: "inbox_mtlroyal",
      subject: "Unacceptable Service — Driver Late 30 Minutes",
      from: { name: "Michael Lee", email: "michael.lee@email.com" },
      to: [{ name: "Montreal Royal Limo", email: "info@montrealroyallimo.ca" }],
      cc: [], replyTo: "michael.lee@email.com",
      body: "To whom it may concern,\n\nI booked a sedan for this morning at 08:00 and the driver arrived at 08:35 without any notification. I missed my appointment.\n\nI expect a full refund and an explanation. This is unacceptable for a premium service.\n\nRegards,\nMichael Lee",
      bodyPreview: "Driver arrived 35 minutes late without notification. I missed my appointment.",
      status: "unread", labels: ["complaint", "urgent"],
      attachments: [], threadId: "thread_mtl_006",
      receivedAt: "2026-07-02T09:00:00Z", createdAt: "2026-07-02T09:00:00Z", updatedAt: "2026-07-02T09:00:00Z",
    },

    // ── General Inquiry ──
    {
      id: "email_aplus_006", organizationId: ORG_ID, inboxId: "inbox_aplus",
      subject: "Question About Airport Services",
      from: { name: "Jennifer Adams", email: "jennifer.adams@email.com" },
      to: [{ name: "A Plus Limo", email: "info@apluslimo.ca" }],
      cc: [], replyTo: "jennifer.adams@email.com",
      body: "Hello,\n\nI'm visiting Montreal next month and was wondering what types of vehicles you offer for airport transfers. Do you have options for child seats?\n\nAlso, what is your cancellation policy?\n\nThanks,\nJennifer Adams",
      bodyPreview: "What vehicle types for airport transfers? Do you have child seats?",
      status: "unread", labels: ["inquiry", "general"],
      attachments: [], threadId: "thread_aplus_006",
      receivedAt: "2026-07-02T14:30:00Z", createdAt: "2026-07-02T14:30:00Z", updatedAt: "2026-07-02T14:30:00Z",
    },
  ];
  // Auto-compute category, priority, and parsed data for all emails
  emails.forEach((partial) => {
    const email: EmailMessage = {
      ...partial,
      priority: classifyPriority(partial.subject, partial.body, partial.labels),
      category: classifyEmail(partial.subject, partial.body, partial.labels),
      parsedData: parseEmail(partial.subject, partial.body, partial.from.name, partial.from.email),
    };
    db.emailMessages.set(email.id, email);
  });
}

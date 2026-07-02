// ============================================================
// ChauffeurOS — Enterprise Limousine SaaS Type System
// Multi-tenant architecture with normalized relationships
// ============================================================

// ── Enums ───────────────────────────────────────────────────

export type OrganizationStatus = "active" | "inactive" | "trial" | "suspended";
export type OrganizationPlan = "starter" | "business" | "enterprise";

export type UserRole = "owner" | "admin" | "dispatcher" | "manager" | "viewer";
export type UserStatus = "active" | "inactive" | "invited";

export type CustomerType = "individual" | "corporate";
export type CustomerStatus = "active" | "inactive" | "blocked";

export type DriverStatus = "available" | "on_trip" | "off_duty" | "on_break" | "unavailable";
export type DriverLicenseClass = "Class 4B" | "Class 1" | "Class 2" | "Class 4A";

export type VehicleType = "luxury_sedan" | "luxury_suv" | "full_size_suv" | "passenger_van" | "stretch_limo" | "executive_sedan";
export type VehicleStatus = "available" | "on_trip" | "maintenance" | "offline" | "cleaning" | "reserved";
export type FuelType = "gasoline" | "diesel" | "electric" | "hybrid";

export type BookingStatus =
  | "draft"
  | "pending_confirmation"
  | "confirmed"
  | "assigned"
  | "chauffeur_en_route"
  | "passenger_picked_up"
  | "in_progress"
  | "completed"
  | "cancelled"
  | "no_show";
export type BookingType = "airport_pickup" | "airport_dropoff" | "point_to_point" | "hourly" | "wedding_event" | "corporate_roadshow" | "round_trip";
export type TripType = "one_way" | "round_trip" | "multi_stop";

export type PaymentMethod = "credit_card" | "bank_transfer" | "corporate_account" | "cash" | "check";
export type InvoiceStatus = "draft" | "sent" | "paid" | "overdue" | "cancelled" | "partial";
export type PaymentStatus = "pending" | "completed" | "failed" | "refunded";

export type MaintenanceType = "oil_change" | "tire_rotation" | "brake_replacement" | "inspection" | "repair" | "cleaning" | "other";
export type MaintenanceStatus = "scheduled" | "in_progress" | "completed" | "cancelled";
export type MaintenancePriority = "low" | "medium" | "high" | "critical";

export type DocumentCategory = "insurance" | "registration" | "driver_license" | "contract" | "inspection" | "photo" | "other";
export type DocumentType = "pdf" | "image" | "doc" | "spreadsheet";

export type NotificationType = "booking" | "payment" | "driver" | "maintenance" | "system" | "alert";
export type NotificationPriority = "low" | "normal" | "high" | "urgent";

export type ActivityAction =
  | "booking_created"
  | "booking_confirmed"
  | "booking_cancelled"
  | "booking_completed"
  | "trip_started"
  | "trip_completed"
  | "driver_assigned"
  | "driver_status_changed"
  | "vehicle_status_changed"
  | "payment_received"
  | "invoice_created"
  | "invoice_paid"
  | "maintenance_scheduled"
  | "maintenance_completed"
  | "customer_created"
  | "document_uploaded"
  | "user_login"
  | "settings_changed";

// ── Core Entities ───────────────────────────────────────────

export interface Organization {
  id: string;
  name: string;
  slug: string;
  logo?: string;
  taxId?: string;
  address: Address;
  phone: string;
  email: string;
  website?: string;
  plan: OrganizationPlan;
  status: OrganizationStatus;
  maxVehicles: number;
  maxDrivers: number;
  maxUsers: number;
  settings: OrganizationSettings;
  createdAt: string;
  updatedAt: string;
}

export interface OrganizationSettings {
  timezone: string;
  currency: string;
  dateFormat: "MM/DD/YYYY" | "DD/MM/YYYY" | "YYYY-MM-DD";
  timeFormat: "12h" | "24h";
  distanceUnit: "km" | "miles";
  defaultLanguage: string;
  branding: {
    primaryColor: string;
    accentColor: string;
  };
  notifications: {
    emailBookingConfirmations: boolean;
    emailInvoices: boolean;
    smsDriverAlerts: boolean;
    pushNotifications: boolean;
  };
}

export interface User {
  id: string;
  organizationId: string;
  email: string;
  firstName: string;
  lastName: string;
  fullName: string; // computed
  avatar?: string;
  role: UserRole;
  status: UserStatus;
  phone?: string;
  lastLoginAt?: string;
  permissions: Permission[];
  createdAt: string;
  updatedAt: string;
}

export interface Permission {
  resource: ResourceName;
  actions: PermissionAction[];
}

export type ResourceName =
  | "dashboard"
  | "customers"
  | "bookings"
  | "dispatch"
  | "drivers"
  | "fleet"
  | "vehicles"
  | "maintenance"
  | "calendar"
  | "invoices"
  | "revenue"
  | "reports"
  | "analytics"
  | "documents"
  | "notifications"
  | "settings"
  | "users"
  | "organization";

export type PermissionAction = "create" | "read" | "update" | "delete" | "export" | "manage";

export interface Address {
  street: string;
  city: string;
  province: string;
  postalCode: string;
  country: string;
  lat?: number;
  lng?: number;
}

// ── Customer Entities ───────────────────────────────────────

export interface Customer {
  id: string;
  organizationId: string;
  type: CustomerType;
  status: CustomerStatus;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  phone: string;
  alternatePhone?: string;
  address?: Address;
  company?: string; // for corporate customers
  position?: string;
  notes?: string;
  preferences: CustomerPreferences;
  tags: string[];
  totalTrips: number;
  totalRevenue: number;
  lifetimeValue: number;
  averageRating: number;
  lastTripAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CustomerPreferences {
  preferredVehicleType?: VehicleType;
  preferredDriverId?: string;
  preferredPaymentMethod: PaymentMethod;
  musicPreference?: string;
  temperaturePreference?: string;
  waterBrand?: string;
  newspaper?: string;
  specialInstructions?: string;
  notifySms: boolean;
  notifyEmail: boolean;
}

export interface CorporateAccount {
  id: string;
  organizationId: string;
  companyName: string;
  taxId?: string;
  address: Address;
  primaryContactId: string; // references Customer
  billingEmail: string;
  billingContactName: string;
  creditLimit?: number;
  paymentTerms: "net_15" | "net_30" | "net_60";
  employees: number;
  contractStartDate: string;
  contractEndDate?: string;
  discountRate: number; // e.g. 0.10 = 10% off
  activeEmployees: Customer[]; // populated on fetch
  totalTrips: number;
  totalRevenue: number;
  status: CustomerStatus;
  createdAt: string;
  updatedAt: string;
}

// ── Driver Entities ─────────────────────────────────────────

export interface Driver {
  id: string;
  organizationId: string;
  userId?: string; // link to User if driver has platform access
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  phone: string;
  avatar?: string;
  status: DriverStatus;
  licenseNumber: string;
  licenseClass: DriverLicenseClass;
  licenseExpiry: string;
  medicalExpiry?: string;
  insuranceExpiry?: string;
  assignedVehicleId?: string;
  currentLocation?: {
    lat: number;
    lng: number;
    address?: string;
    updatedAt: string;
  };
  rating: number;
  totalTrips: number;
  totalRevenue: number;
  completionRate: number; // percentage
  onTimeRate: number;
  yearsOfExperience: number;
  languages: string[];
  certifications: string[];
  notes?: string;
  emergencyContact: {
    name: string;
    phone: string;
    relationship: string;
  };
  schedule: DriverSchedule;
  metrics: DriverMetrics;
  hiredAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface DriverSchedule {
  monday?: Shift;
  tuesday?: Shift;
  wednesday?: Shift;
  thursday?: Shift;
  friday?: Shift;
  saturday?: Shift;
  sunday?: Shift;
}

export interface Shift {
  start: string; // "08:00"
  end: string; // "16:00"
  available: boolean;
}

export interface DriverMetrics {
  tripsThisMonth: number;
  tripsThisWeek: number;
  revenueThisMonth: number;
  hoursWorkedThisWeek: number;
  customerRating: number;
  complaints: number;
  compliments: number;
  accidents: number;
  lastReviewedAt?: string;
}

// ── Vehicle Entities ────────────────────────────────────────

export interface Vehicle {
  id: string;
  organizationId: string;
  name: string; // e.g. "Cadillac Escalade"
  type: VehicleType;
  status: VehicleStatus;
  year: number;
  make: string;
  model: string;
  color: string;
  plate: string;
  vin: string;
  seats: number;
  luggageCapacity: number;
  fuelType: FuelType;
  fuelLevel: number; // 0-100 percentage
  mileage: number; // total km
  currentLocation?: {
    lat: number;
    lng: number;
    address?: string;
    updatedAt: string;
  };
  assignedDriverId?: string;
  amenities: string[];
  registrationExpiry: string;
  insuranceExpiry: string;
  lastServiceAt?: string;
  lastServiceMileage?: number;
  nextServiceDue?: string;
  nextServiceMileage?: number;
  purchaseDate: string;
  purchasePrice: number;
  currentValue: number;
  depreciationRate: number;
  notes?: string;
  photos: string[];
  createdAt: string;
  updatedAt: string;
}

// ── Maintenance Entities ────────────────────────────────────

export interface MaintenanceRecord {
  id: string;
  organizationId: string;
  vehicleId: string;
  type: MaintenanceType;
  status: MaintenanceStatus;
  priority: MaintenancePriority;
  description: string;
  scheduledDate: string;
  completedDate?: string;
  mileageAtService?: number;
  cost: number;
  vendor?: string;
  vendorPhone?: string;
  notes?: string;
  parts: MaintenancePart[];
  nextServiceRecommendation?: string;
  createdAt: string;
  updatedAt: string;
}

export interface MaintenancePart {
  name: string;
  partNumber?: string;
  quantity: number;
  unitPrice: number;
}

// ── Booking & Trip Entities ─────────────────────────────────

export interface Booking {
  id: string;
  organizationId: string;
  bookingNumber: string; // e.g. "MRL-1042"
  type: BookingType;
  tripType: TripType;
  status: BookingStatus;
  customerId: string;
  corporateAccountId?: string;
  passengerName?: string; // if different from customer
  passengerCount: number;
  luggageCount: number;
  pickup: TripStop;
  dropoff: TripStop;
  stops: TripStop[]; // for multi-stop trips
  scheduledPickupAt: string;
  estimatedDropoffAt?: string;
  actualPickupAt?: string;
  actualDropoffAt?: string;
  assignedDriverId?: string;
  assignedVehicleId?: string;
  baseFare: number;
  taxAmount: number;
  gratuity: number;
  tolls: number;
  surcharges: Surcharge[];
  totalAmount: number;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  invoiceId?: string;
  notes?: string;
  specialInstructions?: string;
  flightNumber?: string; // for airport transfers
  flightTracking: boolean;
  cancellationReason?: string;
  cancelledAt?: string;
  cancelledById?: string;
  createdById: string;
  createdAt: string;
  updatedAt: string;
}

export interface TripStop {
  id: string;
  type: "pickup" | "dropoff" | "stop";
  address: Address;
  scheduledAt: string;
  actualAt?: string;
  notes?: string;
  sequence: number;
}

export interface Surcharge {
  name: string; // "Airport Fee", "Wait Time", "Holiday Rate"
  amount: number;
  taxable: boolean;
}

// ── Financial Entities ──────────────────────────────────────

export interface Invoice {
  id: string;
  organizationId: string;
  invoiceNumber: string; // e.g. "INV-1042"
  bookingId?: string; // optional — can invoice for non-booking items
  customerId: string;
  corporateAccountId?: string;
  status: InvoiceStatus;
  issueDate: string;
  dueDate: string;
  lineItems: InvoiceLineItem[];
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  discountAmount: number;
  totalAmount: number;
  amountPaid: number;
  balanceDue: number;
  notes?: string;
  sentAt?: string;
  paidAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface InvoiceLineItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  amount: number;
  taxable: boolean;
}

export interface Payment {
  id: string;
  organizationId: string;
  invoiceId: string;
  customerId: string;
  amount: number;
  method: PaymentMethod;
  status: PaymentStatus;
  reference?: string; // transaction ID
  notes?: string;
  processedAt: string;
  createdAt: string;
}

// ── Document Entity ─────────────────────────────────────────

export interface Document {
  id: string;
  organizationId: string;
  name: string;
  type: DocumentType;
  category: DocumentCategory;
  mimeType: string;
  size: number; // bytes
  url: string;
  entityType?: "customer" | "driver" | "vehicle" | "booking" | "maintenance";
  entityId?: string;
  uploadedById: string;
  expiresAt?: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

// ── Notification Entity ─────────────────────────────────────

export interface Notification {
  id: string;
  organizationId: string;
  userId: string;
  type: NotificationType;
  priority: NotificationPriority;
  title: string;
  message: string;
  read: boolean;
  readAt?: string;
  actionUrl?: string;
  entityType?: string;
  entityId?: string;
  createdAt: string;
}

// ── Email / Inbox Entities ───────────────────────────────────

// ── Email / Inbox Types ─────────────────────────────────────

export type InboxProvider = "gmail" | "outlook" | "smtp" | "hostinger" | "mock";
export type InboxSyncStatus = "connected" | "disconnected" | "error" | "connecting" | "demo" | "needs_reauthorization";

export type EmailMessageStatus =
  | "unread"
  | "read"
  | "replied"
  | "forwarded"
  | "converted_to_booking"
  | "archived";

export type EmailCategory =
  | "booking_request"
  | "quote_request"
  | "cancellation"
  | "booking_modification"
  | "complaint"
  | "general_inquiry"
  | "corporate_request"
  | "customer_question"
  | "dispatch_request"
  | "feedback"
  | "other";

export type EmailPriority = "low" | "normal" | "high" | "urgent";

export interface OAuthToken {
  accessToken: string;
  refreshToken?: string;
  expiresAt?: string;
  scopes: string[];
  tokenType?: string;
  encrypted: boolean; // true in production
}

export interface EmailInbox {
  id: string;
  organizationId: string;
  email: string;
  companyName: string;
  displayName: string;
  provider: InboxProvider;
  syncStatus: InboxSyncStatus;
  enabled: boolean;
  lastSyncAt?: string;
  syncError?: string;
  unreadCount: number;
  totalEmails: number;

  // OAuth fields (Google / Microsoft)
  oauthConnected: boolean;
  oauthProvider?: string;
  oauthEmail?: string;
  oauthToken?: OAuthToken;

  // IMAP/SMTP fields (Hostinger, custom)
  imapHost?: string;
  imapPort?: number;
  imapSecure?: boolean;
  smtpHost?: string;
  smtpPort?: number;
  smtpSecure?: boolean;
  encryptedPassword?: string; // AES-256 encrypted, never plaintext

  // Company info
  companyId?: string;
  phone?: string;
  website?: string;
  notes?: string;

  createdAt: string;
  updatedAt: string;
}

export interface EmailAttachment {
  id: string;
  filename: string;
  mimeType: string;
  size: number;
  url: string;
}

export interface ParsedEmailData {
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  pickupLocation?: string;
  dropoffLocation?: string;
  pickupDate?: string;
  pickupTime?: string;
  passengerCount?: number;
  flightNumber?: string;
  vehicleType?: string;
  specialRequests?: string;
  confidence: number; // 0-1, how confident the parser is
}

export interface EmailMessage {
  id: string;
  organizationId: string;
  inboxId: string; // which inbox received this
  subject: string;
  from: { name: string; email: string };
  to: Array<{ name: string; email: string }>;
  cc: Array<{ name: string; email: string }>;
  replyTo?: string;
  body: string;
  bodyPreview: string;
  status: EmailMessageStatus;
  priority: EmailPriority;
  category: EmailCategory;
  aiClassification?: string; // future AI label
  aiConfidence?: number; // future AI confidence score
  labels: string[];
  attachments: EmailAttachment[];
  threadId: string;
  convertedToBookingId?: string;

  // Parsed data from email body
  parsedData?: ParsedEmailData;

  // CRM links
  linkedCustomerId?: string;
  linkedBookingId?: string;

  receivedAt: string;
  createdAt: string;
  updatedAt: string;
}

// ── Email Analytics ─────────────────────────────────────────

export interface EmailInboxSummary {
  inboxId: string;
  companyName: string;
  email: string;
  total: number;
  unread: number;
  bookingRequests: number;
  quoteRequests: number;
  cancellations: number;
  processed: number;
  archived: number;
}

// ── Activity Log ────────────────────────────────────────────

export interface ActivityLogEntry {
  id: string;
  organizationId: string;
  userId: string;
  action: ActivityAction;
  entityType: string;
  entityId: string;
  details: Record<string, unknown>;
  ipAddress?: string;
  createdAt: string;
}

// ── Dashboard / Analytics ───────────────────────────────────

export interface DashboardStats {
  todayRevenue: number;
  monthlyRevenue: number;
  bookingsToday: number;
  bookingsPending: number;
  vehiclesAvailable: number;
  vehiclesTotal: number;
  driversAvailable: number;
  driversTotal: number;
  tripsInProgress: number;
  airportArrivals: number;
  pendingQuotes: number;
  customerSatisfaction: number;
  revenueTrend: number; // %
  bookingTrend: number;
  fleetUtilization: number; // %
  onTimePercentage: number;
  avgResponseTime: number; // minutes
  topCustomers: CustomerRevenue[];
  recentPayments: Payment[];
  upcomingTrips: Booking[];
  recentActivity: ActivityLogEntry[];
}

export interface CustomerRevenue {
  customerId: string;
  customerName: string;
  company?: string;
  trips: number;
  revenue: number;
}

export interface RevenueSummary {
  period: string;
  totalRevenue: number;
  totalCosts: number;
  profit: number;
  margin: number;
  bookings: number;
  averagePerBooking: number;
  bySource: RevenueBySource[];
  byDay: RevenueByDay[];
}

export interface RevenueBySource {
  source: BookingType;
  revenue: number;
  percentage: number;
  bookings: number;
  avgValue: number;
}

export interface RevenueByDay {
  date: string;
  revenue: number;
  bookings: number;
}

export interface FleetUtilization {
  available: number;
  onTrip: number;
  maintenance: number;
  offline: number;
  total: number;
  utilizationRate: number;
}

// ── Relation/Include Types (for API responses) ──────────────

export interface CustomerWithRelations extends Customer {
  recentBookings?: Booking[];
  invoices?: Invoice[];
  corporateAccount?: CorporateAccount;
}

export interface DriverWithRelations extends Driver {
  assignedVehicle?: Vehicle;
  currentTrip?: Booking;
  recentTrips?: Booking[];
}

export interface VehicleWithRelations extends Vehicle {
  assignedDriver?: Driver;
  maintenanceHistory?: MaintenanceRecord[];
  upcomingMaintenance?: MaintenanceRecord[];
}

export interface BookingWithRelations extends Booking {
  customer?: Customer;
  driver?: Driver;
  vehicle?: Vehicle;
  invoice?: Invoice;
  createdBy?: User;
}

export interface InvoiceWithRelations extends Invoice {
  customer?: Customer;
  booking?: Booking;
  payments?: Payment[];
}

// ── API Types ───────────────────────────────────────────────

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface QueryParams {
  page?: number;
  pageSize?: number;
  sort?: string;
  order?: "asc" | "desc";
  search?: string;
  status?: string;
  [key: string]: string | number | boolean | undefined;
}

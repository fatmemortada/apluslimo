// ============================================================
// ChauffeurOS — Email Parsing Engine
// Extracts structured booking data from free-form email text
// ============================================================

import type { ParsedEmailData, EmailCategory, EmailPriority } from "@/lib/types";

// ── Common patterns ─────────────────────────────────────────

const PHONE_REGEX =
  /(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/g;

const EMAIL_REGEX = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;

const TIME_REGEX =
  /\b(\d{1,2}):(\d{2})\s*(AM|PM|am|pm)?\b|\b(\d{1,2})\s*(AM|PM|am|pm)\b/g;

const DATE_REGEX =
  /\b(Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)\s+(\d{1,2})(?:st|nd|rd|th)?,?\s*(\d{4})?\b|\b(\d{1,2})[\/-](\d{1,2})[\/-](\d{2,4})\b/gi;

const FLIGHT_REGEX =
  /\b(?:flight|flight\s*#|flight\s*n(?:o|°)?[.:]?)\s*([A-Z]{2}\d{1,4})/gi;

const PASSENGER_REGEX =
  /\b(\d+)\s*(?:passenger|pax|people|guest|person)\b/gi;

const VEHICLE_TYPES = [
  { pattern: /\b(?:luxury\s+)?suv\b/i, type: "luxury_suv" },
  { pattern: /\b(?:luxury\s+)?sedan\b/i, type: "luxury_sedan" },
  { pattern: /\b(?:executive\s+)?sedan\b/i, type: "executive_sedan" },
  { pattern: /\b(?:stretch\s+)?limo(?:usine)?\b/i, type: "stretch_limo" },
  { pattern: /\b(?:passenger\s+)?van\b/i, type: "passenger_van" },
  { pattern: /\bfull[-\s]size\s+(?:suv|suv)\b/i, type: "full_size_suv" },
];

const PICKUP_KEYWORDS = [
  /\b(?:pickup|pick.?up|pick up from|from)\s+(.+?)(?:at\s+\d|at\s+(?:around|about)?\s*\d|on\s+(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)|to\s+|\.|$)/gi,
  /\b(?:from)\s+(.+?)(?:\s+to\s+)/gi,
];

const DROPOFF_KEYWORDS = [
  /\b(?:to|drop.?off\s+at|going\s+to|heading\s+to|destination)\s+(.+?)(?:\.|at\s+\d|on\s+(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)|$)/gi,
];

const SPECIAL_REQUESTS_PATTERNS = [
  /\b(?:special\s+(?:request|requirement|instruction)|note[sd]?|please\s+ensure|would\s+like|need|require)\s*[:\s]+(.+?)(?:\.|$)/gi,
  /\b(?:wheelchair|baby\s+seat|child\s+seat|pet|extra\s+luggage|meet\s+and\s+greet|sign|welcome\s+board)\b/gi,
];

// ── Canadian cities / common locations ──────────────────────
const CANADIAN_CITIES = [
  "Montreal", "Toronto", "Vancouver", "Calgary", "Edmonton",
  "Ottawa", "Winnipeg", "Quebec City", "Hamilton", "Halifax",
  "Mississauga", "Brampton", "Surrey", "Laval", "Longueuil",
  "Burnaby", "Windsor", "Regina", "Saskatoon", "St. John's",
  "Mont-Tremblant", "Westmount", "Brossard", "Laval", "Mirabel",
  "Banff", "Whistler", "Niagara Falls",
];

const AIRPORT_CODES: Record<string, string> = {
  YUL: "Montreal-Trudeau International Airport",
  YYC: "Calgary International Airport",
  YYZ: "Toronto Pearson International Airport",
  YVR: "Vancouver International Airport",
  YOW: "Ottawa Macdonald-Cartier International Airport",
  YQB: "Quebec City Jean Lesage International Airport",
  YHZ: "Halifax Stanfield International Airport",
  YEG: "Edmonton International Airport",
  YWG: "Winnipeg International Airport",
  YXE: "Saskatoon International Airport",
  YQR: "Regina International Airport",
};

// ── Main parse function ─────────────────────────────────────

export function parseEmail(
  subject: string,
  body: string,
  fromName: string,
  fromEmail: string
): ParsedEmailData {
  const combined = `${subject}\n${body}`;
  const data: ParsedEmailData = { confidence: 0 };
  let signals = 0;
  let total = 0;

  // 1. Customer name — use from name as fallback
  data.customerName = fromName;
  data.customerEmail = fromEmail;
  signals++;
  total++;

  // 2. Phone
  const phones = body.match(PHONE_REGEX);
  if (phones && phones.length > 0) {
    data.customerPhone = phones[0].trim();
    signals++;
  }
  total++;

  // 3. Flight number
  const flights = Array.from(combined.matchAll(FLIGHT_REGEX));
  if (flights.length > 0) {
    data.flightNumber = flights[0][1].toUpperCase();
    signals++;
  }
  total++;

  // 4. Passenger count
  const pax = Array.from(combined.matchAll(PASSENGER_REGEX));
  if (pax.length > 0) {
    data.passengerCount = parseInt(pax[0][1]);
    signals++;
  }
  total++;

  // 5. Vehicle type
  for (const vt of VEHICLE_TYPES) {
    if (vt.pattern.test(combined)) {
      data.vehicleType = vt.type;
      signals++;
      break;
    }
  }
  total++;

  // 6. Pickup date
  const dates = Array.from(combined.matchAll(DATE_REGEX));
  if (dates.length > 0) {
    const d = dates[0];
    // Named month: "July 15" or "July 15, 2026"
    if (d[1]) {
      data.pickupDate = `${d[1]} ${d[2]}${d[3] ? `, ${d[3]}` : ""}`;
    } else if (d[4] && d[5]) {
      // Numeric: "07/15" or "07/15/2026"
      const year = d[6] || new Date().getFullYear();
      data.pickupDate = `${d[4]}/${d[5]}/${year}`;
    }
    signals++;
  }
  total++;

  // 7. Pickup time
  const times = Array.from(combined.matchAll(TIME_REGEX));
  if (times.length > 0) {
    if (times[0][1] && times[0][2]) {
      data.pickupTime = `${times[0][1]}:${times[0][2]} ${times[0][3] || ""}`.trim();
    } else if (times[0][4] && times[0][5]) {
      data.pickupTime = `${times[0][4]}:00 ${times[0][5]}`;
    }
    signals++;
  }
  total++;

  // 8. Pickup location
  for (const pk of PICKUP_KEYWORDS) {
    const match = pk.exec(combined);
    if (match && match[1]) {
      data.pickupLocation = match[1].trim().replace(/\.$/, "").trim();
      if (data.pickupLocation.length > 3 && data.pickupLocation.length < 120) {
        signals++;
        break;
      }
    }
  }
  total++;

  // 9. Dropoff location
  for (const dk of DROPOFF_KEYWORDS) {
    const match = dk.exec(combined);
    if (match && match[1]) {
      data.dropoffLocation = match[1].trim().replace(/\.$/, "").trim();
      if (data.dropoffLocation.length > 3 && data.dropoffLocation.length < 120) {
        signals++;
        break;
      }
    }
  }
  total++;

  // 10. Special requests
  for (const sr of SPECIAL_REQUESTS_PATTERNS) {
    const match = sr.exec(combined);
    if (match) {
      data.specialRequests = (data.specialRequests || "") + match[0] + " ";
    }
  }
  if (data.specialRequests) {
    data.specialRequests = data.specialRequests.trim();
    signals++;
  }
  total++;

  // Confidence
  data.confidence = Math.min(1, signals / Math.max(1, total));

  return data;
}

// ── Category classifier ─────────────────────────────────────

export function classifyEmail(
  subject: string,
  body: string,
  labels: string[]
): EmailCategory {
  const combined = `${subject}\n${body}\n${labels.join(" ")}`.toLowerCase();

  if (combined.includes("cancel") || combined.includes("cancellation"))
    return "cancellation";

  if (
    combined.includes("modify") ||
    combined.includes("change") ||
    combined.includes("reschedule") ||
    combined.includes("update booking")
  )
    return "booking_modification";

  if (
    combined.includes("complaint") ||
    combined.includes("disappointed") ||
    combined.includes("unacceptable") ||
    combined.includes("refund") ||
    combined.includes("poor service")
  )
    return "complaint";

  if (
    combined.includes("corporate") ||
    combined.includes("account") ||
    combined.includes("company") ||
    combined.includes("monthly statement")
  )
    return "corporate_request";

  if (
    combined.includes("quote") ||
    combined.includes("pricing") ||
    combined.includes("rate") ||
    combined.includes("how much") ||
    combined.includes("cost")
  )
    return "quote_request";

  if (
    combined.includes("dispatch") ||
    combined.includes("driver") ||
    combined.includes("assignment") ||
    combined.includes("eta")
  )
    return "dispatch_request";

  if (
    combined.includes("book") ||
    combined.includes("transfer") ||
    combined.includes("pickup") ||
    combined.includes("airport") ||
    combined.includes("ride")
  )
    return "booking_request";

  if (
    combined.includes("question") ||
    combined.includes("help") ||
    combined.includes("info") ||
    combined.includes("wondering")
  )
    return "customer_question";

  if (
    combined.includes("thank") ||
    combined.includes("great") ||
    combined.includes("excellent") ||
    combined.includes("compliment")
  )
    return "feedback";

  return "general_inquiry";
}

// ── Priority classifier ─────────────────────────────────────

export function classifyPriority(
  subject: string,
  body: string,
  labels: string[]
): EmailPriority {
  const combined = `${subject}\n${body}\n${labels.join(" ")}`.toLowerCase();

  const urgent =
    /\b(?:urgent|asap|immediately|emergency|cancelled|cancellation)\b/i;
  const high =
    /\b(?:important|priority|quick|soon|complaint|disappointed)\b/i;
  const vip = /\b(?:vip|executive|ceo|president|board)\b/i;

  if (urgent.test(combined)) return "urgent";
  if (high.test(combined) || vip.test(combined)) return "high";
  if (labels.includes("vip") || labels.includes("corporate")) return "high";

  return "normal";
}

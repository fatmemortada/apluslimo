// ============================================================
// ChauffeurOS — Email Sync Orchestrator
// Fetches emails from all configured providers, parses, stores
// ============================================================

import { db } from "@/lib/db/store";
import { parseEmail, classifyEmail, classifyPriority } from "@/lib/email/parser";
import type { EmailMessage, EmailInbox, OAuthToken } from "@/lib/types";
import { isTokenExpired, refreshGoogleToken, refreshMicrosoftToken } from "./oauth";

// ── Sync result ──────────────────────────────────────────────

export interface SyncResult {
  inboxId: string;
  email: string;
  status: "success" | "error" | "skipped" | "no_credentials";
  newEmails: number;
  errors?: string[];
}

// ── OAuth credential lookup ──────────────────────────────────

interface OAuthCredentials {
  clientId: string;
  clientSecret: string;
  tenantId?: string;
  redirectUri: string;
}

// In production, these would come from environment variables or a secure store
function getGoogleCredentials(): OAuthCredentials | null {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  if (!clientId || !clientSecret) return null;
  return {
    clientId,
    clientSecret,
    redirectUri: process.env.GOOGLE_REDIRECT_URI || `${process.env.NEXT_PUBLIC_APP_URL || "https://chauffeuros.ca"}/api/auth/callback/google`,
  };
}

function getMicrosoftCredentials(): OAuthCredentials | null {
  const clientId = process.env.MICROSOFT_CLIENT_ID;
  const clientSecret = process.env.MICROSOFT_CLIENT_SECRET;
  if (!clientId || !clientSecret) return null;
  return {
    clientId,
    clientSecret,
    tenantId: process.env.MICROSOFT_TENANT_ID || "common",
    redirectUri: process.env.MICROSOFT_REDIRECT_URI || `${process.env.NEXT_PUBLIC_APP_URL || "https://chauffeuros.ca"}/api/auth/callback/microsoft`,
  };
}

// ── Ensure valid token (refresh if needed) ───────────────────

async function ensureValidToken(
  inbox: EmailInbox,
  creds: OAuthCredentials,
  provider: string
): Promise<OAuthToken | null> {
  if (!inbox.oauthToken) return null;

  let token = inbox.oauthToken;

  if (isTokenExpired(token)) {
    try {
      if (provider === "gmail" && token.refreshToken) {
        token = await refreshGoogleToken(
          token.refreshToken,
          creds.clientId,
          creds.clientSecret
        );
      } else if (provider === "outlook" && token.refreshToken) {
        token = await refreshMicrosoftToken(
          token.refreshToken,
          creds.clientId,
          creds.clientSecret,
          creds.tenantId
        );
      }
      inbox.oauthToken = token;
      inbox.updatedAt = new Date().toISOString();
    } catch (err) {
      inbox.syncStatus = "error";
      return null;
    }
  }

  return token;
}

// ── Sync a single inbox ──────────────────────────────────────

export async function syncInbox(inboxId: string): Promise<SyncResult> {
  const inbox = db.emailInboxes.get(inboxId);
  if (!inbox || !inbox.enabled) {
    return {
      inboxId,
      email: inbox?.email || "unknown",
      status: "skipped",
      newEmails: 0,
    };
  }

  // Determine what kind of sync to run
  if (inbox.provider === "gmail" || inbox.provider === "outlook") {
    return syncOAuth(inbox);
  }

  if (inbox.provider === "smtp") {
    return syncIMAP(inbox);
  }

  // Mock provider — nothing to sync
  return {
    inboxId,
    email: inbox.email,
    status: inbox.provider === "mock" ? "skipped" : "no_credentials",
    newEmails: 0,
    errors: inbox.provider === "mock" ? ["Mock provider — no real email to sync"] : undefined,
  };
}

// ── OAuth-based sync (Gmail, Outlook) ────────────────────────

async function syncOAuth(inbox: EmailInbox): Promise<SyncResult> {
  const errors: string[] = [];

  if (!inbox.oauthConnected || !inbox.oauthToken) {
    return {
      inboxId: inbox.id,
      email: inbox.email,
      status: "no_credentials",
      newEmails: 0,
      errors: ["OAuth not configured"],
    };
  }

  const creds = inbox.provider === "gmail"
    ? getGoogleCredentials()
    : getMicrosoftCredentials();

  if (!creds) {
    return {
      inboxId: inbox.id,
      email: inbox.email,
      status: "no_credentials",
      newEmails: 0,
      errors: [`${inbox.provider} API credentials not configured in environment variables`],
    };
  }

  const token = await ensureValidToken(inbox, creds, inbox.provider);
  if (!token) {
    inbox.syncStatus = "error";
    return {
      inboxId: inbox.id,
      email: inbox.email,
      status: "error",
      newEmails: 0,
      errors: ["Token refresh failed"],
    };
  }

  // Fetch emails via provider API
  try {
    const since = inbox.lastSyncAt
      ? new Date(inbox.lastSyncAt)
      : new Date(Date.now() - 24 * 60 * 60 * 1000); // last 24h if never synced

    // This would call the actual provider API
    // For now, we simulate the fetch to validate the architecture
    const fetched = await simulateProviderFetch(inbox, token, since);

    // Process and store fetched emails
    let newCount = 0;
    for (const fet of fetched) {
      // Skip if already stored by external ID
      const exists = Array.from(db.emailMessages.values()).some(
        (m) => m.threadId === fet.externalId
      );
      if (exists) continue;

      const parsed = parseEmail(fet.subject, fet.body, fet.from.name, fet.from.email);
      const email: EmailMessage = {
        id: `email_sync_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`,
        organizationId: inbox.organizationId,
        inboxId: inbox.id,
        subject: fet.subject,
        from: fet.from,
        to: fet.to,
        cc: fet.cc,
        body: fet.body,
        bodyPreview: fet.bodyPreview,
        status: "unread",
        priority: classifyPriority(fet.subject, fet.body, fet.labels),
        category: classifyEmail(fet.subject, fet.body, fet.labels),
        labels: fet.labels,
        attachments: fet.attachments.map((a) => ({
          id: `att_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`,
          filename: a.filename,
          mimeType: a.mimeType,
          size: a.size,
          url: "#",
        })),
        threadId: fet.externalId || fet.threadId || `thread_${Date.now().toString(36)}`,
        parsedData: parsed,
        receivedAt: fet.receivedAt,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      db.emailMessages.set(email.id, email);
      newCount++;
    }

    // Update inbox state
    inbox.lastSyncAt = new Date().toISOString();
    inbox.syncStatus = "connected";
    inbox.unreadCount += newCount;
    inbox.totalEmails += newCount;

    return {
      inboxId: inbox.id,
      email: inbox.email,
      status: "success",
      newEmails: newCount,
    };
  } catch (err) {
    inbox.syncStatus = "error";
    return {
      inboxId: inbox.id,
      email: inbox.email,
      status: "error",
      newEmails: 0,
      errors: [err instanceof Error ? err.message : "Unknown sync error"],
    };
  }
}

// ── IMAP-based sync ──────────────────────────────────────────

async function syncIMAP(inbox: EmailInbox): Promise<SyncResult> {
  return {
    inboxId: inbox.id,
    email: inbox.email,
    status: "no_credentials",
    newEmails: 0,
    errors: ["IMAP sync requires encrypted app password configuration"],
  };
}

// ── Simulated provider fetch (for when real API isn't configured) ──

async function simulateProviderFetch(
  inbox: EmailInbox,
  token: OAuthToken,
  since: Date
): Promise<import("./provider").FetchedEmail[]> {
  // In production, this would call Gmail API or Microsoft Graph API
  // For now, generate realistic sample emails to validate the pipeline
  const samples: import("./provider").FetchedEmail[] = [
    {
      externalId: `ext_${Date.now().toString(36)}_001`,
      subject: `New booking inquiry — ${new Date().toLocaleDateString()}`,
      from: { name: "James Wilson", email: "jwilson@example.com" },
      to: [{ name: inbox.displayName, email: inbox.email }],
      cc: [],
      body: `Hi,\n\nI need a sedan transfer from YUL airport to downtown Montreal on ${new Date(Date.now() + 86400000).toLocaleDateString()}. Flight arrives at 14:30. 1 passenger.\n\nPlease provide a quote.\n\nBest,\nJames Wilson`,
      bodyPreview: "I need a sedan transfer from YUL airport to downtown Montreal...",
      receivedAt: new Date().toISOString(),
      labels: ["booking_request", "airport"],
      attachments: [],
    },
    {
      externalId: `ext_${Date.now().toString(36)}_002`,
      subject: "Re: Corporate account statement",
      from: { name: "Sarah Chen", email: "sarah@techcorp.com" },
      to: [{ name: inbox.displayName, email: inbox.email }],
      cc: [{ name: "Accounts", email: "accounts@techcorp.com" }],
      body: "Could you please send the monthly statement for June? We need it for reconciliation.\n\nThanks,\nSarah",
      bodyPreview: "Could you please send the monthly statement for June?",
      receivedAt: new Date(Date.now() - 3600000).toISOString(),
      labels: ["corporate", "invoice"],
      attachments: [],
    },
  ];

  return samples;
}

// ── Sync all enabled inboxes ─────────────────────────────────

export async function syncAllInboxes(): Promise<SyncResult[]> {
  const results: SyncResult[] = [];
  const inboxes = db.emailInboxes ? Array.from(db.emailInboxes.values()) : [];

  for (const inbox of inboxes) {
    if (!inbox.enabled) {
      results.push({
        inboxId: inbox.id,
        email: inbox.email,
        status: "skipped",
        newEmails: 0,
        errors: inbox.enabled ? undefined : ["Inbox is disabled"],
      });
      continue;
    }
    const result = await syncInbox(inbox.id);
    results.push(result);
  }

  return results;
}

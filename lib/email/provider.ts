// ============================================================
// ChauffeurOS — Email Provider Interface
// Abstraction layer for Gmail API, Microsoft Graph, and IMAP
// ============================================================

import type { EmailMessage, EmailAttachment, OAuthToken } from "@/lib/types";

// ── Provider Configuration ───────────────────────────────────

export interface ProviderConfig {
  inboxId: string;
  email: string;
  provider: "gmail" | "outlook" | "smtp";
}

export interface OAuthProviderConfig extends ProviderConfig {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  tenantId?: string; // for Microsoft
}

export interface IMAPConfig extends ProviderConfig {
  host: string;
  port: number;
  useTls: boolean;
  appPassword: string; // encrypted app-specific password only
  imapUser: string;
}

// ── Fetched email result ─────────────────────────────────────

export interface FetchedEmail {
  externalId: string;
  subject: string;
  from: { name: string; email: string };
  to: Array<{ name: string; email: string }>;
  cc: Array<{ name: string; email: string }>;
  body: string;
  bodyPreview: string;
  receivedAt: string;
  labels: string[];
  attachments: Array<{
    filename: string;
    mimeType: string;
    size: number;
    data?: string; // base64
  }>;
  threadId?: string;
}

// ── Provider Interface ───────────────────────────────────────

export interface EmailProvider {
  readonly name: string;
  readonly type: "oauth" | "imap";

  /** Test the connection with current credentials */
  testConnection(token: OAuthToken | string): Promise<boolean>;

  /** Fetch recent unseen emails */
  fetchEmails(
    token: OAuthToken | string,
    since: Date,
    maxResults?: number
  ): Promise<FetchedEmail[]>;

  /** Mark email as read by external ID */
  markAsRead(token: OAuthToken | string, externalId: string): Promise<void>;

  /** Archive email by external ID */
  archive(token: OAuthToken | string, externalId: string): Promise<void>;
}

// ── OAuth URLs ───────────────────────────────────────────────

export interface OAuthUrls {
  authorizationUrl: string;
  redirectUri: string;
  scopes: string[];
}

// ── Gmail API Constants ──────────────────────────────────────

export const GMAIL_SCOPES = [
  "https://www.googleapis.com/auth/gmail.readonly",
  "https://www.googleapis.com/auth/gmail.modify",
];

export const GMAIL_AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth";
export const GMAIL_TOKEN_URL = "https://oauth2.googleapis.com/token";

// ── Microsoft Graph Constants ────────────────────────────────

export const GRAPH_SCOPES = [
  "https://graph.microsoft.com/Mail.Read",
  "https://graph.microsoft.com/Mail.ReadWrite",
  "offline_access",
];

export const GRAPH_AUTH_URL = "https://login.microsoftonline.com";
export const GRAPH_TOKEN_URL = "https://login.microsoftonline.com";

// ── IMAP/SMTP Defaults ───────────────────────────────────────

export const IMAP_DEFAULTS: Record<string, { host: string; port: number; useTls: boolean }> = {
  gmail: { host: "imap.gmail.com", port: 993, useTls: true },
  outlook: { host: "outlook.office365.com", port: 993, useTls: true },
  hostinger: { host: "imap.hostinger.com", port: 993, useTls: true },
};

export const SMTP_DEFAULTS: Record<string, { host: string; port: number; useTls: boolean }> = {
  hostinger: { host: "smtp.hostinger.com", port: 465, useTls: true },
};

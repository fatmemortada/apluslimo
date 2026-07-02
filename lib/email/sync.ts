// ============================================================
// ChauffeurOS — Email Sync Orchestrator
// Fetches emails from all configured providers, parses, stores
// ============================================================

import { db } from "@/lib/db/store";
import { parseEmail, classifyEmail, classifyPriority } from "@/lib/email/parser";
import type { EmailMessage, EmailInbox, OAuthToken } from "@/lib/types";
import { isTokenExpired, refreshGoogleToken, refreshMicrosoftToken } from "./oauth";
import { IMAP_DEFAULTS, SMTP_DEFAULTS } from "./provider";

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

  if (inbox.provider === "smtp" || inbox.provider === "hostinger") {
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

// ── Real Gmail API fetch ─────────────────────────────────────

interface GmailHeader {
  name: string;
  value: string;
}

interface GmailPart {
  mimeType: string;
  filename: string;
  headers?: GmailHeader[];
  body: { data?: string; attachmentId?: string; size: number };
  parts?: GmailPart[];
}

interface GmailMessage {
  id: string;
  threadId: string;
  labelIds: string[];
  payload: GmailPart;
  internalDate: string;
}

function base64Decode(data: string): string {
  try {
    return Buffer.from(data.replace(/-/g, "+").replace(/_/g, "/"), "base64").toString("utf-8");
  } catch {
    return "";
  }
}

function findHeader(headers: GmailHeader[], name: string): string {
  return headers?.find((h) => h.name.toLowerCase() === name.toLowerCase())?.value || "";
}

function extractTextParts(part: GmailPart, targetMime: string): string[] {
  const results: string[] = [];
  if (part.mimeType === targetMime && part.body?.data) {
    results.push(base64Decode(part.body.data));
  }
  if (part.parts) {
    for (const p of part.parts) {
      results.push(...extractTextParts(p, targetMime));
    }
  }
  return results;
}

function extractAttachments(part: GmailPart): import("./provider").FetchedEmail["attachments"] {
  const results: import("./provider").FetchedEmail["attachments"] = [];
  if (part.filename && part.filename.length > 0 && part.body?.attachmentId) {
    results.push({
      filename: part.filename,
      mimeType: part.mimeType,
      size: part.body.size || 0,
    });
  }
  if (part.parts) {
    for (const p of part.parts) {
      results.push(...extractAttachments(p));
    }
  }
  return results;
}

function parseGmailMessage(msg: GmailMessage): import("./provider").FetchedEmail | null {
  const headers = msg.payload?.headers || [];
  const subject = findHeader(headers, "Subject");
  const fromRaw = findHeader(headers, "From");
  const toRaw = findHeader(headers, "To");
  const ccRaw = findHeader(headers, "Cc");
  const dateRaw = findHeader(headers, "Date");

  if (!subject && !fromRaw) return null;

  function parseAddress(raw: string): { name: string; email: string } {
    const match = raw.match(/^"?([^"<]*)"?\s*<([^>]+)>/);
    if (match) return { name: match[1].trim() || match[2], email: match[2] };
    return { name: raw.trim(), email: raw.trim() };
  }

  function parseAddressList(raw: string): Array<{ name: string; email: string }> {
    if (!raw) return [];
    const parts: string[] = [];
    let current = "";
    let inQuote = false;
    for (const ch of raw) {
      if (ch === '"') inQuote = !inQuote;
      if (ch === "," && !inQuote) { parts.push(current.trim()); current = ""; }
      else current += ch;
    }
    if (current.trim()) parts.push(current.trim());
    return parts.map(parseAddress);
  }

  let body = "";
  const plainParts = extractTextParts(msg.payload, "text/plain");
  const htmlParts = extractTextParts(msg.payload, "text/html");
  body = plainParts.join("\n\n") || htmlParts.join("\n\n") || "";
  if (!body && msg.payload?.body?.data) {
    body = base64Decode(msg.payload.body.data);
  }

  const bodyPreview = body
    .replace(/<[^>]+>/g, "")
    .replace(/\s+/g, " ")
    .slice(0, 150)
    .trim();

  const receivedAt = dateRaw
    ? new Date(dateRaw).toISOString()
    : new Date(parseInt(msg.internalDate)).toISOString();

  return {
    externalId: msg.id,
    subject: subject || "(no subject)",
    from: parseAddress(fromRaw),
    to: parseAddressList(toRaw),
    cc: parseAddressList(ccRaw),
    body: body || "(no readable content)",
    bodyPreview: bodyPreview || subject || "",
    receivedAt,
    labels: (msg.labelIds || []).filter((l) => !["INBOX", "UNREAD", "SENT", "DRAFT", "CATEGORY_PRIMARY"].includes(l)).map((l) => l.toLowerCase()),
    attachments: extractAttachments(msg.payload),
    threadId: msg.threadId,
  };
}

async function fetchGmailEmails(
  accessToken: string,
  inboxEmail: string,
  since: Date,
  maxResults: number = 20
): Promise<import("./provider").FetchedEmail[]> {
  const sinceSeconds = Math.floor(since.getTime() / 1000);
  const query = `after:${sinceSeconds}`;

  const listRes = await fetch(
    `https://gmail.googleapis.com/gmail/v1/users/me/messages?q=${encodeURIComponent(query)}&maxResults=${maxResults}`,
    { headers: { Authorization: `Bearer ${accessToken}` } }
  );

  if (!listRes.ok) {
    const errText = await listRes.text();
    throw new Error(`Gmail API list failed (${listRes.status}): ${errText}`);
  }

  const listData = await listRes.json();
  const messageIds: string[] = (listData.messages || []).map((m: { id: string }) => m.id);
  if (messageIds.length === 0) return [];

  const results: import("./provider").FetchedEmail[] = [];
  for (const msgId of messageIds) {
    const msgRes = await fetch(
      `https://gmail.googleapis.com/gmail/v1/users/me/messages/${msgId}?format=full`,
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );
    if (!msgRes.ok) continue;
    const msgData: GmailMessage = await msgRes.json();
    const parsed = parseGmailMessage(msgData);
    if (parsed) results.push(parsed);
  }

  return results;
}

// ── Updated OAuth sync (routes to real provider APIs) ───────

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
      errors: [`${inbox.provider} API credentials not configured`],
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

  try {
    const since = inbox.lastSyncAt
      ? new Date(inbox.lastSyncAt)
      : new Date(Date.now() - 24 * 60 * 60 * 1000);

    let fetched: import("./provider").FetchedEmail[];

    if (inbox.provider === "gmail") {
      fetched = await fetchGmailEmails(token.accessToken, inbox.email, since);
    } else if (inbox.provider === "outlook") {
      throw new Error("Microsoft Graph sync not yet implemented");
    } else {
      fetched = [];
    }

    let newCount = 0;
    for (const fet of fetched) {
      const exists = Array.from(db.emailMessages.values()).some(
        (m) => m.threadId === fet.externalId || m.threadId === (fet.threadId || "")
      );
      if (exists) continue;

      const parsed = parseEmail(fet.subject, fet.body, fet.from.name, fet.from.email);
      const email: EmailMessage = {
        id: `email_${fet.externalId}`,
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
          id: `att_${fet.externalId}_${a.filename.replace(/[^a-zA-Z0-9]/g, "_").slice(0, 30)}`,
          filename: a.filename,
          mimeType: a.mimeType,
          size: a.size,
          url: "#",
        })),
        threadId: fet.externalId,
        parsedData: parsed,
        receivedAt: fet.receivedAt,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      db.emailMessages.set(email.id, email);
      newCount++;
    }

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

// ── IMAP-based sync (Hostinger, custom SMTP) ─────────────────

/** Decrypt an IMAP password. In production this uses AES-256-GCM. */
function decryptPassword(encrypted: string): string {
  // Placeholder: in production, use crypto.createDecipheriv with AES-256-GCM
  // For now, the password is stored base64-encoded (not plaintext in logs)
  try {
    return Buffer.from(encrypted, "base64").toString("utf-8");
  } catch {
    return encrypted;
  }
}

/** Build IMAP connection config from inbox settings */
function getIMAPConfig(inbox: EmailInbox): {
  host: string;
  port: number;
  secure: boolean;
  user: string;
  password: string;
} | null {
  if (!inbox.encryptedPassword) return null;

  const defaults = inbox.provider === "hostinger" ? IMAP_DEFAULTS.hostinger : undefined;

  return {
    host: inbox.imapHost || defaults?.host || "imap.hostinger.com",
    port: inbox.imapPort || defaults?.port || 993,
    secure: inbox.imapSecure ?? defaults?.useTls ?? true,
    user: inbox.email,
    password: decryptPassword(inbox.encryptedPassword),
  };
}

/** Test an IMAP connection and return whether it succeeded */
export async function testIMAPConnection(inboxId: string): Promise<{
  success: boolean;
  error?: string;
}> {
  const inbox = db.emailInboxes.get(inboxId);
  if (!inbox) return { success: false, error: "Inbox not found" };

  const config = getIMAPConfig(inbox);
  if (!config) {
    return { success: false, error: "IMAP password not configured" };
  }

  try {
    const { ImapFlow } = await import("imapflow");
    const client = new ImapFlow({
      host: config.host,
      port: config.port,
      secure: config.secure,
      auth: { user: config.user, pass: config.password },
      logger: false,
    });

    await client.connect();
    await client.logout();

    inbox.syncStatus = "connected";
    inbox.syncError = undefined;
    inbox.updatedAt = new Date().toISOString();

    return { success: true };
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Connection failed";
    inbox.syncStatus = "error";
    inbox.syncError = msg;
    inbox.updatedAt = new Date().toISOString();
    return { success: false, error: msg };
  }
}

/** Fetch emails from an IMAP inbox since a given date */
async function imapFetchEmails(
  inbox: EmailInbox,
  since: Date
): Promise<import("./provider").FetchedEmail[]> {
  const config = getIMAPConfig(inbox);
  if (!config) throw new Error("IMAP password not configured");

  const { ImapFlow } = await import("imapflow");
  const client = new ImapFlow({
    host: config.host,
    port: config.port,
    secure: config.secure,
    auth: { user: config.user, pass: config.password },
    logger: false,
  });

  try {
    await client.connect();
    const lock = await client.getMailboxLock("INBOX");

    const results: import("./provider").FetchedEmail[] = [];

    try {
      // Fetch messages since the given date
      const sinceStr = since.toISOString().replace("T", " ").split(".")[0];
      const searchQuery = { since: since };

      for await (const msg of client.fetch(searchQuery, {
        source: true,
        envelope: true,
        bodyStructure: true,
        uid: true,
      })) {
        try {
          const source = msg.source?.toString("utf-8") || "";
          const envelope = msg.envelope;

          // Parse headers manually from source
          const headers = source.split("\r\n\r\n")[0] || "";
          const bodyParts = source.split("\r\n\r\n").slice(1).join("\r\n\r\n");

          const subject = envelope?.subject || "";
          const from = envelope?.from?.[0];
          const to = envelope?.to || [];
          const cc = envelope?.cc || [];
          const date = envelope?.date || new Date();

          // Extract plain text body (strip HTML)
          let body = bodyParts;
          const htmlMatch = bodyParts.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
          if (htmlMatch) {
            body = htmlMatch[1].replace(/<[^>]+>/g, "").trim();
          }

          results.push({
            externalId: String(msg.uid),
            subject: subject || "(no subject)",
            from: {
              name: from?.name || "",
              email: from?.address || "",
            },
            to: (to || []).map((t: any) => ({
              name: t.name || "",
              email: t.address || "",
            })),
            cc: (cc || []).map((c: any) => ({
              name: c.name || "",
              email: c.address || "",
            })),
            body: body || "(no readable content)",
            bodyPreview: body.replace(/\s+/g, " ").slice(0, 150).trim() || subject || "",
            receivedAt: (date || new Date()).toISOString(),
            labels: [],
            attachments: [],
            threadId: `imap_${msg.uid}`,
          });
        } catch {
          // Skip messages that fail to parse
        }
      }
    } finally {
      lock.release();
    }

    await client.logout();
    return results;
  } catch (err) {
    // Ensure client is logged out on error
    try { await client.logout(); } catch {}
    throw err;
  }
}

/** Sync an IMAP inbox (Hostinger or custom SMTP) */
async function syncIMAP(inbox: EmailInbox): Promise<SyncResult> {
  const errors: string[] = [];

  if (!inbox.encryptedPassword) {
    return {
      inboxId: inbox.id,
      email: inbox.email,
      status: "no_credentials",
      newEmails: 0,
      errors: ["IMAP password not configured. Set an encrypted app password in Settings > Connected Inboxes."],
    };
  }

  try {
    const since = inbox.lastSyncAt
      ? new Date(inbox.lastSyncAt)
      : new Date(Date.now() - 24 * 60 * 60 * 1000);

    const fetched = await imapFetchEmails(inbox, since);

    let newCount = 0;
    for (const fet of fetched) {
      const exists = Array.from(db.emailMessages.values()).some(
        (m) => m.threadId === fet.externalId || m.threadId === (fet.threadId || "")
      );
      if (exists) continue;

      const parsed = parseEmail(fet.subject, fet.body, fet.from.name, fet.from.email);
      const email: EmailMessage = {
        id: `email_${fet.externalId}_${Date.now().toString(36)}`,
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
          id: `att_${fet.externalId}_${a.filename.replace(/[^a-zA-Z0-9]/g, "_").slice(0, 30)}`,
          filename: a.filename,
          mimeType: a.mimeType,
          size: a.size,
          url: "#",
        })),
        threadId: fet.externalId,
        parsedData: parsed,
        receivedAt: fet.receivedAt,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      db.emailMessages.set(email.id, email);
      newCount++;
    }

    inbox.lastSyncAt = new Date().toISOString();
    inbox.syncStatus = "connected";
    inbox.syncError = undefined;
    inbox.unreadCount += newCount;
    inbox.totalEmails += newCount;

    return {
      inboxId: inbox.id,
      email: inbox.email,
      status: "success",
      newEmails: newCount,
    };
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown IMAP sync error";
    inbox.syncStatus = "error";
    inbox.syncError = msg;
    return {
      inboxId: inbox.id,
      email: inbox.email,
      status: "error",
      newEmails: 0,
      errors: [msg],
    };
  }
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

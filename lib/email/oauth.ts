// ============================================================
// ChauffeurOS — OAuth 2.0 Flow Handler
// Google Workspace (Gmail API) + Microsoft 365 (Graph API)
// ============================================================

import {
  GMAIL_SCOPES, GMAIL_AUTH_URL, GMAIL_TOKEN_URL,
  GRAPH_SCOPES, GRAPH_AUTH_URL, GRAPH_TOKEN_URL,
  type OAuthUrls,
} from "./provider";
import type { OAuthToken } from "@/lib/types";

// ── Generate OAuth authorization URL ─────────────────────────

export function getGoogleAuthUrl(config: {
  clientId: string;
  redirectUri: string;
  state: string;
}): OAuthUrls {
  const params = new URLSearchParams({
    client_id: config.clientId,
    redirect_uri: config.redirectUri,
    response_type: "code",
    scope: GMAIL_SCOPES.join(" "),
    access_type: "offline",
    state: config.state,
    prompt: "consent", // force refresh token
  });

  return {
    authorizationUrl: `${GMAIL_AUTH_URL}?${params.toString()}`,
    redirectUri: config.redirectUri,
    scopes: GMAIL_SCOPES,
  };
}

export function getMicrosoftAuthUrl(config: {
  clientId: string;
  redirectUri: string;
  state: string;
  tenantId?: string;
}): OAuthUrls {
  const tenant = config.tenantId || "common";
  const params = new URLSearchParams({
    client_id: config.clientId,
    redirect_uri: config.redirectUri,
    response_type: "code",
    scope: GRAPH_SCOPES.join(" "),
    state: config.state,
  });

  return {
    authorizationUrl: `${GRAPH_AUTH_URL}/${tenant}/oauth2/v2.0/authorize?${params.toString()}`,
    redirectUri: config.redirectUri,
    scopes: GRAPH_SCOPES,
  };
}

// ── Exchange authorization code for tokens ───────────────────

export async function exchangeGoogleCode(
  code: string,
  clientId: string,
  clientSecret: string,
  redirectUri: string
): Promise<OAuthToken> {
  const res = await fetch(GMAIL_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
      grant_type: "authorization_code",
    }),
  });

  if (!res.ok) {
    const error = await res.text();
    throw new Error(`Google token exchange failed: ${error}`);
  }

  const data = await res.json();

  return {
    accessToken: data.access_token,
    refreshToken: data.refresh_token,
    expiresAt: data.expires_in
      ? new Date(Date.now() + data.expires_in * 1000).toISOString()
      : undefined,
    scopes: (data.scope || "").split(" "),
    tokenType: data.token_type,
    encrypted: false, // set to true in production with proper encryption
  };
}

export async function exchangeMicrosoftCode(
  code: string,
  clientId: string,
  clientSecret: string,
  redirectUri: string,
  tenantId?: string
): Promise<OAuthToken> {
  const tenant = tenantId || "common";

  const res = await fetch(`${GRAPH_TOKEN_URL}/${tenant}/oauth2/v2.0/token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      code,
      redirect_uri: redirectUri,
      grant_type: "authorization_code",
    }),
  });

  if (!res.ok) {
    const error = await res.text();
    throw new Error(`Microsoft token exchange failed: ${error}`);
  }

  const data = await res.json();

  return {
    accessToken: data.access_token,
    refreshToken: data.refresh_token,
    expiresAt: data.expires_in
      ? new Date(Date.now() + data.expires_in * 1000).toISOString()
      : undefined,
    scopes: (data.scope || "").split(" "),
    tokenType: data.token_type,
    encrypted: false,
  };
}

// ── Refresh an expired token ─────────────────────────────────

export async function refreshGoogleToken(
  refreshToken: string,
  clientId: string,
  clientSecret: string
): Promise<OAuthToken> {
  const res = await fetch(GMAIL_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      refresh_token: refreshToken,
      client_id: clientId,
      client_secret: clientSecret,
      grant_type: "refresh_token",
    }),
  });

  if (!res.ok) {
    const error = await res.text();
    throw new Error(`Google token refresh failed: ${error}`);
  }

  const data = await res.json();

  return {
    accessToken: data.access_token,
    refreshToken: data.refresh_token || refreshToken,
    expiresAt: data.expires_in
      ? new Date(Date.now() + data.expires_in * 1000).toISOString()
      : undefined,
    scopes: [],
    tokenType: data.token_type,
    encrypted: false,
  };
}

export async function refreshMicrosoftToken(
  refreshToken: string,
  clientId: string,
  clientSecret: string,
  tenantId?: string
): Promise<OAuthToken> {
  const tenant = tenantId || "common";

  const res = await fetch(`${GRAPH_TOKEN_URL}/${tenant}/oauth2/v2.0/token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      refresh_token: refreshToken,
      client_id: clientId,
      client_secret: clientSecret,
      grant_type: "refresh_token",
    }),
  });

  if (!res.ok) {
    const error = await res.text();
    throw new Error(`Microsoft token refresh failed: ${error}`);
  }

  const data = await res.json();

  return {
    accessToken: data.access_token,
    refreshToken: data.refresh_token || refreshToken,
    expiresAt: data.expires_in
      ? new Date(Date.now() + data.expires_in * 1000).toISOString()
      : undefined,
    scopes: [],
    tokenType: data.token_type,
    encrypted: false,
  };
}

// ── Check if token is expired ────────────────────────────────

export function isTokenExpired(token: OAuthToken): boolean {
  if (!token.expiresAt) return false;
  return new Date(token.expiresAt).getTime() <= Date.now() + 60000; // 1 min buffer
}

// ── Encrypt/decrypt helpers (placeholder for production) ─────

export function encryptToken(token: OAuthToken): OAuthToken {
  // In production: use crypto.createCipheriv with AES-256-GCM
  // For now: mark as encrypted (placeholder)
  return { ...token, encrypted: true };
}

export function decryptToken(token: OAuthToken): OAuthToken {
  // In production: use crypto.createDecipheriv with AES-256-GCM
  // For now: return as-is
  return { ...token, encrypted: false };
}

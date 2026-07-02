// ============================================================
// ChauffeurOS — API Route Helpers
// Standardized request handling, error responses, org context
// ============================================================

import { NextResponse } from "next/server";
import { seed } from "@/lib/db/seed";
import { db } from "@/lib/db/store";
import type { ApiResponse } from "@/lib/types";

// Ensure seed data exists (idempotent)
export function ensureSeed(): void {
  seed();
}

// Default org ID (in production this comes from auth/session)
export const DEFAULT_ORG_ID = "org_demo001";
export const DEFAULT_USER_ID = "user_fatme";

// Get org context from request (headers or session in production)
export function getOrgContext(request: Request): {
  organizationId: string;
  userId: string;
} {
  // In production: extract from JWT/session cookie
  const orgId =
    request.headers.get("x-organization-id") || DEFAULT_ORG_ID;
  const userId = request.headers.get("x-user-id") || DEFAULT_USER_ID;
  return { organizationId: orgId, userId };
}

// Standardized success response
export function ok<T>(data: T, status = 200): NextResponse<ApiResponse<T>> {
  return NextResponse.json({ success: true, data }, { status });
}

// Standardized error response
export function err(
  error: string,
  status = 400
): NextResponse<ApiResponse<never>> {
  return NextResponse.json({ success: false, error }, { status });
}

// Standardized not found
export function notFound(
  entity = "Resource"
): NextResponse<ApiResponse<never>> {
  return err(`${entity} not found`, 404);
}

// Parse JSON body with error handling
export async function parseBody<T>(request: Request): Promise<T | null> {
  try {
    return await request.json();
  } catch {
    return null;
  }
}

// Activity logging helper
export function logActivity(
  orgId: string,
  userId: string,
  action: string,
  entityType: string,
  entityId: string,
  details: Record<string, unknown> = {}
): void {
  db.activityLog.push({
    id: `act_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 5)}`,
    organizationId: orgId,
    userId,
    action: action as import("@/lib/types").ActivityAction,
    entityType,
    entityId,
    details,
    createdAt: new Date().toISOString(),
  });
}

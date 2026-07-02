import { type NextRequest } from "next/server";
import { ensureSeed, getOrgContext, ok, err, parseBody } from "@/lib/api/helpers";
import { db } from "@/lib/db/store";

export async function POST(request: NextRequest) {
  ensureSeed();
  const body = await parseBody<{ email: string; password: string }>(request);
  if (!body?.email || !body?.password) {
    return err("Email and password are required");
  }

  // Demo authentication — in production use proper auth
  const user = Array.from(db.users.values()).find((u) => u.email === body.email);
  if (!user) return err("Invalid credentials", 401);
  if (user.status !== "active") return err("Account is inactive", 403);

  const org = db.organizations.get(user.organizationId);
  if (!org) return err("Organization not found", 404);

  // Update last login
  user.lastLoginAt = new Date().toISOString();

  return ok({
    user: {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      fullName: user.fullName,
      role: user.role,
      permissions: user.permissions,
    },
    organization: {
      id: org.id,
      name: org.name,
      slug: org.slug,
      plan: org.plan,
      settings: org.settings,
    },
    token: "demo-session-token", // In production: JWT
  });
}

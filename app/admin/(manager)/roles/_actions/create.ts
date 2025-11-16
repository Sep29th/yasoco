"use server";

import { requireAuth } from "@/lib/auth";
import { createRole } from "@/lib/role";

export async function createRoleAction(payload: {
  name: string;
  permissions: string[];
}) {
  await requireAuth();

  const name = String(payload?.name || "").trim();
  const permissions = Array.isArray(payload?.permissions)
    ? payload.permissions.map((p) => String(p).trim()).filter(Boolean)
    : [];

  if (!name) throw new Error("Tên vai trò là bắt buộc");

  const result = await createRole({ name, permissions });

  return { ok: result };
}

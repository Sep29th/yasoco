"use server";

import { requireAuth } from "@/lib/auth";
import { updateRole } from "@/lib/role";

export async function updateRoleAction(payload: {
  id: string;
  name: string;
  permissions: string[];
}) {
  const auth = await requireAuth();

  if (!auth.permissions.includes("role:update"))
    throw new Error("Không có quyền cập nhật vai trò");

  const id = String(payload?.id || "").trim();
  const name = String(payload?.name || "").trim();
  const permissions = Array.isArray(payload?.permissions)
    ? payload.permissions.map((p) => String(p).trim()).filter(Boolean)
    : [];

  if (!id) throw new Error("Mã vai trò là bắt buộc");
  if (!name) throw new Error("Tên vai trò là bắt buộc");

  const result = await updateRole({ id, name, permissions });

  return { ok: result };
}


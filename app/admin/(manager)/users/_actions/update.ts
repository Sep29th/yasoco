"use server";

import { requireAuth } from "@/lib/auth";
import { updateUser } from "@/lib/user";

export async function updateUserAction(payload: {
  id: string;
  name: string;
  phone: string;
  password?: string;
  roleIds: string[];
  isActive: boolean;
}) {
  const auth = await requireAuth();

  if (!auth.permissions.includes("user:update"))
    throw new Error("Không có quyền cập nhật người dùng");

  const id = String(payload?.id || "").trim();
  const name = String(payload?.name || "").trim();
  const phone = String(payload?.phone || "").trim();
  const password = String(payload?.password || "");
  const roleIds = Array.isArray(payload?.roleIds)
    ? payload.roleIds.map((rid) => String(rid).trim()).filter(Boolean)
    : [];
  const isActive = Boolean(payload?.isActive);

  if (!id) throw new Error("Thiếu mã người dùng");
  if (!name) throw new Error("Tên người dùng là bắt buộc");
  if (!phone) throw new Error("Số điện thoại là bắt buộc");

  await updateUser({
    id,
    name,
    phone,
    isActive,
    roleIds,
    password: password.trim() ? password : undefined,
  });

  return { ok: true };
}


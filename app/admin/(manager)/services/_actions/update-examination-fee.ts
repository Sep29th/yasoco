"use server";

import { requireAuth } from "@/lib/auth";
import { upsertExaminationFee } from "@/lib/examination-fee";

export async function updateExaminationFeeAction(payload: {
  value: number | string;
}) {
  const auth = await requireAuth();

  if (!auth.permissions.includes("service:update")) {
    throw new Error("Không có quyền cập nhật giá khám");
  }

  const raw = String(payload?.value ?? "").replace(/\s/g, "");
  const parsed = Number(raw);

  if (!raw) throw new Error("Giá khám là bắt buộc");
  if (!Number.isFinite(parsed) || parsed < 0 || !Number.isInteger(parsed)) {
    throw new Error("Giá khám không hợp lệ");
  }

  const result = await upsertExaminationFee(parsed);

  return { ok: true, value: result.value };
}

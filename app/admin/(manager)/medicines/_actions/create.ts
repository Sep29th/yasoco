"use server";

import { requireAuth } from "@/lib/auth";
import { createMedicine } from "@/lib/medicine";

export async function createMedicineAction(payload: {
  name: string;
  description?: string;
  unit: string;
  price: number | string;
}) {
  const auth = await requireAuth();

  if (!auth.permissions.includes("medicine:create")) {
    throw new Error("Không có quyền tạo thuốc");
  }

  const name = String(payload?.name || "").trim();
  const unit = String(payload?.unit || "").trim();
  const description = String(payload?.description ?? "").trim();
  const priceNumber = Number(payload?.price);

  if (!name) throw new Error("Tên thuốc là bắt buộc");
  if (!unit) throw new Error("Đơn vị là bắt buộc");
  if (!Number.isFinite(priceNumber) || priceNumber < 0) {
    throw new Error("Giá thuốc không hợp lệ");
  }

  const result = await createMedicine({
    name,
    unit,
    description: description || undefined,
    price: priceNumber,
  });

  return { ok: Boolean(result?.id), medicineId: result?.id };
}

"use server";

import { requireAuth } from "@/lib/auth";
import { updateMedicine } from "@/lib/medicine";

export async function updateMedicineAction(payload: {
	id: string;
	name: string;
	description?: string;
	unit: string;
	originalPrice: number | string;
	price: number | string;
}) {
	const auth = await requireAuth();

	if (!auth.permissions.includes("medicine:update")) {
		throw new Error("Không có quyền cập nhật thuốc");
	}

	const id = String(payload?.id || "").trim();
	const name = String(payload?.name || "").trim();
	const unit = String(payload?.unit || "").trim();
	const description = String(payload?.description ?? "").trim();
	const originalPriceNumber = Number(payload?.originalPrice);
	const priceNumber = Number(payload?.price);

	if (!id) throw new Error("Thiếu mã thuốc");
	if (!name) throw new Error("Tên thuốc là bắt buộc");
	if (!unit) throw new Error("Đơn vị là bắt buộc");
	if (!Number.isFinite(originalPriceNumber) || originalPriceNumber < 0) {
		throw new Error("Giá gốc thuốc không hợp lệ");
	}
	if (!Number.isFinite(priceNumber) || priceNumber < 0) {
		throw new Error("Giá thuốc không hợp lệ");
	}

	await updateMedicine({
		id,
		name,
		unit,
		description: description || undefined,
		originalPrice: originalPriceNumber,
		price: priceNumber,
	});

	return { ok: true };
}

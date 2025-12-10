"use server";

import { requireAuth } from "@/lib/auth";
import { updateMedicine } from "@/lib/medicine";

export async function updateMedicineAction(payload: {
	id: string;
	name: string;
	description?: string;
	unit: string;
}) {
	const auth = await requireAuth();

	if (!auth.permissions.includes("medicine:update")) {
		throw new Error("Không có quyền cập nhật thuốc");
	}

	const id = String(payload?.id || "").trim();
	const name = String(payload?.name || "").trim();
	const unit = String(payload?.unit || "").trim();
	const description = String(payload?.description ?? "").trim();

	if (!id) throw new Error("Thiếu mã thuốc");
	if (!name) throw new Error("Tên thuốc là bắt buộc");
	if (!unit) throw new Error("Đơn vị là bắt buộc");

	await updateMedicine({
		id,
		name,
		description: description || undefined,
		unit,
	});

	return { ok: true };
}

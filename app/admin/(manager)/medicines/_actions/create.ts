"use server";

import {requireAuth} from "@/lib/auth";
import {createMedicine} from "@/lib/medicine";

export async function createMedicineAction(payload: {
	name: string;
	description?: string;
	unit: string;
}) {
	try {
		const auth = await requireAuth();

		if (!auth.permissions.includes("medicine:create")) {
			throw new Error("Không có quyền tạo thuốc");
		}

		const name = String(payload?.name || "").trim();
		const unit = String(payload?.unit || "").trim();
		const description = String(payload?.description ?? "").trim();

		if (!name) throw new Error("Tên thuốc là bắt buộc");
		if (!unit) throw new Error("Đơn vị là bắt buộc");

		const result = await createMedicine({
			name,
			unit,
			description: description || undefined,
		});

		return {ok: Boolean(result?.id), medicineId: result?.id};
	} catch (err) {
		if (err instanceof Error) return {ok: false, message: err.message};
		console.error(err);
		return {ok: false, message: "Lỗi không xác định"};
	}
}

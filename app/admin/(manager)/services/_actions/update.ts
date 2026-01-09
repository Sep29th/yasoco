"use server";

import {requireAuth} from "@/lib/auth";
import {updateService} from "@/lib/service";

export async function updateServiceAction(payload: {
	id: string;
	name: string;
	description?: string;
	price: number | string;
}) {
	try {
		const auth = await requireAuth();

		if (!auth.permissions.includes("service:update")) {
			throw new Error("Không có quyền cập nhật dịch vụ");
		}

		const id = String(payload?.id || "").trim();
		const name = String(payload?.name || "").trim();
		const description = String(payload?.description ?? "").trim();
		const priceNumber = Number(payload?.price);

		if (!id) throw new Error("Thiếu mã dịch vụ");
		if (!name) throw new Error("Tên dịch vụ là bắt buộc");
		if (!Number.isFinite(priceNumber) || priceNumber < 0) {
			throw new Error("Giá dịch vụ không hợp lệ");
		}

		await updateService({
			id,
			name,
			description: description || undefined,
			price: priceNumber,
		});

		return {ok: true};
	} catch (err) {
		if (err instanceof Error) return {ok: false, message: err.message};
		console.error(err);
		return {ok: false, message: "Lỗi không xác định"};
	}
}

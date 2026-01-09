"use server";

import {requireAuth} from "@/lib/auth";
import {createService} from "@/lib/service";

export async function createServiceAction(payload: {
	name: string;
	description?: string;
	price: number | string;
}) {
	try {
		const auth = await requireAuth();

		if (!auth.permissions.includes("service:create")) {
			throw new Error("Không có quyền tạo dịch vụ");
		}

		const name = String(payload?.name || "").trim();
		const description = String(payload?.description ?? "").trim();
		const priceNumber = Number(payload?.price);

		if (!name) throw new Error("Tên dịch vụ là bắt buộc");
		if (!Number.isFinite(priceNumber) || priceNumber < 0) {
			throw new Error("Giá dịch vụ không hợp lệ");
		}

		const result = await createService({
			name,
			description: description || undefined,
			price: priceNumber,
		});

		return {ok: Boolean(result?.id), serviceId: result?.id};
	} catch (err) {
		if (err instanceof Error) return {ok: false, message: err.message};
		console.error(err);
		return {ok: false, message: "Lỗi không xác định"};
	}
}

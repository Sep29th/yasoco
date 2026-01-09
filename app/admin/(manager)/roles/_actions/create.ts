"use server";

import {requireAuth} from "@/lib/auth";
import {createRole} from "@/lib/role";

export async function createRoleAction(payload: {
	name: string;
	permissions: string[];
}) {
	try {
		const auth = await requireAuth();

		if (!auth.permissions.includes("role:create"))
			throw new Error("Không có quyền tạo vai trò");

		const name = String(payload?.name || "").trim();
		const permissions = Array.isArray(payload?.permissions)
			? payload.permissions.map((p) => String(p).trim()).filter(Boolean)
			: [];

		if (!name) throw new Error("Tên vai trò là bắt buộc");

		const result = await createRole({name, permissions});

		return {ok: result};
	} catch (err) {
		if (err instanceof Error) return {ok: false, message: err.message};
		console.error(err);
		return {ok: false, message: "Lỗi không xác định"};
	}
}

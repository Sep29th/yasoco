"use server";

import {requireAuth} from "@/lib/auth";
import {createUser} from "@/lib/user";

export async function createUserAction(payload: {
	name: string;
	phone: string;
	password: string;
	roleIds: string[];
	isActive: boolean;
}) {
	try {
		const auth = await requireAuth();

		if (!auth.permissions.includes("user:create"))
			throw new Error("Không có quyền tạo người dùng");

		const name = String(payload?.name || "").trim();
		const phone = String(payload?.phone || "").trim();
		const password = String(payload?.password || "");
		const roleIds = Array.isArray(payload?.roleIds)
			? payload.roleIds.map((id) => String(id).trim()).filter(Boolean)
			: [];
		const isActive =
			typeof payload?.isActive === "boolean" ? payload.isActive : true;

		if (!name) throw new Error("Tên người dùng là bắt buộc");
		if (!phone) throw new Error("Số điện thoại là bắt buộc");
		if (!password) throw new Error("Mật khẩu là bắt buộc");

		const result = await createUser({
			name,
			phone,
			password,
			roleIds,
			isActive,
		});

		return {ok: Boolean(result?.id), userId: result?.id};
	} catch (err) {
		if (err instanceof Error) return {ok: false, message: err.message};
		console.error(err);
		return {ok: false, message: "Lỗi không xác định"};
	}
}


"use server";

import {requireAuth} from "@/lib/auth";
import {updateDosageTemplate} from "@/lib/dosage-template";

export default async function updateDosageTemplateAction(id: string, data: { shortcut: string; content: string }) {
	const auth = await requireAuth();
	if (!auth.permissions.includes("medicine:update")) {
		throw new Error("Không có quyền sửa mẫu tắt")
	}

	try {
		const result = await updateDosageTemplate(id, data);
		return {success: true, message: result.id}
	} catch (e: unknown) {
		if (e instanceof Error) {
			return {success: false, message: e.message};
		} else {
			return {success: false, message: "Lỗi không xác định"};
		}
	}
}
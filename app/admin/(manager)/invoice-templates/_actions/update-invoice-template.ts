"use server";

import { requireAuth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { JSONContent } from "@tiptap/react";
import { revalidateTag } from "next/cache";

export default async function updateInvoiceTemplate(
	id: string,
	name: string,
	value: JSONContent
) {
	const auth = await requireAuth();

	if (!auth.permissions.includes("invoice-template:update")) {
		throw new Error("Không có quyền sửa mẫu đơn");
	}
	try {
		const result = await prisma.$transaction(async (tx) => {
			const existed = await tx.invoiceTemplate.findFirst({
				where: { id },
				select: { id: true },
			});

			if (!existed) throw new Error("Không tìm thấy mẫu hóa đơn");

			revalidateTag("invoice-template-all", { expire: 0 });
			return await tx.invoiceTemplate.update({
				where: { id },
				data: { name, value },
				select: { id: true },
			});
		});

		return { success: true, message: result.id };
	} catch (e: unknown) {
		if (e instanceof Error) {
			return { success: false, message: e.message };
		} else {
			return { success: false, message: "Lỗi không xác định" };
		}
	}
}

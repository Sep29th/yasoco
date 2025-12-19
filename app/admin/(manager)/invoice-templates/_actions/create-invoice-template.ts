"use server";

import { requireAuth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { revalidateTag } from "next/cache";

export const createInvoiceTemplate = async (name: string) => {
	const auth = await requireAuth();

	if (!auth.permissions.includes("invoice-template:create")) {
		throw new Error("Không có quyền tạo mẫu đơn");
	}
	try {
		const result = await prisma.$transaction(async (tx) => {
			const existed = await tx.invoiceTemplate.findFirst({
				where: { name },
				select: { id: true },
			});

			if (existed) throw new Error("Tên đã tồn tại");
			revalidateTag("invoice-template-all", { expire: 0 });
			return await tx.invoiceTemplate.create({
				data: { name, value: { type: "doc" } },
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
};

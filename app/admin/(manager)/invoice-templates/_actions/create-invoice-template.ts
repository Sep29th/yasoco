"use server";

import prisma from "@/lib/prisma"

export const createInvoiceTemplate = async (name: string) => {
	try {
		const result = await prisma.$transaction(async (tx) => {
			const existed = await tx.invoiceTemplate.findFirst({where: {name}, select: {id: true}});

			if (existed) throw new Error("Tên đã tồn tại");

			return await tx.invoiceTemplate.create({
				data: {name, value: {type: "doc"}},
				select: {id: true}
			})
		})

		return {success: true, message: result.id}
	} catch (e: unknown) {
		if (e instanceof Error) {
			return {success: false, message: e.message}
		} else {
			return {success: false, message: "Lỗi không xác định"}
		}
	}
}
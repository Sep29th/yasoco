"use server";

import { cacheLife, cacheTag } from "next/cache";
import prisma from "./prisma";

export async function getInvoiceTemplateById(id: string) {
	return await prisma.invoiceTemplate.findUnique({ where: { id } });
}

export async function getPaginationInvoiceTemplates(
	page: number,
	pageSize: number
) {
	const [total, invoiceTemplates] = await Promise.all([
		prisma.invoiceTemplate.count(),
		prisma.invoiceTemplate.findMany({
			skip: (page - 1) * pageSize,
			take: pageSize,
		}),
	]);

	return { total, invoiceTemplates };
}

export async function getAllInvoiceTemplates() {
	"use cache";
	cacheTag("invoice-template-all");
	cacheLife("max");
	const data = await prisma.invoiceTemplate.findMany();

	return data;
}

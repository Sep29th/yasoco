"use server";

import prisma from "@/lib/prisma"
import {cacheLife, cacheTag, revalidateTag} from "next/cache";

export async function getAllDosageTemplates() {
	"use cache";
	cacheTag("dosage-templates");
	cacheLife("max");

	return prisma.dosageTemplate.findMany({orderBy: {shortcut: "asc"}});
}

export async function getDosageTemplateById(id: string) {
	const dosageTemplate = await prisma.dosageTemplate.findUnique({where: {id}});

	if (!dosageTemplate) throw new Error("Không tìm thấy mẫu tắt");

	return dosageTemplate;
}

export async function getPaginationDosageTemplate(page: number, pageSize: number) {
	const [total, dosageTemplates] = await Promise.all([
		prisma.dosageTemplate.count(),
		prisma.dosageTemplate.findMany({
			orderBy: {shortcut: "asc"},
			skip: (page - 1) * pageSize,
			take: pageSize,
		})
	])

	return {total, dosageTemplates};
}

export async function createDosageTemplate({shortcut, content}: { shortcut: string; content: string }) {
	const checkExisted = await prisma.dosageTemplate.findFirst({where: {shortcut}});
	if (checkExisted) throw new Error("Mẫu tắt đã được dùng");

	const dosageTemplate = await prisma.dosageTemplate.create({
		data: {shortcut, content}
	})
	revalidateTag("dosage-templates", {expire: 0})

	return dosageTemplate;
}

export async function updateDosageTemplate(id: string, data: { shortcut: string, content: string }) {
	const checkExisted = await prisma.dosageTemplate.findFirst({where: {id}});
	if (!checkExisted) throw new Error("Không tìm thấy mẫu tắt")

	const usedShortcut = await prisma.dosageTemplate.findFirst({where: {shortcut: data.shortcut}});
	if (usedShortcut) throw new Error("Mẫu tắt đã được dùng");

	const dosageTemplate = await prisma.dosageTemplate.update({where: {id}, data})
	revalidateTag("dosage-templates", {expire: 0})

	return dosageTemplate;
}

export async function deleteDosageTemplate(id: string) {
	const checkExisted = await prisma.dosageTemplate.findFirst({where: {id}});
	if (!checkExisted) throw new Error("Không tìm thấy mẫu tắt")

	await prisma.dosageTemplate.delete({where: {id}});
	revalidateTag("dosage-templates", {expire: 0})
}
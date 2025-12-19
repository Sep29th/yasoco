"use server";

import prisma from "@/lib/prisma";
import { Tag } from "./generated/prisma";

export async function getTagCount() {
	const count = await prisma.tag.count();

	return count;
}

export async function getPaginationTags(page: number, pageSize: number) {
	const [total, tags] = await Promise.all([
		prisma.tag.count(),
		prisma.tag.findMany({
			orderBy: { createdAt: "desc" },
			skip: (page - 1) * pageSize,
			take: pageSize,
		}),
	]);

	return { total, tags };
}

export async function getTagById(id: string) {
	return await prisma.tag.findUnique({ where: { id } });
}

export async function createTag(data: Pick<Tag, "name" | "color">) {
	await prisma.tag.create({ data });
}

export async function updateTag(data: Pick<Tag, "name" | "color" | "id">) {
	await prisma.tag.update({ data, where: { id: data.id } });
}

export async function deleteTag(id: string) {
	return (await prisma.tag.deleteMany({ where: { id } })).count;
}

export async function getAllTags() {
	return await prisma.tag.findMany({ select: { id: true, name: true, color: true } });
}

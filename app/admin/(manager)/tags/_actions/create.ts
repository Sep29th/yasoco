"use server";

import { Tag } from "@/lib/generated/prisma";
import prisma from "@/lib/prisma";
import { createTag } from "@/lib/tag";

export async function createTagAction(data: Pick<Tag, "name" | "color">) {
	const existed = await prisma.tag.findFirst({ where: { name: data.name } });
	if (existed) throw new Error(`Đã tồn tại thẻ có tên là ${data.name}`);

	await createTag(data);
}

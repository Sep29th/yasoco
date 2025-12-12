"use server";

import { Tag } from "@/lib/generated/prisma";
import prisma from "@/lib/prisma";
import { updateTag } from "@/lib/tag";

export async function updateTagAction(
	data: Pick<Tag, "name" | "color" | "id">
) {
	const existed = await prisma.tag.findFirst({ where: { name: data.name } });
	if (existed && existed.id !== data.id)
		throw new Error(`Đã tồn tại thẻ có tên là ${data.name}`);

	await updateTag(data);
}

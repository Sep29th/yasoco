import prisma from "@/lib/prisma";

export async function getTagCount() {
	const count = await prisma.tag.count();

	return count;
}

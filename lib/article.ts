import prisma from "@/lib/prisma";

export async function getPublishedArticleCount() {
	const count = await prisma.article.count({ where: { isPublished: true } });

	return count;
}

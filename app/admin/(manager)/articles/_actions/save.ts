"use server";

import { requireAuth } from "@/lib/auth";
import { ArticleFormValues } from "../_schema/article-form-schema";
import prisma from "@/lib/prisma";
import { revalidateTag } from "next/cache";

export default async function saveArticleAction(
	articleId: string,
	values: ArticleFormValues,
	contentText: string
) {
	const auth = await requireAuth();

	if (!auth.permissions.includes("article:update")) {
		throw new Error("Không có quyền sửa bài viết");
	}

	const { tags, ...article } = values;

	const result = await prisma.$transaction(async (tx) => {
		await tx.article.update({
			where: { id: articleId },
			data: {
				...article,
				content: article.content
					? JSON.parse(JSON.stringify(article.content))
					: { type: "doc" },
				contentText,
			},
		});
		const tags = await tx.articleTag.findMany({
			where: { articleId },
			select: { tagId: true, id: true },
		});

		const hadTagMap = new Map<string, string>();

		const hadTags = tags.map((k) => {
			hadTagMap.set(k.tagId, k.id);
			return k.tagId;
		});

		const currentSet = new Set(hadTags);
		const futureSet = new Set(values.tags);
		const removed = hadTags.filter((item) => !futureSet.has(item));
		const added = values.tags.filter((item) => !currentSet.has(item));
		const changed = [...removed, ...added];

		const idToRemove = removed
			.map((k) => hadTagMap.get(k))
			.filter((k) => typeof k == "string");

		if (idToRemove.length > 0) {
			await tx.articleTag.deleteMany({ where: { id: { in: idToRemove } } });
		}

		if (added.length > 0) {
			await tx.articleTag.createMany({
				data: added.map((k) => ({ articleId, tagId: k })),
			});
		}

		return changed;
	});

	for (const tag of result) {
		revalidateTag(`${tag}-articles`, { expire: 0 });
	}
}

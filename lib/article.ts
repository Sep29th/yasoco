"use server";

import prisma from "@/lib/prisma";
import { Article, Prisma } from "./generated/prisma";
import { buildSearchSql, parseSearchKeyword } from "./search";

export async function getPublishedArticleCount() {
	const count = await prisma.article.count({ where: { isPublished: true } });

	return count;
}

export async function getPaginationArticle(
	page: number,
	pageSize: number,
	groupByTagId: string,
	search: string
) {
	const offset = Math.max(0, (page - 1) * pageSize);

	const parsedSearch = parseSearchKeyword(search);
	const searchSql = parsedSearch
		? buildSearchSql(parsedSearch, {
				tsv: Prisma.sql`a."searchVector"`,
				primary: Prisma.sql`COALESCE(a.title, '')`,
				others: [
					Prisma.sql`COALESCE(a.excerpt, '')`,
					Prisma.sql`COALESCE(a."contentText", '')`,
				],
			})
		: null;
	const hasTag = groupByTagId.trim().length > 0;

	const conditions: Prisma.Sql[] = [];

	if (hasTag) {
		conditions.push(Prisma.sql`
      EXISTS (
        SELECT 1
        FROM "ArticleTag" at
        WHERE at."articleId" = a.id
          AND at."tagId" = ${groupByTagId}
      )
    `);
	}

	if (searchSql) {
		conditions.push(searchSql.where);
	}

	const whereSQL =
		conditions.length > 0
			? Prisma.sql`WHERE ${Prisma.join(conditions, " AND ")}`
			: Prisma.empty;

	const orderBySQL = searchSql
		? Prisma.sql`${searchSql.score} DESC,`
		: Prisma.empty;

	const articles = await prisma.$queryRaw`
    SELECT
      a.id,
      a.title,
      a.slug,
      a."coverImage",
      a."showInMainPage",
      a."isPublished"
    FROM "Article" a
    ${whereSQL}
    ORDER BY
      ${orderBySQL}
      a."showInMainPage",
      a."isPublished"
    LIMIT ${pageSize}
    OFFSET ${offset};
  `;

	const countResult = await prisma.$queryRaw<{ total: bigint }[]>`
    SELECT COUNT(*)::bigint AS total
    FROM "Article" a
    ${whereSQL};
  `;

	return {
		total: Number(countResult[0]?.total ?? 0),
		articles: articles as Pick<
			Article,
			"id" | "title" | "slug" | "coverImage" | "showInMainPage" | "isPublished"
		>[],
	};
}

export async function getArticleById(id: string) {
	const article = await prisma.article.findUnique({
		where: { id },
		include: { articleTags: { select: { tagId: true } } },
	});

	return article;
}

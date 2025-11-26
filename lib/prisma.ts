import { PrismaClient } from "./generated/prisma";
const prismaClient = new PrismaClient();
const extendedPrismaClient = prismaClient.$extends({
	model: {
		article: {
			async search(keyword: string, limit = 10) {
				const q = (keyword || "").trim();
				if (!q) return [];
				const ftsResults = await prismaClient.$queryRaw<
					Array<{ id: string; title: string; slug: string; rank: number }>
				>`SELECT id, title, slug, ts_rank("searchVector", plainto_tsquery('simple', ${q})) AS rank
					FROM "Article"
					WHERE "searchVector" @@ plainto_tsquery('simple', ${q})
					ORDER BY rank DESC
					LIMIT ${limit}`;
				if (ftsResults.length > 0) return ftsResults;
				const trigramResults = await prismaClient.$queryRaw<
					Array<{ id: string; title: string; slug: string; similarity: number }>
				>`SELECT id, title, slug, greatest(similarity(unaccent("contentText"), unaccent(${q})), similarity(unaccent(title), unaccent(${q}))) AS similarity
					FROM "Article"
					WHERE unaccent("contentText") ILIKE unaccent('%' || ${q} || '%') OR unaccent(title) ILIKE unaccent('%' || ${q} || '%') OR similarity(unaccent("contentText"), unaccent(${q})) > 0.25
					ORDER BY similarity DESC
					LIMIT ${limit}`;
				return trigramResults;
			},
		},
		user: {
			async allPermissions(userId: string) {
				const result = await prismaClient.$queryRaw<
					{ name: string }[]
				>`SELECT DISTINCT p.name
					FROM "User" u 
						INNER JOIN "UserRole" ur ON u.id = ur."userId" 
						INNER JOIN "Role" r ON ur."roleId" = r.id 
						INNER JOIN "PermissionRole" pr ON r.id = pr."roleId" 
						INNER JOIN "Permission" p ON pr."permissionId" = p.id
					WHERE u.id = ${userId} AND u."isActive" = true AND u."isDeleted" = false`;
				return result.map((row) => row.name);
			},
		},
	},
});
export default extendedPrismaClient;
export { prismaClient as prismaBase };

import { PrismaClient } from "./generated/prisma";

const prismaClient = new PrismaClient(
	process.env.NODE_ENV === "development" ? { log: ["query"] } : undefined
);

const extendedPrismaClient = prismaClient.$extends({
	model: {
		article: {
			async search(keyword: string, limit = 10) {
				const q = (keyword || "").trim();
				if (!q) return [];
				const ftsResults: {
					id: string;
					title: string;
					slug: string;
					rank: number;
				}[] = await prismaClient.$queryRaw`
          SELECT id, title, slug, ts_rank("searchVector", plainto_tsquery('simple', ${q})) AS rank
          FROM "Article"
          WHERE "searchVector" @@ plainto_tsquery('simple', ${q})
          ORDER BY rank DESC
          LIMIT ${limit}
        `;

				if (ftsResults.length > 0) return ftsResults;

				const trigramResults: {
					id: string;
					title: string;
					slug: string;
					similarity: number;
				}[] = await prismaClient.$queryRaw`
          SELECT id, title, slug, 
            GREATEST(
              similarity(content_search, f_unaccent(${q})), 
              similarity(title_search, f_unaccent(${q}))
            ) AS similarity
          FROM "Article"
          WHERE
            title_search ILIKE f_unaccent('%' || ${q} || '%') 
            OR content_search ILIKE f_unaccent('%' || ${q} || '%') 
            OR similarity(title_search, f_unaccent(${q})) > 0.25
          ORDER BY similarity DESC
          LIMIT ${limit}
        `;

				return trigramResults;
			},
		},

		user: {
			async allPermissions(userId: string) {
				const result = await prismaClient.$queryRaw<{ name: string }[]>`
          SELECT DISTINCT p.name
          FROM "User" u 
            INNER JOIN "UserRole" ur ON u.id = ur."userId" 
            INNER JOIN "Role" r ON ur."roleId" = r.id 
            INNER JOIN "PermissionRole" pr ON r.id = pr."roleId" 
            INNER JOIN "Permission" p ON pr."permissionId" = p.id
          WHERE u.id = ${userId} AND u."isActive" = true AND u."isDeleted" = false
        `;
				return result.map((row) => row.name);
			},
		},

		medicine: {
			async search(keyword: string, page = 1, pageSize = 10) {
				const q = (keyword || "").trim();
				if (!q) return { total: 0, medicines: [] };

				const offset = (page - 1) * pageSize;

				const results: {
					id: string;
					name: string;
					description: string | null;
					unit: string;
					createdAt: Date;
					updatedAt: Date;
					rank: number;
					total_count: bigint;
				}[] = await prismaClient.$queryRaw`
          SELECT id, name, description, unit, "createdAt",
						ts_rank(
							"searchTsv",
							websearch_to_tsquery(
								'pg_catalog.simple',
								f_unaccent(${q})
							)
						) AS rank,
						COUNT(*) OVER() AS total_count
					FROM "Medicine"
					WHERE "searchTsv" @@ websearch_to_tsquery(
						'pg_catalog.simple',
						f_unaccent(${q})
					)
					ORDER BY rank DESC
					LIMIT ${pageSize}
					OFFSET ${offset};
        `;

				if (results.length === 0) {
					return { total: 0, medicines: [] };
				}

				const total = Number(results[0].total_count);

				const medicines = results.map((row) => ({
					id: row.id,
					name: row.name,
					description: row.description,
					unit: row.unit,
					createdAt: row.createdAt,
					updatedAt: row.updatedAt,
				}));

				return { total, medicines };
			},
		},
	},
});

export default extendedPrismaClient;
export { prismaClient as prismaBase };

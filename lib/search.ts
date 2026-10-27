import { Prisma } from "./generated/prisma";

const MAX_KEYWORD_LENGTH = 200;
// Ngưỡng word_similarity (pg_trgm) để coi là gõ sai chính tả, ví dụ "acuclv" ~ "Acuclav"
const TYPO_SIMILARITY_THRESHOLD = 0.5;
const TYPO_MIN_LENGTH = 3;

const hasWordChar = (s: string) => /[\p{L}\p{N}]/u.test(s);

// Escape ký tự đại diện của LIKE/ILIKE (escape mặc định là "\")
const escapeLike = (s: string) => s.replace(/[\\%_]/g, (c) => `\\${c}`);

export type ParsedKeyword = {
	raw: string;
	tsQuery: string;
	likePhrase: string;
	likeTokens: string[];
};

/**
 * Chuẩn hóa từ khóa người dùng nhập.
 * - tsQuery: dạng prefix cho full-text search, ví dụ "acu 100" -> "acu:* & 100:*"
 * - likePhrase / likeTokens: đã escape, dùng cho tìm chuỗi con bằng ILIKE
 */
export function parseSearchKeyword(keyword: string): ParsedKeyword | null {
	const raw = (keyword || "")
		.trim()
		.replace(/\s+/g, " ")
		.slice(0, MAX_KEYWORD_LENGTH);
	if (!raw) return null;

	const tokens = raw.split(" ").filter(Boolean);
	const tsQuery = tokens
		.map((t) => t.replace(/[&|!():<>'"\\*]/g, ""))
		.filter(hasWordChar)
		.map((t) => `${t}:*`)
		.join(" & ");

	return {
		raw,
		tsQuery,
		likePhrase: escapeLike(raw),
		likeTokens: tokens.map(escapeLike),
	};
}

type SearchFields = {
	/** Cột tsvector đã có GIN index */
	tsv: Prisma.Sql;
	/** Trường chính (tên / tiêu đề), phải đã COALESCE về "" nếu nullable */
	primary: Prisma.Sql;
	/** Các trường phụ (mô tả, nội dung...) */
	others?: Prisma.Sql[];
};

/**
 * Tạo điều kiện WHERE và điểm xếp hạng cho tìm kiếm "thông minh", không phân biệt hoa thường và dấu:
 * 1. Full-text prefix: "acu" khớp "Acuclav", không theo thứ tự từ
 * 2. Chuỗi con: mỗi từ khóa nằm ở bất kỳ đâu trong các trường, ví dụ "clav" khớp "Acuclav"
 * 3. Gõ sai chính tả (pg_trgm) trên trường chính, ví dụ "amoxicilin" khớp "Amoxicillin"
 * Điểm ưu tiên: trùng khớp hoàn toàn > bắt đầu bằng > bắt đầu một từ > chứa > độ liên quan / độ giống.
 */
export function buildSearchSql(
	keyword: ParsedKeyword,
	{ tsv, primary, others = [] }: SearchFields
) {
	const { raw, tsQuery, likePhrase, likeTokens } = keyword;

	const primaryText = Prisma.sql`f_unaccent(${primary})`;
	const haystack = Prisma.sql`f_unaccent(concat_ws(' ', ${Prisma.join(
		[primary, ...others],
		", "
	)}))`;
	const phrase = Prisma.sql`f_unaccent(${likePhrase})`;
	const query = Prisma.sql`f_unaccent(${raw})`;
	const tsQuerySql = Prisma.sql`to_tsquery('pg_catalog.simple', f_unaccent(${tsQuery}))`;

	const ftsMatch = tsQuery
		? Prisma.sql`${tsv} @@ ${tsQuerySql}`
		: Prisma.sql`FALSE`;
	const ftsScore = tsQuery
		? Prisma.sql`CASE WHEN ${ftsMatch} THEN 10 + ts_rank(${tsv}, ${tsQuerySql}) * 10 ELSE 0 END`
		: Prisma.sql`0`;
	const allTokensIn = (text: Prisma.Sql) => Prisma.sql`NOT EXISTS (
		SELECT 1 FROM unnest(${likeTokens}::text[]) AS kw(token)
		WHERE ${text} NOT ILIKE '%' || f_unaccent(kw.token) || '%'
	)`;
	const typoMatch =
		raw.length >= TYPO_MIN_LENGTH
			? Prisma.sql`word_similarity(${query}, ${primaryText}) >= ${TYPO_SIMILARITY_THRESHOLD}`
			: Prisma.sql`FALSE`;

	const where = Prisma.sql`(
		${ftsMatch}
		OR ${allTokensIn(haystack)}
		OR ${typoMatch}
	)`;

	const score = Prisma.sql`(
		CASE WHEN ${primaryText} ILIKE ${phrase} THEN 100 ELSE 0 END
		+ CASE WHEN ${primaryText} ILIKE ${phrase} || '%' THEN 50 ELSE 0 END
		+ CASE WHEN ' ' || ${primaryText} ILIKE '% ' || ${phrase} || '%' THEN 30 ELSE 0 END
		+ CASE WHEN ${allTokensIn(primaryText)} THEN 20 ELSE 0 END
		+ ${ftsScore}
		+ word_similarity(${query}, ${primaryText}) * 10
	)`;

	return { where, score };
}

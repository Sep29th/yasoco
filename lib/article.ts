import prisma from "@/lib/prisma";
import { unstable_cache } from "next/cache";

async function _getPublishedArticleCount() {
  const count = await prisma.article.count({ where: { isPublished: true } });

  return count;
}

export const getPublishedArticleCount = unstable_cache(
  _getPublishedArticleCount,
  ["article", "count-published"]
);

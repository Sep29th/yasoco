import prisma from "@/lib/prisma";
import { unstable_cache } from "next/cache";

async function _getTagCount() {
  const count = await prisma.tag.count();

  return count;
}

export const getTagCount = unstable_cache(_getTagCount, ["tag", "count"]);

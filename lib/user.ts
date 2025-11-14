import prisma from "@/lib/prisma";
import { unstable_cache } from "next/cache";

async function _getUserCount() {
  const count = await prisma.user.count();

  return count;
}

export const getUserCount = unstable_cache(_getUserCount, ["user", "count"]);

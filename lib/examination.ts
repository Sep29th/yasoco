import prisma from "@/lib/prisma";
import { unstable_cache } from "next/cache";
import { getMidnightRevalidateSeconds } from "./utils";

async function _getTodayAppointmentCount() {
  const today = new Date();
  const startOfDay = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate(),
    0,
    0,
    0
  );
  const endOfDay = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate(),
    23,
    59,
    59
  );

  const count = await prisma.examination.count({
    where: { date: { gte: startOfDay, lt: endOfDay } },
  });

  return count;
}

export const getTodayAppointmentCount = unstable_cache(
  _getTodayAppointmentCount,
  ["examination", "today"],
  {
    revalidate: getMidnightRevalidateSeconds(),
    tags: ["examination", "today"],
  }
);

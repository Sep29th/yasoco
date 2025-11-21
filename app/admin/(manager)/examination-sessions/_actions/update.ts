"use server";

import { requireAuth } from "@/lib/auth";
import {
  ORDERED_DAYS,
  updateExaminationSessions,
} from "@/lib/examination-session";
import { DaysOfWeek } from "@/lib/generated/prisma";

const ALLOWED_DAYS: DaysOfWeek[] = ORDERED_DAYS;

const isValidTime = (value: string) => {
  const trimmed = value.trim();
  const match = /^([01]\d|2[0-3]):([0-5]\d)$/.exec(trimmed);
  if (!match) return false;

  return true;
};

export async function updateExaminationSessionsAction(payload: {
  sessionsByDay: Record<string, string[]>;
}) {
  const auth = await requireAuth();

  if (!auth.permissions.includes("examination-session:update")) {
    throw new Error("Không có quyền cập nhật giờ khám");
  }

  const sessionsByDay = payload?.sessionsByDay ?? {};
  const normalized: Record<DaysOfWeek, string[]> = {} as Record<
    DaysOfWeek,
    string[]
  >;

  for (const day of ALLOWED_DAYS) {
    const rawList = Array.isArray(sessionsByDay[day])
      ? sessionsByDay[day]
      : [];

    const cleaned: string[] = [];
    const seen = new Set<string>();

    for (const item of rawList) {
      const value = String(item || "").trim();
      if (!value) continue;
      if (!isValidTime(value)) {
        throw new Error(
          `Giờ không hợp lệ cho ${day}. Vui lòng nhập theo định dạng HH:MM`
        );
      }
      if (seen.has(value)) continue;
      seen.add(value);
      cleaned.push(value);
    }

    cleaned.sort();
    normalized[day] = cleaned;
  }

  await updateExaminationSessions(normalized);

  return { ok: true };
}

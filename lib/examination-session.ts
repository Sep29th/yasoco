import prisma from "@/lib/prisma";
import { DaysOfWeek } from "@/lib/generated/prisma";
export const ORDERED_DAYS: DaysOfWeek[] = [
	"MONDAY",
	"TUESDAY",
	"WEDNESDAY",
	"THURSDAY",
	"FRIDAY",
	"SATURDAY",
	"SUNDAY",
];
export type ExaminationSessionByDay = { day: DaysOfWeek; sessions: string[] };
export const getExaminationSessionsByDay = async (): Promise<
	ExaminationSessionByDay[]
> => {
	const rows = await prisma.examinationSession.findMany();
	const map = new Map<string, string[]>();
	for (const row of rows) {
		const key = String(row.daysOfWeek);
		const value = Array.isArray(row.session) ? row.session : [];
		map.set(key, value);
	}
	return ORDERED_DAYS.map((day) => ({
		day,
		sessions: map.get(day) ?? [],
	}));
};
export const updateExaminationSessions = async (
	payload: Record<DaysOfWeek, string[]>
) => {
	await Promise.all(
		ORDERED_DAYS.map((day) => {
			const key = day.toLowerCase();
			const sessions = payload[day] ?? [];
			return prisma.examinationSession.upsert({
				where: { id: `session-${key}` },
				update: { daysOfWeek: day, session: sessions },
				create: { id: `session-${key}`, daysOfWeek: day, session: sessions },
			});
		})
	);
};

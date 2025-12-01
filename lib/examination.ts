"use server";
import prisma from "@/lib/prisma";
import { DateString } from "@/utils/types/date-string";
const TIMEZONE = "Asia/Ho_Chi_Minh";
function getDateStringInTimezone(date: Date = new Date()): string {
	return new Intl.DateTimeFormat("en-CA", {
		timeZone: TIMEZONE,
		year: "numeric",
		month: "2-digit",
		day: "2-digit",
	}).format(date);
}
function getTimezoneOffsetMinutes(
	timezone: string,
	date: Date = new Date()
): number {
	const testDate = new Date(Date.UTC(2024, 0, 1, 0, 0, 0));
	const parts = new Intl.DateTimeFormat("en-US", {
		timeZone: timezone,
		timeZoneName: "longOffset",
	}).formatToParts(testDate);
	const offsetPart = parts.find((p) => p.type === "timeZoneName");
	if (offsetPart) {
		const offsetMatch = offsetPart.value.match(/GMT([+-])(\d{1,2}):?(\d{2})?/);
		if (offsetMatch) {
			const sign = offsetMatch[1] === "+" ? 1 : -1;
			const hours = parseInt(offsetMatch[2] || "0");
			const minutes = parseInt(offsetMatch[3] || "0");
			return sign * (hours * 60 + minutes);
		}
	}
	const utcDate = new Date(
		Date.UTC(
			date.getUTCFullYear(),
			date.getUTCMonth(),
			date.getUTCDate(),
			0,
			0,
			0
		)
	);
	const tzFormatter = new Intl.DateTimeFormat("en-US", {
		timeZone: timezone,
		year: "numeric",
		month: "2-digit",
		day: "2-digit",
		hour: "2-digit",
		minute: "2-digit",
		second: "2-digit",
		hour12: false,
	});
	const tzParts = tzFormatter.formatToParts(utcDate);
	const tzYear = parseInt(tzParts.find((p) => p.type === "year")?.value || "0");
	const tzMonth =
		parseInt(tzParts.find((p) => p.type === "month")?.value || "0") - 1;
	const tzDay = parseInt(tzParts.find((p) => p.type === "day")?.value || "0");
	const tzHour = parseInt(tzParts.find((p) => p.type === "hour")?.value || "0");
	const tzDate = new Date(Date.UTC(tzYear, tzMonth, tzDay, tzHour, 0, 0));
	const offsetMs = tzDate.getTime() - utcDate.getTime();
	return Math.round(offsetMs / (1000 * 60));
}
function getStartOfDayInTimezone(date: Date = new Date()): Date {
	const dateStr = getDateStringInTimezone(date);
	const [year, month, day] = dateStr.split("-").map(Number);
	const offsetMinutes = getTimezoneOffsetMinutes(TIMEZONE, date);
	const offsetHours = Math.floor(Math.abs(offsetMinutes) / 60);
	const offsetMins = Math.abs(offsetMinutes) % 60;
	const offsetSign = offsetMinutes >= 0 ? "+" : "-";
	const dateTimeStr = `${year}-${String(month).padStart(2, "0")}-${String(
		day
	).padStart(2, "0")}T00:00:00${offsetSign}${String(offsetHours).padStart(
		2,
		"0"
	)}:${String(offsetMins).padStart(2, "0")}`;
	return new Date(dateTimeStr);
}
function getEndOfDayInTimezone(date: Date = new Date()): Date {
	const dateStr = getDateStringInTimezone(date);
	const [year, month, day] = dateStr.split("-").map(Number);
	const offsetMinutes = getTimezoneOffsetMinutes(TIMEZONE, date);
	const offsetHours = Math.floor(Math.abs(offsetMinutes) / 60);
	const offsetMins = Math.abs(offsetMinutes) % 60;
	const offsetSign = offsetMinutes >= 0 ? "+" : "-";
	const dateTimeStr = `${year}-${String(month).padStart(2, "0")}-${String(
		day
	).padStart(2, "0")}T23:59:59.999${offsetSign}${String(offsetHours).padStart(
		2,
		"0"
	)}:${String(offsetMins).padStart(2, "0")}`;
	return new Date(dateTimeStr);
}
function parseDateStringToStartOfDay(dateString: DateString): Date {
	const date = new Date(dateString);
	return getStartOfDayInTimezone(date);
}
function parseDateStringToEndOfDay(dateString: DateString): Date {
	const date = new Date(dateString);
	return getEndOfDayInTimezone(date);
}
export async function getTodayAppointmentCount() {
	const startOfDay = getStartOfDayInTimezone();
	const endOfDay = getEndOfDayInTimezone();
	const count = await prisma.examination.count({
		where: { date: { gte: startOfDay, lte: endOfDay } },
	});
	return count;
}
export const getPaginationExamination = async (
	page: number,
	pageSize: number,
	data:
		| { mode: "all"; phone?: string }
		| { mode: "day"; date: DateString; phone?: string }
) => {
	const phoneFilter = data.phone
		? { parentPhone: data.phone.trim() }
		: undefined;
	let where:
		| { date?: { gte: Date; lte: Date }; parentPhone?: string }
		| undefined;
	if (data.mode === "day") {
		const base = {
			date: {
				gte: parseDateStringToStartOfDay(data.date),
				lte: parseDateStringToEndOfDay(data.date),
			},
		};
		where = phoneFilter ? { ...base, ...phoneFilter } : base;
	} else {
		where = phoneFilter;
	}
	const [total, examinations] = await Promise.all([
		prisma.examination.count({ where }),
		prisma.examination.findMany({
			where,
			orderBy: { date: "desc" },
			skip: (page - 1) * pageSize,
			take: pageSize,
			select: {
				id: true,
				parentName: true,
				parentPhone: true,
				kidName: true,
				kidBirthDate: true,
				kidGender: true,
				date: true,
				status: true,
				type: true,
			},
		}),
	]);
	return { total, examinations };
};
export async function getAllPastExaminationsByPhone(phone: string) {
	return prisma.examination.findMany({
		where: { parentPhone: phone, date: { lt: new Date() } },
		orderBy: { date: "desc" },
		select: {
			id: true,
			parentName: true,
			parentPhone: true,
			kidName: true,
			date: true,
			status: true,
			type: true,
		},
	});
}
export async function getAllFutureExaminationsByPhone(phone: string) {
	return prisma.examination.findMany({
		where: { parentPhone: phone, date: { gt: new Date() } },
		orderBy: { date: "asc" },
		select: {
			id: true,
			parentName: true,
			parentPhone: true,
			kidName: true,
			date: true,
			status: true,
			type: true,
		},
	});
}
export async function getExaminationById(id: string) {
	return prisma.examination.findUnique({ where: { id } });
}

import prisma from "@/lib/prisma";
import { unstable_cache } from "next/cache";
import { getMidnightRevalidateSeconds } from "./utils";
import { DateString } from "@/utils/types/date-string";

const TIMEZONE = process.env.TZ || "Asia/Ho_Chi_Minh";

/**
 * Lấy date string theo format YYYY-MM-DD trong timezone Asia/Ho_Chi_Minh
 */
function getDateStringInTimezone(date: Date = new Date()): string {
	return new Intl.DateTimeFormat("en-CA", {
		timeZone: TIMEZONE,
		year: "numeric",
		month: "2-digit",
		day: "2-digit",
	}).format(date);
}

/**
 * Tính timezone offset (tính bằng phút) cho timezone cụ thể tại một thời điểm
 * Sử dụng cách tính toán chính xác bằng cách so sánh UTC time và timezone time
 */
function getTimezoneOffsetMinutes(timezone: string, date: Date = new Date()): number {
	// Tạo một date test (midnight UTC)
	const testDate = new Date(Date.UTC(2024, 0, 1, 0, 0, 0));
	
	// Format test date trong timezone để lấy offset string
	const parts = new Intl.DateTimeFormat("en-US", {
		timeZone: timezone,
		timeZoneName: "longOffset",
	}).formatToParts(testDate);
	
	const offsetPart = parts.find((p) => p.type === "timeZoneName");
	if (offsetPart) {
		// Format: "GMT+7" hoặc "GMT+07:00" hoặc "GMT+0700"
		const offsetMatch = offsetPart.value.match(/GMT([+-])(\d{1,2}):?(\d{2})?/);
		if (offsetMatch) {
			const sign = offsetMatch[1] === "+" ? 1 : -1;
			const hours = parseInt(offsetMatch[2] || "0");
			const minutes = parseInt(offsetMatch[3] || "0");
			return sign * (hours * 60 + minutes);
		}
	}
	
	// Fallback: Asia/Ho_Chi_Minh là UTC+7 (420 phút)
	// Hoặc tính toán bằng cách so sánh UTC và timezone time
	const utcDate = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), 0, 0, 0));
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
	const tzMonth = parseInt(tzParts.find((p) => p.type === "month")?.value || "0") - 1;
	const tzDay = parseInt(tzParts.find((p) => p.type === "day")?.value || "0");
	const tzHour = parseInt(tzParts.find((p) => p.type === "hour")?.value || "0");
	
	// Tính offset dựa trên sự khác biệt
	const tzDate = new Date(Date.UTC(tzYear, tzMonth, tzDay, tzHour, 0, 0));
	const offsetMs = tzDate.getTime() - utcDate.getTime();
	return Math.round(offsetMs / (1000 * 60));
}

/**
 * Tạo Date object cho start of day (00:00:00) theo timezone Asia/Ho_Chi_Minh
 * Sử dụng cách tính toán chính xác với timezone offset
 */
function getStartOfDayInTimezone(date: Date = new Date()): Date {
	// Lấy date string theo timezone Asia/Ho_Chi_Minh
	const dateStr = getDateStringInTimezone(date);
	
	// Parse thành các phần
	const [year, month, day] = dateStr.split("-").map(Number);
	
	// Tính offset trong phút
	const offsetMinutes = getTimezoneOffsetMinutes(TIMEZONE, date);
	const offsetHours = Math.floor(Math.abs(offsetMinutes) / 60);
	const offsetMins = Math.abs(offsetMinutes) % 60;
	const offsetSign = offsetMinutes >= 0 ? "+" : "-";
	
	// Tạo date string với timezone offset
	// Format: YYYY-MM-DDTHH:mm:ss+HH:MM
	const dateTimeStr = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}T00:00:00${offsetSign}${String(offsetHours).padStart(2, "0")}:${String(offsetMins).padStart(2, "0")}`;
	
	// Parse và trả về Date object (sẽ tự động convert về UTC)
	return new Date(dateTimeStr);
}

/**
 * Lấy end of day (23:59:59.999) theo timezone Asia/Ho_Chi_Minh
 */
function getEndOfDayInTimezone(date: Date = new Date()): Date {
	// Lấy date string theo timezone Asia/Ho_Chi_Minh
	const dateStr = getDateStringInTimezone(date);
	
	// Parse thành các phần
	const [year, month, day] = dateStr.split("-").map(Number);
	
	// Tính offset trong phút
	const offsetMinutes = getTimezoneOffsetMinutes(TIMEZONE, date);
	const offsetHours = Math.floor(Math.abs(offsetMinutes) / 60);
	const offsetMins = Math.abs(offsetMinutes) % 60;
	const offsetSign = offsetMinutes >= 0 ? "+" : "-";
	
	// Tạo date string với timezone offset
	// Format: YYYY-MM-DDTHH:mm:ss.sss+HH:MM
	const dateTimeStr = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}T23:59:59.999${offsetSign}${String(offsetHours).padStart(2, "0")}:${String(offsetMins).padStart(2, "0")}`;
	
	// Parse và trả về Date object (sẽ tự động convert về UTC)
	return new Date(dateTimeStr);
}

/**
 * Parse date string và trả về start of day theo timezone Asia/Ho_Chi_Minh
 */
function parseDateStringToStartOfDay(dateString: DateString): Date {
	const date = new Date(dateString);
	return getStartOfDayInTimezone(date);
}

/**
 * Parse date string và trả về end of day theo timezone Asia/Ho_Chi_Minh
 */
function parseDateStringToEndOfDay(dateString: DateString): Date {
	const date = new Date(dateString);
	return getEndOfDayInTimezone(date);
}

async function _getTodayAppointmentCount() {
	const startOfDay = getStartOfDayInTimezone();
	const endOfDay = getEndOfDayInTimezone();

	const count = await prisma.examination.count({
		where: { date: { gte: startOfDay, lte: endOfDay } },
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

export const getPaginationExamination = async (
	page: number,
	pageSize: number,
	data:
		| { mode: "all" }
		| {
				mode: "day";
				date: DateString;
		  }
) => {
	const where =
		data.mode === "day"
			? {
					date: {
						gte: parseDateStringToStartOfDay(data.date),
						lte: parseDateStringToEndOfDay(data.date),
					},
			  }
			: undefined;

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

export async function getExaminationById(id: string) {
	return prisma.examination.findUnique({ where: { id } });
}

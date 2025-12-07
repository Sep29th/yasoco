"use server";
import prisma from "@/lib/prisma";
import { cacheTag, cacheLife } from "next/cache";
const toNum = (val: bigint | number) => Number(val || 0);
const ONE_WEEK_IN_SECONDS = 7 * 24 * 60 * 60;
function getVietnamRange(
	type: "year" | "month" | "day",
	year: number,
	month?: number,
	dayDate?: Date
) {
	let startVal = new Date();
	let endVal = new Date();
	if (type === "year") {
		const startStr = `${year}-01-01T00:00:00+07:00`;
		const endStr = `${year + 1}-01-01T00:00:00+07:00`;
		startVal = new Date(startStr);
		endVal = new Date(endStr);
	} else if (type === "month" && month) {
		const startM = month.toString().padStart(2, "0");
		const nextMonthVal = month === 12 ? 1 : month + 1;
		const nextYearVal = month === 12 ? year + 1 : year;
		const nextMonthStr = nextMonthVal.toString().padStart(2, "0");
		const startStr = `${year}-${startM}-01T00:00:00+07:00`;
		const endStr = `${nextYearVal}-${nextMonthStr}-01T00:00:00+07:00`;
		startVal = new Date(startStr);
		endVal = new Date(endStr);
	} else if (type === "day" && dayDate) {
		const d = new Date(dayDate);
		const vnDateStr = d.toLocaleDateString("en-CA", {
			timeZone: "Asia/Ho_Chi_Minh",
		});
		startVal = new Date(`${vnDateStr}T00:00:00+07:00`);
		endVal = new Date(startVal.getTime() + 24 * 60 * 60 * 1000);
	}
	return { start: startVal, end: endVal };
}
async function fetchHourlyDataUTC(start: Date, end: Date) {
	return await prisma.$queryRaw<
		Array<{
			utcTime: Date;
			sumExamination: bigint;
			sumService: bigint;
			sumMedSell: bigint;
			sumMedOrig: bigint;
			sumDiscount: bigint;
		}>
	>`
		SELECT 
			DATE_TRUNC('hour', "createdAt") as "utcTime", 
			SUM("examinationFee") as "sumExamination", 
			SUM("serviceFee") as "sumService", 
			SUM("medicineSellingPrice") as "sumMedSell", 
			SUM("medicineOriginalPrice") as "sumMedOrig",
			SUM("totalDiscount") as "sumDiscount"
		FROM "Invoice"
		WHERE "createdAt" >= ${start} AND "createdAt" < ${end}
		GROUP BY DATE_TRUNC('hour', "createdAt")
	`;
}
const createStatsObject = () => ({
	totalExaminationFee: 0,
	totalServiceFee: 0,
	totalMedicineProfit: 0,
	totalDiscount: 0,
	totalRevenue: 0,
});
async function _getAnalyzeYear(year: number) {
	const { start, end } = getVietnamRange("year", year);
	const rawData = await fetchHourlyDataUTC(start, end);
	const months = Array.from({ length: 12 }, (_, i) => ({
		month: i + 1,
		...createStatsObject(),
	}));
	rawData.forEach((row) => {
		const vnDate = new Date(
			row.utcTime.toLocaleString("en-US", { timeZone: "Asia/Ho_Chi_Minh" })
		);
		const monthIndex = vnDate.getMonth();
		const exam = toNum(row.sumExamination);
		const service = toNum(row.sumService);
		const medSell = toNum(row.sumMedSell);
		const medOrig = toNum(row.sumMedOrig);
		const discount = toNum(row.sumDiscount);
		const medProfit = medSell - medOrig;
		months[monthIndex].totalExaminationFee += exam;
		months[monthIndex].totalServiceFee += service;
		months[monthIndex].totalMedicineProfit += medProfit;
		months[monthIndex].totalDiscount += discount;
		months[monthIndex].totalRevenue += exam + service + medProfit - discount;
	});
	const yearTotal = months.reduce(
		(acc, curr) => ({
			totalExaminationFee: acc.totalExaminationFee + curr.totalExaminationFee,
			totalServiceFee: acc.totalServiceFee + curr.totalServiceFee,
			totalMedicineProfit: acc.totalMedicineProfit + curr.totalMedicineProfit,
			totalDiscount: acc.totalDiscount + curr.totalDiscount,
			totalRevenue: acc.totalRevenue + curr.totalRevenue,
		}),
		createStatsObject()
	);
	return { year, stats: yearTotal, breakdown: months };
}
async function _getAnalyzeMonth(year: number, month: number) {
	const { start, end } = getVietnamRange("month", year, month);
	const rawData = await fetchHourlyDataUTC(start, end);
	const daysInMonth = new Date(year, month, 0).getDate();
	const days = Array.from({ length: daysInMonth }, (_, i) => ({
		day: i + 1,
		...createStatsObject(),
	}));
	rawData.forEach((row) => {
		const vnDate = new Date(
			row.utcTime.toLocaleString("en-US", { timeZone: "Asia/Ho_Chi_Minh" })
		);
		const dayIndex = vnDate.getDate() - 1;
		const exam = toNum(row.sumExamination);
		const service = toNum(row.sumService);
		const medSell = toNum(row.sumMedSell);
		const medOrig = toNum(row.sumMedOrig);
		const discount = toNum(row.sumDiscount);
		const medProfit = medSell - medOrig;
		if (days[dayIndex]) {
			days[dayIndex].totalExaminationFee += exam;
			days[dayIndex].totalServiceFee += service;
			days[dayIndex].totalMedicineProfit += medProfit;
			days[dayIndex].totalDiscount += discount;
			days[dayIndex].totalRevenue += exam + service + medProfit - discount;
		}
	});
	const monthTotal = days.reduce(
		(acc, curr) => ({
			totalExaminationFee: acc.totalExaminationFee + curr.totalExaminationFee,
			totalServiceFee: acc.totalServiceFee + curr.totalServiceFee,
			totalMedicineProfit: acc.totalMedicineProfit + curr.totalMedicineProfit,
			totalDiscount: acc.totalDiscount + curr.totalDiscount,
			totalRevenue: acc.totalRevenue + curr.totalRevenue,
		}),
		createStatsObject()
	);
	return { year, month, stats: monthTotal, breakdown: days };
}
async function _getAnalyzeDay(date: Date) {
	const { start, end } = getVietnamRange("day", 0, 0, date);
	const rawData = await fetchHourlyDataUTC(start, end);
	const hours = Array.from({ length: 24 }, (_, i) => ({
		hour: i,
		...createStatsObject(),
	}));
	rawData.forEach((row) => {
		const vnDate = new Date(
			row.utcTime.toLocaleString("en-US", { timeZone: "Asia/Ho_Chi_Minh" })
		);
		const hourIndex = vnDate.getHours();
		const exam = toNum(row.sumExamination);
		const service = toNum(row.sumService);
		const medSell = toNum(row.sumMedSell);
		const medOrig = toNum(row.sumMedOrig);
		const discount = toNum(row.sumDiscount);
		const medProfit = medSell - medOrig;
		if (hours[hourIndex]) {
			hours[hourIndex].totalExaminationFee += exam;
			hours[hourIndex].totalServiceFee += service;
			hours[hourIndex].totalMedicineProfit += medProfit;
			hours[hourIndex].totalDiscount += discount;
			hours[hourIndex].totalRevenue += exam + service + medProfit - discount;
		}
	});
	const dayTotal = hours.reduce(
		(acc, curr) => ({
			totalExaminationFee: acc.totalExaminationFee + curr.totalExaminationFee,
			totalServiceFee: acc.totalServiceFee + curr.totalServiceFee,
			totalMedicineProfit: acc.totalMedicineProfit + curr.totalMedicineProfit,
			totalDiscount: acc.totalDiscount + curr.totalDiscount,
			totalRevenue: acc.totalRevenue + curr.totalRevenue,
		}),
		createStatsObject()
	);
	return { date: start, stats: dayTotal, breakdown: hours };
}
async function cacheAnalyzeYear(year: number) {
	"use cache";
	cacheTag(`analyze-year-${year}`);
	cacheLife({ stale: ONE_WEEK_IN_SECONDS, revalidate: ONE_WEEK_IN_SECONDS });
	return await _getAnalyzeYear(year);
}
async function cacheAnalyzeMonth(year: number, month: number) {
	"use cache";
	cacheTag(`analyze-month-${year}-${month}`);
	cacheLife({ stale: ONE_WEEK_IN_SECONDS, revalidate: ONE_WEEK_IN_SECONDS });
	return await _getAnalyzeMonth(year, month);
}
async function cacheAnalyzeDay(date: Date) {
	"use cache";
	const d = new Date(date);
	const dateKey = d.toLocaleDateString("en-CA", {
		timeZone: "Asia/Ho_Chi_Minh",
	});
	cacheTag(`analyze-day-${dateKey}`);
	cacheLife({ stale: ONE_WEEK_IN_SECONDS, revalidate: ONE_WEEK_IN_SECONDS });
	return await _getAnalyzeDay(date);
}
export async function getRevenueByYear(year: number) {
	const currentYear = new Date().getFullYear();
	if (year < currentYear) {
		return await cacheAnalyzeYear(year);
	}
	return await _getAnalyzeYear(year);
}
export async function getRevenueByMonth(year: number, month: number) {
	const now = new Date();
	const currentYear = now.getFullYear();
	const currentMonth = now.getMonth() + 1;
	const isPastMonth =
		year < currentYear || (year === currentYear && month < currentMonth);
	if (isPastMonth) {
		return await cacheAnalyzeMonth(year, month);
	}
	return await _getAnalyzeMonth(year, month);
}
export async function getRevenueByDay(date: Date) {
	const inputDate = new Date(date);
	const inputStr = inputDate.toLocaleDateString("en-CA", {
		timeZone: "Asia/Ho_Chi_Minh",
	});
	const todayStr = new Date().toLocaleDateString("en-CA", {
		timeZone: "Asia/Ho_Chi_Minh",
	});
	if (inputStr < todayStr) {
		return await cacheAnalyzeDay(date);
	}
	return await _getAnalyzeDay(date);
}

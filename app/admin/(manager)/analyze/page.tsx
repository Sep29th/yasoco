import Link from "next/link";
import {
	getRevenueByDay,
	getRevenueByMonth,
	getRevenueByYear,
} from "@/lib/invoice";
import type {
	AnalysisData,
	DayAnalysisData,
	MonthAnalysisData,
	YearAnalysisData,
} from "./_types/type";
import { RevenueChart } from "./_component/revenue-chart";
import { DateFilter } from "./_component/date-filter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DollarSign, Activity, Pill } from "lucide-react";
type ViewMode = "day" | "month" | "year";
const formatCurrency = (amount: number) => {
	return new Intl.NumberFormat("vi-VN", {
		style: "currency",
		currency: "VND",
	}).format(amount);
};
export default async function AnalyzePage({
	searchParams,
}: {
	searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
	const params = await searchParams;
	const view = (params.view as ViewMode) || "day";
	const now = new Date();
	const dateParam = typeof params.date === "string" ? params.date : null;
	const targetDate = dateParam ? new Date(dateParam) : now;
	const currentDateStr = targetDate.toLocaleDateString("en-CA", {
		timeZone: "Asia/Ho_Chi_Minh",
	});
	const currentYear = targetDate.getFullYear();
	const currentMonth = targetDate.getMonth() + 1;
	let data: AnalysisData;
	let title = "";
	if (view === "year") {
		data = (await getRevenueByYear(currentYear)) as YearAnalysisData;
		title = `Báo cáo Năm ${currentYear}`;
	} else if (view === "month") {
		data = (await getRevenueByMonth(
			currentYear,
			currentMonth
		)) as MonthAnalysisData;
		title = `Báo cáo Tháng ${currentMonth}/${currentYear}`;
	} else {
		data = (await getRevenueByDay(targetDate)) as DayAnalysisData;
		const dateDisplay = targetDate.toLocaleDateString("vi-VN", {
			day: "2-digit",
			month: "2-digit",
			year: "numeric",
		});
		title = `Báo cáo Ngày ${dateDisplay}`;
	}
	const { stats, breakdown } = data;
	return (
		<div className="p-6 max-w-7xl mx-auto space-y-6 bg-gray-50/50 min-h-screen font-sans">
			<div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b pb-6">
				<div>
					<h1 className="text-3xl font-bold tracking-tight text-gray-900">
						{title}
					</h1>
					<p className="text-muted-foreground mt-1 text-sm">
						Theo dõi hiệu suất kinh doanh và dòng tiền.
					</p>
				</div>
				<div className="flex flex-col sm:flex-row gap-3 items-end">
					<DateFilter key={view} currentDate={targetDate} view={view} />
				</div>
			</div>
			<Tabs defaultValue={view} className="w-full">
				<TabsList className="grid w-full max-w-[400px] grid-cols-3">
					<TabsTrigger value="day" asChild>
						<Link href={`?view=day&date=${currentDateStr}`}>Theo Ngày</Link>
					</TabsTrigger>
					<TabsTrigger value="month" asChild>
						<Link href={`?view=month&date=${currentDateStr}`}>Theo Tháng</Link>
					</TabsTrigger>
					<TabsTrigger value="year" asChild>
						<Link href={`?view=year&date=${currentDateStr}`}>Theo Năm</Link>
					</TabsTrigger>
				</TabsList>
			</Tabs>
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
				<Card className="border-l-4 border-l-[#A6CF52] shadow-sm">
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium text-muted-foreground">
							Tổng Doanh Thu
						</CardTitle>
						<DollarSign className="h-4 w-4 text-[#A6CF52]" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold text-gray-900">
							{formatCurrency(stats.totalRevenue)}
						</div>
					</CardContent>
				</Card>
				<Card className="shadow-sm">
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium text-muted-foreground">
							Phí Khám
						</CardTitle>
						<Activity className="h-4 w-4 text-gray-400" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">
							{formatCurrency(stats.totalExaminationFee)}
						</div>
					</CardContent>
				</Card>
				<Card className="shadow-sm">
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium text-muted-foreground">
							Phí Dịch Vụ
						</CardTitle>
						<Activity className="h-4 w-4 text-gray-400" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">
							{formatCurrency(stats.totalServiceFee)}
						</div>
					</CardContent>
				</Card>
				<Card className="shadow-sm">
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium text-muted-foreground">
							Lãi Thuốc
						</CardTitle>
						<Pill className="h-4 w-4 text-[#A6CF52]" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold text-[#A6CF52]">
							{formatCurrency(stats.totalMedicineProfit)}
						</div>
					</CardContent>
				</Card>
			</div>
			<RevenueChart data={breakdown} view={view} />
		</div>
	);
}

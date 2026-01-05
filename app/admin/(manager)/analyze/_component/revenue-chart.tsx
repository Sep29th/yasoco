"use client";
import {
	BarChart,
	Bar,
	XAxis,
	YAxis,
	CartesianGrid,
	Tooltip,
	ResponsiveContainer,
	Legend,
} from "recharts";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {
	HourlyBreakdown,
	DailyBreakdown,
	MonthlyBreakdown,
} from "../_types/type";
import {FileText} from "lucide-react";

type ChartDataItem = HourlyBreakdown | DailyBreakdown | MonthlyBreakdown;

interface ChartProps {
	data: ChartDataItem[];
	view: "day" | "month" | "year";
}

interface RechartsPayloadItem {
	value?: number | string;
	name?: string;
	color?: string;
	dataKey?: string;
	payload?: unknown;
}

interface CustomTooltipProps {
	active?: boolean;
	payload?: RechartsPayloadItem[];
	label?: string;
}

const formatCurrency = (value: number) =>
	new Intl.NumberFormat("vi-VN", {style: "currency", currency: "VND"}).format(
		value
	);

const CustomTooltip = ({active, payload, label}: CustomTooltipProps) => {
	if (active && payload && payload.length) {
		const dataItem = payload[0].payload as ChartDataItem;
		const discount = dataItem.totalDiscount || 0;
		const invoiceCount = dataItem.invoiceCount || 0;
		const grossRevenue = payload.reduce(
			(acc: number, p: RechartsPayloadItem) => {
				return acc + (Number(p.value) || 0);
			},
			0
		);
		const netRevenue = grossRevenue - discount;

		return (
			<div className="bg-white p-3 border border-gray-200 shadow-lg rounded-lg text-sm z-50 min-w-[200px]">
				<p className="font-bold text-gray-700 mb-2">{label}</p>
				{payload.map((entry: RechartsPayloadItem, index: number) => (
					<div key={index} className="flex items-center gap-2 mb-1">
						<div
							className="w-3 h-3 rounded-full"
							style={{backgroundColor: entry.color}}
						/>
						<span className="text-gray-500">{entry.name}:</span>
						<span className="font-medium ml-auto">
							{formatCurrency(Number(entry.value))}
						</span>
					</div>
				))}
				{discount > 0 && (
					<div className="flex items-center gap-2 mb-1 border-t border-dashed border-gray-100 pt-1">
						<div className="w-3 h-3 rounded-full bg-red-400"/>
						<span className="text-gray-500">Giảm giá:</span>
						<span className="font-medium ml-auto text-red-500">
							-{formatCurrency(discount)}
						</span>
					</div>
				)}
				<div className="flex items-center gap-2 mb-1 border-t border-dashed border-gray-100 pt-1">
					<FileText className="w-3 h-3 text-blue-500"/>
					<span className="text-gray-500">Số hóa đơn:</span>
					<span className="font-medium ml-auto text-gray-900">
						{invoiceCount}
					</span>
				</div>
				<div className="border-t border-gray-100 mt-2 pt-2 flex items-center justify-between gap-4">
					<span className="font-bold text-gray-800">Thực thu:</span>
					<span className="font-bold text-[#A6CF52]">
						{formatCurrency(netRevenue)}
					</span>
				</div>
			</div>
		);
	}
	return null;
};

export function RevenueChart({data, view}: ChartProps) {
	const chartData = data.map((item) => {
		let name = "";
		if ("hour" in item) {
			name = `${item.hour}:00`;
		} else if ("day" in item) {
			name = `Ngày ${item.day}`;
		} else if ("month" in item) {
			name = `Tháng ${item.month}`;
		}

		return {
			name,
			examination: item.totalExaminationFee,
			service: item.totalServiceFee,
			totalDiscount: item.totalDiscount,
			invoiceCount: item.invoiceCount,
		};
	});

	return (
		<Card className="h-full shadow-sm">
			<CardHeader>
				<CardTitle>Biểu đồ biến động doanh thu</CardTitle>
			</CardHeader>
			<CardContent>
				<div className="h-[400px] w-full">
					<ResponsiveContainer width="100%" height="100%">
						<BarChart
							data={chartData}
							margin={{top: 20, right: 30, left: 20, bottom: 5}}
						>
							<CartesianGrid
								strokeDasharray="3 3"
								vertical={false}
								stroke="#e5e7eb"
							/>
							<XAxis
								dataKey="name"
								stroke="#888888"
								fontSize={12}
								tickLine={false}
								axisLine={false}
							/>
							<YAxis
								stroke="#888888"
								fontSize={12}
								tickLine={false}
								axisLine={false}
								tickFormatter={(value) => {
									if (value >= 1000000) return `${value / 1000000}M`;
									if (value >= 1000) return `${value / 1000}K`;
									return value;
								}}
							/>
							<Tooltip
								content={<CustomTooltip/>}
								cursor={{fill: "transparent"}}
							/>
							<Legend wrapperStyle={{paddingTop: "20px"}}/>
							<Bar
								name="Phí Khám"
								dataKey="examination"
								stackId="a"
								fill="#94a3b8"
								radius={[0, 0, 0, 0]}
							/>
							<Bar
								name="Phí Dịch Vụ"
								dataKey="service"
								stackId="a"
								fill="#64748b"
								radius={[4, 4, 0, 0]}
							/>
						</BarChart>
					</ResponsiveContainer>
				</div>
			</CardContent>
		</Card>
	);
}
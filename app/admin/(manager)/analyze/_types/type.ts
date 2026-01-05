export interface RevenueStats {
	totalExaminationFee: number;
	totalServiceFee: number;
	totalDiscount: number;
	totalRevenue: number;
	invoiceCount: number;
}

export interface HourlyBreakdown extends RevenueStats {
	hour: number;
}

export interface DailyBreakdown extends RevenueStats {
	day: number;
}

export interface MonthlyBreakdown extends RevenueStats {
	month: number;
}

export interface DayAnalysisData {
	date: Date;
	stats: RevenueStats;
	breakdown: HourlyBreakdown[];
}

export interface MonthAnalysisData {
	year: number;
	month: number;
	stats: RevenueStats;
	breakdown: DailyBreakdown[];
}

export interface YearAnalysisData {
	year: number;
	stats: RevenueStats;
	breakdown: MonthlyBreakdown[];
}

export type AnalysisData =
	| DayAnalysisData
	| MonthAnalysisData
	| YearAnalysisData;
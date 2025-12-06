"use client";
import { useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { useMemo, useState } from "react";
interface DateFilterProps {
	currentDate: Date;
	view: "day" | "month" | "year";
}
const getFormattedValue = (date: Date, view: "day" | "month" | "year") => {
	const vnDate = new Date(
		date.toLocaleString("en-US", { timeZone: "Asia/Ho_Chi_Minh" })
	);
	const yyyy = vnDate.getFullYear();
	const mm = String(vnDate.getMonth() + 1).padStart(2, "0");
	const dd = String(vnDate.getDate()).padStart(2, "0");
	if (view === "year") {
		return String(yyyy);
	} else if (view === "month") {
		return `${yyyy}-${mm}`;
	} else {
		return `${yyyy}-${mm}-${dd}`;
	}
};
export function DateFilter({ currentDate, view }: DateFilterProps) {
	const router = useRouter();
	const searchParams = useSearchParams();
	const computedValue = useMemo(
		() => getFormattedValue(currentDate, view),
		[currentDate, view]
	);
	const [inputValue, setInputValue] = useState(computedValue);
	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const newValue = e.target.value;
		setInputValue(newValue);
		if (!newValue) return;
		const params = new URLSearchParams(searchParams.toString());
		params.set("view", view);
		let dateParam = newValue;
		if (view === "year") {
			if (newValue.length < 4) return;
			dateParam = `${newValue}-01-01`;
		} else if (view === "month") {
			if (newValue.length < 7) return;
			dateParam = `${newValue}-01`;
		}
		params.set("date", dateParam);
		router.replace(`?${params.toString()}`);
	};
	if (view === "year") {
		return (
			<Input
				type="number"
				min="2000"
				max="2100"
				value={inputValue}
				onChange={handleChange}
				className="w-[160px] bg-white"
				placeholder="Chọn năm"
			/>
		);
	}
	if (view === "month") {
		return (
			<Input
				type="month"
				value={inputValue}
				onChange={handleChange}
				className="w-[180px] bg-white"
			/>
		);
	}
	return (
		<Input
			type="date"
			value={inputValue}
			onChange={handleChange}
			className="w-[160px] bg-white"
		/>
	);
}

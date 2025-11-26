"use client";
import * as React from "react";
import { format, parse } from "date-fns";
import { vi } from "date-fns/locale";
import { CalendarIcon } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { DateString } from "@/utils/types/date-string";
type PropsType = { date?: string };
export function DatePickerFilter({ date: dateString }: PropsType) {
	const router = useRouter();
	const searchParams = useSearchParams();
	const [open, setOpen] = React.useState(false);
	const date = React.useMemo(() => {
		if (!dateString) return undefined;
		return parse(dateString, "yyyy-MM-dd", new Date());
	}, [dateString]);
	const onSelect = (newDate: Date | undefined) => {
		const params = new URLSearchParams(searchParams.toString());
		if (newDate) {
			const formattedDate = format(newDate, "yyyy-MM-dd") as DateString;
			params.set("date", formattedDate);
		} else {
			params.delete("date");
		}
		params.delete("page");
		setOpen(false);
		router.push(`?${params.toString()}`);
	};
	return (
		<Popover open={open} onOpenChange={setOpen}>
			<PopoverTrigger asChild>
				<Button
					variant={"outline"}
					className={cn(
						"w-[135px] justify-start text-left font-normal cursor-pointer",
						!date && "text-muted-foreground"
					)}
				>
					<CalendarIcon className="mr-2 h-4 w-4" />
					{date ? format(date, "P", { locale: vi }) : <span>Chọn ngày</span>}
				</Button>
			</PopoverTrigger>
			<PopoverContent className="w-auto p-0" align="end">
				<Calendar
					mode="single"
					selected={date}
					onSelect={onSelect}
					autoFocus
					locale={vi}
					captionLayout="dropdown"
				/>
			</PopoverContent>
		</Popover>
	);
}

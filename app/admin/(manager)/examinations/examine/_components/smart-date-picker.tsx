"use client";

import { parseDate } from "chrono-node";
import { format, isValid, parse } from "date-fns";
import { CalendarIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { ChangeEvent, useState } from "react";

interface SmartDatePickerProps {
	value?: Date;
	onChange: (date: Date | undefined) => void;
	disabled?: boolean;
	placeholder?: string;
}

export function SmartDatePicker({
	value,
	onChange,
	disabled,
	placeholder = "DD/MM/YYYY",
}: SmartDatePickerProps) {
	const [open, setOpen] = useState(false);
	const [inputValue, setInputValue] = useState("");
	const [isEditing, setIsEditing] = useState(false);

	const displayValue = isEditing
		? inputValue
		: value && isValid(value)
		? format(value, "dd/MM/yyyy")
		: "";

	const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
		const text = e.target.value;
		setInputValue(text);
		setIsEditing(true);

		if (text.trim() === "") {
			onChange(undefined);
			return;
		}

		// 1. Ưu tiên xử lý dạng số viết liền (DDMMYYYY hoặc DDMMYY)
		// Kiểm tra xem text có phải chỉ toàn số không
		if (/^\d+$/.test(text)) {
			let parsed: Date | undefined;
			if (text.length === 8) {
				parsed = parse(text, "ddMMyyyy", new Date());
			} else if (text.length === 6) {
				parsed = parse(text, "ddMMyy", new Date());
			}
			if (parsed && isValid(parsed)) {
				onChange(parsed);
				return;
			}
		}
		const parsedDate = parseDate(text);
		if (parsedDate) {
			onChange(parsedDate);
		}
	};

	const handleCalendarSelect = (date: Date | undefined) => {
		setOpen(false);
		onChange(date);
		setIsEditing(false);
		setInputValue("");
	};

	const handleBlur = () => {
		setIsEditing(false);
		setInputValue("");
	};

	const handleFocus = () => {
		setIsEditing(true);
		setInputValue(displayValue);
	};

	return (
		<div className="relative flex items-center w-full">
			<Input
				value={displayValue}
				onChange={handleInputChange}
				onBlur={handleBlur}
				onFocus={handleFocus}
				placeholder={placeholder}
				disabled={disabled}
				className={cn(
					"bg-background pr-10 w-full",
					!value && "text-muted-foreground"
				)}
				onKeyDown={(e) => {
					if (e.key === "ArrowDown") {
						e.preventDefault();
						setOpen(true);
					}
				}}
			/>
			<Popover open={open} onOpenChange={setOpen}>
				<PopoverTrigger asChild disabled={disabled}>
					<Button
						variant="ghost"
						size="icon"
						className="absolute right-0 top-0 h-full w-10 px-3 text-muted-foreground hover:bg-transparent"
						type="button"
					>
						<CalendarIcon className="size-4 opacity-50" />
						<span className="sr-only">Open calendar</span>
					</Button>
				</PopoverTrigger>
				<PopoverContent className="w-auto p-0" align="end">
					<Calendar
						mode="single"
						selected={value}
						onSelect={handleCalendarSelect}
						captionLayout="dropdown"
						startMonth={new Date(1900, 0)}
						endMonth={new Date(new Date().getFullYear(), new Date().getMonth())}
						disabled={(date) =>
							date > new Date() || date < new Date("1900-01-01")
						}
					/>
				</PopoverContent>
			</Popover>
		</div>
	);
}

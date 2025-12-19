"use client";

import * as React from "react";
import { X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
	Command,
	CommandGroup,
	CommandItem,
	CommandList,
} from "@/components/ui/command";
import { Command as CommandPrimitive } from "cmdk";
import { getContrastYIQ } from "@/utils/contrast-yiq";

type Option = {
	name: string;
	id: string;
	color: string;
};

interface MultiSelectProps {
	options: Option[];
	value?: string[];
	onChange: (value: string[]) => void;
	onBlur?: () => void;
	placeholder?: string;
	className?: string;
	disabled?: boolean;
}

export const MultiSelect = React.forwardRef<HTMLInputElement, MultiSelectProps>(
	(
		{
			options,
			value = [],
			onChange,
			onBlur,
			placeholder = "Select items...",
			className,
			disabled,
		},
		ref
	) => {
		const inputRef = React.useRef<HTMLInputElement>(null);
		const [open, setOpen] = React.useState(false);
		const [inputValue, setInputValue] = React.useState("");

		React.useImperativeHandle(ref, () => inputRef.current as HTMLInputElement);

		const handleUnselect = React.useCallback(
			(itemValue: string) => {
				onChange(value.filter((s) => s !== itemValue));
			},
			[onChange, value]
		);

		const handleKeyDown = React.useCallback(
			(e: React.KeyboardEvent<HTMLDivElement>) => {
				const input = inputRef.current;
				if (input) {
					if (e.key === "Delete" || e.key === "Backspace") {
						if (input.value === "" && value.length > 0) {
							handleUnselect(value[value.length - 1]);
						}
					}
					if (e.key === "Escape") {
						input.blur();
					}
				}
			},
			[handleUnselect, value]
		);

		const selectables = options.filter((option) => !value.includes(option.id));

		return (
			<Command
				onKeyDown={handleKeyDown}
				className={`overflow-visible bg-transparent ${className}`}
			>
				<div
					className={`group border border-input px-3 py-2 text-sm ring-offset-background rounded-md focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 ${
						disabled ? "opacity-50 cursor-not-allowed" : ""
					}`}
				>
					<div className="flex gap-1 flex-wrap">
						{value.map((selectedValue) => {
							const option = options.find((o) => o.id === selectedValue);
							const textColor = option
								? getContrastYIQ(option.color)
								: "inherit";

							return (
								<Badge
									key={selectedValue}
									className="border-transparent hover:opacity-90 transition-opacity"
									style={{
										backgroundColor: option?.color,
										color: textColor,
									}}
								>
									{option?.name || selectedValue}
									<button
										type="button"
										className="ml-1 ring-offset-background rounded-full outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 opacity-70 hover:opacity-100"
										onKeyDown={(e) => {
											if (e.key === "Enter") {
												handleUnselect(selectedValue);
											}
										}}
										onMouseDown={(e) => {
											e.preventDefault();
											e.stopPropagation();
										}}
										onClick={() => handleUnselect(selectedValue)}
										disabled={disabled}
									>
										<X className="h-3 w-3" style={{ color: "currentColor" }} />
									</button>
								</Badge>
							);
						})}
						<CommandPrimitive.Input
							ref={inputRef}
							value={inputValue}
							onValueChange={setInputValue}
							onBlur={() => {
								setOpen(false);
								onBlur?.();
							}}
							onFocus={() => setOpen(true)}
							placeholder={placeholder}
							className="ml-2 bg-transparent outline-none placeholder:text-muted-foreground flex-1"
							disabled={disabled}
						/>
					</div>
				</div>
				<div className="relative mt-2">
					{open && selectables.length > 0 ? (
						<div className="absolute top-0 z-10 w-full rounded-md border bg-popover text-popover-foreground shadow-md outline-none animate-in">
							<CommandList>
								<CommandGroup className="h-full overflow-auto max-h-[200px]">
									{selectables.map((option) => (
										<CommandItem
											key={option.id}
											onSelect={() => {
												setInputValue("");
												onChange([...value, option.id]);
												inputRef.current?.focus();
											}}
											onMouseDown={(e) => {
												e.preventDefault();
												e.stopPropagation();
											}}
											className="cursor-pointer flex items-center gap-2"
										>
											<div
												className="h-3 w-3 rounded-full border border-muted-foreground/30"
												style={{ backgroundColor: option.color }}
											/>
											{option.name}
										</CommandItem>
									))}
								</CommandGroup>
							</CommandList>
						</div>
					) : null}
				</div>
			</Command>
		);
	}
);

MultiSelect.displayName = "MultiSelect";

"use client";
import { useState } from "react";
import { Check, ChevronsUpDown, Minus, Plus, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
	Command,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
} from "@/components/ui/command";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
type SelectorItem = {
	id: string;
	name: string;
	price: number;
	unit?: string;
	description?: string;
};
type SelectedItem = SelectorItem & { quantity: number };
type PropsType = {
	options: SelectorItem[];
	value?: SelectedItem[];
	onChange?: (value: SelectedItem[]) => void;
	placeholder?: string;
	disabled?: boolean;
};
export default function Selector({
	options = [],
	value,
	onChange,
	placeholder = "Chọn mục...",
	disabled = false,
}: PropsType) {
	const [open, setOpen] = useState(false);
	const [internalItems, setInternalItems] = useState<SelectedItem[]>([]);
	const items = value || internalItems;
	const setItems = (newItems: SelectedItem[]) => {
		if (onChange) onChange(newItems);
		else setInternalItems(newItems);
	};
	const handleSelect = (option: SelectorItem) => {
		setOpen(false);
		const exists = items.find((i) => i.id === option.id);
		if (exists) {
			updateQuantity(option.id, 1);
		} else {
			setItems([...items, { ...option, quantity: 1 }]);
		}
	};
	const updateQuantity = (id: string, delta: number) => {
		setItems(
			items.map((item) =>
				item.id === id
					? { ...item, quantity: Math.max(1, item.quantity + delta) }
					: item
			)
		);
	};
	const removeItem = (id: string) => {
		setItems(items.filter((item) => item.id !== id));
	};
	return (
		<div className={cn("w-full space-y-2", disabled && "opacity-80")}>
			<Popover open={open} onOpenChange={setOpen}>
				<PopoverTrigger asChild>
					<Button
						variant="outline"
						role="combobox"
						aria-expanded={open}
						disabled={disabled}
						className="w-full justify-between font-normal px-3 disabled:cursor-not-allowed disabled:opacity-50"
					>
						<span className="truncate text-muted-foreground">
							{placeholder}
						</span>
						<ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
					</Button>
				</PopoverTrigger>
				{!disabled && (
					<PopoverContent
						className="w-(--radix-popover-trigger-width) p-0"
						align="start"
					>
						<Command>
							<CommandInput placeholder="Tìm kiếm..." />
							<CommandList>
								<CommandEmpty>Không tìm thấy.</CommandEmpty>
								<CommandGroup>
									{options.map((option) => (
										<CommandItem
											key={option.id}
											value={option.name}
											onSelect={() => handleSelect(option)}
											className="cursor-pointer"
										>
											<Check
												className={cn(
													"mr-2 h-4 w-4",
													items.some((i) => i.id === option.id)
														? "opacity-100"
														: "opacity-0"
												)}
											/>
											<div className="flex flex-col text-sm">
												<span>{option.name}</span>
												{option.description && (
													<span className="text-xs text-muted-foreground italic">
														{option.description}
													</span>
												)}
												{option.price && (
													<span className="text-xs font-medium text-[#A6CF52]">
														{option.price.toLocaleString()}đ
														{option.unit && ` / ${option.unit}`}
													</span>
												)}
											</div>
										</CommandItem>
									))}
								</CommandGroup>
							</CommandList>
						</Command>
					</PopoverContent>
				)}
			</Popover>
			<div
				className={cn(
					"flex flex-col gap-2 border rounded-md p-2 bg-slate-50 overflow-y-auto custom-scrollbar",
					"h-[235px]",
					disabled && "bg-gray-100"
				)}
			>
				{items.length === 0 ? (
					<div className="h-full flex items-center justify-center text-sm text-gray-400 italic select-none">
						Chưa có mục nào được chọn
					</div>
				) : (
					items.map((item) => (
						<div
							key={item.id}
							className="flex items-center justify-between gap-2 bg-white border p-2 rounded shadow-sm text-sm shrink-0"
						>
							<div className="flex-1 min-w-0">
								<div
									className="font-medium truncate text-slate-700"
									title={item.name}
								>
									{item.name}
								</div>
								{item.description && (
									<div
										className="text-xs text-gray-400 truncate italic"
										title={item.description}
									>
										{item.description}
									</div>
								)}
								{item.price && (
									<div className="text-xs text-[#A6CF52] font-medium mt-0.5">
										{(item.price * item.quantity).toLocaleString()}đ
										{item.unit && (
											<span className="text-gray-500 ml-1">
												({item.quantity} {item.unit})
											</span>
										)}
									</div>
								)}
							</div>
							<div
								className={cn(
									"flex items-center border rounded bg-white shrink-0",
									disabled && "opacity-50"
								)}
							>
								<button
									type="button"
									onClick={() => updateQuantity(item.id, -1)}
									disabled={disabled}
									className="px-2 py-1 hover:bg-gray-100 border-r disabled:cursor-not-allowed cursor-pointer"
								>
									<Minus className="h-3 w-3" />
								</button>
								<span className="px-2 font-semibold text-xs min-w-[29px] text-center text-slate-700">
									{item.quantity}
								</span>
								<button
									type="button"
									onClick={() => updateQuantity(item.id, 1)}
									disabled={disabled}
									className="px-2 py-1 hover:bg-gray-100 border-l disabled:cursor-not-allowed cursor-pointer"
								>
									<Plus className="h-3 w-3" />
								</button>
							</div>
							<button
								type="button"
								onClick={() => removeItem(item.id)}
								disabled={disabled}
								className="text-gray-400 hover:text-red-500 p-1 disabled:cursor-not-allowed disabled:hover:text-gray-400 shrink-0 cursor-pointer"
							>
								<X className="h-4 w-4" />
							</button>
						</div>
					))
				)}
			</div>
		</div>
	);
}

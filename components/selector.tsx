"use client";
import { useState, useRef, useEffect } from "react";
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
import { Input } from "./ui/input";
import { FormControl, FormField, FormItem } from "./ui/form";
import { UseFormReturn } from "react-hook-form";
import { FormValues } from "@/app/admin/(manager)/examinations/examine/_schemas/form-schema";
type SelectorItem = {
	id: string;
	name: string;
	price?: number;
	unit?: string;
	description?: string;
};
type SelectedItem = SelectorItem & { quantity: number; dosage?: string };
type PropsType = {
	options: SelectorItem[];
	name: "services" | "medicines";
	form: UseFormReturn<FormValues, unknown, FormValues>;
	value?: SelectedItem[];
	onChange?: (value: SelectedItem[]) => void;
	placeholder?: string;
	disabled?: boolean;
	needInput?: boolean;
};
export default function Selector({
	options = [],
	value,
	onChange,
	placeholder = "Chọn mục...",
	disabled = false,
	needInput,
	name,
	form,
}: PropsType) {
	const [open, setOpen] = useState(false);
	const [internalItems, setInternalItems] = useState<SelectedItem[]>([]);
	const [searchValue, setSearchValue] = useState("");
	const commandListRef = useRef<HTMLDivElement>(null);
	const items = value || internalItems;
	useEffect(() => {
		if (commandListRef.current) {
			commandListRef.current.scrollTop = 0;
		}
	}, [searchValue]);
	const setItems = (newItems: SelectedItem[]) => {
		if (onChange) onChange(newItems);
		else setInternalItems(newItems);
	};
	const handleSelect = (option: SelectorItem) => {
		setOpen(false);
		setSearchValue("");
		const exists = items.find((i) => i.id === option.id);
		if (exists) {
			updateQuantity(option.id, 1);
		} else {
			const newItem: SelectedItem = { ...option, quantity: 1 };
			if (name === "medicines") newItem.dosage = "";
			setItems([...items, newItem]);
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
	const updateNote = (id: string, newNote: string) => {
		setItems(
			items.map((item) =>
				item.id === id ? { ...item, dosage: newNote } : item
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
						<Command shouldFilter={true}>
							<CommandInput
								placeholder="Tìm kiếm..."
								value={searchValue}
								onValueChange={setSearchValue}
							/>
							<CommandList
								ref={commandListRef}
								className="max-h-[300px] overflow-y-auto"
							>
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
												<span className="text-xs font-medium text-[#A6CF52]">
													{option.price && option.price.toLocaleString()}
													{option.unit &&
														(option.price
															? `đ / ${option.unit}`
															: `${option.unit}`)}
												</span>
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
					items.map((item, idx) => (
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
								<div className="text-xs text-[#A6CF52] font-medium mt-0.5">
									{item.price &&
										`${(item.price * item.quantity).toLocaleString()}đ`}
									{item.unit && (
										<span className="text-xs font-medium text-[#A6CF52]">
											{item.quantity} {item.unit}
										</span>
									)}
								</div>
							</div>
							{needInput && (
								<>
									{name === "medicines" && (
										<FormField
											control={form.control}
											name={`medicines.${idx}.dosage`}
											render={() => (
												<FormItem className="flex-2">
													<FormControl>
														<Input
															className={cn(
																"w-full",
																disabled && "cursor-not-allowed"
															)}
															type="text"
															value={item.dosage || ""}
															onChange={(e) =>
																updateNote(item.id, e.target.value)
															}
															disabled={disabled}
															placeholder="Liều dùng..."
														/>
													</FormControl>
												</FormItem>
											)}
										/>
									)}
								</>
							)}
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

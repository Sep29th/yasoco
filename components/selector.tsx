"use client";
import {useState, useRef, useEffect} from "react";
import {
	Check,
	ChevronsUpDown,
	Minus,
	Plus,
	X,
	NotebookPen,
	Hash,
	AlignLeft,
} from "lucide-react";
import {cn} from "@/lib/utils";
import {Button} from "@/components/ui/button";
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
import {Input} from "./ui/input";
import {FormControl, FormField, FormItem} from "./ui/form";
import {UseFormReturn} from "react-hook-form";
import {FormValues} from "@/app/admin/(manager)/examinations/examine/_schemas/form-schema";
import {useDebounce} from "@/lib/hooks/use-debounce";
import {DosageTemplate} from "@/lib/generated/prisma";

function removeAccents(str: string) {
	return str
		.normalize("NFD")
		.replace(/[\u0300-\u036f]/g, "")
		.replace(/đ/g, "d")
		.replace(/Đ/g, "D")
		.toLowerCase();
}

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
	suggestions?: DosageTemplate[];
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
																	 suggestions = [],
																 }: PropsType) {
	const [open, setOpen] = useState(false);
	const [internalItems, setInternalItems] = useState<SelectedItem[]>([]);
	const [inputValue, setInputValue] = useState("");
	const [quantityInputs, setQuantityInputs] = useState<Record<string, string>>({});

	const [notebookOpen, setNotebookOpen] = useState<Record<string, boolean>>({});

	const [inlineOpenId, setInlineOpenId] = useState<string | null>(null);
	const [inlineQuery, setInlineQuery] = useState("");
	const [selectedIndex, setSelectedIndex] = useState(0);

	const debouncedSearch = useDebounce(inputValue, 300);
	const commandListRef = useRef<HTMLDivElement>(null);
	const suggestionListRef = useRef<HTMLDivElement>(null);

	const items = value || internalItems;
	const setItems = (newItems: SelectedItem[]) => {
		if (onChange) onChange(newItems);
		else setInternalItems(newItems);
	};

	const filteredOptions = options.filter((option) => {
		if (!debouncedSearch) return true;
		const search = removeAccents(debouncedSearch);
		const name = removeAccents(option.name);
		const desc = option.description ? removeAccents(option.description) : "";
		return name.includes(search) || desc.includes(search);
	});

	const filteredSuggestions = suggestions.filter((s) => {
		if (!inlineQuery) return true;
		const search = removeAccents(inlineQuery);
		return (
			removeAccents(s.shortcut).includes(search) ||
			removeAccents(s.content).includes(search)
		);
	});

	useEffect(() => {
		if (commandListRef.current) {
			commandListRef.current.scrollTo({top: 0, behavior: "smooth"});
		}
	}, [debouncedSearch]);

	useEffect(() => {
		setSelectedIndex(0);
	}, [inlineQuery, inlineOpenId]);

	useEffect(() => {
		if (suggestionListRef.current) {
			const activeItem = suggestionListRef.current.children[selectedIndex] as HTMLElement;
			if (activeItem) {
				activeItem.scrollIntoView({block: "nearest"});
			}
		}
	}, [selectedIndex]);


	const handleSelect = (option: SelectorItem) => {
		setOpen(false);
		const exists = items.find((i) => i.id === option.id);
		if (exists) {
			updateQuantity(option.id, 1);
		} else {
			const newItem: SelectedItem = {...option, quantity: 1};
			if (name === "medicines") newItem.dosage = "";
			setItems([...items, newItem]);
			setQuantityInputs((prev) => ({...prev, [option.id]: "1"}));
		}
	};

	const updateQuantity = (id: string, delta: number) => {
		setItems(
			items.map((item) => {
				if (item.id === id) {
					const newQuantity = Math.max(1, item.quantity + delta);
					setQuantityInputs((prev) => ({...prev, [id]: String(newQuantity)}));
					return {...item, quantity: newQuantity};
				}
				return item;
			})
		);
	};

	const handleQuantityInputChange = (id: string, value: string) => {
		if (value === "" || /^\d+$/.test(value)) {
			setQuantityInputs((prev) => ({...prev, [id]: value}));
		}
	};

	const handleQuantityInputBlur = (id: string) => {
		const inputVal = quantityInputs[id] || "";
		const numValue = parseInt(inputVal, 10);
		if (!inputVal || isNaN(numValue) || numValue < 1) {
			setItems(items.map((item) => (item.id === id ? {...item, quantity: 1} : item)));
			setQuantityInputs((prev) => ({...prev, [id]: "1"}));
		} else {
			setItems(items.map((item) => (item.id === id ? {...item, quantity: numValue} : item)));
			setQuantityInputs((prev) => ({...prev, [id]: String(numValue)}));
		}
	};

	const removeItem = (id: string) => {
		setItems(items.filter((item) => item.id !== id));
		setQuantityInputs((prev) => {
			const newInputs = {...prev};
			delete newInputs[id];
			return newInputs;
		});
	};

	const updateNote = (id: string, newNote: string) => {
		setItems(items.map((item) => (item.id === id ? {...item, dosage: newNote} : item)));
	};

	const selectSuggestion = (itemId: string, suggestion: DosageTemplate, isInline: boolean) => {
		const currentItem = items.find((i) => i.id === itemId);
		if (!currentItem) return;

		let newDosage = currentItem.dosage || "";

		if (isInline) {
			const triggerMatch = newDosage.match(/@([^@]*)$/);
			if (triggerMatch) {
				newDosage = newDosage.slice(0, -triggerMatch[0].length) + suggestion.content;
			} else {
				newDosage += suggestion.content;
			}
			setInlineOpenId(null);
		} else {
			newDosage = suggestion.content;
			setNotebookOpen((prev) => ({...prev, [itemId]: false}));
		}

		updateNote(itemId, newDosage);
	};

	const handleDosageChange = (id: string, val: string) => {
		if (val.endsWith(" ")) {
			const match = val.match(/@([\w\d]+)\s$/);
			if (match) {
				const shortcutKey = match[1];
				const found = suggestions.find(
					(s) => s.shortcut.toLowerCase() === shortcutKey.toLowerCase()
				);
				if (found) {
					const expanded = val.slice(0, -match[0].length) + found.content + " ";
					updateNote(id, expanded);
					setInlineOpenId(null);
					return;
				}
			}
		}

		updateNote(id, val);

		const triggerMatch = val.match(/@([^@]*)$/);
		if (triggerMatch) {
			setInlineOpenId(id);
			setInlineQuery(triggerMatch[1]);
		} else {
			setInlineOpenId(null);
			setInlineQuery("");
		}
	};

	const handleInputKeyDown = (e: React.KeyboardEvent, id: string) => {
		if (inlineOpenId === id && filteredSuggestions.length > 0) {
			if (e.key === "ArrowDown") {
				e.preventDefault();
				setSelectedIndex((prev) => (prev + 1) % filteredSuggestions.length);
			} else if (e.key === "ArrowUp") {
				e.preventDefault();
				setSelectedIndex((prev) =>
					prev - 1 < 0 ? filteredSuggestions.length - 1 : prev - 1
				);
			} else if (e.key === "Enter" || e.key === "Tab") {
				e.preventDefault();
				selectSuggestion(id, filteredSuggestions[selectedIndex], true);
			} else if (e.key === "Escape") {
				setInlineOpenId(null);
			}
		}
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
						<span className="truncate text-muted-foreground">{placeholder}</span>
						<ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50"/>
					</Button>
				</PopoverTrigger>
				{!disabled && (
					<PopoverContent className="w-(--radix-popper-anchor-width) p-0" align="start">
						<Command shouldFilter={false}>
							<CommandInput
								placeholder="Tìm kiếm..."
								value={inputValue}
								onValueChange={setInputValue}
							/>
							<CommandList ref={commandListRef} className="max-h-[300px] overflow-y-auto scroll-smooth">
								{filteredOptions.length === 0 ? (
									<CommandEmpty>Không tìm thấy.</CommandEmpty>
								) : (
									<CommandGroup>
										{filteredOptions.map((option) => (
											<CommandItem
												key={option.id}
												value={option.name}
												onSelect={() => handleSelect(option)}
												className="cursor-pointer"
											>
												<Check
													className={cn(
														"mr-2 h-4 w-4",
														items.some((i) => i.id === option.id) ? "opacity-100" : "opacity-0"
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
														{option.unit && (option.price ? `đ / ${option.unit}` : `${option.unit}`)}
                          </span>
												</div>
											</CommandItem>
										))}
									</CommandGroup>
								)}
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
								<div className="font-medium truncate text-slate-700" title={item.name}>
									{item.name}
								</div>
								{item.description && (
									<div className="text-xs text-gray-400 truncate italic" title={item.description}>
										{item.description}
									</div>
								)}
								<div className="text-xs text-[#A6CF52] font-medium mt-0.5">
									{item.price && `${(item.price * item.quantity).toLocaleString()}đ`}
									{item.unit && (
										<span className="text-xs font-medium text-[#A6CF52]">
                      {item.quantity} {item.unit}
                    </span>
									)}
								</div>
							</div>
							{needInput && name === "medicines" && (
								<FormField
									control={form.control}
									name={`medicines.${idx}.dosage`}
									render={() => (
										<FormItem className="flex-2 min-w-[120px]">
											<div className="flex items-center gap-1">
												<Popover
													open={inlineOpenId === item.id && filteredSuggestions.length > 0}
													onOpenChange={(isOpen) => {
														if (!isOpen) setInlineOpenId(null);
													}}
												>
													<PopoverTrigger asChild>
														<FormControl>
															<Input
																className={cn("w-full h-9", disabled && "cursor-not-allowed")}
																type="text"
																value={item.dosage || ""}
																onChange={(e) => handleDosageChange(item.id, e.target.value)}
																onKeyDown={(e) => handleInputKeyDown(e, item.id)}
																disabled={disabled}
																placeholder="Liều dùng (gõ @)..."
																autoComplete="off"
															/>
														</FormControl>
													</PopoverTrigger>
													<PopoverContent
														className="w-(--radix-popper-anchor-width) p-1"
														align="start"
														onOpenAutoFocus={(e) => e.preventDefault()}
													>
														{filteredSuggestions.length === 0 ? (
															<div className="py-6 text-center text-sm text-muted-foreground">
																Không có mẫu phù hợp.
															</div>
														) : (
															<div className="max-h-[200px] overflow-y-auto" ref={suggestionListRef}>
																<div className="px-2 py-1.5 text-xs font-medium text-muted-foreground">
																	Gợi ý nhanh
																</div>
																{filteredSuggestions.map((sugg, i) => (
																	<div
																		key={sugg.id}
																		onClick={() => selectSuggestion(item.id, sugg, true)}
																		className={cn(
																			"relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none",
																			i === selectedIndex
																				? "bg-accent text-accent-foreground"
																				: "hover:bg-accent hover:text-accent-foreground"
																		)}
																	>
																		<div className="flex flex-col w-full">
                                                <span className="font-medium text-sm flex items-center gap-2">
                                                    <AlignLeft className="h-3 w-3 text-muted-foreground"/>
																									{sugg.content}
                                                </span>
																			<span className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                                                    <Hash className="h-3 w-3"/>
																				{sugg.shortcut}
                                                </span>
																		</div>
																	</div>
																))}
															</div>
														)}
													</PopoverContent>
												</Popover>
												<Popover
													open={notebookOpen[item.id] || false}
													onOpenChange={(isOpen) =>
														setNotebookOpen((prev) => ({...prev, [item.id]: isOpen}))
													}
												>
													<PopoverTrigger asChild>
														<Button
															variant="ghost"
															size="icon"
															className="h-9 w-9 shrink-0 text-slate-500 hover:text-[#A6CF4E]"
															disabled={disabled}
															title="Chọn liều dùng mẫu"
														>
															<NotebookPen className="h-4 w-4"/>
														</Button>
													</PopoverTrigger>
													<PopoverContent className="w-[400px] p-0" align="end">
														<Command>
															<CommandInput placeholder="Tìm mẫu hoặc shortcut..."/>
															<CommandList>
																<CommandEmpty>Không có mẫu này.</CommandEmpty>
																<CommandGroup heading="Danh sách mẫu">
																	{suggestions.map((sugg) => (
																		<CommandItem
																			key={sugg.id}
																			value={sugg.content + " " + sugg.shortcut}
																			onSelect={() => selectSuggestion(item.id, sugg, false)}
																			className="cursor-pointer"
																		>
																			<div className="flex justify-between items-center w-full">
																				<span className="truncate mr-2">{sugg.content}</span>
																				<span
																					className="shrink-0 text-xs bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded border">
                                          @{sugg.shortcut}
                                        </span>
																			</div>
																		</CommandItem>
																	))}
																</CommandGroup>
															</CommandList>
														</Command>
													</PopoverContent>
												</Popover>
											</div>
										</FormItem>
									)}
								/>
							)}
							<div className={cn("flex items-center border rounded bg-white shrink-0", disabled && "opacity-50")}>
								<button
									type="button"
									onClick={() => updateQuantity(item.id, -1)}
									disabled={disabled}
									className="px-2 py-1 hover:bg-gray-100 border-r disabled:cursor-not-allowed cursor-pointer"
								>
									<Minus className="h-3 w-3"/>
								</button>
								<Input
									type="text"
									inputMode="numeric"
									value={quantityInputs[item.id] ?? String(item.quantity)}
									onChange={(e) => handleQuantityInputChange(item.id, e.target.value)}
									onBlur={() => handleQuantityInputBlur(item.id)}
									disabled={disabled}
									className="h-7 w-12 px-1 text-center font-semibold text-xs border-0 focus-visible:ring-0 focus-visible:ring-offset-0 shadow-none"
								/>
								<button
									type="button"
									onClick={() => updateQuantity(item.id, 1)}
									disabled={disabled}
									className="px-2 py-1 hover:bg-gray-100 border-l disabled:cursor-not-allowed cursor-pointer"
								>
									<Plus className="h-3 w-3"/>
								</button>
							</div>

							<button
								type="button"
								onClick={() => removeItem(item.id)}
								disabled={disabled}
								className="text-gray-400 hover:text-red-500 p-1 disabled:cursor-not-allowed disabled:hover:text-gray-400 shrink-0 cursor-pointer"
							>
								<X className="h-4 w-4"/>
							</button>
						</div>
					))
				)}
			</div>
		</div>
	);
}
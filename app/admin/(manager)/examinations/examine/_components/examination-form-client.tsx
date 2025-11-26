"use client";
import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import Selector from "@/components/selector";
import TiptapEditor from "@/components/tiptap-editor";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Examination, Medicine, Service } from "@/lib/generated/prisma";
import { cn } from "@/lib/utils";
import { CalendarIcon, Printer, Ban } from "lucide-react";
import ExaminationTypeBadge from "../../_components/examination-type-badge";
import ExaminationStatusBadge from "../../_components/examination-status-badge";
import { Badge } from "@/components/ui/badge";
import { getModeFromStatus } from "../_utils/get-mode-from-status";
import { createFormSchema, FormValues } from "../_schemas/form-schema";
import receiveAction from "../_actions/receive";
import { Spinner } from "@/components/ui/spinner";
import examineAction from "../_actions/examine";
import payAction from "../_actions/pay";
import cancelExamination from "../../_actions/cancel";
import updateStatus from "../_actions/update-status";
type PropsType = {
	initialFormValue: Partial<
		Omit<
			Examination,
			| "bookedBy"
			| "cancelledBy"
			| "createdAt"
			| "date"
			| "examinationFee"
			| "examinedBy"
			| "paidBy"
			| "receivedBy"
			| "updatedAt"
		>
	>;
	data: {
		medicines: Omit<Medicine, "createdAt" | "updatedAt">[];
		services: Omit<Service, "createdAt" | "updatedAt">[];
		examinationFee: number;
	};
	returnTo: string;
};
export default function ExaminationFormClient({
	initialFormValue,
	data,
	returnTo,
}: PropsType) {
	const mode = useMemo(
		() => getModeFromStatus(initialFormValue.status),
		[initialFormValue.status]
	);
	const schema = useMemo(() => createFormSchema(mode), [mode]);
	const form = useForm<FormValues>({
		resolver: zodResolver(schema),
		defaultValues: {
			parentName: initialFormValue.parentName || "",
			parentPhone: initialFormValue.parentPhone || "",
			kidName: initialFormValue.kidName || "",
			kidGender: initialFormValue.kidGender === false ? "female" : "male",
			kidBirthDate: initialFormValue.kidBirthDate || new Date(),
			kidWeight: initialFormValue.kidWeight || 0,
			symptoms: initialFormValue.symptoms || undefined,
			diagnose: initialFormValue.diagnose || undefined,
			services: initialFormValue.services || [],
			medicines: initialFormValue.medicines || [],
			note: initialFormValue.note || undefined,
		},
	});
	const servicesWatch = useWatch({ control: form.control, name: "services" });
	const medicinesWatch = useWatch({ control: form.control, name: "medicines" });
	const services = useMemo(() => servicesWatch || [], [servicesWatch]);
	const medicines = useMemo(() => medicinesWatch || [], [medicinesWatch]);
	const isDisabled = useMemo(() => {
		switch (mode) {
			case "receive":
				return {
					basicInfo: false,
					symptoms: false,
					diagnose: true,
					services: true,
					medicines: true,
					note: false,
				};
			case "examine":
				return {
					basicInfo: false,
					symptoms: false,
					diagnose: false,
					services: false,
					medicines: false,
					note: false,
				};
			case "pay":
				return {
					basicInfo: true,
					symptoms: true,
					diagnose: true,
					services: false,
					medicines: false,
					note: false,
				};
			default:
				return {
					basicInfo: true,
					symptoms: true,
					diagnose: true,
					services: true,
					medicines: true,
					note: true,
				};
		}
	}, [mode]);
	const totalAmount = useMemo(() => {
		const totalServicePrice = services.reduce(
			(acc, item) => acc + (item.price || 0) * item.quantity,
			0
		);
		const totalMedicinePrice = medicines.reduce(
			(acc, item) => acc + (item.price || 0) * item.quantity,
			0
		);
		return totalServicePrice + totalMedicinePrice + data.examinationFee;
	}, [services, medicines, data.examinationFee]);
	const serviceOptions = useMemo(
		() =>
			data.services.map((s) => ({
				id: s.id,
				name: s.name,
				price: s.price,
				description: s.description || undefined,
			})),
		[data.services]
	);
	const medicineOptions = useMemo(
		() =>
			data.medicines.map((m) => ({
				id: m.id,
				name: m.name,
				price: m.price,
				unit: m.unit,
				description: m.description || undefined,
			})),
		[data.medicines]
	);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [isCancelling, startTransition] = useTransition();
	const needToBackStatusRef = useRef(true);
	const [isBacking, startBackingTransition] = useTransition();
	const handleCancel = () => {
		needToBackStatusRef.current = false;
		startTransition(async () => {
			const formData = new FormData();
			if (initialFormValue.id) formData.append("id", initialFormValue.id);
			formData.append("returnTo", returnTo);
			await cancelExamination(formData);
		});
	};
	const onSubmit = async (values: FormValues) => {
		if (isSubmitting) return;
		try {
			setIsSubmitting(true);
			needToBackStatusRef.current = false;
			if (mode === "receive")
				await receiveAction(values, returnTo, initialFormValue?.id);
			else if (mode === "examine")
				await examineAction(values, returnTo, initialFormValue?.id || "");
			else await payAction(values, returnTo, initialFormValue?.id || "");
		} catch (_: unknown) {
		} finally {
			setIsSubmitting(false);
		}
	};
	const renderSubmitText = () => {
		switch (mode) {
			case "receive":
				return "Hoàn thành tiếp nhận";
			case "examine":
				return "Lưu kết quả khám";
			case "pay":
				return "Xác nhận & Thanh toán";
			default:
				return "Lưu";
		}
	};
	useEffect(() => {
		return () => {
			if (
				needToBackStatusRef.current &&
				initialFormValue.id &&
				initialFormValue.status == "IN_PROGRESS"
			) {
				startBackingTransition(async () => {
					await updateStatus(initialFormValue.id || "", "WAITING");
				});
			}
		};
	}, [initialFormValue.id, initialFormValue.status]);
	return (
		<Form {...form}>
			<form
				onSubmit={form.handleSubmit(onSubmit)}
				className="grid grid-cols-1 lg:grid-cols-15 gap-6 h-full"
			>
				<div className="lg:col-span-4 space-y-6">
					<div className="bg-white rounded shadow p-6 space-y-4 lg:h-full">
						<span className="font-semibold text-xl mb-4 block border-b pb-2 shrink-0">
							Thông tin cơ bản
						</span>
						<div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-2">
							<div className="space-y-1">
								<span className="text-xs text-muted-foreground">
									Trạng thái
								</span>
								<div className="min-h-[24px]">
									{initialFormValue.status ? (
										<ExaminationStatusBadge status={initialFormValue.status} />
									) : (
										<Badge variant="outline" className="text-gray-500">
											Mới tạo
										</Badge>
									)}
								</div>
							</div>
							<div className="space-y-1">
								<span className="text-xs text-muted-foreground">Loại khám</span>
								<div className="min-h-[24px]">
									<ExaminationTypeBadge
										type={initialFormValue.type || "WALK_IN"}
									/>
								</div>
							</div>
						</div>
						<div className="grid grid-cols-1 md:grid-cols-5 gap-2">
							<div className="md:col-span-3">
								<FormField
									control={form.control}
									name="parentName"
									render={({ field }) => (
										<FormItem>
											<FormLabel>
												Tên phụ huynh <span className="text-red-500">*</span>
											</FormLabel>
											<FormControl>
												<Input
													placeholder="Ví dụ: Nguyễn Văn A"
													{...field}
													disabled={isDisabled.basicInfo}
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
							</div>
							<div className="md:col-span-2">
								<FormField
									control={form.control}
									name="parentPhone"
									render={({ field }) => (
										<FormItem>
											<FormLabel>
												SĐT <span className="text-red-500">*</span>
											</FormLabel>
											<FormControl>
												<Input
													placeholder="09xxxxxxxx"
													{...field}
													disabled={isDisabled.basicInfo}
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
							</div>
						</div>
						<div className="grid grid-cols-1 md:grid-cols-10 gap-2">
							<div className="md:col-span-7">
								<FormField
									control={form.control}
									name="kidName"
									render={({ field }) => (
										<FormItem>
											<FormLabel>
												Tên bé <span className="text-red-500">*</span>
											</FormLabel>
											<FormControl>
												<Input
													placeholder="Ví dụ: Bé Bi"
													{...field}
													disabled={isDisabled.basicInfo}
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
							</div>
							<div className="md:col-span-3">
								<FormField
									control={form.control}
									name="kidGender"
									render={({ field }) => (
										<FormItem>
											<FormLabel>
												Giới tính <span className="text-red-500">*</span>
											</FormLabel>
											<Select
												onValueChange={field.onChange}
												value={field.value}
												disabled={isDisabled.basicInfo}
											>
												<FormControl>
													<SelectTrigger className="w-full">
														<SelectValue placeholder="Chọn giới tính" />
													</SelectTrigger>
												</FormControl>
												<SelectContent>
													<SelectItem value="male">Nam</SelectItem>
													<SelectItem value="female">Nữ</SelectItem>
												</SelectContent>
											</Select>
											<FormMessage />
										</FormItem>
									)}
								/>
							</div>
						</div>
						<div className="grid grid-cols-2 gap-2">
							<FormField
								control={form.control}
								name="kidBirthDate"
								render={({ field }) => (
									<FormItem className="flex flex-col">
										<FormLabel>
											Ngày sinh <span className="text-red-500">*</span>
										</FormLabel>
										<Popover>
											<PopoverTrigger asChild disabled={isDisabled.basicInfo}>
												<FormControl>
													<Button
														variant={"outline"}
														className={cn(
															"w-full pl-3 text-left font-normal",
															!field.value && "text-muted-foreground"
														)}
													>
														{field.value ? (
															format(field.value, "dd/MM/yyyy")
														) : (
															<span>Chọn ngày sinh</span>
														)}
														<CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
													</Button>
												</FormControl>
											</PopoverTrigger>
											<PopoverContent className="w-auto p-0" align="start">
												<Calendar
													mode="single"
													selected={field.value}
													onSelect={field.onChange}
													disabled={(date) =>
														date > new Date() || date < new Date("1900-01-01")
													}
													autoFocus
													captionLayout="dropdown"
												/>
											</PopoverContent>
										</Popover>
										<FormMessage />
									</FormItem>
								)}
							/>
							<FormField
								control={form.control}
								name="kidWeight"
								render={({ field }) => (
									<FormItem>
										<FormLabel>
											Cân nặng (kg) <span className="text-red-500">*</span>
										</FormLabel>
										<FormControl>
											<Input
												type="number"
												step="0.1"
												placeholder="0.0"
												value={field.value || ""}
												disabled={isDisabled.basicInfo}
												onChange={(e) => {
													const val = e.target.value;
													field.onChange(val === "" ? 0 : parseFloat(val));
												}}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
						</div>
					</div>
				</div>
				<div className="lg:col-span-7 space-y-6">
					<div className="bg-white rounded shadow p-6 space-y-4">
						<span className="font-semibold text-xl mb-4 block border-b pb-2 shrink-0">
							Thông tin khám
						</span>
						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							<div className="space-y-2">
								<FormField
									control={form.control}
									name="symptoms"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Triệu chứng</FormLabel>
											<FormControl>
												<TiptapEditor
													content={field.value}
													onChange={field.onChange}
													disabled={isDisabled.symptoms}
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
							</div>
							<div className="space-y-2">
								<FormField
									control={form.control}
									name="diagnose"
									render={({ field }) => (
										<FormItem>
											<FormLabel>
												Chẩn đoán
												{mode === "examine" && (
													<span className="text-red-500">*</span>
												)}
											</FormLabel>
											<FormControl>
												<TiptapEditor
													content={field.value}
													onChange={field.onChange}
													disabled={isDisabled.diagnose}
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
							</div>
							<div className="space-y-2">
								<FormField
									control={form.control}
									name="services"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Dịch vụ chỉ định</FormLabel>
											<FormControl>
												<Selector
													options={serviceOptions}
													value={field.value}
													onChange={(value) => field.onChange(value)}
													disabled={isDisabled.services}
													placeholder="Tìm kiếm dịch vụ..."
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
							</div>
							<div className="space-y-2">
								<FormField
									control={form.control}
									name="medicines"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Thuốc kê đơn</FormLabel>
											<FormControl>
												<Selector
													options={medicineOptions}
													value={field.value}
													onChange={(value) => field.onChange(value)}
													disabled={isDisabled.medicines}
													placeholder="Tìm kiếm thuốc..."
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
							</div>
							<div className="space-y-2 col-span-1 md:col-span-2">
								<FormField
									control={form.control}
									name="note"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Ghi chú</FormLabel>
											<FormControl>
												<TiptapEditor
													content={field.value}
													onChange={field.onChange}
													disabled={isDisabled.note}
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
							</div>
						</div>
					</div>
				</div>
				<div className="lg:col-span-4 space-y-6 flex flex-col lg:h-full">
					<div className="bg-white rounded shadow p-6 flex-1 flex flex-col h-full overflow-hidden">
						<span className="font-semibold text-xl mb-4 block border-b pb-2 shrink-0">
							Thông tin thanh toán
						</span>
						<div className="flex-1 overflow-y-auto pr-2 -mr-2 space-y-4 text-sm mb-4">
							<div>
								<h4 className="font-semibold text-gray-700 mb-2 border-b border-dashed pb-1">
									Dịch vụ
								</h4>
								<div className="space-y-2">
									{services.length > 0 ? (
										services.map((item, idx) => (
											<div
												key={idx}
												className="flex justify-between items-start text-gray-600"
											>
												<div className="flex-1 pr-2">
													<span className="block text-gray-900">
														{item.name}
													</span>
													<span className="text-xs text-gray-500">
														SL: {item.quantity}
													</span>
												</div>
												<span className="font-medium text-gray-900 shrink-0">
													{((item.price || 0) * item.quantity).toLocaleString()}
													đ
												</span>
											</div>
										))
									) : (
										<p className="text-xs text-gray-400 italic">
											Chưa chọn dịch vụ
										</p>
									)}
								</div>
							</div>
							<div className="mt-4">
								<h4 className="font-semibold text-gray-700 mb-2 border-b border-dashed pb-1">
									Thuốc
								</h4>
								<div className="space-y-2">
									{medicines.length > 0 ? (
										medicines.map((item, idx) => (
											<div
												key={idx}
												className="flex justify-between items-start text-gray-600"
											>
												<div className="flex-1 pr-2">
													<span className="block text-gray-900">
														{item.name}
													</span>
													<span className="text-xs text-gray-500">
														SL: {item.quantity} {item.unit || ""}
													</span>
												</div>
												<span className="font-medium text-gray-900 shrink-0">
													{((item.price || 0) * item.quantity).toLocaleString()}
													đ
												</span>
											</div>
										))
									) : (
										<p className="text-xs text-gray-400 italic">
											Chưa kê đơn thuốc
										</p>
									)}
								</div>
							</div>
							<div className="mt-4">
								<h4 className="font-semibold text-gray-700 mb-2 border-b border-dashed pb-1">
									Khám
								</h4>
								<div className="flex justify-between items-start text-gray-600">
									<span>Phí khám bệnh</span>
									<span className="font-medium text-gray-900 shrink-0">
										{data.examinationFee.toLocaleString()}đ
									</span>
								</div>
							</div>
						</div>
						<div className="mt-auto pt-4 border-t shrink-0">
							<div className="flex justify-between items-center text-base font-bold bg-[#A6CF52]/10 p-4 rounded-md mb-4">
								<span className="text-gray-800">Thành tiền:</span>
								<span className="text-xl text-[#A6CF52]">
									{totalAmount.toLocaleString()} đ
								</span>
							</div>
							<div className="flex flex-col gap-3">
								{initialFormValue.status !== "COMPLETED" &&
									initialFormValue.status !== "CANCELLED" && (
										<Button
											type="submit"
											size="lg"
											disabled={isSubmitting}
											className="w-full bg-[#A6CF52] hover:bg-[#93b848] text-white font-bold text-md shadow-md transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
										>
											{isSubmitting || isBacking ? (
												<>
													<span className="mr-2">Đang xử lý...</span>
													<Spinner />
												</>
											) : (
												renderSubmitText()
											)}
										</Button>
									)}
								<div className="grid grid-cols-1 gap-3">
									{initialFormValue.status === "COMPLETED" ||
										(initialFormValue.status === "PENDING_PAYMENT" && (
											<Button
												type="button"
												variant="outline"
												className="w-full border-gray-300"
											>
												<Printer className="mr-2 h-4 w-4" /> In phiếu
											</Button>
										))}
									{initialFormValue.status &&
										initialFormValue.status !== "COMPLETED" &&
										initialFormValue.status !== "CANCELLED" && (
											<Popover>
												<PopoverTrigger asChild>
													<Button
														type="button"
														variant="outline"
														className="w-full border-red-200 text-red-600 bg-red-50 hover:bg-red-100"
													>
														<Ban className="mr-2 h-4 w-4" /> Hủy ca khám
													</Button>
												</PopoverTrigger>
												<PopoverContent className="w-[260px]" side="top">
													<p className="text-sm">
														Bạn có chắc muốn hủy lịch khám này không?
													</p>
													<div className="mt-3 flex items-center gap-2 justify-end">
														<Button
															type="button"
															size="sm"
															className="bg-[#DC3545] hover:bg-[#C82333]"
															onClick={handleCancel}
															disabled={isCancelling}
														>
															{isCancelling ? (
																<Spinner className="w-4 h-4" />
															) : (
																"Xác nhận"
															)}
														</Button>
													</div>
												</PopoverContent>
											</Popover>
										)}
								</div>
							</div>
						</div>
					</div>
				</div>
			</form>
		</Form>
	);
}

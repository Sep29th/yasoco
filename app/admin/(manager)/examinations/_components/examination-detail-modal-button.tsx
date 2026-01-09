"use client";
import {Button} from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import {Tabs, TabsContent, TabsList, TabsTrigger} from "@/components/ui/tabs";
import {useMemo, useState, useTransition} from "react";
import {VisuallyHidden} from "@radix-ui/react-visually-hidden";
import {
	getAllFutureExaminationsByPhone,
	getAllPastExaminationsByPhone,
	getExaminationById,
} from "@/lib/examination";
import ExaminationStatusBadge from "./examination-status-badge";
import ExaminationTypeBadge from "./examination-type-badge";
import {formatDateTime} from "../_utils/format-date-time";
import {formatDate} from "../_utils/format-date";
import ActionItem from "./action-item";
import {Skeleton} from "@/components/ui/skeleton";
import ExaminationItem from "./examination-item";
import {CalendarIcon, CheckCircle2, Clock} from "lucide-react";
import {Calendar} from "@/components/ui/calendar";
import {vi} from "date-fns/locale";
import {Label} from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import {createFollowUp} from "../_actions/create-follow-up";
import {toast} from "sonner";
import ExaminationItemSkeleton from "./examination-item-skeleton";
import {Examination} from "@/lib/generated/prisma";
import PrintInvoiceModalButton from "@/app/admin/(manager)/examinations/_components/print-invoice-modal-button";
import ReadOnlyTiptap from "@/app/admin/(manager)/examinations/_components/read-only-tiptap";

const HOURS = Array.from({length: 24}, (_, i) =>
	i.toString().padStart(2, "0")
);
const MINUTES = Array.from({length: 60}, (_, i) =>
	i.toString().padStart(2, "0")
);
type PropsType = { examinationId: string };
export default function ExaminationDetailModalButton({
																											 examinationId,
																										 }: PropsType) {
	const [open, setOpen] = useState(false);
	const [examination, setExamination] = useState<Examination | null>(null);
	const [examinationsHistory, setExaminationsHistory] = useState<Awaited<
		ReturnType<typeof getAllPastExaminationsByPhone>
	> | null>(null);
	const [examinationsFuture, setExaminationsFuture] = useState<Awaited<
		ReturnType<typeof getAllFutureExaminationsByPhone>
	> | null>(null);
	const [isDetailPending, startDetailTransition] = useTransition();
	const [isHistoryPending, startHistoryTransition] = useTransition();
	const [isFuturePending, startFutureTransition] = useTransition();
	const [isBookExaminationPending, startBookExaminationTransition] =
		useTransition();
	const [bookingDate, setBookingDate] = useState<Date | undefined>(undefined);
	const [selectedHour, setSelectedHour] = useState<string | undefined>(
		undefined
	);
	const [selectedMinute, setSelectedMinute] = useState<string | undefined>(
		undefined
	);
	const bookingTime = useMemo(() => {
		if (selectedHour && selectedMinute) {
			return `${selectedHour}:${selectedMinute}`;
		}
		return undefined;
	}, [selectedHour, selectedMinute]);
	const [tab, setTab] = useState("detail");
	const loadDetail = (id: string) => {
		startDetailTransition(async () => {
			setExamination(null);
			const data = await getExaminationById(id);
			setExamination(data);
		});
	};
	const loadHistory = () => {
		if (!examination?.parentPhone) {
			return;
		}
		startHistoryTransition(async () => {
			const data = await getAllPastExaminationsByPhone(examination.parentPhone);
			setExaminationsHistory(data);
		});
	};
	const loadFuture = () => {
		if (!examination?.parentPhone) {
			return;
		}
		startFutureTransition(async () => {
			const data = await getAllFutureExaminationsByPhone(
				examination.parentPhone
			);
			setExaminationsFuture(data);
		});
	};
	const handleOpenChange = (isOpen: boolean) => {
		setOpen(isOpen);
		if (isOpen) {
			if (!examination) {
				loadDetail(examinationId);
			}
		} else {
			setTimeout(() => {
				setTab("detail");
				setExamination(null);
				setExaminationsHistory(null);
				setExaminationsFuture(null);
				setBookingDate(undefined);
				setSelectedHour(undefined);
				setSelectedMinute(undefined);
			}, 200);
		}
	};
	const handleTabChange = (newTab: string) => {
		setTab(newTab);
		if (newTab === "history" && !examinationsHistory) {
			loadHistory();
		} else if (newTab === "future" && !examinationsFuture) {
			loadFuture();
		}
	};
	const handleSelectExamination = (id: string) => {
		setTab("detail");
		loadDetail(id);
	};
	const handleCreateBooking = () => {
		if (!bookingDate || !bookingTime || !examination) return;
		const [hours, minutes] = bookingTime.split(":").map(Number);
		const finalBookingDate = new Date(bookingDate);
		finalBookingDate.setHours(hours, minutes, 0, 0);
		startBookExaminationTransition(async () => {
			const result = await createFollowUp({
				parentName: examination.parentName,
				parentPhone: examination.parentPhone,
				kidName: examination.kidName,
				kidGender: examination.kidGender,
				kidBirthDate: examination.kidBirthDate,
				date: finalBookingDate,
			});
			if (!result.success) {
				toast.error("Không thể tạo lịch", {
					description: result.message,
					position: "top-right",
				});
			} else {
				toast.success("Thành công", {
					description: result.message,
					position: "top-right",
					style: {
						backgroundColor: "#A6CF52",
						color: "white",
						border: "none",
					},
				});
				setBookingDate(undefined);
				setSelectedHour(undefined);
				setSelectedMinute(undefined);
				loadFuture();
				setTab("future");
			}
		});
	};
	const totalServicePrice =
		examination?.services.reduce(
			(acc, item) => acc + (item.price || 0) * item.quantity,
			0
		) || 0;
	const subTotal = totalServicePrice + (examination?.examinationFee || 0);
	const totalDiscount =
		examination?.discounts.reduce((acc, curr) => {
			const val = curr.value || 0;
			if (curr.type === "percent") {
				return acc + (subTotal * val) / 100;
			}
			return acc + val;
		}, 0) || 0;
	const totalAmount = Math.max(0, subTotal - totalDiscount);
	return (
		<Dialog open={open} onOpenChange={handleOpenChange}>
			<DialogTrigger asChild>
				<Button variant="link" size="sm">
					Chi tiết
				</Button>
			</DialogTrigger>
			<DialogContent className="sm:max-w-[1360px] w-[1360px] pt-10 h-[822px] flex flex-col">
				<VisuallyHidden>
					<DialogTitle>Modal chi tiết bệnh án</DialogTitle>
				</VisuallyHidden>
				<Tabs
					value={tab}
					onValueChange={handleTabChange}
					className="flex-1 flex flex-col overflow-hidden"
				>
					<TabsList className="w-full overflow-x-auto shrink-0">
						<TabsTrigger value="detail" className="whitespace-nowrap">
							Chi tiết
						</TabsTrigger>
						<TabsTrigger value="history" className="whitespace-nowrap">
							Lịch sử khám
						</TabsTrigger>
						<TabsTrigger value="future" className="whitespace-nowrap">
							Lịch khám đặt trước
						</TabsTrigger>
						<TabsTrigger value="book" className="whitespace-nowrap">
							Tạo lịch khám lại
						</TabsTrigger>
					</TabsList>
					<TabsContent value="detail" className="flex-1 h-full overflow-hidden">
						<div className="grid grid-cols-4 gap-2 h-full">
							{!isDetailPending && examination ? (
								<>
									<div className="bg-white rounded shadow h-full flex flex-col overflow-hidden">
										<div className="p-6 pb-2 shrink-0">
											<span className="font-semibold text-lg block border-b pb-2">
												Thông tin cơ bản
											</span>
										</div>
										<div className="p-6 pt-2 flex-1 overflow-y-auto space-y-4">
											<div className="space-y-1">
												<span className="text-xs text-muted-foreground">
													Tên phụ huynh
												</span>
												<p className="text-sm font-medium">
													{examination.parentName}
												</p>
											</div>
											<div className="space-y-1">
												<span className="text-xs text-muted-foreground">
													SĐT
												</span>
												<p className="text-sm font-medium">
													{examination.parentPhone}
												</p>
											</div>
											<div className="space-y-1">
												<span className="text-xs text-muted-foreground">
													Địa chỉ
												</span>
												<p className="text-sm">
													{examination.address}
												</p>
											</div>
											<div className="space-y-1">
												<span className="text-xs text-muted-foreground">
													Tên bé
												</span>
												<p className="text-sm font-medium">
													{examination.kidName}
												</p>
											</div>
											<div className="grid grid-cols-2 gap-2">
												<div className="space-y-1">
													<span className="text-xs text-muted-foreground">
														Ngày sinh
													</span>
													<p className="text-sm">
														{formatDate(examination.kidBirthDate)}
													</p>
												</div>
												<div className="space-y-1">
													<span className="text-xs text-muted-foreground">
														Giới tính
													</span>
													<p className="text-sm">
														{examination.kidGender ? "Nam" : "Nữ"}
													</p>
												</div>
											</div>
											<div className="space-y-1">
												<span className="text-xs text-muted-foreground">
													Cân nặng (kg)
												</span>
												<p className="text-sm">
													{examination.kidWeight != null
														? examination.kidWeight
														: "Chưa cập nhật"}
												</p>
											</div>
											<div className="space-y-1">
												<span className="text-xs text-muted-foreground">
													Giờ khám
												</span>
												<p className="text-sm">
													{formatDateTime(examination.date)}
												</p>
											</div>
											<div className="grid grid-cols-2 gap-2">
												<div className="space-y-1">
													<span className="text-xs text-muted-foreground">
														Trạng thái
													</span>
													<div className="min-h-6">
														<ExaminationStatusBadge
															status={examination.status}
														/>
													</div>
												</div>
												<div className="space-y-1">
													<span className="text-xs text-muted-foreground">
														Loại khám
													</span>
													<div className="min-h-6">
														<ExaminationTypeBadge type={examination.type}/>
													</div>
												</div>
											</div>
											<PrintInvoiceModalButton examination={examination}/>
										</div>
									</div>
									<div className="bg-white rounded shadow h-full flex flex-col overflow-hidden">
										<div className="p-6 pb-2 shrink-0">
											<span className="font-semibold text-lg block border-b pb-2">
												Thông tin khám
											</span>
										</div>
										<div className="p-6 pt-2 flex-1 overflow-y-auto space-y-4">
											<ReadOnlyTiptap label={"Tiền sử bệnh"} content={examination.medicalHistory}/>
											<ReadOnlyTiptap label={"Triệu chứng"} content={examination.symptoms}/>
											<ReadOnlyTiptap label={"Chẩn đoán"} content={examination.diagnose}/>
											<ReadOnlyTiptap label={"Ghi chú"} content={examination.note}/>
										</div>
									</div>
									<div className="bg-white rounded shadow h-full flex flex-col overflow-hidden">
										<div className="p-6 pb-2 shrink-0">
											<span className="font-semibold text-lg block border-b pb-2">
												Thông tin dịch vụ
											</span>
										</div>
										<div className="p-6 py-2 flex-1 overflow-y-auto space-y-4 text-sm">
											<div className="mt-4">
												<h4 className="font-semibold text-gray-700 mb-2 border-b border-dashed pb-1">
													Thuốc
												</h4>
												<div className="space-y-2">
													{examination.medicines.length > 0 ? (
														examination.medicines.map((item, idx) => (
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
																	<span className="block text-xs text-gray-500">
																		- {item.dosage}
																	</span>
																</div>
															</div>
														))
													) : (
														<p className="text-xs text-gray-400 italic">
															Không có thuốc
														</p>
													)}
												</div>
											</div>
											<div>
												<h4 className="font-semibold text-gray-700 mb-2 border-b border-dashed pb-1">
													Dịch vụ
												</h4>
												<div className="space-y-2">
													{examination.services.length > 0 ? (
														examination.services.map((item, idx) => (
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
																	{(
																		(item.price || 0) * item.quantity
																	).toLocaleString()}
																	đ
																</span>
															</div>
														))
													) : (
														<p className="text-xs text-gray-400 italic">
															Không có dịch vụ
														</p>
													)}
												</div>
											</div>
											{examination.examinationFee !== null && examination.examinationFee > 0 && (
												<div className="mt-4">
													<h4 className="font-semibold text-gray-700 mb-2 border-b border-dashed pb-1">
														Khám
													</h4>
													<div className="flex justify-between items-start text-gray-600">
														<span>Phí khám bệnh</span>
														<span className="font-medium text-gray-900 shrink-0">
															{examination.examinationFee.toLocaleString()}đ
														</span>
													</div>
												</div>
											)}
											<div className="mt-4">
												<h4 className="font-semibold text-gray-700 mb-2 border-b border-dashed pb-1">
													Giảm giá
												</h4>
												{examination.discounts.length > 0 ? (
													<div className="space-y-2">
														{examination.discounts.map((d, idx) => (
															<div
																key={idx}
																className="flex justify-between items-start text-gray-600"
															>
																<div>
																	<span className="block text-gray-900">
																		{d.description || "Giảm giá"}
																	</span>
																	<span className="text-xs text-gray-500">
																		{d.type === "percent"
																			? `${d.value}%`
																			: `${d.value.toLocaleString()}đ`}
																	</span>
																</div>
																<span className="font-medium text-red-600 shrink-0">
																	{examination.examinationFee !== null && examination.examinationFee > 0 &&
																		(d.type === "percent"
																			? `-${(
																				(subTotal * d.value) /
																				100
																			).toLocaleString()}đ`
																			: `-${d.value.toLocaleString()}đ`)}
																</span>
															</div>
														))}
													</div>
												) : (
													<p className="text-xs text-gray-400 italic">
														Không có giảm giá
													</p>
												)}
											</div>
										</div>
										{examination.examinationFee !== null &&
											examination.status === "COMPLETED" && (
												<div className="p-6 pt-2 shrink-0 border-t">
													<div className="flex justify-between items-start text-gray-600 mt-2">
														<span className="font-bold text-gray-800">
															Tổng cộng
														</span>
														<span className="font-bold text-[#A6CF52] text-base shrink-0">
															{totalAmount.toLocaleString()}đ
														</span>
													</div>
												</div>
											)}
									</div>
									<div className="bg-white rounded shadow h-full flex flex-col overflow-hidden">
										<div className="p-6 pb-2 shrink-0">
											<span className="font-semibold text-lg block border-b pb-2">
												Thông tin khác
											</span>
										</div>
										<div className="p-6 pt-2 flex-1 overflow-y-auto space-y-6">
											{examination.bookedBy && (
												<ActionItem
													title="Người đặt lịch"
													snapshot={examination.bookedBy}
												/>
											)}
											{examination.receivedBy && (
												<ActionItem
													title="Người tiếp nhận"
													snapshot={examination.receivedBy}
												/>
											)}
											{examination.examinedBy && (
												<ActionItem
													title="Người khám"
													snapshot={examination.examinedBy}
												/>
											)}
											{examination.paidBy && (
												<ActionItem
													title="Người thu tiền"
													snapshot={examination.paidBy}
												/>
											)}
											{examination.cancelledBy && (
												<ActionItem
													title="Người hủy lịch"
													snapshot={examination.cancelledBy}
												/>
											)}
										</div>
									</div>
								</>
							) : (
								<>
									<div className="bg-white rounded shadow p-6 space-y-4 h-full">
										<Skeleton className="h-full w-full"/>
									</div>
									<div className="bg-white rounded shadow p-6 space-y-4 h-full">
										<Skeleton className="h-full w-full"/>
									</div>
									<div className="bg-white rounded shadow p-6 space-y-4 h-full">
										<Skeleton className="h-full w-full"/>
									</div>
									<div className="bg-white rounded shadow p-6 space-y-4 h-full">
										<Skeleton className="h-full w-full"/>
									</div>
								</>
							)}
						</div>
					</TabsContent>
					<TabsContent
						value="history"
						className="flex-1 h-full overflow-hidden"
					>
						{!isHistoryPending && examinationsHistory ? (
							examinationsHistory.length > 0 ? (
								<div className="h-full overflow-y-auto">
									{/* Đã bỏ pr-2 vì không cần chừa chỗ cho popup nữa */}
									<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 pb-4">
										{examinationsHistory.map((exam) => (
											<ExaminationItem
												key={exam.id}
												data={exam}
												onClick={handleSelectExamination}
											/>
										))}
									</div>
								</div>
							) : (
								<div className="flex h-64 items-center justify-center text-gray-500 italic">
									Chưa có lịch sử khám nào.
								</div>
							)
						) : (
							<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 pb-4">
								{Array.from({length: 8}).map((_, i) => (
									<ExaminationItemSkeleton key={i}/>
								))}
							</div>
						)}
					</TabsContent>
					<TabsContent value="future" className="flex-1 h-full overflow-hidden">
						{!isFuturePending && examinationsFuture ? (
							examinationsFuture.length > 0 ? (
								<div className="h-full overflow-y-auto">
									<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 pb-4 pr-2">
										{examinationsFuture.map((exam) => (
											<ExaminationItem
												key={exam.id}
												data={exam}
												onClick={handleSelectExamination}
											/>
										))}
									</div>
								</div>
							) : (
								<div className="flex h-64 items-center justify-center text-gray-500 italic">
									Không có lịch khám đặt trước nào.
								</div>
							)
						) : (
							<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 pb-4">
								{Array.from({length: 8}).map((_, i) => (
									<ExaminationItemSkeleton key={i}/>
								))}
							</div>
						)}
					</TabsContent>
					<TabsContent value="book" className="flex-1 h-full overflow-y-auto">
						{!isDetailPending && examination ? (
							<div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-full items-start">
								<div className="bg-white rounded shadow p-6 space-y-6">
									<span className="font-semibold text-lg block border-b pb-2">
										Thông tin người tái khám
									</span>
									<div className="grid grid-cols-1 gap-4">
										<div className="space-y-1">
											<span className="text-xs text-muted-foreground uppercase tracking-wide">
												Tên phụ huynh
											</span>
											<p className="text-base font-medium text-gray-900">
												{examination.parentName}
											</p>
										</div>
										<div className="space-y-1">
											<span className="text-xs text-muted-foreground uppercase tracking-wide">
												Số điện thoại
											</span>
											<p className="text-base font-medium text-gray-900 font-mono">
												{examination.parentPhone}
											</p>
										</div>
										<div className="w-full h-px bg-gray-100 my-2"/>
										<div className="space-y-1">
											<span className="text-xs text-muted-foreground uppercase tracking-wide">
												Tên bé
											</span>
											<p className="text-lg font-bold text-gray-900">
												{examination.kidName}
											</p>
										</div>
										<div className="grid grid-cols-2 gap-4">
											<div className="space-y-1">
												<span className="text-xs text-muted-foreground uppercase tracking-wide">
													Ngày sinh
												</span>
												<p className="text-base font-medium text-gray-900">
													{formatDate(examination.kidBirthDate)}
												</p>
											</div>
											<div className="space-y-1">
												<span className="text-xs text-muted-foreground uppercase tracking-wide">
													Giới tính
												</span>
												<p className="text-base font-medium text-gray-900">
													{examination.kidGender ? "Nam" : "Nữ"}
												</p>
											</div>
										</div>
									</div>
								</div>
								<div className="bg-white rounded shadow p-6 space-y-6 flex flex-col items-center min-h-[400px]">
									<span className="font-semibold text-lg block border-b pb-2 w-full">
										Chọn thời gian hẹn
									</span>
									<div className="flex flex-col lg:flex-row gap-6 w-full items-start justify-center h-full">
										<div className="flex flex-col items-center gap-2 shrink-0 mx-auto lg:mx-0">
											<div className="border rounded-lg p-4 bg-slate-50">
												<Calendar
													mode="single"
													selected={bookingDate}
													onSelect={(date) => {
														setBookingDate(date);
													}}
													disabled={(date) => {
														const today = new Date();
														today.setHours(0, 0, 0, 0);
														return date < today;
													}}
													captionLayout="dropdown"
													className="rounded-md bg-white border shadow-sm"
													autoFocus
													locale={vi}
												/>
											</div>
										</div>
										<div className="flex-1 w-full flex flex-col gap-4 justify-start">
											<Label className="px-1 text-sm font-medium text-gray-700">
												Chọn giờ khám
											</Label>
											<div className="flex items-center gap-2">
												<div className="flex-1">
													<Select
														value={selectedHour}
														onValueChange={setSelectedHour}
														disabled={!bookingDate}
													>
														<SelectTrigger className="w-full">
															<SelectValue placeholder="Giờ"/>
														</SelectTrigger>
														<SelectContent className="h-48">
															{HOURS.map((h) => (
																<SelectItem key={h} value={h}>
																	{h}
																</SelectItem>
															))}
														</SelectContent>
													</Select>
												</div>
												<span className="text-gray-400 text-xl">:</span>
												<div className="flex-1">
													<Select
														value={selectedMinute}
														onValueChange={setSelectedMinute}
														disabled={!bookingDate}
													>
														<SelectTrigger className="w-full">
															<SelectValue placeholder="Phút"/>
														</SelectTrigger>
														<SelectContent className="h-48">
															{MINUTES.map((m) => (
																<SelectItem key={m} value={m}>
																	{m}
																</SelectItem>
															))}
														</SelectContent>
													</Select>
												</div>
											</div>
											{!bookingDate ? (
												<p className="text-xs text-gray-400 italic px-1">
													Vui lòng chọn ngày trước
												</p>
											) : (
												<p className="text-xs text-gray-500 px-1">
													{bookingTime
														? `Thời gian: ${bookingTime}`
														: "Chọn giờ và phút"}
												</p>
											)}
										</div>
									</div>
									<div className="w-full pt-4 border-t mt-auto flex flex-col items-center gap-4">
										{bookingDate && bookingTime && (
											<div
												className="flex items-center gap-2 text-[#A6CF52] font-medium bg-[#A6CF52]/10 px-4 py-2 rounded-full text-sm animate-in fade-in zoom-in duration-300">
												<CalendarIcon className="h-4 w-4"/>
												<span>Ngày {formatDate(bookingDate)}</span>
												<span className="w-1 h-1 rounded-full bg-[#A6CF52]"/>
												<Clock className="h-4 w-4"/> <span>{bookingTime}</span>
											</div>
										)}
										<Button
											onClick={handleCreateBooking}
											disabled={
												!bookingDate || !bookingTime || isBookExaminationPending
											}
											className="w-full max-w-sm bg-[#A6CF52] hover:bg-[#93b848] text-white font-bold shadow-md transition-all active:scale-[0.98]"
											size="lg"
										>
											{isBookExaminationPending ? (
												"Đang xử lý..."
											) : (
												<>
													<CheckCircle2 className="mr-2 h-5 w-5"/> Tạo lịch tái
													khám
												</>
											)}
										</Button>
									</div>
								</div>
							</div>
						) : (
							<div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-full">
								<div className="bg-white rounded shadow p-6 space-y-4">
									<Skeleton className="h-8 w-1/2 mb-4"/>
									<Skeleton className="h-6 w-full"/>
									<Skeleton className="h-6 w-full"/>
									<Skeleton className="h-6 w-3/4"/>
								</div>
								<div className="bg-white rounded shadow p-6 space-y-4 flex flex-col items-center">
									<Skeleton className="h-8 w-1/2 mb-4"/>
									<Skeleton className="h-[300px] w-[300px] rounded-lg"/>
									<Skeleton className="h-10 w-full mt-4"/>
								</div>
							</div>
						)}
					</TabsContent>
				</Tabs>
			</DialogContent>
		</Dialog>
	);
}

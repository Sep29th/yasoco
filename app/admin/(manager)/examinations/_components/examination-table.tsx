"use client";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import ExaminationStatusBadge from "./examination-status-badge";
import ExaminationTypeBadge from "./examination-type-badge";
import ExaminationDetailModalButton from "./examination-detail-modal-button";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
	Pagination,
	PaginationContent,
	PaginationItem,
	PaginationNext,
	PaginationPrevious,
} from "@/components/ui/pagination";
import { ExaminationStatus } from "@/lib/generated/prisma";
import { formatDate } from "../_utils/format-date";
import { formatDateTime } from "../_utils/format-date-time";
import cancelExamination from "../_actions/cancel";
import { getPaginationExamination } from "@/lib/examination";
import { AccessTokenPayload } from "@/lib/jwt";
import { useEffect } from "react";
import { getExaminationChannel } from "@/lib/pusher-client";
import { useRouter } from "next/navigation";
import { DateString } from "@/utils/types/date-string";
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import { Edit3 } from "lucide-react";
const renderModifyTitle = (status: ExaminationStatus) => {
	if (status == "BOOKED") return "Tiếp nhận";
	else if (status == "WAITING" || status == "IN_PROGRESS") return "Khám";
	else return "Thanh toán";
};
type PropsType = {
	examinations: Awaited<
		ReturnType<typeof getPaginationExamination>
	>["examinations"];
	auth: AccessTokenPayload;
	returnTo: string;
	page: number;
	totalPages: number;
	mode: "all" | "day";
	date: DateString;
};
export default function ExaminationTable({
	examinations,
	auth,
	returnTo,
	page,
	totalPages,
	mode,
	date,
}: PropsType) {
	const { refresh } = useRouter();
	useEffect(() => {
		const channel = getExaminationChannel();
		const handleUpdateEvent = (data: { id: string; date?: Date }) => {
			if (
				(data.date &&
					(mode === "all" ||
						new Date().toDateString() === new Date(date).toDateString())) ||
				examinations.some((exam) => exam.id === data.id)
			) {
				refresh();
			}
		};
		channel.bind("update", handleUpdateEvent);
		return () => {
			channel.unbind("update", handleUpdateEvent);
		};
	}, [mode, date, examinations, refresh]);
	return (
		<>
			<div className="bg-white rounded shadow overflow-x-auto">
				<Table className="min-w-[900px]">
					<TableHeader>
						<TableRow>
							<TableHead>Tên bé</TableHead>
							<TableHead>Tên phụ huynh</TableHead>
							<TableHead>SĐT phụ huynh</TableHead>
							<TableHead>Ngày sinh</TableHead>
							<TableHead>Giới tính bé</TableHead>
							<TableHead>Giờ khám</TableHead>
							<TableHead>Trạng thái</TableHead>
							<TableHead>Kiểu</TableHead>
							<TableHead className="text-right">Thao tác</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{examinations.map((examination) => (
							<TableRow key={examination.id}>
								<TableCell className="font-medium">
									{examination.kidName}
								</TableCell>
								<TableCell>{examination.parentName}</TableCell>
								<TableCell>{examination.parentPhone}</TableCell>
								<TableCell>{formatDate(examination.kidBirthDate)}</TableCell>
								<TableCell>{examination.kidGender ? "Nam" : "Nữ"}</TableCell>
								<TableCell>{formatDateTime(examination.date)}</TableCell>
								<TableCell>
									<ExaminationStatusBadge status={examination.status} />
								</TableCell>
								<TableCell>
									<ExaminationTypeBadge type={examination.type} />
								</TableCell>
								<TableCell className="gap-1 flex justify-end">
									<ExaminationDetailModalButton
										examinationId={examination.id}
									/>
									{auth.permissions.includes("examination:update") &&
										(examination.status === "COMPLETED" ||
											examination.status === "CANCELLED") && (
											<Link
												href={`/admin/examinations/examine?returnTo=${encodeURIComponent(
													returnTo
												)}&examinationId=${examination.id}`}
												className="no-underline"
											>
												<Tooltip>
													<TooltipTrigger asChild>
														<Button
															className="cursor-pointer"
															variant="outline"
															size="icon-sm"
														>
															<Edit3 className="size-4" />
														</Button>
													</TooltipTrigger>
													<TooltipContent>
														<p>Chỉnh sửa</p>
													</TooltipContent>
												</Tooltip>
											</Link>
										)}
									{auth.permissions.includes("examination:create") &&
										(examination.status === "COMPLETED" ||
											examination.status === "CANCELLED") && (
											<Link
												href={`/admin/examinations/examine?returnTo=${encodeURIComponent(
													returnTo
												)}&examinationId=${examination.id}&isReReceive=true`}
												className="no-underline"
											>
												<Button variant="outline" size="sm">
													Tiếp nhận lại
												</Button>
											</Link>
										)}
									{auth.permissions.includes("examination:update") &&
										(examination.status == "BOOKED" ||
											examination.status == "PENDING_PAYMENT" ||
											examination.status == "WAITING") && (
											<Popover>
												<PopoverTrigger asChild>
													<Button
														size="sm"
														className="bg-[#DC3545] hover:bg-[#C82333]"
													>
														Hủy
													</Button>
												</PopoverTrigger>
												<PopoverContent className="w-[260px]" side="top">
													<p className="text-sm">
														Bạn có chắc muốn hủy lịch khám này không?
													</p>
													<form
														action={cancelExamination}
														className="mt-3 flex items-center gap-2 justify-end"
													>
														<input
															type="hidden"
															name="id"
															value={examination.id}
														/>
														<input
															type="hidden"
															name="returnTo"
															value={returnTo}
														/>
														<Button
															type="submit"
															size="sm"
															className="bg-[#DC3545] hover:bg-[#C82333]"
														>
															Xác nhận
														</Button>
													</form>
												</PopoverContent>
											</Popover>
										)}
									{auth.permissions.includes("examination:update") &&
										(examination.status == "BOOKED" ||
											examination.status == "PENDING_PAYMENT" ||
											examination.status == "WAITING" ||
											examination.status == "IN_PROGRESS") && (
											<Link
												href={`/admin/examinations/examine?returnTo=${encodeURIComponent(
													returnTo
												)}&examinationId=${examination.id}`}
											>
												<Button
													className="bg-[#A6CF52] hover:bg-[#93b848]"
													size="sm"
												>
													{renderModifyTitle(examination.status)}
												</Button>
											</Link>
										)}
								</TableCell>
							</TableRow>
						))}
						{examinations.length === 0 && (
							<TableRow>
								<TableCell
									colSpan={9}
									className="text-center px-4 py-6 text-muted-foreground"
								>
									Không có lịch khám nào
								</TableCell>
							</TableRow>
						)}
					</TableBody>
				</Table>
			</div>
			<nav className="flex flex-col gap-2 items-center justify-between sm:flex-row">
				<Pagination>
					<PaginationContent>
						<PaginationItem>
							<PaginationPrevious
								href={`?page=${Math.max(1, page - 1)}`}
								className={
									page <= 1
										? "opacity-50 pointer-events-none cursor-not-allowed"
										: "cursor-pointer"
								}
							/>
						</PaginationItem>
						<PaginationItem>
							<span className="px-3 py-1 border rounded">
								{page} / {totalPages}
							</span>
						</PaginationItem>
						<PaginationItem>
							<PaginationNext
								href={`?page=${Math.min(totalPages, page + 1)}`}
								className={
									page >= totalPages
										? "opacity-50 pointer-events-none cursor-not-allowed"
										: "cursor-pointer"
								}
							/>
						</PaginationItem>
					</PaginationContent>
				</Pagination>
			</nav>
		</>
	);
}

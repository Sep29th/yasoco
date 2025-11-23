import { requireAuth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { PageParams } from "./_types/page-params";
import { validatePageParams } from "@/app/admin/(manager)/examinations/_utils/validate-page-params";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { createQueryString } from "@/app/admin/(manager)/examinations/_utils/create-query-string";
import { DatePickerFilter } from "@/app/admin/(manager)/examinations/_components/date-picker-filter";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import {
	Pagination,
	PaginationContent,
	PaginationItem,
	PaginationNext,
	PaginationPrevious,
} from "@/components/ui/pagination";
import { getPaginationExamination } from "@/lib/examination";
import { formatDateTime } from "./_utils/format-date-time";
import { formatDate } from "./_utils/format-date";
import ExaminationStatusBadge from "@/app/admin/(manager)/examinations/_components/examination-status-badge";
import ExaminationTypeBadge from "@/app/admin/(manager)/examinations/_components/examination-type-badge";
import { ExaminationStatus } from "@/lib/generated/prisma";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";

const renderModifyTitle = (status: ExaminationStatus) => {
	if (status == "BOOKED") return "Tiếp nhận";
	else if (status == "WAITING") return "Khám";
	else return "Thanh toán";
};

type PropsType = {
	searchParams: Promise<PageParams>;
};

export default async function ExaminationPage({ searchParams }: PropsType) {
	const auth = await requireAuth();

	if (!auth.permissions.includes("examination:read"))
		redirect("/admin/forbidden");

	const resolvedParams = await searchParams;

	const { mode, page, date } = validatePageParams(resolvedParams);

	const { total, examinations } = await getPaginationExamination(page, 10, {
		mode,
		date,
	});

	const spTyped = resolvedParams as Record<string, string | undefined>;
	const errorMessage =
		typeof spTyped.error === "string" ? spTyped.error.trim() : "";

	const totalPages = Math.max(1, Math.ceil(total / 10));

	const currentPath = "/admin/examinations";
	const queryString = createQueryString(resolvedParams, mode);
	const returnTo = `${currentPath}${queryString}`;

	return (
		<div className="space-y-4">
			{errorMessage && (
				<div className="rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">
					{errorMessage}
				</div>
			)}
			<header className="flex items-center justify-between">
				<h1 className="text-2xl font-semibold">Lịch khám</h1>

				<div className="flex flex-col items-stretch gap-2 sm:flex-row sm:items-center sm:gap-3">
					<div className={"flex items-center justify-end gap-2"}>
						<ToggleGroup type="single" variant={"outline"} value={mode}>
							<ToggleGroupItem value="all" className={"cursor-pointer"} asChild>
								<Link href={createQueryString(resolvedParams, "all")}>
									<span>Tất cả</span>
								</Link>
							</ToggleGroupItem>
							<ToggleGroupItem value="day" className={"cursor-pointer"} asChild>
								<Link href={createQueryString(resolvedParams, "day")}>
									<span>Theo ngày</span>
								</Link>
							</ToggleGroupItem>
						</ToggleGroup>
						{mode === "day" && <DatePickerFilter mode={mode} date={date} />}
					</div>
					{auth.permissions.includes("examination:create") && (
						<Link
							href={`/admin/examinations/examine?returnTo=${encodeURIComponent(
								returnTo
							)}`}
							className="no-underline"
						>
							<Button size="lg" variant="outline" className="cursor-pointer">
								<Plus className="size-4 mr-2" /> Tiếp nhận
							</Button>
						</Link>
					)}
				</div>
			</header>

			<div className="bg-white rounded shadow">
				<Table>
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
														// action={deleteUserAction}
														className="mt-3 flex items-center gap-2 justify-end"
													>
														{/* <input type="hidden" name="id" value={user.id} /> */}
														<input type="hidden" name="page" value={page} />
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
											examination.status == "WAITING") && (
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

			<nav className="flex items-center justify-between">
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
		</div>
	);
}

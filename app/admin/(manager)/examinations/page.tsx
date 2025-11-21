import { requireAuth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { PageParams } from "./_types/page-params";
import { validateParams } from "@/app/admin/(manager)/examinations/_utils/validate-page-params";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Edit3, Eye, Plus, Trash2 } from "lucide-react";
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
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { deleteServiceAction } from "@/app/admin/(manager)/services/_actions/delete";
import {
	Pagination,
	PaginationContent,
	PaginationItem,
	PaginationNext,
	PaginationPrevious,
} from "@/components/ui/pagination";
import { getPaginationExamination } from "@/lib/examination";
import { formatDateTime } from "./_utils/format-date-time";
import { Badge } from "@/components/ui/badge";
import { formatDate } from './_utils/format-date';

type PropsType = {
	searchParams: Promise<PageParams>;
};

export default async function ExaminationPage({ searchParams }: PropsType) {
	const auth = await requireAuth();

	if (!auth.permissions.includes("examination:read"))
		redirect("/admin/forbidden");

	const resolvedParams = await searchParams;

	const { mode, page, date } = validateParams(resolvedParams);

	const { total, examinations } = await getPaginationExamination(
		page,
		10,
		{ mode, date }
	);

	const totalPages = Math.max(1, Math.ceil(total / 10));

	return (
		<div className="space-y-4">
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
						<Link href="/admin/examination/create" className="no-underline">
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
							<TableHead>Tên phụ huynh</TableHead>
							<TableHead>SĐT phụ huynh</TableHead>
							<TableHead>Tên bé</TableHead>
							<TableHead>Ngày sinh</TableHead>
							<TableHead>Giới tính bé</TableHead>
							<TableHead>Giờ khám</TableHead>
							<TableHead>Trạng thái</TableHead>
							<TableHead>Kiểu</TableHead>
							<TableHead className="text-left">Thao tác</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{examinations.map((examination) => (
							<TableRow key={examination.id}>
								<TableCell className="font-medium">
									{examination.parentName}
								</TableCell>
								<TableCell>{examination.parentPhone}</TableCell>
								<TableCell>{examination.kidName}</TableCell>
								<TableCell>
									{formatDate(examination.kidBirthDate)}
								</TableCell>
								<TableCell>{examination.kidGender ? "Nam" : "Nữ"}</TableCell>
								<TableCell>{formatDateTime(examination.date)}</TableCell>
								<TableCell>{<Badge>{examination.status}</Badge>}</TableCell>
								<TableCell>{<Badge>{examination.type}</Badge>}</TableCell>
								<TableCell>
									<div className="flex items-center gap-2">
										<Link href={`/admin/examinations/${examination.id}`}>
											<Tooltip>
												<TooltipTrigger asChild>
													<Button
														className="cursor-pointer"
														variant="ghost"
														size="icon"
													>
														<Eye className="size-4" />
													</Button>
												</TooltipTrigger>
												<TooltipContent side="left">
													<p>Xem chi tiết</p>
												</TooltipContent>
											</Tooltip>
										</Link>

										{auth.permissions.includes("service:update") && (
											<Link href={`/admin/examinations/${examination.id}/edit`}>
												<Tooltip>
													<TooltipTrigger asChild>
														<Button
															className="cursor-pointer"
															variant="ghost"
															size="icon"
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

										{auth.permissions.includes("service:delete") && (
											<Tooltip>
												<Popover>
													<PopoverTrigger asChild>
														<TooltipTrigger asChild>
															<Button
																className="cursor-pointer"
																variant="ghost"
																size="icon"
															>
																<Trash2 className="size-4 text-destructive" />
															</Button>
														</TooltipTrigger>
													</PopoverTrigger>

													<PopoverContent className="w-[260px]" side="top">
														<p className="text-sm">
															Bạn có chắc muốn xóa dịch vụ này không?
														</p>

														<form
															action={deleteServiceAction}
															className="mt-3 flex items-center gap-2 justify-end"
														>
															<input
																type="hidden"
																name="id"
																value={examination.id}
															/>
															<input type="hidden" name="page" value={page} />
															<Button
																type="submit"
																variant="destructive"
																className="cursor-pointer"
																size="sm"
															>
																Xóa
															</Button>
														</form>
													</PopoverContent>
												</Popover>
												<TooltipContent side="right">
													<p>Xóa</p>
												</TooltipContent>
											</Tooltip>
										)}
									</div>
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

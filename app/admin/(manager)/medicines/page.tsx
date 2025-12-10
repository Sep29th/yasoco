import { requireAuth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import {
	Eye,
	Edit3,
	Trash2,
	Plus,
	FileSpreadsheet,
	Search,
} from "lucide-react";
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
import { getPaginationMedicines, getMedicineById } from "@/lib/medicine";
import { deleteMedicineAction } from "./_actions/delete";
import MedicineModalContent from "./_components/modal-content";
type PropsType = {
	searchParams: Promise<{
		page?: string;
		error?: string;
		modal?: string;
		search?: string;
	}>;
};
export default async function MedicinesPage({ searchParams }: PropsType) {
	const auth = await requireAuth();
	if (!auth.permissions.includes("medicine:read")) {
		redirect("/admin/forbidden");
	}
	const sp = await searchParams;
	const spTyped = sp as Record<string, string | undefined>;
	const errorMessage =
		typeof spTyped.error === "string" ? spTyped.error.trim() : "";
	const page = Math.max(1, parseInt((sp.page as string) || "1", 10) || 1);
	const pageSize = 10;
	const { search } = sp;
	const searchRaw = typeof search === "string" ? search.trim() : "";
	const { total, medicines } = await getPaginationMedicines(
		page,
		pageSize,
		search
	);
	const totalPages = Math.max(1, Math.ceil(total / pageSize));
	const modalId = String(spTyped.modal ?? "").trim();
	const formatDateTime = (value: Date | string) =>
		new Intl.DateTimeFormat("vi-VN", {
			dateStyle: "medium",
			timeStyle: "short",
		}).format(new Date(value));
	const modalData = modalId
		? await getMedicineById(modalId).catch(() => null)
		: null;
	return (
		<div className="space-y-4">
			{errorMessage && (
				<div className="rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">
					{errorMessage}
				</div>
			)}
			<header className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
				<h1 className="text-2xl font-semibold">Thuốc</h1>
				<div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3 w-full md:w-auto">
					<form method="get" className="w-full sm:w-60">
						<div className="relative">
							<Input
								name="search"
								defaultValue={searchRaw}
								placeholder="Tìm tên thuốc, mô tả..."
								className="w-full bg-white pr-8"
							/>
							<Search className="absolute right-2.5 top-2.5 h-4 w-4 text-muted-foreground pointer-events-none" />
						</div>
					</form>
					<div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
						{auth.permissions.includes("medicine:create") && (
							<>
								<Link
									href="/admin/medicines/import-excel"
									className="no-underline w-full sm:w-auto"
								>
									<Button
										size="lg"
										className="cursor-pointer bg-[#A6CF52] hover:bg-[#94B846] w-full sm:w-auto"
									>
										<FileSpreadsheet className="size-4 mr-2" /> Nhập Excel
									</Button>
								</Link>
								<Link
									href="/admin/medicines/create"
									className="no-underline w-full sm:w-auto"
								>
									<Button
										size="lg"
										variant="outline"
										className="cursor-pointer w-full sm:w-auto bg-white"
									>
										<Plus className="size-4 mr-2" /> Thêm thuốc
									</Button>
								</Link>
							</>
						)}
					</div>
				</div>
			</header>
			<div className="bg-white rounded shadow">
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead>Tên thuốc</TableHead>
							<TableHead>Đơn vị</TableHead>
							<TableHead>Tạo lúc</TableHead>
							<TableHead>Mô tả</TableHead>
							<TableHead className="text-left">Thao tác</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{medicines.map((medicine) => (
							<TableRow key={medicine.id}>
								<TableCell className="font-medium">{medicine.name}</TableCell>
								<TableCell>{medicine.unit}</TableCell>
								<TableCell>{formatDateTime(medicine.createdAt)}</TableCell>
								<TableCell
									className="max-w-xs truncate"
									title={medicine.description || ""}
								>
									{medicine.description || "-"}
								</TableCell>
								<TableCell>
									<div className="flex items-center gap-2">
										<Link
											href={`/admin/medicines?modal=${
												medicine.id
											}&page=${page}${searchRaw ? `&search=${searchRaw}` : ""}`}
										>
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
										{auth.permissions.includes("medicine:update") && (
											<Link href={`/admin/medicines/${medicine.id}/edit`}>
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
										{auth.permissions.includes("medicine:delete") && (
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
															Bạn có chắc muốn xóa thuốc này không?
														</p>
														<form
															action={deleteMedicineAction}
															className="mt-3 flex items-center gap-2 justify-end"
														>
															<input
																type="hidden"
																name="id"
																value={medicine.id}
															/>
															<input type="hidden" name="page" value={page} />
															{searchRaw && (
																<input
																	type="hidden"
																	name="search"
																	value={searchRaw}
																/>
															)}
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
						{medicines.length === 0 && (
							<TableRow>
								<TableCell
									colSpan={6}
									className="text-center px-4 py-6 text-muted-foreground"
								>
									{searchRaw
										? `Không tìm thấy thuốc nào khớp với "${searchRaw}"`
										: "Không có thuốc nào"}
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
								href={`?page=${Math.max(1, page - 1)}${
									searchRaw ? `&search=${searchRaw}` : ""
								}`}
								className={
									page <= 1
										? "opacity-50 pointer-events-none cursor-not-allowed"
										: "cursor-pointer"
								}
							/>
						</PaginationItem>
						<PaginationItem>
							<span className="px-3 py-1 border rounded bg-white">
								{page} / {totalPages}
							</span>
						</PaginationItem>
						<PaginationItem>
							<PaginationNext
								href={`?page=${Math.min(totalPages, page + 1)}${
									searchRaw ? `&search=${searchRaw}` : ""
								}`}
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
			{modalData ? <MedicineModalContent data={modalData} /> : null}
		</div>
	);
}

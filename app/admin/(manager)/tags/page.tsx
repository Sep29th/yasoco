import { Button } from "@/components/ui/button";
import {
	Pagination,
	PaginationContent,
	PaginationItem,
	PaginationNext,
	PaginationPrevious,
} from "@/components/ui/pagination";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import {
	TableHead,
	TableBody,
	TableHeader,
	TableRow,
	TableCell,
	Table,
} from "@/components/ui/table";
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import { requireAuth } from "@/lib/auth";
import { getPaginationTags } from "@/lib/tag";
import { Edit3, Plus, Trash2 } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import TagBadge from "./_components/tag-badge";
import { deleteTag } from "./_actions/delete";
type SearchParams = { page: string };
type PropsType = { searchParams: Promise<Partial<SearchParams>> };
const formatDateTime = (value: Date | string) =>
	new Intl.DateTimeFormat("vi-VN", {
		dateStyle: "medium",
		timeStyle: "short",
	}).format(new Date(value));
const validateSearchParams = (params: Partial<SearchParams>) => {
	const value = { page: 0 };
	if (!params.page) {
		value.page = 1;
	} else {
		const trimmed = params.page.trim();
		const numbered = Number(trimmed);
		if (!isNaN(numbered) && trimmed !== "") {
			value.page = numbered;
		} else value.page = 1;
	}
	return value;
};
export default async function TagPage({ searchParams }: PropsType) {
	const auth = await requireAuth();
	if (!auth.permissions.includes("tag:read")) {
		redirect("/admin/forbidden");
	}
	const { page } = validateSearchParams(await searchParams);
	const pageSize = 10;
	const { total, tags } = await getPaginationTags(page, pageSize);
	const totalPages = Math.max(1, Math.ceil(total / pageSize));
	return (
		<div className="space-y-4">
			<header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
				<h1 className="text-2xl font-semibold">Chủ đề</h1>
				<div className="flex flex-col items-stretch gap-2 sm:flex-row sm:items-center sm:gap-3">
					{auth.permissions.includes("tag:create") && (
						<Link
							href="/admin/tags/create"
							className="no-underline w-full sm:w-auto"
						>
							<Button
								size="lg"
								variant="outline"
								className="cursor-pointer w-full sm:w-auto"
							>
								<Plus className="size-4 mr-2" /> Thêm chủ đề
							</Button>
						</Link>
					)}
				</div>
			</header>
			<div className="bg-white rounded shadow">
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead>Tên chủ đề</TableHead>
							<TableHead>Tạo lúc</TableHead>
							<TableHead className="text-left">Thao tác</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{tags.map((tag) => (
							<TableRow key={tag.id}>
								<TableCell className="font-medium">
									<TagBadge content={tag.name} color={tag.color} />
								</TableCell>
								<TableCell>{formatDateTime(tag.createdAt)}</TableCell>
								<TableCell>
									<div className="flex items-center gap-2">
										{auth.permissions.includes("tag:update") && (
											<Link href={`/admin/tags/${tag.id}/edit`}>
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
										{auth.permissions.includes("tag:delete") && (
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
															Bạn có chắc muốn xóa chủ đề này không?
														</p>
														<form
															action={deleteTag}
															className="mt-3 flex items-center gap-2 justify-end"
														>
															<input type="hidden" name="id" value={tag.id} />
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
						{tags.length === 0 && (
							<TableRow>
								<TableCell
									colSpan={5}
									className="text-center px-4 py-6 text-muted-foreground"
								>
									Không có chủ đề nào
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

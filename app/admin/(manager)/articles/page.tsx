/* eslint-disable @next/next/no-img-element */
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { getPaginationArticle } from "@/lib/article";
import { requireAuth } from "@/lib/auth";
import { Check, Edit3, Search, Trash2 } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import AddArticleButtonModal from "./_components/add-article-button-modal";
import { getAllTags } from "@/lib/tag";
import { TagFilter } from "./_components/tag-filter";

type SearchParams = {
	page: string;
	groupByTagId: string;
	search: string;
};

type PropsType = {
	searchParams: Promise<Partial<SearchParams>>;
};

const validateSearchParams = (params: Partial<SearchParams>) => {
	const value = { page: 1, groupByTagId: "", search: "" };
	if (params.page) {
		const trimmed = params.page.trim();
		const numbered = Number(trimmed);
		if (!isNaN(numbered) && trimmed !== "") {
			value.page = numbered;
		} else {
			value.page = 1;
		}
	}
	if (
		params.groupByTagId &&
		/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
			params.groupByTagId
		)
	) {
		value.groupByTagId = params.groupByTagId;
	}
	if (params.search && /^[\p{L}\p{N}\s]+$/u.test(params.search)) {
		value.search = params.search;
	}
	return value;
};

export default async function ArticlePage({ searchParams }: PropsType) {
	const auth = await requireAuth();
	if (!auth.permissions.includes("article:read")) {
		redirect("/admin/forbidden");
	}
	const sp = await searchParams;
	const spTyped = sp as Record<string, string | undefined>;
	const errorMessage =
		typeof spTyped.error === "string" ? spTyped.error.trim() : "";
	const { page, groupByTagId, search } = validateSearchParams(sp);
	const pageSize = 10;

	const [paginationResult, tags] = await Promise.all([
		getPaginationArticle(page, pageSize, groupByTagId, search),
		getAllTags(),
	]);
	const { total, articles } = paginationResult;
	const totalPages = Math.max(1, Math.ceil(total / pageSize));

	return (
		<div className="space-y-4">
			{errorMessage && (
				<div className="rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">
					{errorMessage}
				</div>
			)}
			<header className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
				<h1 className="text-2xl font-semibold">Bài viết</h1>

				<div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3 w-full md:w-auto">
					<TagFilter tags={tags} currentTagId={groupByTagId} />
					<form method="get" className="w-full sm:w-60">
						{groupByTagId && (
							<input type="hidden" name="groupByTagId" value={groupByTagId} />
						)}

						<div className="relative">
							<Input
								name="search"
								defaultValue={search}
								placeholder="Tìm bài viết..."
								className="w-full bg-white pr-8"
							/>
							<Search className="absolute right-2.5 top-2.5 h-4 w-4 text-muted-foreground pointer-events-none" />
						</div>
					</form>

					<div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
						{auth.permissions.includes("article:create") && (
							<AddArticleButtonModal />
						)}
					</div>
				</div>
			</header>
			<div className="bg-white rounded shadow">
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead>Chủ đề</TableHead>
							<TableHead>Đường dẫn</TableHead>
							<TableHead>Ảnh bìa</TableHead>
							<TableHead>Hiện trên trang chủ</TableHead>
							<TableHead>Xuất bản</TableHead>
							<TableHead className="text-left">Thao tác</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{articles.map((article) => (
							<TableRow key={article.id}>
								<TableCell className="font-medium">{article.title}</TableCell>
								<TableCell>
									<Badge variant="secondary">{article.slug}</Badge>
								</TableCell>
								<TableCell>
									{article.coverImage ? (
										<img
											src={article.coverImage}
											alt={`cover-image-${article.id}`}
											className="w-25 object-cover rounded"
										/>
									) : (
										<></>
									)}
								</TableCell>
								<TableCell>{article.showInMainPage ? <Check /> : ""}</TableCell>
								<TableCell>{article.isPublished ? <Check /> : ""}</TableCell>
								<TableCell>
									<div className="flex items-center gap-2">
										{auth.permissions.includes("article:update") && (
											<Link href={`/admin/articles/${article.id}/edit`}>
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
										{auth.permissions.includes("article:delete") && (
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
															Bạn có chắc muốn xóa bài viết này không?
														</p>
														<form
															// action={deleteMedicineAction}
															className="mt-3 flex items-center gap-2 justify-end"
														>
															<input
																type="hidden"
																name="id"
																value={article.id}
															/>
															<input type="hidden" name="page" value={page} />
															{groupByTagId && (
																<input
																	type="hidden"
																	name="groupByTagId"
																	value={groupByTagId}
																/>
															)}
															{search && (
																<input
																	type="hidden"
																	name="search"
																	value={search}
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
						{articles.length === 0 && (
							<TableRow>
								<TableCell
									colSpan={6}
									className="text-center px-4 py-6 text-muted-foreground"
								>
									{search
										? `Không tìm thấy bài viết nào khớp với "${search}"`
										: "Không có bài viết nào"}
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
									search ? `&search=${search}` : ""
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
									search ? `&search=${search}` : ""
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
		</div>
	);
}

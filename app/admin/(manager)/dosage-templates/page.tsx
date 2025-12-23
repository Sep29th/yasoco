import {requireAuth} from "@/lib/auth";
import {redirect} from "next/navigation";
import {getPaginationDosageTemplate} from "@/lib/dosage-template";
import Link from "next/link";
import {Button} from "@/components/ui/button";
import {Edit3, Trash2} from "lucide-react";
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from "@/components/ui/table";
import {Tooltip, TooltipContent, TooltipTrigger} from "@/components/ui/tooltip";
import {Popover, PopoverContent, PopoverTrigger} from "@/components/ui/popover";
import {
	Pagination,
	PaginationContent,
	PaginationItem,
	PaginationNext,
	PaginationPrevious
} from "@/components/ui/pagination";
import {Badge} from "@/components/ui/badge";
import deleteDosageTemplateAction from "./_actions/delete-dosage-template";
import AddDosageTemplateButton from "@/app/admin/(manager)/dosage-templates/_components/add-dosage-template-button";
import UpdateDosageTemplateButton
	from "@/app/admin/(manager)/dosage-templates/_components/update-dosage-template-button";

type SearchParams = { page: string };
type PropsType = { searchParams: Promise<Partial<SearchParams>> };
const validateSearchParams = (params: Partial<SearchParams>) => {
	const value = {page: 1};
	if (params.page) {
		const trimmed = params.page.trim();
		const numbered = Number(trimmed);
		if (!isNaN(numbered) && trimmed !== "") {
			value.page = numbered;
		} else {
			value.page = 1;
		}
	}
	return value;
};

export default async function DosageTemplatesPage({searchParams}: PropsType) {
	const auth = await requireAuth();
	if (!auth.permissions.includes("medicine:read")) redirect("/admin/forbidden");

	const {page} = validateSearchParams(await searchParams);
	const pageSize = 15;

	const {total, dosageTemplates} = await getPaginationDosageTemplate(page, pageSize);
	const totalPages = Math.max(1, Math.ceil(total / pageSize));

	return (
		<div className="space-y-4">
			<header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
				<h1 className="text-2xl font-semibold">Mẫu liều dùng</h1>
				<div className="flex flex-col items-stretch gap-2 sm:flex-row sm:items-center sm:gap-3">
					{auth.permissions.includes("medicine:update") && (
						<AddDosageTemplateButton/>
					)}
				</div>
			</header>
			<div className="bg-white rounded shadow">
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead>Phím tắt</TableHead>
							<TableHead>Nội dung</TableHead>
							<TableHead className="text-left">Thao tác</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{dosageTemplates.map((dosageTemplate) => (
							<TableRow key={dosageTemplate.id}>
								<TableCell className="font-medium">
									<Badge variant="outline">{`@${dosageTemplate.shortcut}`}</Badge>
								</TableCell>
								<TableCell>{dosageTemplate.content}</TableCell>
								<TableCell>
									<div className="flex items-center gap-2">
										{auth.permissions.includes("medicine:update") && (
											<UpdateDosageTemplateButton dosageTemplate={dosageTemplate}/>
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
																<Trash2 className="size-4 text-destructive"/>
															</Button>
														</TooltipTrigger>
													</PopoverTrigger>
													<PopoverContent className="w-[260px]" side="top">
														<p className="text-sm">
															Bạn có chắc muốn xóa mẫu tắt này không?
														</p>
														<form
															action={deleteDosageTemplateAction}
															className="mt-3 flex items-center gap-2 justify-end"
														>
															<input type="hidden" name="id" value={dosageTemplate.id}/>
															<input type="hidden" name="page" value={page}/>
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
						{dosageTemplates.length === 0 && (
							<TableRow>
								<TableCell
									colSpan={5}
									className="text-center px-4 py-6 text-muted-foreground"
								>
									Không có mẫu tắt nào
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
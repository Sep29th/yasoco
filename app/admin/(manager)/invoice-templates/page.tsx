import {requireAuth} from "@/lib/auth";
import {redirect} from "next/navigation";
import {getPaginationInvoiceTemplates} from "@/lib/invoice-template";
import AddInvoiceTemplateButtonModal
	from "@/app/admin/(manager)/invoice-templates/_components/add-invoice-template-button-modal";
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from "@/components/ui/table";
import Link from "next/link";
import {Tooltip, TooltipContent, TooltipTrigger} from "@/components/ui/tooltip";
import {Button} from "@/components/ui/button";
import {Edit3} from "lucide-react";
import {
	Pagination,
	PaginationContent,
	PaginationItem,
	PaginationNext,
	PaginationPrevious
} from "@/components/ui/pagination";

type PropsType = {
	searchParams: Promise<{ page?: string }>
}

export default async function InvoiceTemplatesPage({searchParams}: PropsType) {
	const auth = await requireAuth();

	if (!auth.permissions.includes("invoice-template:read")) redirect("/admin/forbidden");

	const sp = await searchParams;
	const page = Math.max(1, parseInt((sp.page as string) || "1", 10) || 1);
	const pageSize = 10;

	const {total, invoiceTemplates} = await getPaginationInvoiceTemplates(page, pageSize);

	const totalPages = Math.max(1, Math.ceil(total / pageSize));

	return (
		<div className="space-y-4">
			<header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
				<h1 className="text-2xl font-semibold">Mẫu hóa đơn</h1>
				<div className="flex flex-col items-stretch gap-2 sm:flex-row sm:items-center sm:gap-3">
					{auth.permissions.includes("invoice-template:create") && <AddInvoiceTemplateButtonModal/>}
				</div>
			</header>
			<div className="bg-white rounded shadow">
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead>Tên mẫu hóa đơn</TableHead>
							<TableHead className="text-left">Thao tác</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{invoiceTemplates.map((invoiceTemplate) => (
							<TableRow key={invoiceTemplate.id}>
								<TableCell className="font-medium">{invoiceTemplate.name}</TableCell>
								<TableCell>
									<div className="flex items-center gap-2">
										{auth.permissions.includes("medicine:update") && (
											<Link href={`/admin/invoice-templates/${invoiceTemplate.id}/edit`}>
												<Tooltip>
													<TooltipTrigger asChild>
														<Button
															className="cursor-pointer"
															variant="ghost"
															size="icon"
														>
															<Edit3 className="size-4"/>
														</Button>
													</TooltipTrigger>
													<TooltipContent>
														<p>Chỉnh sửa</p>
													</TooltipContent>
												</Tooltip>
											</Link>
										)}

										{/*{auth.permissions.includes("medicine:delete") && (*/}
										{/*	<Tooltip>*/}
										{/*		<Popover>*/}
										{/*			<PopoverTrigger asChild>*/}
										{/*				<TooltipTrigger asChild>*/}
										{/*					<Button*/}
										{/*						className="cursor-pointer"*/}
										{/*						variant="ghost"*/}
										{/*						size="icon"*/}
										{/*					>*/}
										{/*						<Trash2 className="size-4 text-destructive" />*/}
										{/*					</Button>*/}
										{/*				</TooltipTrigger>*/}
										{/*			</PopoverTrigger>*/}

										{/*			<PopoverContent className="w-[260px]" side="top">*/}
										{/*				<p className="text-sm">*/}
										{/*					Bạn có chắc muốn xóa thuốc này không?*/}
										{/*				</p>*/}

										{/*				<form*/}
										{/*					action={deleteMedicineAction}*/}
										{/*					className="mt-3 flex items-center gap-2 justify-end"*/}
										{/*				>*/}
										{/*					<input*/}
										{/*						type="hidden"*/}
										{/*						name="id"*/}
										{/*						value={medicine.id}*/}
										{/*					/>*/}
										{/*					<input type="hidden" name="page" value={page} />*/}
										{/*					<Button*/}
										{/*						type="submit"*/}
										{/*						variant="destructive"*/}
										{/*						className="cursor-pointer"*/}
										{/*						size="sm"*/}
										{/*					>*/}
										{/*						Xóa*/}
										{/*					</Button>*/}
										{/*				</form>*/}
										{/*			</PopoverContent>*/}
										{/*		</Popover>*/}
										{/*		<TooltipContent side="right">*/}
										{/*			<p>Xóa</p>*/}
										{/*		</TooltipContent>*/}
										{/*	</Tooltip>*/}
										{/*)}*/}
									</div>
								</TableCell>
							</TableRow>
						))}

						{invoiceTemplates.length === 0 && (
							<TableRow>
								<TableCell
									colSpan={6}
									className="text-center px-4 py-6 text-muted-foreground"
								>
									Không có mẫu hóa đơn nào
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
	)
}
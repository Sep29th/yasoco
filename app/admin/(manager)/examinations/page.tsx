import { requireAuth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { PageParams } from "./_types/page-params";
import { validatePageParams } from "@/app/admin/(manager)/examinations/_utils/validate-page-params";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus } from "lucide-react";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { createQueryString } from "@/app/admin/(manager)/examinations/_utils/create-query-string";
import { DatePickerFilter } from "@/app/admin/(manager)/examinations/_components/date-picker-filter";
import { getPaginationExamination } from "@/lib/examination";
import ExaminationTable from "./_components/examination-table";
type PropsType = { searchParams: Promise<PageParams> };
export default async function ExaminationPage({ searchParams }: PropsType) {
	const auth = await requireAuth();
	if (!auth.permissions.includes("examination:read"))
		redirect("/admin/forbidden");
	const resolvedParams = await searchParams;
	const spTyped = resolvedParams as Record<string, string | undefined>;
	const errorMessage =
		typeof spTyped.error === "string" ? spTyped.error.trim() : "";
	const { mode, page, date, phone } = validatePageParams(resolvedParams);
	const { total, examinations } = await getPaginationExamination(page, 10, {
		mode,
		date,
		phone: phone || undefined,
	});
	const phoneRaw = (spTyped.phone || "").trim();
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
			<header className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
				<h1 className="text-2xl font-semibold">Lịch khám</h1>
				<div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3 w-full md:w-auto">
					<form
						method="get"
						className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-2 w-full"
					>
						<input type="hidden" name="mode" value={mode} />
						{mode === "day" && <input type="hidden" name="date" value={date} />}
						<div className="w-full sm:w-60">
							<Input
								name="phone"
								type="tel"
								inputMode="numeric"
								placeholder="Lọc theo SĐT phụ huynh"
								defaultValue={phoneRaw}
								className="w-full"
								pattern="^(?:\+?84|0)(?:3|5|7|8|9)[0-9]{8}$"
								title="Số điện thoại không hợp lệ"
							/>
						</div>
						<div className="flex items-center justify-end gap-2">
							<ToggleGroup type="single" variant={"outline"} value={mode}>
								<ToggleGroupItem
									value="all"
									className={"cursor-pointer"}
									asChild
								>
									<Link href={createQueryString(resolvedParams, "all")}>
										<span>Tất cả</span>
									</Link>
								</ToggleGroupItem>
								<ToggleGroupItem
									value="day"
									className={"cursor-pointer"}
									asChild
								>
									<Link href={createQueryString(resolvedParams, "day")}>
										<span>Theo ngày</span>
									</Link>
								</ToggleGroupItem>
							</ToggleGroup>
							{mode === "day" && <DatePickerFilter date={date} />}
						</div>
					</form>
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
			<ExaminationTable
				examinations={examinations}
				auth={auth}
				page={page}
				returnTo={returnTo}
				totalPages={totalPages}
				mode={mode}
				date={date}
			/>
		</div>
	);
}

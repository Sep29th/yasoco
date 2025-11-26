import ExaminationFormClient from "@/app/admin/(manager)/examinations/examine/_components/examination-form-client";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ExamineParams } from "./_types/examine-params";
import { requireAuth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { validateExamineParams } from "./_utils/validate-examine-params";
import { getExaminationById } from "@/lib/examination";
import { getAllMedicines } from "@/lib/medicine";
import { getAllServices } from "@/lib/service";
import { getExaminationFee } from "@/lib/examination-fee";
import { ExaminationStatus } from "@/lib/generated/prisma";
import ExaminationDetailModalButton from "../_components/examination-detail-modal-button";
import updateStatus from "./_actions/update-status";
type PropsType = { searchParams: Promise<ExamineParams> };
const renderTitle = (status: ExaminationStatus | undefined) => {
	if (status == "PENDING_PAYMENT") return "Thanh toán";
	else if (status == "IN_PROGRESS" || status == "WAITING") return "Khám";
	else return "Tiếp nhận";
};
const renderDescription = (status: ExaminationStatus | undefined) => {
	if (status == "PENDING_PAYMENT") return "Thanh toán cho lịch khám";
	else if (status == "IN_PROGRESS" || status == "WAITING")
		return "Tiến hành khám và điền đầy đủ thông tin ca khám";
	else if (!status)
		return "Thiết lập thông tin cho bệnh nhân không có lịch trước";
	return "Thiết lập thông tin cho bệnh nhân";
};
export default async function ExaminePage({ searchParams }: PropsType) {
	const auth = await requireAuth();
	if (!auth.permissions.includes("examination:update"))
		redirect("/admin/forbidden");
	const resolvedParams = await searchParams;
	const spTyped = resolvedParams as Record<string, string | undefined>;
	const errorMessage =
		typeof spTyped.error === "string" ? spTyped.error.trim() : "";
	const { examinationId, returnTo } = validateExamineParams(resolvedParams);
	let examination = undefined;
	if (examinationId) {
		examination = await getExaminationById(examinationId);
		if (!examination) redirect(`${returnTo}&error=Lịch khám không tồn tại`);
	}
	const [medicines, services, examinationFee] = await Promise.all([
		getAllMedicines(),
		getAllServices(),
		getExaminationFee(),
	]);
	if (examination && examination.status === ExaminationStatus.WAITING) {
		await updateStatus(examination.id, ExaminationStatus.IN_PROGRESS);
		examination.status = ExaminationStatus.IN_PROGRESS;
	}
	const initialFormValue = {
		id: examination?.id,
		parentName: examination?.parentName,
		parentPhone: examination?.parentPhone,
		kidName: examination?.kidName,
		kidGender: examination?.kidGender,
		kidBirthDate: examination?.kidBirthDate,
		kidWeight: examination?.kidWeight,
		symptoms: examination?.symptoms,
		diagnose: examination?.diagnose,
		services: examination?.services,
		medicines: examination?.medicines,
		note: examination?.note,
		status: examination?.status,
		type: examination?.type,
	};
	return (
		<div className="space-y-6">
			{errorMessage && (
				<div className="rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">
					{errorMessage}
				</div>
			)}
			<header className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
				<div>
					<h1 className="text-2xl font-semibold">
						{renderTitle(examination?.status)}
					</h1>
					<p className="text-sm text-muted-foreground">
						{renderDescription(examination?.status)}
					</p>
				</div>
				<div className="justify-end items-center gap-2">
					{examination?.id && (
						<ExaminationDetailModalButton examinationId={examination.id} />
					)}
					<Link href={returnTo} className="no-underline">
						<Button variant="outline" className="cursor-pointer">
							Quay lại
						</Button>
					</Link>
				</div>
			</header>
			<ExaminationFormClient
				initialFormValue={initialFormValue}
				data={{
					medicines,
					services,
					examinationFee: examinationFee?.value || 0,
				}}
				returnTo={returnTo}
			/>
		</div>
	);
}

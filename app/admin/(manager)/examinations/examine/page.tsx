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

type PropsType = {
	searchParams: Promise<ExamineParams>;
};

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
			<header className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
				<div>
					<h1 className="text-2xl font-semibold">
						{renderTitle(examination?.status)}
					</h1>
					<p className="text-sm text-muted-foreground">
						{renderDescription(examination?.status)}
					</p>
				</div>
				<Link href={returnTo} className="no-underline">
					<Button variant="outline" className="cursor-pointer">
						Quay lại
					</Button>
				</Link>
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

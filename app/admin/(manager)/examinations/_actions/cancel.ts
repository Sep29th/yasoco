"use server";
import { getCurrentUser, requireAuth } from "@/lib/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { ExaminationStatus } from "@/lib/generated/prisma";
import { pusherServer } from "@/lib/pusher-server";
export default async function cancelExamination(formData: FormData) {
	const returnTo = String(formData.get("returnTo") ?? "").trim();
	const id = String(formData.get("id") ?? "").trim();
	try {
		if (!id) throw new Error("Id lịch khám không hợp lệ");
		const auth = await requireAuth();
		if (!auth.permissions.includes("examination:update"))
			throw new Error("Không có quyền");
		const exist = await prisma.examination.findUnique({ where: { id } });
		if (!exist) throw new Error("Lịch khám không tồn tại");
		if (exist.status === "CANCELLED" || exist.status === "COMPLETED")
			throw new Error("Lịch khám đã bị hủy sẵn hoặc đã hoàn thành");
		const user = await getCurrentUser();
		const userInfo = { id: user.id, name: user.name, phone: user.phone };
		await prisma.examination.update({
			where: { id },
			data: { status: ExaminationStatus.CANCELLED, cancelledBy: userInfo },
		});
		await pusherServer.trigger("examination", "update", { id });
		redirect(returnTo);
	} catch (error) {
		const isNextRedirectError =
			typeof error === "object" &&
			error !== null &&
			"digest" in error &&
			(error as { digest?: string }).digest?.includes("NEXT_REDIRECT");
		if (isNextRedirectError) {
			throw error;
		}
		const errorMessage =
			error instanceof Error ? error.message : "Có lỗi xảy ra";
		redirect(
			`/admin/examinations/examine?returnTo=${returnTo}&error=${encodeURIComponent(
				errorMessage
			)}&examinationId=${id}`
		);
	}
}

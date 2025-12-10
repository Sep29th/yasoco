"use server";
import { redirect } from "next/navigation";
import { FormValues } from "../_schemas/form-schema";
import prisma from "@/lib/prisma";
import { getCurrentUser, requireAuth } from "@/lib/auth";
import { ExaminationStatus } from "@/lib/generated/prisma";
import { pusherServer } from "@/lib/pusher-server";
export default async function payAction(
	values: FormValues,
	returnTo: string,
	id: string
) {
	try {
		const auth = await requireAuth();
		if (!auth.permissions.includes("examination:update"))
			throw new Error("Không có quyền");
		const user = await getCurrentUser();
		const userInfo = {
			id: user.id,
			name: user.name,
			phone: user.phone,
			at: new Date(),
		};
		await prisma.$transaction(async (tx) => {
			const [existing, examinationFee] = await Promise.all([
				tx.examination.findUnique({
					where: { id },
					select: { date: true, status: true, type: true },
				}),
				tx.examinationFee.findFirst(),
			]);
			if (!existing) throw new Error("Examination not found");
			if (existing.status !== "PENDING_PAYMENT")
				throw new Error("Trạng thái không hợp lệ");
			const serviceFee = values.services.reduce(
				(prev, curr) => prev + curr.price * curr.quantity,
				0
			);
			const subTotal = serviceFee + (examinationFee?.value || 0);
			const totalDiscount = values.discounts.reduce(
				(prev, curr) =>
					prev +
					(curr.type === "fix" ? curr.value : subTotal * (curr.value / 100)),
				0
			);
			await Promise.all([
				tx.examination.update({
					where: { id },
					data: {
						...values,
						kidGender: values.kidGender === "male",
						status: ExaminationStatus.COMPLETED,
						paidBy: userInfo,
						examinationFee: examinationFee?.value || 0,
					},
				}),
				tx.invoice.create({
					data: {
						examinationFee: examinationFee?.value,
						serviceFee,
						totalDiscount,
					},
				}),
			]);
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

"use server";
import { redirect } from "next/navigation";
import { FormValues } from "../_schemas/form-schema";
import prisma from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { pusherServer } from "@/lib/pusher-server";
export default async function updateAction(
	values: FormValues,
	returnTo: string,
	id: string
) {
	try {
		const auth = await requireAuth();
		if (!auth.permissions.includes("examination:update"))
			throw new Error("Không có quyền");
		const existing = await prisma.examination.findUnique({
			where: { id },
			select: { date: true, status: true, type: true },
		});
		if (!existing) throw new Error("Examination not found");
		if (existing.status !== "COMPLETED" && existing.status !== "CANCELLED")
			throw new Error("Trạng thái không hợp lệ");
		await prisma.examination.update({
			where: { id },
			data: {
				...values,
				kidGender: values.kidGender === "male",
			},
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

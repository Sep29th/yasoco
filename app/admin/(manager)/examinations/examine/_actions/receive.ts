"use server";
import { redirect } from "next/navigation";
import { FormValues } from "../_schemas/form-schema";
import prisma from "@/lib/prisma";
import { getCurrentUser, requireAuth } from "@/lib/auth";
import { ExaminationStatus, ExaminationType } from "@/lib/generated/prisma";
import { pusherServer } from "@/lib/pusher-server";
export default async function receiveAction(
	values: FormValues,
	returnTo: string,
	id?: string
) {
	try {
		const auth = await requireAuth();
		if (
			!auth.permissions.includes("examination:update") ||
			!auth.permissions.includes("examination:create")
		)
			throw new Error("Không có quyền");
		const user = await getCurrentUser();
		const userInfo = {
			id: user.id,
			name: user.name,
			phone: user.phone,
			at: new Date(),
		};
		const servicesJson = values.services.map((s) => ({
			id: s.id,
			name: s.name,
			price: s.price,
			description: s.description,
			quantity: s.quantity,
		}));
		const medicinesJson = values.medicines.map((m) => ({
			id: m.id,
			name: m.name,
			price: m.price,
			description: m.description,
			quantity: m.quantity,
			unit: m.unit,
		}));
		if (id) {
			const existing = await prisma.examination.findUnique({
				where: { id },
				select: { date: true, status: true, type: true },
			});
			if (!existing) throw new Error("Examination not found");
			if (existing.status !== "BOOKED")
				throw new Error("Trạng thái không hợp lệ");
			await prisma.examination.update({
				where: { id },
				data: {
					...values,
					kidGender: values.kidGender === "male",
					status: ExaminationStatus.WAITING,
					services: servicesJson,
					medicines: medicinesJson,
					receivedBy: userInfo,
				},
			});
			await pusherServer.trigger("examination", "update", { id });
		} else {
			const newEx = await prisma.examination.create({
				data: {
					...values,
					kidGender: values.kidGender === "male",
					date: new Date(),
					status: ExaminationStatus.WAITING,
					type: ExaminationType.WALK_IN,
					services: servicesJson,
					medicines: medicinesJson,
					receivedBy: userInfo,
				},
				select: { id: true },
			});
			await pusherServer.trigger("examination", "update", {
				id: newEx.id,
				date: new Date(),
			});
		}
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
		console.error(errorMessage);
		redirect(
			`/admin/examinations/examine?returnTo=${returnTo}&error=${encodeURIComponent(
				errorMessage
			)}${id ? `&examinationId=${id}` : ""}`
		);
	}
}

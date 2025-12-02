"use server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { pusherServer } from "@/lib/pusher-server";
import { Examination, ExaminationStatus, ExaminationType } from "@/lib/generated/prisma";
export async function createFollowUp(
	data: Pick<
		Examination,
		| "parentName"
		| "parentPhone"
		| "kidName"
		| "kidBirthDate"
		| "kidGender"
		| "date"
	>
): Promise<{ success: boolean; message: string }> {
	try {
		const currentUser = await getCurrentUser();
		const userInfo = {
			id: currentUser.id,
			name: currentUser.name,
			phone: currentUser.phone,
			at: new Date(),
		};
		const checkStartTime = new Date(data.date);
		const checkEndTime = new Date(data.date.getTime() + 30 * 60000);
		const existingExamination = await prisma.examination.findFirst({
			where: {
				date: { gte: checkStartTime, lt: checkEndTime },
				status: { not: "CANCELLED" as ExaminationStatus },
			},
		});
		if (existingExamination) {
			return {
				success: false,
				message: `Đã có lịch khám tồn tại vào lúc ${data.date.toLocaleTimeString(
					"vi-VN",
					{ hour: "2-digit", minute: "2-digit" }
				)}. Vui lòng chọn giờ khác.`,
			};
		}
		const newExamination = await prisma.examination.create({
			data: {
				...data,
				status: ExaminationStatus.BOOKED,
				type: ExaminationType.FOLLOW_UP,
				bookedBy: userInfo,
			},
			select: { id: true },
		});
		await pusherServer.trigger("examination", "update", {
			id: newExamination.id,
			date: data.date,
		});
		return { success: true, message: "Tạo lịch tái khám thành công!" };
	} catch (error) {
		console.error("Error creating follow-up:", error);
		return {
			success: false,
			message: "Đã xảy ra lỗi hệ thống. Vui lòng thử lại.",
		};
	}
}

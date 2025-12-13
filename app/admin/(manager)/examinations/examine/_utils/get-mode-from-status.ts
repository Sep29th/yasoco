import { ExaminationStatus } from "@/lib/generated/prisma";
export const getModeFromStatus = (
	status?: ExaminationStatus
): "receive" | "examine" | "pay" | "edit" => {
	if (!status) return "receive";
	if (status === "BOOKED") return "receive";
	if (status === "IN_PROGRESS" || status === "WAITING") return "examine";
	if (status === "PENDING_PAYMENT") return "pay";
	if (status === "COMPLETED" || status === "CANCELLED") return "edit";
	return "receive";
};

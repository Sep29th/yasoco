import { Badge } from "@/components/ui/badge";
import { ExaminationStatus } from "@/lib/generated/prisma";
type PropsType = { status: ExaminationStatus };
const statusBadge: Record<
	ExaminationStatus,
	{ text: string; className: string }
> = {
	BOOKED: { text: "Có lịch trước", className: "text-blue-600 border-blue-600" },
	WAITING: { text: "Chờ khám", className: "text-yellow-600 border-yellow-600" },
	IN_PROGRESS: {
		text: "Đang khám",
		className: "text-indigo-600 border-indigo-600",
	},
	PENDING_PAYMENT: {
		text: "Chờ thanh toán",
		className: "text-orange-600 border-orange-600",
	},
	COMPLETED: {
		text: "Đã hoàn thành",
		className: "text-green-600 border-green-600",
	},
	CANCELLED: { text: "Đã hủy", className: "text-red-600 border-red-600" },
};
export default function ExaminationStatusBadge({ status }: PropsType) {
	const { text, className } = statusBadge[status];
	return (
		<Badge variant="outline" className={className}>
			{text}
		</Badge>
	);
}

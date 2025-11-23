import {ExaminationStatus} from '@/lib/generated/prisma';
import {Badge} from "@/components/ui/badge";

type PropsType = {
	status: ExaminationStatus
}

const statusBadge = {
	[ExaminationStatus.BOOKED]: (
		<Badge variant="outline" className="text-blue-600 border-blue-600">
			Có lịch trước
		</Badge>
	),
	[ExaminationStatus.WAITING]: (
		<Badge variant="outline" className="text-yellow-600 border-yellow-600">
			Chờ khám
		</Badge>
	),
	[ExaminationStatus.IN_PROGRESS]: (
		<Badge variant="outline" className="text-indigo-600 border-indigo-600">
			Đang khám
		</Badge>
	),
	[ExaminationStatus.PENDING_PAYMENT]: (
		<Badge variant="outline" className="text-orange-600 border-orange-600">
			Chờ thanh toán
		</Badge>
	),
	[ExaminationStatus.COMPLETED]: (
		<Badge variant="outline" className="text-green-600 border-green-600">
			Đã hoàn thành
		</Badge>
	),
	[ExaminationStatus.CANCELLED]: (
		<Badge variant="outline" className="text-red-600 border-red-600">
			Đã hủy
		</Badge>
	),
}

export default function ExaminationStatusBadge({status}: PropsType) {
	return statusBadge[status];
}

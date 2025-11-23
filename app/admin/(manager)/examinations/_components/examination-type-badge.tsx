import {ExaminationType} from '@/lib/generated/prisma';
import {Badge} from "@/components/ui/badge";

type PropsType = {
	type: ExaminationType
}

const typeBadge = {
	[ExaminationType.PRE_BOOKED]: (
		<Badge className="bg-blue-600 text-white">
			Đặt trước
		</Badge>
	),
	[ExaminationType.FOLLOW_UP]: (
		<Badge className="bg-yellow-500 text-white">
			Khám lại
		</Badge>
	),
	[ExaminationType.WALK_IN]: (
		<Badge className="bg-indigo-600 text-white">
			Đến khám trực tiếp
		</Badge>
	)
}

export default function ExaminationTypeBadge({type}: PropsType) {
	return typeBadge[type];
}

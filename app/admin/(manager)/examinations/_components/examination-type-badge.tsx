import { ExaminationType } from "@/lib/generated/prisma";
import { Badge } from "@/components/ui/badge";
type PropsType = { type: ExaminationType };
const typeConfig: Record<ExaminationType, { text: string; className: string }> =
	{
		PRE_BOOKED: { text: "Đặt trước", className: "bg-blue-600 text-white" },
		FOLLOW_UP: { text: "Khám lại", className: "bg-yellow-500 text-white" },
		WALK_IN: {
			text: "Đến khám trực tiếp",
			className: "bg-indigo-600 text-white",
		},
	};
export default function ExaminationTypeBadge({ type }: PropsType) {
	const { text, className } = typeConfig[type];
	return <Badge className={className}>{text}</Badge>;
}

import { Clock, Phone, User } from "lucide-react";
import { formatDateTime } from "../_utils/format-date-time";
type PropsType = { title: string; snapshot: PrismaJson.UserSnapshotType };
export default function ActionItem({ title, snapshot }: PropsType) {
	return (
		<div className="flex flex-col space-y-2 border-b last:border-0 border-dashed pb-4 last:pb-0">
			<span className="text-sm font-semibold text-gray-800">{title}</span>
			<div className="flex items-start gap-2 text-sm text-gray-600">
				<User className="h-4 w-4 mt-0.5 shrink-0 text-gray-400" />
				<div className="flex flex-col min-w-0">
					<span className="font-medium wrap-break-word">{snapshot.name}</span>
					<div className="flex items-center gap-1 text-xs text-gray-500 mt-0.5">
						<Phone className="h-3 w-3 shrink-0" /> <span>{snapshot.phone}</span>
					</div>
				</div>
			</div>
			<div className="flex items-center gap-2 text-xs text-gray-400 bg-gray-50 p-2 rounded-md">
				<Clock className="h-3.5 w-3.5 shrink-0" />
				<span>{formatDateTime(snapshot.at ?? new Date())}</span>
			</div>
		</div>
	);
}

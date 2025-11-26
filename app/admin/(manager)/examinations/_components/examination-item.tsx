"use client";
import { CalendarIcon, Phone, User } from "lucide-react";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import ExaminationStatusBadge from "./examination-status-badge";
import ExaminationTypeBadge from "./examination-type-badge";
import { cn } from "@/lib/utils";
import { Examination } from '@/lib/generated/prisma';
type PropsType = {
	data: Pick<
		Examination,
		"id" | "parentName" | "parentPhone" | "kidName" | "date" | "status" | "type"
	>;
	onClick?: (id: string) => void;
	className?: string;
};
export default function ExaminationItem({
	data,
	onClick,
	className,
}: PropsType) {
	return (
		<div
			onClick={() => onClick?.(data.id)}
			className={cn(
				"group relative flex flex-col gap-3 rounded-lg border bg-white p-4 shadow-sm transition-all cursor-pointer",
				"hover:shadow-md hover:border-[#A6CF52] hover:bg-[#A6CF52]/5",
				className
			)}
		>
			<div className="absolute left-0 top-0 bottom-0 w-1 bg-[#A6CF52] rounded-l-lg opacity-0 group-hover:opacity-100 transition-opacity" />
			<div className="flex justify-between items-start gap-2 pl-2 group-hover:pl-3 transition-all">
				<div className="flex flex-col">
					<span className="font-bold text-gray-900 text-base group-hover:text-[#7fa332] transition-colors">
						{data.kidName}
					</span>
					<div className="mt-1">
						<ExaminationTypeBadge type={data.type} />
					</div>
				</div>
				<ExaminationStatusBadge status={data.status} />
			</div>
			<div className="flex flex-col gap-1.5 pl-2 group-hover:pl-3 transition-all">
				<div className="flex items-center gap-2 text-sm text-gray-600">
					<User className="h-3.5 w-3.5 text-gray-400 group-hover:text-[#A6CF52] shrink-0 transition-colors" />
					<span className="truncate">
						<span className="font-medium text-gray-700">{data.parentName}</span>
					</span>
				</div>
				<div className="flex items-center gap-2 text-sm text-gray-600">
					<Phone className="h-3.5 w-3.5 text-gray-400 group-hover:text-[#A6CF52] shrink-0 transition-colors" />
					<span className="font-mono text-gray-700">{data.parentPhone}</span>
				</div>
			</div>
			<div className="mt-auto pt-2 flex items-center gap-2 text-xs text-gray-500 border-t border-dashed border-gray-100 pl-2 group-hover:pl-3 transition-all">
				<CalendarIcon className="h-3.5 w-3.5 group-hover:text-[#A6CF52] transition-colors" />
				<span>
					{format(new Date(data.date), "HH:mm - dd/MM/yyyy", {
						locale: vi,
					})}
				</span>
			</div>
		</div>
	);
}

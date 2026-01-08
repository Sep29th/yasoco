"use client";

import { useRef, useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { CalendarIcon, Layers, Phone, Sparkles, User, Stethoscope } from "lucide-react";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import ExaminationStatusBadge from "./examination-status-badge";
import ExaminationTypeBadge from "./examination-type-badge";
import { cn } from "@/lib/utils";
import { Examination } from '@/lib/generated/prisma';
import ReadOnlyTiptap from "@/app/admin/(manager)/examinations/_components/read-only-tiptap";
import { isEmptyJSONContent } from "@/components/tiptap-editor";

// --- CUSTOM PORTAL ---
const Portal = ({ children }: { children: React.ReactNode }) => {
	const [mounted, setMounted] = useState(false);
	useEffect(() => setMounted(true), []);
	if (!mounted || typeof document === "undefined") return null;
	return createPortal(children, document.body);
};

type PropsType = {
	data: Pick<
		Examination,
		"id" | "parentName" | "parentPhone" | "kidName" | "date" | "status" | "type"
	> & Partial<Pick<Examination, "services" | "diagnose">>;
	onClick?: (id: string) => void;
	className?: string;
};

export default function ExaminationItem({
																					data,
																					onClick,
																					className,
																				}: PropsType) {
	const hasServices = Array.isArray(data.services) && data.services.length > 0;
	const hasDiagnose = !isEmptyJSONContent(data.diagnose ?? null);

	const cardRef = useRef<HTMLDivElement>(null);

	// [UPDATED STATE]: Lưu cả style và phía hiển thị (side)
	const [popupData, setPopupData] = useState<{
		style: React.CSSProperties;
		side: 'left' | 'right';
	} | null>(null);

	const handleMouseEnter = () => {
		if (!hasDiagnose || !cardRef.current) return;

		const rect = cardRef.current.getBoundingClientRect();
		const POPUP_WIDTH = 320;
		const GAP = 12;

		let left = rect.right + GAP;
		let side: 'left' | 'right' = 'right'; // Mặc định hiện bên phải

		// Logic tự động lật
		if (left + POPUP_WIDTH > window.innerWidth) {
			left = rect.left - POPUP_WIDTH - GAP;
			side = 'left'; // Đã lật sang trái
		}

		setPopupData({
			style: {
				top: rect.top,
				left: left,
				position: 'fixed',
			},
			side: side,
		});
	};

	const handleMouseLeave = () => {
		setPopupData(null);
	};

	return (
		<>
			{/* --- MAIN CARD --- */}
			<div
				ref={cardRef}
				onClick={() => onClick?.(data.id)}
				onMouseEnter={handleMouseEnter}
				onMouseLeave={handleMouseLeave}
				className={cn(
					"group/wrapper relative flex flex-col gap-3 rounded-xl border bg-white p-4 shadow-sm transition-all duration-300 cursor-pointer overflow-hidden",
					"hover:shadow-md hover:border-[#A6CF52]/50",
					// Giữ border sáng khi popup đang mở
					popupData && "border-[#A6CF52]/50 shadow-md",
					className
				)}
			>
				<div className="absolute left-0 top-0 bottom-0 w-1 bg-[#A6CF52] opacity-0 group-hover/wrapper:opacity-100 transition-opacity duration-300" />

				{/* Header Info */}
				<div className="flex justify-between items-start gap-2 pl-1">
					<div className="flex flex-col">
            <span className="font-bold text-gray-900 text-base group-hover/wrapper:text-[#7fa332] transition-colors line-clamp-1">
              {data.kidName}
            </span>
						<div className="mt-1">
							<ExaminationTypeBadge type={data.type} />
						</div>
					</div>
					<ExaminationStatusBadge status={data.status} />
				</div>

				{/* Parent Info */}
				<div className="flex flex-col gap-2 pl-1 mt-1">
					<div className="flex items-center gap-2 text-sm text-gray-600">
						<User className="h-4 w-4 text-gray-400" />
						<span className="font-medium text-gray-700 truncate">{data.parentName}</span>
					</div>
					<div className="flex items-center gap-2 text-sm text-gray-600">
						<Phone className="h-4 w-4 text-gray-400" />
						<span className="font-mono text-gray-700">{data.parentPhone}</span>
					</div>
				</div>

				{/* Date */}
				<div className="mt-auto pt-3 flex items-center gap-2 text-xs text-gray-500 border-t border-dashed border-gray-100 pl-1">
					<CalendarIcon className="h-3.5 w-3.5" />
					<span>
            {format(new Date(data.date), "HH:mm - dd/MM/yyyy", { locale: vi })}
          </span>
				</div>

				{/* Slide-up Services */}
				{hasServices && data.services && (
					<div className={cn(
						"absolute inset-x-0 bottom-0 bg-white/95 backdrop-blur-sm z-10 flex flex-col border-t border-[#A6CF52]/20",
						"transition-transform duration-300 ease-in-out will-change-transform",
						"h-[80%] translate-y-full group-hover/wrapper:translate-y-0"
					)}>
						<div className="flex items-center justify-between px-4 py-2 bg-[#A6CF52]/10 text-[#5c7a1f]">
							<div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider">
								<Sparkles className="w-3.5 h-3.5" />
								Dịch vụ ({data.services.length})
							</div>
						</div>
						<div className="flex-1 overflow-y-auto p-3 space-y-2 scrollbar-thin scrollbar-thumb-gray-200 hover:scrollbar-thumb-[#A6CF52]/50">
							{data.services.map((service, idx) => (
								<div key={idx} className="flex items-center justify-between gap-3 border-b border-dashed border-gray-100 last:border-0 pb-2 last:pb-0">
                  <span className="text-xs font-medium text-gray-800 line-clamp-2 leading-snug flex-1">
                    {service.name}
                  </span>
									<div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 shrink-0">
										<Layers className="w-3 h-3 text-gray-400" />
										<span className="text-[10px] font-mono font-bold">SL: {service.quantity}</span>
									</div>
								</div>
							))}
						</div>
						<div className="absolute bottom-0 left-0 right-0 h-4 bg-gradient-to-t from-white to-transparent pointer-events-none" />
					</div>
				)}
			</div>

			{/* --- POPUP VIA PORTAL --- */}
			{popupData && (
				<Portal>
					<div
						className={cn(
							"w-[320px] rounded-xl border border-gray-200 bg-white shadow-2xl z-[9999] pointer-events-none animate-in fade-in zoom-in-95 duration-75",
							// Quan trọng: Không dùng overflow-hidden ở container chính này nữa, để mũi tên có thể chòi ra ngoài
							"visible"
						)}
						style={popupData.style}
					>
						{/* [UPDATED]: Mũi tên trang trí động */}
						<div
							className={cn(
								"absolute top-6 w-3 h-3 bg-white transform rotate-45 border-gray-200 z-10",
								// Nếu popup ở bên PHẢI -> Mũi tên nằm ở mép TRÁI (-left-1.5), có border TRÊN và TRÁI
								popupData.side === 'right' && "-left-1.5 border-l border-t",
								// Nếu popup ở bên TRÁI -> Mũi tên nằm ở mép PHẢI (-right-1.5), có border DƯỚI và PHẢI
								popupData.side === 'left' && "-right-1.5 border-r border-b"
							)}
						/>

						{/* Container nội dung cần bo góc và overflow hidden */}
						<div className="overflow-hidden rounded-xl relative z-20 bg-white">
							{/* Header */}
							<div className="flex items-center gap-2 px-4 py-3 bg-gray-50 border-b border-gray-100">
								<div className="p-1.5 rounded-md bg-[#A6CF52]/10 text-[#7fa332]">
									<Stethoscope className="w-4 h-4" />
								</div>
								<span className="font-bold text-sm text-gray-800 uppercase tracking-wide">
                  Chẩn đoán
                </span>
							</div>

							{/* Content */}
							<div className="p-4 max-h-[300px] overflow-hidden bg-white">
								<div className="prose prose-sm prose-p:text-gray-600 prose-headings:text-gray-800 max-w-none text-sm leading-relaxed line-clamp-[10]">
									<ReadOnlyTiptap label="" content={data.diagnose ?? null} />
								</div>
							</div>
						</div>
					</div>
				</Portal>
			)}
		</>
	);
}
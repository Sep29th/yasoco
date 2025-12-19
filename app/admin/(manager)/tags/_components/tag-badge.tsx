import { getContrastYIQ } from "@/utils/contrast-yiq";

type PropsType = {
	content: React.ReactNode;
	color: string;
	className?: string;
};

export default function TagBadge({
	content,
	color,
	className = "",
}: PropsType) {
	const textColor = getContrastYIQ(color);
	return (
		<span
			className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium shadow-sm transition-colors ${className}`}
			style={{
				backgroundColor: color,
				color: textColor,
			}}
		>
			{content}
		</span>
	);
}

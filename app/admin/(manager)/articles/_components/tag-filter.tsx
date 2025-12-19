"use client";

import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { useRouter, useSearchParams } from "next/navigation";

interface TagFilterProps {
	tags: { id: string; name: string; color: string }[];
	currentTagId?: string;
}

export function TagFilter({ tags, currentTagId }: TagFilterProps) {
	const router = useRouter();
	const searchParams = useSearchParams();

	const handleValueChange = (value: string) => {
		const params = new URLSearchParams(searchParams.toString());

		if (value && value !== "all") {
			params.set("groupByTagId", value);
		} else {
			params.delete("groupByTagId");
		}

		params.set("page", "1");

		router.push(`?${params.toString()}`);
	};

	return (
		<Select value={currentTagId || "all"} onValueChange={handleValueChange}>
			<SelectTrigger className="w-full sm:w-[180px] bg-white">
				<SelectValue placeholder="Chọn chủ đề" />
			</SelectTrigger>
			<SelectContent>
				<SelectItem value="all">Tất cả chủ đề</SelectItem>
				{tags.map((tag) => (
					<SelectItem key={tag.id} value={tag.id}>
						<div className="flex items-center gap-2">
							<span
								className="w-2 h-2 rounded-full"
								style={{ backgroundColor: tag.color }}
							/>
							{tag.name}
						</div>
					</SelectItem>
				))}
			</SelectContent>
		</Select>
	);
}

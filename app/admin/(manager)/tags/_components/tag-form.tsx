"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Tag } from "@/lib/generated/prisma";
import { RefreshCcw } from "lucide-react";
import { createTagAction } from "../_actions/create";
import { updateTagAction } from "../_actions/update";
import { getRandomPastelColor } from "../_utils/random-pastel";
import TagBadge from "./tag-badge";

type PropsType = {
	mode: "create" | "edit";
	tagId?: string;
	initialValues: Omit<Tag, "createdAt" | "updatedAt" | "id">;
};

export default function TagForm({ mode, initialValues, tagId }: PropsType) {
	const router = useRouter();
	const [name, setName] = useState(initialValues.name);
	const [color, setColor] = useState(initialValues.color);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		setError(null);

		const trimmedName = name.trim();
		const trimmedColor = color.trim();

		if (mode === "edit" && !tagId) {
			setError("Thiếu mã thẻ cần cập nhật");
			return;
		}

		if (!trimmedName) {
			setError("Tên thẻ không được bỏ trống");
			return;
		}

		const hexRegex = /^#([0-9A-F]{3}){1,2}$/i;
		if (!trimmedColor || !hexRegex.test(trimmedColor)) {
			setError("Mã màu không hợp lệ (Ví dụ: #FF0000)");
			return;
		}

		setLoading(true);
		try {
			const payload = {
				name: trimmedName,
				color: trimmedColor,
			};

			if (mode === "create") {
				await createTagAction(payload);
			} else if (tagId) {
				await updateTagAction({
					id: tagId,
					...payload,
				});
			}

			router.push("/admin/tags");
		} catch (err) {
			const message = err instanceof Error ? err.message : String(err);
			setError(message || "Có lỗi xảy ra");
		} finally {
			setLoading(false);
		}
	};

	return (
		<form
			onSubmit={handleSubmit}
			className="grid grid-cols-1 lg:grid-cols-3 gap-6"
		>
			<div className="lg:col-span-1 space-y-6">
				<div className="bg-white rounded shadow p-6 space-y-4">
					<div className="space-y-2">
						<Label htmlFor="name">Tên thẻ</Label>
						<Input
							id="name"
							value={name}
							onChange={(e) => setName(e.target.value)}
							placeholder="Ví dụ: Tim mạch, Tiêu hóa,..."
							disabled={loading}
						/>
					</div>
					<div className="space-y-2">
						<Label htmlFor="color">Màu nền (Hex)</Label>
						<div className="flex gap-2">
							<div className="relative w-10 h-10 shrink-0 overflow-hidden rounded border cursor-pointer">
								<input
									type="color"
									value={color}
									onChange={(e) => setColor(e.target.value)}
									className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[150%] h-[150%] p-0 m-0 border-0 cursor-pointer"
									disabled={loading}
								/>
							</div>
							<Input
								id="color"
								value={color}
								onChange={(e) => setColor(e.target.value)}
								placeholder="#000000"
								className="uppercase"
								maxLength={7}
								disabled={loading}
							/>
							<Button
								type="button"
								variant="outline"
								size="icon"
								onClick={() => setColor(getRandomPastelColor())}
								title="Chọn màu ngẫu nhiên"
								disabled={loading}
							>
								<RefreshCcw className="h-4 w-4" />
							</Button>
						</div>
					</div>
				</div>
				{error && (
					<div className="rounded border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
						{error}
					</div>
				)}
				<div className="flex items-center gap-2">
					<Button
						type="submit"
						className="cursor-pointer bg-[#A6CF52] hover:bg-[#94B846]"
						disabled={loading}
					>
						{loading
							? mode === "create"
								? "Đang tạo..."
								: "Đang cập nhật..."
							: mode === "create"
							? "Tạo thẻ"
							: "Cập nhật"}
					</Button>
					<Button
						type="button"
						variant="outline"
						className="cursor-pointer"
						onClick={() => router.push("/admin/tags")}
						disabled={loading}
					>
						Hủy
					</Button>
				</div>
			</div>
			<div className="lg:col-span-2">
				<div className="bg-white rounded shadow p-6 space-y-4">
					<div>
						<h2 className="text-lg font-medium">Xem trước</h2>
						<p className="text-sm text-muted-foreground">
							Thẻ sẽ hiển thị như thế này trên giao diện.
						</p>
					</div>

					<div className="p-10 border border-dashed rounded flex items-center justify-center bg-gray-50">
						<TagBadge color={color} content={name || "Tên thẻ"} />
					</div>

					<div className="text-xs text-muted-foreground mt-2">
						* Màu chữ (đen/trắng) sẽ tự động thay đổi dựa trên độ sáng của màu
						nền.
					</div>
				</div>
			</div>
		</form>
	);
}

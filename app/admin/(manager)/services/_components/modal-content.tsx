import { ModalWrapper } from "@/components/modal-wrapper";
import { Badge } from "@/components/ui/badge";
import { Service } from "@/lib/generated/prisma";
type PropsType = { data: Service };
export default function ServiceModalContent({ data }: PropsType) {
	const formatPrice = (value: number) =>
		new Intl.NumberFormat("vi-VN", {
			style: "currency",
			currency: "VND",
		}).format(value);
	return (
		<ModalWrapper>
			<div className="grid gap-4 py-4">
				<div>
					<h2 className="text-2xl font-bold">{data.name}</h2>
					<p className="text-sm text-muted-foreground">
						{data.description || "Không có mô tả"}
					</p>
				</div>
				<div className="space-y-2">
					<p className="text-sm font-medium">Giá dịch vụ</p>
					<Badge>{formatPrice(data.price)}</Badge>
				</div>
				<div className="text-xs text-muted-foreground">
					Được tạo lúc
					{new Intl.DateTimeFormat("vi-VN", {
						dateStyle: "medium",
						timeStyle: "short",
					}).format(new Date(data.createdAt))}
				</div>
			</div>
		</ModalWrapper>
	);
}

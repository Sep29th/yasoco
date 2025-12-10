import { ModalWrapper } from "@/components/modal-wrapper";
import { Medicine } from "@/lib/generated/prisma";
type PropsType = { data: Medicine };
export default function MedicineModalContent({ data }: PropsType) {
	return (
		<ModalWrapper>
			<div className="grid gap-4 py-4">
				<div>
					<h2 className="text-2xl font-bold">{data.name}</h2>
					<p className="text-sm text-muted-foreground">Đơn vị: {data.unit}</p>
				</div>
				{data.description && (
					<div className="space-y-1 text-sm">
						<p className="font-medium">Mô tả</p>
						<p className="text-muted-foreground">{data.description}</p>
					</div>
				)}
				<div className="text-xs text-muted-foreground">
					Được tạo lúc
					{new Intl.DateTimeFormat("vi-VN", {
						timeZone: "Asia/Ho_Chi_Minh",
						dateStyle: "medium",
						timeStyle: "short",
					}).format(new Date(data.createdAt))}
				</div>
			</div>
		</ModalWrapper>
	);
}

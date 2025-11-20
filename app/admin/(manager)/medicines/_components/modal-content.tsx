import { ModalWrapper } from "@/components/modal-wrapper";
import { Badge } from "@/components/ui/badge";
import { getMedicineById } from "@/lib/medicine";

type PropsType = {
  data: Awaited<ReturnType<typeof getMedicineById>>;
};

export default function MedicineModalContent({ data }: PropsType) {
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
            Đơn vị: {data.unit}
          </p>
        </div>

        <div className="space-y-2">
          <p className="text-sm font-medium">Giá thuốc</p>
          <Badge>{formatPrice(data.price)}</Badge>
        </div>

        {data.description && (
          <div className="space-y-1 text-sm">
            <p className="font-medium">Mô tả</p>
            <p className="text-muted-foreground">{data.description}</p>
          </div>
        )}

        <div className="text-xs text-muted-foreground">
          Được tạo lúc{" "}
          {new Intl.DateTimeFormat("vi-VN", {
            dateStyle: "medium",
            timeStyle: "short",
          }).format(new Date(data.createdAt))}
        </div>
      </div>
    </ModalWrapper>
  );
}

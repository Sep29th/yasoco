"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { createServiceAction } from "../_actions/create";
import { updateServiceAction } from "../_actions/update";

type PropsType = {
  mode: "create" | "edit";
  serviceId?: string;
  initialValues: {
    name: string;
    description: string;
    price: number | string;
  };
};

export default function ServiceFormClient({
  mode,
  serviceId,
  initialValues,
}: PropsType) {
  const router = useRouter();
  const [name, setName] = useState(initialValues.name);
  const [description, setDescription] = useState(initialValues.description);
  const [price, setPrice] = useState(
    typeof initialValues.price === "number"
      ? String(initialValues.price)
      : initialValues.price
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    const trimmedName = name.trim();
    const trimmedDescription = description.trim();
    const priceNumber = Number(price.replace(/\s/g, ""));

    if (mode === "edit" && !serviceId) {
      setError("Thiếu mã dịch vụ cần cập nhật");
      return;
    }

    if (!trimmedName) {
      setError("Tên dịch vụ không được bỏ trống");
      return;
    }

    if (!price.trim()) {
      setError("Giá dịch vụ không được bỏ trống");
      return;
    }

    if (!Number.isFinite(priceNumber) || priceNumber < 0) {
      setError("Giá dịch vụ không hợp lệ");
      return;
    }

    setLoading(true);
    try {
      if (mode === "create") {
        await createServiceAction({
          name: trimmedName,
          description: trimmedDescription,
          price: priceNumber,
        });
      } else {
        await updateServiceAction({
          id: serviceId as string,
          name: trimmedName,
          description: trimmedDescription,
          price: priceNumber,
        });
      }

      router.push("/admin/services");
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      setError(message || "Có lỗi xảy ra");
    } finally {
      setLoading(false);
    }
  };

  const renderPreviewPrice = () => {
    const raw = price.replace(/\s/g, "");
    const value = Number(raw);

    if (!raw) return "Chưa nhập giá";
    if (!Number.isFinite(value) || value < 0) return price;

    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(value);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="grid grid-cols-1 lg:grid-cols-3 gap-6"
    >
      <div className="lg:col-span-1 space-y-6">
        <div className="bg-white rounded shadow p-6 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Tên dịch vụ</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ví dụ: Thở khí dung"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Mô tả</Label>
            <Input
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Mô tả ngắn về dịch vụ"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="price">Giá (VND)</Label>
            <Input
              id="price"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="Ví dụ: 150000"
            />
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
              ? "Tạo dịch vụ"
              : "Cập nhật"}
          </Button>
          <Button
            type="button"
            variant="outline"
            className="cursor-pointer"
            onClick={() => router.push("/admin/services")}
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
              Thông tin dịch vụ sẽ hiển thị cho nhân viên khi chọn dịch vụ.
            </p>
          </div>

          <div className="space-y-1">
            <p className="text-base font-semibold">{name || "Tên dịch vụ"}</p>
            {description && (
              <p className="text-sm text-muted-foreground">{description}</p>
            )}
            <p className="text-sm">Giá: {renderPreviewPrice()}</p>
          </div>
        </div>
      </div>
    </form>
  );
}

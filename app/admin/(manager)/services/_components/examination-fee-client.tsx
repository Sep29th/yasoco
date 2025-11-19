"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { updateExaminationFeeAction } from "../_actions/update-examination-fee";

type Props = {
  value: number | null;
  canEdit: boolean;
};

export default function ExaminationFeeClient({ value, canEdit }: Props) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [input, setInput] = useState(
    value !== null && value !== undefined ? String(value) : ""
  );
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const formatPrice = (v: number | null) => {
    if (v === null) return "Chưa cấu hình";

    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(v);
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    const raw = input.replace(/\s/g, "");
    const parsed = Number(raw);

    if (!raw) {
      setError("Giá khám là bắt buộc");
      return;
    }

    if (!Number.isFinite(parsed) || parsed < 0 || !Number.isInteger(parsed)) {
      setError("Giá khám không hợp lệ");
      return;
    }

    startTransition(async () => {
      try {
        await updateExaminationFeeAction({ value: parsed });
        setEditing(false);
        router.refresh();
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        setError(message || "Có lỗi xảy ra");
      }
    });
  };

  if (!canEdit) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <span>Giá khám:</span>
        <span className="font-medium text-foreground">{formatPrice(value)}</span>
      </div>
    );
  }

  if (!editing) {
    return (
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1 text-sm text-muted-foreground">
          <span>Giá khám:</span>
          <span className="font-medium text-foreground">
            {formatPrice(value)}
          </span>
        </div>
        <Button
          type="button"
          size="sm"
          variant="outline"
          className="cursor-pointer"
          onClick={() => setEditing(true)}
        >
          Sửa giá khám
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex items-center gap-2">
      <div className="flex items-center gap-2">
        <Label
          htmlFor="examination-fee"
          className="text-xs whitespace-nowrap"
        >
          Giá khám (VND)
        </Label>
        <Input
          id="examination-fee"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="h-8 w-32"
        />
      </div>
      <div className="flex items-center gap-1">
        <Button
          type="submit"
          size="sm"
          className="cursor-pointer bg-[#A6CF52] hover:bg-[#94B846]"
          disabled={isPending}
        >
          {isPending ? "Đang lưu..." : "Lưu"}
        </Button>
        <Button
          type="button"
          size="sm"
          variant="outline"
          className="cursor-pointer"
          disabled={isPending}
          onClick={() => {
            setEditing(false);
            setError(null);
            setInput(
              value !== null && value !== undefined ? String(value) : ""
            );
          }}
        >
          Hủy
        </Button>
      </div>
      {error && (
        <p className="text-xs text-destructive mt-1">{error}</p>
      )}
    </form>
  );
}

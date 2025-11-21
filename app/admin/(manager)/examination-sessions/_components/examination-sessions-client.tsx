"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { updateExaminationSessionsAction } from "../_actions/update";
import { X, Plus } from "lucide-react";

type DayKey =
  | "MONDAY"
  | "TUESDAY"
  | "WEDNESDAY"
  | "THURSDAY"
  | "FRIDAY"
  | "SATURDAY"
  | "SUNDAY";

type ExaminationSessionByDay = {
  day: DayKey;
  sessions: string[];
};

type PropsType = {
  initialData: ExaminationSessionByDay[];
  canEdit: boolean;
};

const DAY_LABELS: Record<DayKey, string> = {
  MONDAY: "Thứ 2",
  TUESDAY: "Thứ 3",
  WEDNESDAY: "Thứ 4",
  THURSDAY: "Thứ 5",
  FRIDAY: "Thứ 6",
  SATURDAY: "Thứ 7",
  SUNDAY: "Chủ nhật",
};

export default function ExaminationSessionsClient({
  initialData,
  canEdit,
}: PropsType) {
  const [state, setState] = useState<ExaminationSessionByDay[]>(initialData);
  const [inputs, setInputs] = useState<Record<DayKey, string>>(() => {
    const result = {} as Record<DayKey, string>;
    for (const item of initialData) {
      result[item.day] = "";
    }
    return result;
  });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleInputChange = (day: DayKey, value: string) => {
    setInputs((prev) => ({ ...prev, [day]: value }));
  };

  const handleAddTime = (day: DayKey) => {
    setError(null);
    setSuccess(null);

    const raw = (inputs[day] || "").trim();
    if (!raw) return;

    const match = /^([01]\d|2[0-3]):([0-5]\d)$/.exec(raw);
    if (!match) {
      setError("Giờ phải có định dạng HH:MM, ví dụ: 17:30");
      return;
    }

    setState((prev) => {
      const next = prev.map((item) => {
        if (item.day !== day) return item;

        if (item.sessions.includes(raw)) {
          return item;
        }

        const sessions = [...item.sessions, raw].sort();
        return { ...item, sessions };
      });

      return next;
    });

    setInputs((prev) => ({ ...prev, [day]: "" }));
  };

  const handleRemoveTime = (day: DayKey, value: string) => {
    setError(null);
    setSuccess(null);

    setState((prev) =>
      prev.map((item) => {
        if (item.day !== day) return item;
        return {
          ...item,
          sessions: item.sessions.filter((s) => s !== value),
        };
      })
    );
  };

  const handleSubmit = () => {
    setError(null);
    setSuccess(null);

    const sessionsByDay: Record<string, string[]> = {};
    for (const item of state) {
      sessionsByDay[item.day] = item.sessions;
    }

    startTransition(async () => {
      try {
        await updateExaminationSessionsAction({ sessionsByDay });
        setSuccess("Đã lưu thay đổi giờ khám.");
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        setError(message || "Có lỗi xảy ra khi lưu giờ khám");
      }
    });
  };

  return (
    <div className="space-y-4">
      {error && (
        <div className="rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">
          {error}
        </div>
      )}

      {success && (
        <div className="rounded-md border border-emerald-300/60 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
          {success}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {state.map((item) => (
          <div key={item.day} className="bg-white rounded shadow p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-semibold">{DAY_LABELS[item.day]}</h2>
                <p className="text-xs text-muted-foreground">
                  Các khung giờ có thể đặt lịch trong ngày này.
                </p>
              </div>
            </div>

            <div className="min-h-10">
              {item.sessions.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {item.sessions.map((time) => (
                    <div
                      key={time}
                      className="inline-flex items-center gap-1 rounded-full border bg-muted px-3 py-1 text-xs"
                    >
                      <span>{time}</span>
                      {canEdit && (
                        <button
                          type="button"
                          className="inline-flex items-center justify-center rounded-full hover:bg-destructive/10 text-destructive"
                          onClick={() => handleRemoveTime(item.day, time)}
                        >
                          <X className="h-3 w-3" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-muted-foreground">
                  Chưa có khung giờ nào.
                </p>
              )}
            </div>

            {canEdit && (
              <div className="space-y-2">
                <Label htmlFor={`time-${item.day}`} className="text-xs">
                  Thêm khung giờ (HH:MM)
                </Label>
                <div className="flex items-center gap-2">
                  <Input
                    id={`time-${item.day}`}
                    value={inputs[item.day] ?? ""}
                    onChange={(e) =>
                      handleInputChange(item.day, e.target.value)
                    }
                    placeholder="Ví dụ: 17:30"
                    className="h-8"
                  />
                  <Button
                    type="button"
                    size="icon"
                    className="h-8 w-8 cursor-pointer bg-[#A6CF52] hover:bg-[#94B846]"
                    onClick={() => handleAddTime(item.day)}
                    disabled={isPending}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {canEdit && (
        <div className="flex justify-end">
          <Button
            type="button"
            className="cursor-pointer bg-[#A6CF52] hover:bg-[#94B846]"
            onClick={handleSubmit}
            disabled={isPending}
          >
            {isPending ? "Đang lưu..." : "Lưu thay đổi cho tất cả ngày"}
          </Button>
        </div>
      )}
    </div>
  );
}

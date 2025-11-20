"use client";

import { useState, useTransition, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { importMedicinesFromExcelAction } from "../_actions/import-from-excel";

// Các cột: [Tên thuốc, Đơn vị, Giá, Mô tả]

type ParsedRow = {
  name: string;
  unit: string;
  price: string;
  description: string;
};

type RowErrorMap = Record<number, string[]>;

export default function ImportMedicinesExcelClient() {
  const router = useRouter();
  const [fileName, setFileName] = useState<string | null>(null);
  const [rows, setRows] = useState<ParsedRow[]>([]);
  const [rowErrors, setRowErrors] = useState<RowErrorMap>({});
  const [parseError, setParseError] = useState<string | null>(null);
  const [isImporting, startImportTransition] = useTransition();
  const [isParsing, setIsParsing] = useState(false);

  const resetState = () => {
    setRows([]);
    setRowErrors({});
    setParseError(null);
    setFileName(null);
  };

  const handleFile = useCallback(async (file: File) => {
    resetState();
    setIsParsing(true);

    try {
      const { default: XLSX } = await import("xlsx");

      const buffer = await file.arrayBuffer();
      const workbook = XLSX.read(new Uint8Array(buffer), { type: "array" });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];

      const data: unknown[][] = XLSX.utils.sheet_to_json(sheet, {
        header: 1,
        raw: false,
      });

      if (!Array.isArray(data) || data.length <= 1) {
        setParseError("File không có dữ liệu hoặc thiếu header");
        return;
      }

      const [, ...body] = data;

      const parsed: ParsedRow[] = body
        .filter((row) => Array.isArray(row) && row.some((cell) => cell))
        .map((row) => {
          const r = row as (string | number | null | undefined)[];
          return {
            name: String(r[0] ?? "").trim(),
            unit: String(r[1] ?? "").trim(),
            price: String(r[2] ?? "").trim(),
            description: String(r[3] ?? "").trim(),
          };
        });

      if (parsed.length === 0) {
        setParseError("Không tìm thấy dòng dữ liệu nào trong file");
        return;
      }

      setRows(parsed);
      setRowErrors({});
      setParseError(null);
      setFileName(file.name);
    } catch (error) {
      console.error("[ImportMedicinesExcelClient] Parse error", error);
      setParseError(
        "Không thể đọc file Excel, vui lòng kiểm tra định dạng hoặc dùng file mẫu"
      );
    } finally {
      setIsParsing(false);
    }
  }, []);

  const onFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      void handleFile(file);
    }
  };

  const onDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const file = event.dataTransfer.files?.[0];
    if (file) {
      void handleFile(file);
    }
  };

  const onDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  const handleImport = () => {
    if (rows.length === 0) {
      setParseError("Chưa có dữ liệu để import");
      return;
    }

    setRowErrors({});
    setParseError(null);

    const payloadRows = rows.map((row) => ({
      name: row.name,
      unit: row.unit,
      price: Number(String(row.price).replace(/\s/g, "")),
      description: row.description,
    }));

    startImportTransition(async () => {
      try {
        const result = await importMedicinesFromExcelAction({
          rows: payloadRows,
        });

        if (!result.ok) {
          const map: RowErrorMap = {};

          result.rowErrors.forEach((err) => {
            if (!map[err.index]) map[err.index] = [];
            map[err.index].push(err.message);
          });

          setRowErrors(map);
          return;
        }

        router.push("/admin/medicines");
      } catch (error) {
        console.error("[ImportMedicinesExcelClient] Import error", error);
        setParseError(
          error instanceof Error ? error.message : "Không thể import dữ liệu"
        );
      }
    });
  };

  const hasErrors = Object.keys(rowErrors).length > 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Thêm thuốc bằng file Excel</h1>
          <p className="text-sm text-muted-foreground">
            Tải file Excel chứa danh sách thuốc, xem trước dữ liệu và import hàng
            loạt. Nếu có bất kỳ dòng nào lỗi thì toàn bộ file sẽ không được thêm.
          </p>
        </div>
        <a
          href="/medicines-template.csv"
          download
          className="no-underline w-full sm:w-auto"
        >
          <Button
            type="button"
            variant="outline"
            className="cursor-pointer w-full sm:w-auto"
          >
            Tải file mẫu (.csv)
          </Button>
        </a>
      </div>

      <div className="space-y-4">
        <div
          onDrop={onDrop}
          onDragOver={onDragOver}
          className="border-2 border-dashed border-muted-foreground/30 rounded-md px-4 py-8 flex flex-col items-center justify-center gap-3 text-center cursor-pointer hover:border-muted-foreground/60 transition-colors"
        >
          <p className="text-sm font-medium">
            Kéo thả file Excel (.xlsx, .xls) hoặc .csv vào đây
          </p>
          <p className="text-xs text-muted-foreground">
            Hoặc bấm nút bên dưới để chọn file từ máy tính
          </p>
          <Input
            type="file"
            accept=".xlsx,.xls,.csv"
            onChange={onFileChange}
            className="mt-3 max-w-xs cursor-pointer"
          />
          {fileName && (
            <p className="mt-2 text-xs text-muted-foreground">
              Đã chọn file: <span className="font-medium">{fileName}</span>
            </p>
          )}
        </div>

        {parseError && (
          <div className="rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">
            {parseError}
          </div>
        )}

        {rows.length > 0 && (
          <div className="space-y-3">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-muted-foreground">
                Đã đọc được <span className="font-semibold">{rows.length}</span>{" "}
                dòng dữ liệu từ file.
                {hasErrors && (
                  <>
                    {" "}- Có <span className="font-semibold">lỗi</span> ở một số
                    dòng, vui lòng kiểm tra bên dưới.
                  </>
                )}
              </p>
              <div className="flex flex-col items-stretch gap-2 sm:flex-row sm:items-center">
                <Button
                  type="button"
                  variant="outline"
                  className="cursor-pointer w-full sm:w-auto"
                  onClick={resetState}
                  disabled={isParsing || isImporting}
                >
                  Chọn file khác
                </Button>
                <Button
                  type="button"
                  className="cursor-pointer bg-[#A6CF52] hover:bg-[#94B846] w-full sm:w-auto"
                  onClick={handleImport}
                  disabled={isParsing || isImporting}
                >
                  {isImporting ? "Đang import..." : "Kiểm tra và import"}
                </Button>
              </div>
            </div>

            <div className="border rounded-md overflow-hidden">
              <div className="max-h-[60vh] overflow-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[60px]">#</TableHead>
                      <TableHead>Tên thuốc</TableHead>
                      <TableHead>Đơn vị</TableHead>
                      <TableHead>Giá</TableHead>
                      <TableHead>Mô tả</TableHead>
                      <TableHead>Lỗi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {rows.map((row, index) => {
                      const errors = rowErrors[index] ?? [];
                      const hasRowError = errors.length > 0;

                      return (
                        <TableRow
                          key={index}
                          className={
                            hasRowError ? "bg-destructive/5 hover:bg-destructive/10" : ""
                          }
                        >
                          <TableCell className="text-xs text-muted-foreground">
                            {index + 1}
                          </TableCell>
                          <TableCell>{row.name}</TableCell>
                          <TableCell>{row.unit}</TableCell>
                          <TableCell>{row.price}</TableCell>
                          <TableCell>{row.description}</TableCell>
                          <TableCell>
                            {errors.length > 0 && (
                              <ul className="text-xs text-destructive space-y-1 list-disc list-inside">
                                {errors.map((msg, i) => (
                                  <li key={i}>{msg}</li>
                                ))}
                              </ul>
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

import { requireAuth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import ImportMedicinesExcelClient from "../_components/import-medicines-excel-client";

export default async function ImportMedicinesExcelPage() {
  const auth = await requireAuth();

  if (!auth.permissions.includes("medicine:create")) {
    redirect("/admin/forbidden");
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Import thuốc từ Excel</h1>
          <p className="text-sm text-muted-foreground">
            Sử dụng file Excel để thêm hàng loạt thuốc vào hệ thống. Bạn có thể
            xem trước và kiểm tra lỗi trước khi bắt đầu import.
          </p>
        </div>
        <Link href="/admin/medicines" className="no-underline">
          <Button variant="outline" className="cursor-pointer">
            Quay lại danh sách
          </Button>
        </Link>
      </header>

      <ImportMedicinesExcelClient />
    </div>
  );
}

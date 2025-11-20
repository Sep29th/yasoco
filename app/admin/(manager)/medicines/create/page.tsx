import { requireAuth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import MedicineFormClient from "../_components/medicine-form-client";

export default async function CreateMedicinePage() {
  const auth = await requireAuth();

  if (!auth.permissions.includes("medicine:create")) {
    redirect("/admin/forbidden");
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Tạo thuốc</h1>
          <p className="text-sm text-muted-foreground">
            Thêm thuốc mới vào danh sách để sử dụng khi kê đơn.
          </p>
        </div>
        <Link href="/admin/medicines" className="no-underline">
          <Button variant="outline" className="cursor-pointer">
            Quay lại
          </Button>
        </Link>
      </header>

      <MedicineFormClient
        mode="create"
        initialValues={{
          name: "",
          unit: "",
          price: "",
          description: "",
        }}
      />
    </div>
  );
}

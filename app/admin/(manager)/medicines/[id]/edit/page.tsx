import { requireAuth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import MedicineFormClient from "../../_components/medicine-form-client";
import { getMedicineById } from "@/lib/medicine";

type PropsType = {
  params: Promise<{ id: string }>;
};

export default async function EditMedicinePage({ params }: PropsType) {
  const auth = await requireAuth();

  if (!auth.permissions.includes("medicine:update")) {
    redirect("/admin/forbidden");
  }

  const { id } = await params;
  let medicine: Awaited<ReturnType<typeof getMedicineById>> | null = null;

  try {
    medicine = await getMedicineById(id);
  } catch {
    medicine = null;
  }

  if (!medicine) {
    redirect("/admin/medicines?error=Thuốc không tồn tại");
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Chỉnh sửa thuốc</h1>
          <p className="text-sm text-muted-foreground">
            Cập nhật thông tin cho thuốc.
          </p>
        </div>
        <Link href="/admin/medicines" className="no-underline">
          <Button variant="outline" className="cursor-pointer">
            Quay lại
          </Button>
        </Link>
      </header>

      <MedicineFormClient
        mode="edit"
        medicineId={medicine.id}
        initialValues={{
          name: medicine.name,
          unit: medicine.unit,
          price: medicine.price,
          description: medicine.description ?? "",
        }}
      />
    </div>
  );
}

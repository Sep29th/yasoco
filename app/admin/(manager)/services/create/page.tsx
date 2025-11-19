import { requireAuth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import ServiceFormClient from "../_components/service-form-client";

export default async function CreateServicePage() {
  const auth = await requireAuth();

  if (!auth.permissions.includes("service:create")) {
    redirect("/admin/forbidden");
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Tạo dịch vụ</h1>
          <p className="text-sm text-muted-foreground">
            Thiết lập thông tin cho các dịch vụ khám như thở khí dung, đo huyết
            áp, ...
          </p>
        </div>
        <Link href="/admin/services" className="no-underline">
          <Button variant="outline" className="cursor-pointer">
            Quay lại
          </Button>
        </Link>
      </header>

      <ServiceFormClient
        mode="create"
        initialValues={{
          name: "",
          description: "",
          price: "",
        }}
      />
    </div>
  );
}

import { requireAuth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import ServiceFormClient from "../../_components/service-form-client";
import { getServiceById } from "@/lib/service";

type PropsType = {
  params: Promise<{ id: string }>;
};

export default async function EditServicePage({ params }: PropsType) {
  const auth = await requireAuth();

  if (!auth.permissions.includes("service:update")) {
    redirect("/admin/forbidden");
  }

  const { id } = await params;
  let service: Awaited<ReturnType<typeof getServiceById>> | null = null;

  try {
    service = await getServiceById(id);
  } catch {
    service = null;
  }

  if (!service) {
    redirect("/admin/services?error=Dịch vụ không tồn tại");
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Chỉnh sửa dịch vụ</h1>
          <p className="text-sm text-muted-foreground">
            Cập nhật thông tin cho dịch vụ khám.
          </p>
        </div>
        <Link href="/admin/services" className="no-underline">
          <Button variant="outline" className="cursor-pointer">
            Quay lại
          </Button>
        </Link>
      </header>

      <ServiceFormClient
        mode="edit"
        serviceId={service.id}
        initialValues={{
          name: service.name,
          description: service.description ?? "",
          price: service.price,
        }}
      />
    </div>
  );
}

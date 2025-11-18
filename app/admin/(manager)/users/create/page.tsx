import { requireAuth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import UserFormClient from "../_components/user-form-client";
import { getAssignableRoles } from "@/lib/role";

export default async function CreateUserPage() {
  const auth = await requireAuth();

  if (!auth.permissions.includes("user:create")) redirect("/admin/forbidden");

  const roles = await getAssignableRoles();

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Tạo người dùng</h1>
          <p className="text-sm text-muted-foreground">
            Thiết lập thông tin và vai trò cho người dùng mới.
          </p>
        </div>
        <Link href="/admin/users" className="no-underline">
          <Button variant="outline" className="cursor-pointer">
            Quay lại
          </Button>
        </Link>
      </header>

      <UserFormClient
        mode="create"
        availableRoles={roles}
        initialValues={{
          name: "",
          phone: "",
          password: "",
          roleIds: [],
          isActive: true,
        }}
      />
    </div>
  );
}


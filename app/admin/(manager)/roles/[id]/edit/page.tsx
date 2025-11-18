import { requireAuth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import EditRoleClient from "../../_components/edit-role-client";
import { getRoleById } from "@/lib/role";

type PropsType = {
  params: Promise<{ id: string }>;
};

export default async function RoleEditPage({ params }: PropsType) {
  const auth = await requireAuth();
  if (!auth.permissions.includes("role:update")) redirect("/admin/forbidden");

  const { id } = await params;
  const role = await getRoleById(id);

  if (!role || !role.id || !role.name) {
    redirect("/admin/roles?error=Vai trò không tồn tại");
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-semibold">Chỉnh sửa vai trò</h1>
        <div className="flex items-center gap-2">
          <Link href="/admin/roles" className="no-underline">
            <Button variant="outline" className="cursor-pointer">
              Quay lại
            </Button>
          </Link>
        </div>
      </header>

      <div>
        <EditRoleClient
          roleId={role.id}
          initialName={role.name}
          initialPermissions={role.permissionNames || []}
        />
      </div>
    </div>
  );
}

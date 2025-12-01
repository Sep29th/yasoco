import { requireAuth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import UserFormClient from "../../_components/user-form-client";
import { getAssignableRoles } from "@/lib/role";
import { getUserById } from "@/lib/user";

type PropsType = {
  params: Promise<{ id: string }>;
};

export default async function EditUserPage({ params }: PropsType) {
  const auth = await requireAuth();

  if (!auth.permissions.includes("user:update")) redirect("/admin/forbidden");

  const { id } = await params;
  let user: Awaited<ReturnType<typeof getUserById>> | null;
  try {
    user = await getUserById(id);
  } catch {
    user = null;
  }

  if (!user || user.isDeleted) {
    redirect("/admin/users?error=Người dùng không tồn tại");
  }

  const roles = await getAssignableRoles();

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Chỉnh sửa người dùng</h1>
          <p className="text-sm text-muted-foreground">
            Cập nhật thông tin và vai trò của người dùng.
          </p>
        </div>
        <Link href="/admin/users" className="no-underline">
          <Button variant="outline" className="cursor-pointer">
            Quay lại
          </Button>
        </Link>
      </header>

      <UserFormClient
        mode="edit"
        userId={user.id}
        availableRoles={roles}
        initialValues={{
          name: user.name,
          phone: user.phone,
          password: "",
          roleIds: user.roles.map((role) => role.id),
          isActive: Boolean(user.isActive),
        }}
      />
    </div>
  );
}


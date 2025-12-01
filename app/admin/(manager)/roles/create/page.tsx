import { requireAuth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import CreateRoleClient from "../_components/create-role-client";

export default async function CreateRole() {
  const auth = await requireAuth();

  if (!auth.permissions.includes("role:create")) redirect("/admin/forbidden");

  return (
    <div className="space-y-6">
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-semibold">Tạo vai trò mới</h1>
        <div className="flex items-center gap-2">
          <Link href="/admin/roles" className="no-underline">
            <Button variant="outline" className="cursor-pointer">
              Quay lại
            </Button>
          </Link>
        </div>
      </header>

      <CreateRoleClient />
    </div>
  );
}

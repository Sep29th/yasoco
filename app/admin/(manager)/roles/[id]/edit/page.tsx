import { requireAuth } from "@/lib/auth";
import { redirect } from "next/navigation";

type PropsType = {
  params: Promise<{ id: string }>;
};

export default async function RoleEditPage({ params }: PropsType) {
  const auth = await requireAuth();
  if (!auth.permissions.includes("role:update")) redirect("/admin/forbidden");

  const { id } = await params;

  return <h3>update {id}</h3>;
}
